import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  AI_AUTHENTICATION_ID,
  AI_MODEL_ID,
  AUDIENCE,
  MAX_ITEMS,
  RANKING,
  ROLE,
  SLACK_CHANNEL,
  THREAD_MATCH,
  UPDATE_INSTRUCTIONS,
} from "./config.ts";

const sdk = createZapierSdk();

const DAY_MS = 24 * 60 * 60 * 1000;
const GMAIL = "https://gmail.googleapis.com/gmail/v1/users/me";
const CALENDAR =
  "https://www.googleapis.com/calendar/v3/calendars/primary/events";
// Calendar entries that aren't meetings.
const NOT_MEETINGS = new Set(["outOfOffice", "focusTime", "workingLocation"]);

// The weekly schedule trigger sends nothing the zap reads; the schema only checks that the input parses.
const InputSchema = z.object({}).loose();

const SlackSearchSchema = z
  .object({
    ok: z.boolean(),
    error: z.string().optional(),
    messages: z
      .object({
        matches: z
          .array(
            z
              .object({
                text: z.string().default(""),
                permalink: z.string().optional(),
                channel: z
                  .object({
                    name: z.string().optional(),
                    is_im: z.boolean().optional(),
                    is_mpim: z.boolean().optional(),
                  })
                  .loose(),
              })
              .loose(),
          )
          .default([]),
      })
      .loose()
      .optional(),
  })
  .loose();

const SlackHistorySchema = z
  .object({
    ok: z.boolean(),
    error: z.string().optional(),
    messages: z
      .array(z.object({ ts: z.string(), text: z.string().default("") }).loose())
      .default([]),
  })
  .loose();

const EventsSchema = z
  .object({
    items: z
      .array(
        z
          .object({
            summary: z.string().default(""),
            eventType: z.string().optional(),
            status: z.string().optional(),
            start: z
              .object({
                dateTime: z.string().optional(),
                date: z.string().optional(),
              })
              .loose(),
            attendees: z
              .array(z.object({ self: z.boolean().optional() }).loose())
              .default([]),
          })
          .loose(),
      )
      .default([]),
  })
  .loose();

const ListSchema = z
  .object({
    messages: z.array(z.object({ id: z.string() }).loose()).default([]),
  })
  .loose();

const MessageSchema = z
  .object({
    snippet: z.string().default(""),
    payload: z
      .object({
        headers: z
          .array(z.object({ name: z.string(), value: z.string() }))
          .default([]),
      })
      .loose()
      .optional(),
  })
  .loose();

async function getJson(url: string, connection: string): Promise<unknown> {
  const response = await sdk.fetch(url, { connection });
  if (!response.ok) {
    throw new Error(`${connection} returned ${response.status} for ${url}`);
  }
  return response.json();
}

// Monday 00:00 UTC of the current week.
function weekStart(now: Date): Date {
  const daysSinceMonday = (now.getUTCDay() + 6) % 7;
  const start = new Date(now.getTime() - daysSinceMonday * DAY_MS);
  start.setUTCHours(0, 0, 0, 0);
  return start;
}

const day = (date: Date) => date.toISOString().slice(0, 10);

