import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import { SLACK_CHANNEL } from "./config.ts";

const sdk = createZapierSdk();

// Payload fields that hold the event name, checked in order. The first one with a value wins.
const EVENT_FIELDS = ["event", "type"];
// Event names worth posting. Leave empty to post every event; any other name is skipped.
const ALLOWED_EVENTS: string[] = [];
// Payload field that holds the message's title line. Falls back to the event name.
const TITLE_FIELD = "title";
// Payload fields shown under the title, in order, as `*Label*: value`. Fields that are missing or empty are left out.
const FIELDS = [
  { key: "description", label: "Description" },
  { key: "severity", label: "Severity" },
  { key: "source", label: "Source" },
  { key: "url", label: "Link" },
];

// Senders differ in payload shape, so the input is only known to be an object.
const InputSchema = z.object({}).loose();

// Nested values are written as compact JSON so they stay on one line.
const asText = (value: unknown): string =>
  typeof value === "string" ? value : JSON.stringify(value);

const isPresent = (value: unknown): boolean =>
  value !== null && value !== undefined && value !== "";

const workflow = defineDurable(
  "post-webhook-events-to-slack",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const eventField = EVENT_FIELDS.find((key) => isPresent(input[key]));
    const eventName = eventField ? asText(input[eventField]) : null;

    if (
      ALLOWED_EVENTS.length > 0 &&
      (eventName === null || !ALLOWED_EVENTS.includes(eventName))
    ) {
      return { skipped: true, reason: "event-not-in-allowed-list", eventName };
    }

    const title = isPresent(input[TITLE_FIELD])
      ? asText(input[TITLE_FIELD])
      : (eventName ?? "Webhook event");
    const details = FIELDS.filter(({ key }) => isPresent(input[key])).map(
      ({ key, label }) => `*${label}*: ${asText(input[key])}`,
    );
    const text = [`*${title}*`, ...details].join("\n");

    await ctx.step("post-webhook-event-to-channel", async () =>
      sdk.runAction({
        appKey: "slack",
        actionType: "write",
        actionKey: "channel_message",
        connection: "slack",
        inputs: {
          channel: SLACK_CHANNEL,
          text,
          as_bot: "yes",
          link_names: "no",
          add_edit_link: "no",
          unfurl: "no",
        },
      }),
    );

    return { posted: true, eventName };
  },
);

export default workflow;
