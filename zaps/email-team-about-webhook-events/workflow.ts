import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import { RECIPIENT_EMAIL } from "./config.ts";

const sdk = createZapierSdk();

// Payload field that names the event, and the only events worth emailing (case-insensitive). Empty = email every event.
const EVENT_FIELD = "event";
const EVENTS_TO_EMAIL: string[] = [];
// Payload field used as the email subject. Without it the subject is "New <event> event".
const TITLE_FIELD = "title";
// Payload fields listed in the email body, as label and field name. Rename them to match what your sender posts.
const FIELDS = [
  { label: "Event", field: "event" },
  { label: "Title", field: "title" },
  { label: "Description", field: "description" },
  { label: "Assignee", field: "assignee" },
  { label: "Link", field: "url" },
];

// Senders differ in payload shape, so only the listed fields are read.
const InputSchema = z.object({}).loose();

function asText(value: unknown): string {
  if (value == null) return "";
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}

const workflow = defineDurable(
  "email-team-about-webhook-events",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const eventName = asText(input[EVENT_FIELD]).trim();
    if (
      EVENTS_TO_EMAIL.length > 0 &&
      !EVENTS_TO_EMAIL.some(
        (name) => name.toLowerCase() === eventName.toLowerCase(),
      )
    ) {
      return { skipped: true, reason: "event-not-in-list", eventName };
    }

    const subject =
      asText(input[TITLE_FIELD]).trim() ||
      `New ${eventName || "unnamed"} event`;
    const body = FIELDS.map(({ label, field }) => ({
      label,
      text: asText(input[field]),
    }))
      .filter(({ text }) => text !== "")
      .map(({ label, text }) => `${label}: ${text}`)
      .join("\n");

    const sent = await ctx.step("send-event-email", async () =>
      sdk.runAction({
        appKey: "email",
        actionType: "write",
        actionKey: "outbound",
        inputs: {
          to: RECIPIENT_EMAIL,
          subject,
          body: body || "The event arrived with none of the listed fields.",
        },
      }),
    );

    return { eventName, subject, sent: sent.data?.[0] ?? null };
  },
);

export default workflow;
