import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  AI_AUTHENTICATION_ID,
  AI_MODEL_ID,
  BOT_NAME,
  CATEGORIES,
  DIGEST_INSTRUCTIONS,
  INBOX_QUERY,
  MAX_EMAILS,
  SLACK_CHANNEL,
} from "./config.ts";

const sdk = createZapierSdk();

const GMAIL = "https://gmail.googleapis.com/gmail/v1/users/me";

// The daily schedule trigger sends nothing the zap reads; the schema only checks that the input parses.
const InputSchema = z.object({}).loose();

const ProfileSchema = z.object({ emailAddress: z.string() }).loose();

const ListSchema = z
  .object({
    messages: z
      .array(z.object({ id: z.string(), threadId: z.string() }).loose())
      .default([]),
  })
  .loose();

const MessageSchema = z
  .object({
    threadId: z.string(),
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

async function gmail(path: string): Promise<unknown> {
  const response = await sdk.fetch(`${GMAIL}${path}`, { connection: "gmail" });
  if (!response.ok) {
    throw new Error(`Gmail returned ${response.status} for ${path}`);
  }
  return response.json();
}

const workflow = defineDurable(
  "post-a-daily-email-digest-to-slack-with-ai",
  async (ctx, rawInput) => {
    InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const emails = await ctx.step("read-inbox", async () => {
      const { emailAddress } = ProfileSchema.parse(await gmail("/profile"));
      const list = ListSchema.parse(
        await gmail(
          `/messages?q=${encodeURIComponent(INBOX_QUERY)}&maxResults=${MAX_EMAILS}`,
        ),
      );
      const found = [];
      for (const { id } of list.messages) {
        const message = MessageSchema.parse(
          await gmail(
            `/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject`,
          ),
        );
        const header = (name: string) =>
          message.payload?.headers.find((h) => h.name === name)?.value ?? "";
        found.push({
          from: header("From"),
          subject: header("Subject") || "(no subject)",
          snippet: message.snippet,
          // authuser opens the right account when the person is signed in to more than one.
          link: `https://mail.google.com/mail/?authuser=${encodeURIComponent(emailAddress)}#all/${message.threadId}`,
        });
      }
      return found;
    });

    if (emails.length === 0) {
      return { skipped: true, reason: "no-new-email" };
    }

    const digest = await ctx.step("write-digest", async () => {
      const result = await sdk.runAction({
        appKey: "ai",
        actionType: "write",
        actionKey: "get_completion",
        inputs: {
          model_id: AI_MODEL_ID,
          authentication_id: AI_AUTHENTICATION_ID,
          instructions: `${DIGEST_INSTRUCTIONS}\n\nCategories: ${CATEGORIES}`,
          inputFields: {
            today: new Date().toDateString(),
            emails: JSON.stringify(emails),
          },
          includeWorkflowData: false,
          outputFields: [
            {
              name: "digest",
              description: "The whole digest as one Slack message.",
              type: "text",
              isRequired: true,
            },
          ],
        },
      });
      const output = result.data[0] as { digest?: string } | undefined;
      return (output?.digest ?? "").trim();
    });

    if (!digest) {
      throw new Error("AI by Zapier returned no digest");
    }

    // A member ID (U… or W…) gets the digest as a DM; anything else is a channel.
    const toPerson = /^[UW][A-Z0-9]+$/.test(SLACK_CHANNEL);
    const posted = await ctx.step("post-digest", async () =>
      sdk.runAction({
        appKey: "slack",
        actionType: "write",
        actionKey: toPerson ? "direct_message" : "channel_message",
        connection: "slack",
        inputs: {
          channel: SLACK_CHANNEL,
          text: digest,
          as_bot: "yes",
          username: BOT_NAME,
          unfurl: "no",
          add_edit_link: "no",
        },
      }),
    );

    return { emails: emails.length, posted: posted.data[0] ?? null };
  },
);

export default workflow;
