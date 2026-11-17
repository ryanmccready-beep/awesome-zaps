import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import { SLACK_CHANNEL } from "./config.ts";

const sdk = createZapierSdk();

// Title of the form question that holds the lead's name, exactly as it appears on the form. It becomes the headline.
const NAME_QUESTION = "Name";

const InputSchema = z.object({}).loose();

function answerText(value: unknown): string {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean)
      .join(", ");
  }
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).trim();
}

function buildMessage(input: Record<string, unknown>): string {
  const name = answerText(input[NAME_QUESTION]) || "(no name given)";
  const answers = Object.entries(input)
    .map(([question, value]) => [question, answerText(value)] as const)
    .filter(([, answer]) => answer !== "")
    .map(([question, answer]) => `*${question}*: ${answer}`);
  return [`*New lead: ${name}*`, ...answers].join("\n");
}

const workflow = defineDurable(
  "post-google-forms-leads-to-slack",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const text = buildMessage(input);
    if (!Object.values(input).some((value) => answerText(value) !== "")) {
      return { skipped: true, reason: "no-answers" };
    }

    const posted = await ctx.step("post-lead-to-channel", async () =>
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

    return { posted: posted.data[0] ?? null };
  },
);

export default workflow;
