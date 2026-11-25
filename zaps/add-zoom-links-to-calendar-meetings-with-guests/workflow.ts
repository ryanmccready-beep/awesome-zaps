import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import { REPLACE_MEET, SEND_UPDATES, SKIP_WORDS } from "./config.ts";

const sdk = createZapierSdk();

const GCAL = "https://www.googleapis.com/calendar/v3/calendars/primary/events";
const ZOOM = "https://api.zoom.us/v2/users/me/meetings";
// A private property on the user's copy of each event the zap handles, so its own edit never starts it again.
const MARK = "zoom_meeting_id";
const ZOOM_LINK = /zoom\.us\/|zoomgov\.com/i;
const OTHER_LINK =
  /meet\.google\.com|teams\.microsoft\.com|teams\.live\.com|webex\.com|whereby\.com|gotomeet|around\.co|chime\.aws|meet\.jit\.si/i;

type Rec = Record<string, any>;
type Mode = "add" | "replace_meet";
const text = (v: unknown): string =>
  (v === null || v === undefined ? "" : String(v)).trim();

// The calendar trigger sends the changed event; only its ID is used. dry_run returns the plan without changing anything.
const InputSchema = z
  .object({
    id: z.string().nullable().optional(),
    dry_run: z.union([z.boolean(), z.string()]).nullable().optional(),
  })
  .loose();

async function call(
  connection: string,
  url: string,
  init: Rec = {},
): Promise<Rec> {
  const response = await sdk.fetch(url, {
    connection,
    ...init,
    headers: { "Content-Type": "application/json" },
  });
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`${response.status}: ${body.slice(0, 300)}`);
  }
  return body ? JSON.parse(body) : {};
}

