import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  AI_AUTHENTICATION_ID,
  AI_MODEL_ID,
  BOT_NAME,
  LOOKBACK_DAYS,
  REMINDER_TEXT,
  SLACK_CHANNEL,
  TOPICS_INSTRUCTIONS,
  WAIT_HOURS,
} from "./config.ts";

const sdk = createZapierSdk();

const SLACK = "https://slack.com/api";

// The calendar trigger fires once per session, a day before it starts. Only the name is used.
const InputSchema = z
  .object({ summary: z.string().nullable().optional() })
  .loose();

const MessagesSchema = z
  .object({
    ok: z.boolean(),
    error: z.string().optional(),
    messages: z
      .array(
        z
          .object({
            ts: z.string(),
            text: z.string().default(""),
            username: z.string().optional(),
            subtype: z.string().optional(),
            reactions: z
              .array(z.object({ name: z.string(), count: z.number() }).loose())
              .optional(),
          })
          .loose(),
      )
      .default([]),
  })
  .loose();

type Message = z.infer<typeof MessagesSchema>["messages"][number];

async function readSlack(path: string): Promise<Message[]> {
  const response = await sdk.fetch(`${SLACK}/${path}`, {
    connection: "slack",
  });
  if (!response.ok) {
    throw new Error(`Slack returned ${response.status} for ${path}`);
  }
  const body = MessagesSchema.parse(await response.json());
  if (!body.ok) {
    throw new Error(`Slack couldn't read ${path}: ${body.error}`);
  }
  return body.messages;
}

async function post(text: string, threadTs?: string) {
  const result = await sdk.runAction({
    appKey: "slack",
    actionType: "write",
    actionKey: "channel_message",
    connection: "slack",
    inputs: {
      channel: SLACK_CHANNEL,
      text,
      ...(threadTs ? { thread_ts: threadTs } : {}),
      as_bot: "yes",
      username: BOT_NAME,
      unfurl: "no",
      add_edit_link: "no",
    },
  });
  const sent = result.data[0] as { ts?: string } | undefined;
  return sent?.ts ?? "";
}

const workflow = defineDurable(
  "suggest-topics-before-a-team-session-in-slack-with-ai",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const session = input.summary?.trim() || "Our session";

    const reminderTs = await ctx.step("post-reminder", async () =>
      post(`*${session}* ${REMINDER_TEXT}`),
    );
    if (!reminderTs) {
      throw new Error("Slack didn't return the reminder's timestamp");
    }

    await ctx.wait("wait-for-replies", Math.round(WAIT_HOURS * 3600));

    const context = await ctx.step("read-replies-and-week", async () => {
      const oldest = Date.now() / 1000 - LOOKBACK_DAYS * 86400;
      const thread = await readSlack(
        `conversations.replies?channel=${SLACK_CHANNEL}&ts=${reminderTs}&limit=100`,
      );
      const week = await readSlack(
        `conversations.history?channel=${SLACK_CHANNEL}&oldest=${oldest}&limit=200`,
      );
      const [reminder, ...replies] = thread;
      // Slack's own notices (joins, topic changes) and other bots' posts carry a subtype; this zap's posts carry its BOT_NAME.
      // Messages people post through Zapier have a bot_id too, so that field can't tell them apart.
      const byPeople = (m: Message) => !m.subtype && m.username !== BOT_NAME;
      return {
        reactions: (reminder?.reactions ?? []).map(
          (r) => `${r.name}: ${r.count}`,
        ),
        replies: replies.filter(byPeople).map((m) => m.text),
        week: week
          .filter((m) => byPeople(m) && m.ts !== reminderTs)
          .map((m) => m.text.slice(0, 500)),
      };
    });

    const topics = await ctx.step("suggest-topics", async () => {
      const result = await sdk.runAction({
        appKey: "ai",
        actionType: "write",
        actionKey: "get_completion",
        inputs: {
          model_id: AI_MODEL_ID,
          authentication_id: AI_AUTHENTICATION_ID,
          instructions: TOPICS_INSTRUCTIONS,
          inputFields: {
            session,
            reactions: context.reactions.join(", ") || "none",
            replies: JSON.stringify(context.replies),
            this_weeks_messages: JSON.stringify(context.week),
          },
          includeWorkflowData: false,
          outputFields: [
            {
              name: "topics",
              description: "The suggestions as one Slack message.",
              type: "text",
              isRequired: true,
            },
          ],
        },
      });
      const output = result.data[0] as { topics?: string } | undefined;
      return (output?.topics ?? "").trim();
    });

    if (!topics) {
      throw new Error("AI by Zapier returned no topics");
    }

    const repliedTs = await ctx.step("reply-with-topics", async () =>
      post(topics, reminderTs),
    );

    return { session, reminderTs, repliedTs, replies: context.replies.length };
  },
);

export default workflow;