const workflow = defineDurable(
  "post-your-weekly-update-to-slack-with-ai",
  async (ctx, rawInput) => {
    InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const week = await ctx.step("set-week", async () => {
      const now = new Date();
      const start = weekStart(now);
      return {
        now: now.toISOString(),
        start: start.toISOString(),
        nextWeekEnd: new Date(start.getTime() + 14 * DAY_MS).toISOString(),
        // Slack and Gmail search "after" a date, so give them the day before Monday.
        dayBefore: day(new Date(start.getTime() - DAY_MS)),
      };
    });

    const slack = await ctx.step("read-my-slack-messages", async () => {
      const query = encodeURIComponent(`from:me after:${week.dayBefore}`);
      const body = SlackSearchSchema.parse(
        await getJson(
          `https://slack.com/api/search.messages?query=${query}&count=${MAX_ITEMS}&sort=timestamp`,
          "slack",
        ),
      );
      if (!body.ok) {
        throw new Error(`Slack search failed: ${body.error}`);
      }
      // Direct messages stay out of an update the team reads.
      return (body.messages?.matches ?? [])
        .filter((m) => !m.channel.is_im && !m.channel.is_mpim)
        .map((m) => ({
          channel: m.channel.name ?? "",
          text: m.text.slice(0, 500),
          link: m.permalink ?? "",
        }));
    });

    const calendar = await ctx.step("read-my-calendar", async () => {
      const body = EventsSchema.parse(
        await getJson(
          `${CALENDAR}?timeMin=${encodeURIComponent(week.start)}&timeMax=${encodeURIComponent(week.nextWeekEnd)}&singleEvents=true&orderBy=startTime&maxResults=250`,
          "google-calendar",
        ),
      );
      const meetings = body.items
        .filter(
          (e) =>
            e.status !== "cancelled" &&
            !NOT_MEETINGS.has(e.eventType ?? "") &&
            e.start.dateTime,
        )
        .map((e) => ({
          title: e.summary,
          start: e.start.dateTime ?? "",
          guests: e.attendees.filter((a) => !a.self).length,
        }));
      return {
        thisWeek: meetings.filter((m) => m.start <= week.now),
        nextWeek: meetings.filter((m) => m.start > week.now),
      };
    });

    const sent = await ctx.step("read-my-sent-email", async () => {
      const query = encodeURIComponent(
        `in:sent after:${week.dayBefore.replaceAll("-", "/")}`,
      );
      const list = ListSchema.parse(
        await getJson(
          `${GMAIL}/messages?q=${query}&maxResults=${MAX_ITEMS}`,
          "gmail",
        ),
      );
      const found = [];
      for (const { id } of list.messages) {
        const message = MessageSchema.parse(
          await getJson(
            `${GMAIL}/messages/${id}?format=metadata&metadataHeaders=To&metadataHeaders=Subject`,
            "gmail",
          ),
        );
        const header = (name: string) =>
          message.payload?.headers.find((h) => h.name === name)?.value ?? "";
        found.push({
          to: header("To"),
          subject: header("Subject"),
          snippet: message.snippet,
        });
      }
      return found;
    });

    const update = await ctx.step("write-update", async () => {
      const result = await sdk.runAction({
        appKey: "ai",
        actionType: "write",
        actionKey: "get_completion",
        inputs: {
          model_id: AI_MODEL_ID,
          authentication_id: AI_AUTHENTICATION_ID,
          instructions: `${UPDATE_INSTRUCTIONS}\n\nWho the user is: ${ROLE}\nWho reads it: ${AUDIENCE}\n\nInclude, ranked by impact:\n${RANKING}`,
          inputFields: {
            week_of: day(new Date(week.start)),
            slack_messages: JSON.stringify(slack),
            sent_emails: JSON.stringify(sent),
            this_weeks_meetings: JSON.stringify(calendar.thisWeek),
            next_weeks_meetings: JSON.stringify(calendar.nextWeek),
          },
          includeWorkflowData: false,
          outputFields: [
            {
              name: "update",
              description: "The weekly update as one Slack message.",
              type: "text",
              isRequired: true,
            },
          ],
        },
      });
      const output = result.data[0] as { update?: string } | undefined;
      return (output?.update ?? "").trim();
    });

    if (!update) {
      throw new Error("AI by Zapier returned no update");
    }

    // A member ID (U… or W…) sends the update as a DM, so the user can read it before sharing.
    const toPerson = /^[UW][A-Z0-9]+$/.test(SLACK_CHANNEL);
    const threadTs = await ctx.step("find-update-thread", async () => {
      if (!THREAD_MATCH || toPerson) return null;
      const startOfToday = new Date(week.now);
      startOfToday.setUTCHours(0, 0, 0, 0);
      const body = SlackHistorySchema.parse(
        await getJson(
          `https://slack.com/api/conversations.history?channel=${SLACK_CHANNEL}&oldest=${startOfToday.getTime() / 1000}&limit=200`,
          "slack",
        ),
      );
      if (!body.ok) {
        throw new Error(`Slack couldn't read the channel: ${body.error}`);
      }
      const match = THREAD_MATCH.toLowerCase();
      return (
        body.messages.find((m) => m.text.toLowerCase().includes(match))?.ts ??
        null
      );
    });

    const posted = await ctx.step("post-update", async () =>
      sdk.runAction({
        appKey: "slack",
        actionType: "write",
        actionKey: toPerson ? "direct_message" : "channel_message",
        connection: "slack",
        inputs: {
          channel: SLACK_CHANNEL,
          text: update,
          ...(threadTs ? { thread_ts: threadTs } : {}),
          as_bot: "no",
          unfurl: "no",
          add_edit_link: "no",
        },
      }),
    );

    return {
      inThread: Boolean(threadTs),
      read: {
        slack: slack.length,
        emails: sent.length,
        meetings: calendar.thisWeek.length,
      },
      posted: posted.data[0] ?? null,
    };
  },
);

export default workflow;
