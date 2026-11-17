import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import { SLACK_CHANNEL } from "./config.ts";

const sdk = createZapierSdk();

// Number of characters of the email body to include as the message preview.
const PREVIEW_LENGTH = 300;

const InputSchema = z
  .object({
    subject: z.string().nullable().optional(),
    body_plain: z.string().nullable().optional(),
    from: z
      .object({
        name: z.string().nullable().optional(),
        email: z.string().nullable().optional(),
      })
      .loose()
      .nullable()
      .optional(),
    message_url: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable(
  "post-matching-gmail-emails-to-slack",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const subject = input.subject || "(no subject)";
    const sender = input.from?.name || input.from?.email || "Unknown sender";
    const preview = (input.body_plain ?? "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, PREVIEW_LENGTH);
    const text = [
      `*${sender}*`,
      `*${subject}*`,
      preview || null,
      input.message_url ? `Original email: ${input.message_url}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    await ctx.step("post-email-to-channel", async () =>
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

    return { posted: true, subject };
  },
);

export default workflow;
