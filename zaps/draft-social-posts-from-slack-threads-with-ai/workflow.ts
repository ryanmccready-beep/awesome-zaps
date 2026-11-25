import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  AI_AUTHENTICATION_ID,
  AI_MODEL_ID,
  BOT_NAME,
  DEFAULT_PLATFORM,
  DRAFT_INSTRUCTIONS,
  VOICE_GUIDE,
} from "./config.ts";

const sdk = createZapierSdk();

// Enough history for a long back-and-forth without sending the model a whole channel.
const THREAD_LIMIT = 50;
// A draft takes 30 seconds or more, so the bot says it heard the request first.
const ACK_TEXT = "One sec.";

const InputSchema = z
  .object({
    ts: z.string(),
    channel: z.string(),
    thread_ts: z.string().nullable().optional(),
    text: z.string().nullable().optional(),
  })
  .loose();

const RepliesSchema = z
  .object({
    ok: z.boolean(),
    error: z.string().optional(),
    messages: z
      .array(
        z
          .object({
            ts: z.string(),
            text: z.string().optional(),
            username: z.string().optional(),
            bot_id: z.string().optional(),
            files: z
              .array(z.object({ name: z.string().optional() }).loose())
              .optional(),
          })
          .loose(),
      )
      .default([]),
  })
  .loose();

type ThreadMessage = z.infer<typeof RepliesSchema>["messages"][number];

// Control characters break JSON payloads.
function clean(text: string | undefined | null): string {
  return (text ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .trim();
}

const fromBot = (m: ThreadMessage) =>
  Boolean(m.bot_id) && m.username === BOT_NAME;

// Labels each message so the model can tell its own earlier drafts from what people asked.
// The model can't open Slack files, so it only sees their names.
function threadText(messages: ThreadMessage[], requestTs: string): string {
  return messages
    .filter((m) => !(fromBot(m) && clean(m.text) === ACK_TEXT))
    .map((m) => {
      const who = fromBot(m)
        ? BOT_NAME
        : m.ts === requestTs
          ? "Request"
          : "Teammate";
      const names = (m.files ?? []).map((f) => f.name ?? "").filter(Boolean);
      const attached = names.length ? ` [attached: ${names.join(", ")}]` : "";
      return `${who}: ${clean(m.text)}${attached}`;
    })
    .join("\n\n");
}

const workflow = defineDurable(
  "draft-social-posts-from-slack-threads-with-ai",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const request = clean(input.text);
    if (!request) {
      return { skipped: true, reason: "no-text", ts: input.ts };
    }
    // A mention at the top level starts a thread under it.
    const threadTs = input.thread_ts ?? input.ts;

    await ctx.step("post-ack", async () =>
      sdk.runAction({
        appKey: "slack",
        actionType: "write",
        actionKey: "channel_message",
        connection: "slack",
        inputs: {
          channel: input.channel,
          thread_ts: threadTs,
          text: ACK_TEXT,
          as_bot: "yes",
          username: BOT_NAME,
          add_edit_link: "no",
        },
      }),
    );

    const thread = await ctx.step("read-thread", async () => {
      const response = await sdk.fetch(
        `https://slack.com/api/conversations.replies?channel=${input.channel}&ts=${threadTs}&limit=${THREAD_LIMIT}`,
        { connection: "slack" },
      );
      if (!response.ok) {
        throw new Error(`Slack returned ${response.status} for the thread`);
      }
      const body = RepliesSchema.parse(await response.json());
      if (!body.ok) {
        throw new Error(`Slack couldn't read the thread: ${body.error}`);
      }
      return threadText(body.messages, input.ts);
    });

    const draft = await ctx.step("draft-post", async () => {
      const result = await sdk.runAction({
        appKey: "ai",
        actionType: "write",
        actionKey: "get_completion",
        inputs: {
          model_id: AI_MODEL_ID,
          authentication_id: AI_AUTHENTICATION_ID,
          instructions: `${DRAFT_INSTRUCTIONS}\n\nWrite for the platform the request names, or ${DEFAULT_PLATFORM} if it names none.\n\n# Voice guide\n${VOICE_GUIDE}`,
          inputFields: { thread, request },
          includeWorkflowData: false,
          outputFields: [
            {
              name: "reply",
              description:
                "The Slack reply: one short line, then the draft or drafts in code blocks.",
              type: "text",
              isRequired: true,
            },
          ],
        },
      });
      const output = result.data[0] as { reply?: string } | undefined;
      return (output?.reply ?? "").trim();
    });

    if (!draft) {
      throw new Error("AI by Zapier returned no draft");
    }

    const reply = await ctx.step("reply-in-thread", async () =>
      sdk.runAction({
        appKey: "slack",
        actionType: "write",
        actionKey: "channel_message",
        connection: "slack",
        inputs: {
          channel: input.channel,
          thread_ts: threadTs,
          text: draft,
          as_bot: "yes",
          username: BOT_NAME,
          add_edit_link: "no",
        },
      }),
    );

    return { ok: true, ts: input.ts, reply: reply.data[0] ?? null };
  },
);

export default workflow;