// What to do with this event: a reason to leave it alone, or how to give it Zoom.
function plan(e: Rec, nowMs: number): { skip: string } | { mode: Mode } {
  if (e.status === "cancelled") return { skip: "cancelled" };
  if (e.eventType && e.eventType !== "default") {
    return { skip: `not a meeting (${e.eventType})` };
  }
  if (!e.start?.dateTime) return { skip: "all-day event" };
  if (!e.recurrence && Date.parse(e.end?.dateTime || "") < nowMs) {
    return { skip: "already over" };
  }
  if (!(e.attendees || []).some((a: Rec) => !a.self && !a.resource)) {
    return { skip: "no one else is invited" };
  }
  const title = text(e.summary).toLowerCase();
  const word = SKIP_WORDS.find((w) => title.includes(w.toLowerCase()));
  if (word) return { skip: `title contains "${word}"` };
  if (e.extendedProperties?.private?.[MARK]) {
    return { skip: "already handled by this zap" };
  }
  const entryPoints: Rec[] = e.conferenceData?.entryPoints || [];
  const links = `${text(e.location)} ${text(e.description)} ${entryPoints.map((p) => text(p.uri)).join(" ")}`;
  if (
    /zoom/i.test(text(e.conferenceData?.conferenceSolution?.name)) ||
    ZOOM_LINK.test(links)
  ) {
    return { skip: "already has Zoom" };
  }
  if (e.hangoutLink) {
    return e.organizer?.self && REPLACE_MEET
      ? { mode: "replace_meet" }
      : { skip: "has a Google Meet call" };
  }
  if (entryPoints.length || OTHER_LINK.test(links)) {
    return { skip: "already has a meeting link" };
  }
  // Google keeps a guest's edit on the guest's own copy, so the link would reach no one else.
  if (!e.organizer?.self && !e.guestsCanModify) {
    return { skip: "someone else organizes it and guests can't edit" };
  }
  return { mode: "add" };
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const meetingId = (id: string) =>
  id.replace(/^(\d{3})(\d{4})(\d+)$/, "$1 $2 $3");

const workflow = defineDurable(
  "add-zoom-links-to-calendar-meetings-with-guests",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : (rawInput ?? {}),
    );
    const dryRun =
      input.dry_run === true || text(input.dry_run).toLowerCase() === "true";
    const eventId = text(input.id);
    if (!eventId) return { skipped: true, reason: "no event ID" };

    // Read the event fresh rather than trust the trigger's copy. One instance of a recurring event is handled on its series.
    const found = await ctx.step("read-event", async () => {
      const event = await call(
        "google-calendar",
        `${GCAL}/${encodeURIComponent(eventId)}`,
      );
      const series = event.recurringEventId
        ? await call(
            "google-calendar",
            `${GCAL}/${encodeURIComponent(event.recurringEventId)}`,
          )
        : null;
      const target = series || event;
      // Dates are made inside a step, since the workflow body has to replay the same way every time.
      const startMs = Date.parse(target.start?.dateTime || "");
      return {
        event: target,
        now: new Date().toISOString(),
        startUtc: Number.isFinite(startMs)
          ? new Date(startMs).toISOString().replace(/\.\d{3}Z$/, "Z")
          : "",
      };
    });
    const event = found.event;
    const summary = text(event.summary) || "Meeting";
    const decision = plan(event, Date.parse(found.now));
    if ("skip" in decision) {
      return { skipped: true, reason: decision.skip, event: summary };
    }

    const recurring =
      Array.isArray(event.recurrence) && event.recurrence.length > 0;
    const startMs = Date.parse(event.start.dateTime);
    const minutes = Math.max(
      15,
      Math.round((Date.parse(event.end?.dateTime || "") - startMs) / 60000) ||
        30,
    );
    const zoomRequest = {
      topic: summary.slice(0, 200),
      timezone: text(event.start.timeZone) || "UTC",
      duration: minutes,
      // A series gets one recurring Zoom meeting with no fixed time, the kind Zoom's own calendar add-on makes.
      ...(recurring ? { type: 3 } : { type: 2, start_time: found.startUtc }),
    };
    if (dryRun) {
      return {
        dry_run: true,
        mode: decision.mode,
        event: summary,
        zoom_request: zoomRequest,
      };
    }

    const zoom = await ctx.step("create-zoom-meeting", async () => {
      const m = await call("zoom", ZOOM, {
        method: "POST",
        body: JSON.stringify(zoomRequest),
      });
      return {
        id: text(m.id),
        join_url: text(m.join_url),
        password: text(m.password),
      };
    });
    if (!zoom.join_url) {
      throw new Error(`Zoom made meeting ${zoom.id} but returned no join link`);
    }

    const block = [
      "<b>Join Zoom Meeting</b>",
      `<a href="${esc(zoom.join_url)}">${esc(zoom.join_url)}</a>`,
      `Meeting ID: ${meetingId(zoom.id)}`,
      ...(zoom.password ? [`Passcode: ${esc(zoom.password)}`] : []),
    ].join("<br>");
    const replaceMeet = decision.mode === "replace_meet";
    const patch: Rec = {
      description: text(event.description)
        ? `${event.description}<br><br>${block}`
        : block,
      extendedProperties: {
        private: {
          ...(event.extendedProperties?.private || {}),
          [MARK]: zoom.id,
        },
      },
      ...(text(event.location) ? {} : { location: zoom.join_url }),
      ...(replaceMeet ? { conferenceData: null } : {}),
    };
    const query = `sendUpdates=${SEND_UPDATES}${replaceMeet ? "&conferenceDataVersion=1" : ""}`;

    const updated = await ctx.step("add-zoom-link-to-event", async () => {
      const u = await call(
        "google-calendar",
        `${GCAL}/${encodeURIComponent(event.id)}?${query}`,
        { method: "PATCH", body: JSON.stringify(patch) },
      );
      return { url: text(u.htmlLink), meet_left: Boolean(u.hangoutLink) };
    });

    return {
      added: true,
      mode: decision.mode,
      event: summary,
      event_url: updated.url,
      recurring,
      zoom_meeting_id: zoom.id,
      zoom_url: zoom.join_url,
      meet_left: updated.meet_left,
    };
  },
);

export default workflow;
