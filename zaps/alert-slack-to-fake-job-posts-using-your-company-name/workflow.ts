import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  AI_AUTHENTICATION_ID,
  AI_MODEL_ID,
  BOT_NAME,
  CAREERS_URL,
  COMPANY_NAME,
  LOOKBACK_DAYS,
  SEARCH_INSTRUCTIONS,
  SLACK_CHANNEL,
} from "./config.ts";

const sdk = createZapierSdk();

// The daily schedule trigger sends nothing the zap reads; the schema only checks that the input parses.
const InputSchema = z.object({}).loose();

// One post the search found, as the AI step returns it.
const PostSchema = z.object({
  title: z.string(),
  site: z.string(),
  url: z.string(),
  verdict: z.string(),
  reason: z.string(),
});

const SearchResultSchema = z.object({
  result: z.object({ items: z.array(PostSchema).default([]) }),
});

type Post = z.infer<typeof PostSchema>;

function alertText(posts: Post[]): string {
  const lines = posts.map(
    (p) =>
      `• <${p.url}|${p.title.replace(/[<>|]/g, "")}> on ${p.site}: ${p.reason}`,
  );
  const headline =
    posts.length === 1
      ? `1 job post uses ${COMPANY_NAME}'s name and doesn't match an open role`
      : `${posts.length} job posts use ${COMPANY_NAME}'s name and don't match an open role`;
  return [
    `:rotating_light: *${headline}*`,
    ...lines,
    `Check each one against <${CAREERS_URL}|the careers page>, then report it to the site it's on.`,
  ].join("\n");
}

const workflow = defineDurable(
  "alert-slack-to-fake-job-posts-using-your-company-name",
  async (ctx, rawInput) => {
    InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const found = await ctx.step("search-for-job-posts", async () => {
      const result = await sdk.runAction({
        appKey: "ai",
        actionType: "write",
        actionKey: "get_completion",
        inputs: {
          model_id: AI_MODEL_ID,
          authentication_id: AI_AUTHENTICATION_ID,
          instructions: `${SEARCH_INSTRUCTIONS}\n\nCompany: ${COMPANY_NAME}\nCareers page: ${CAREERS_URL}\nLookback: the last ${LOOKBACK_DAYS} days, up to ${new Date().toDateString()}`,
          includeWorkflowData: false,
          isOutputArray: true,
          outputFields: [
            { name: "title", type: "text", isRequired: true },
            { name: "site", type: "text", isRequired: true },
            { name: "url", type: "text", isRequired: true },
            { name: "verdict", type: "text", isRequired: true },
            { name: "reason", type: "text", isRequired: true },
          ],
          tools: [
            {
              type: "builtin",
              id: "tool_web_search",
              builtin_tool_name: "web_search",
            },
            {
              type: "builtin",
              id: "tool_web_scrape",
              builtin_tool_name: "web_scrape",
            },
            { type: "builtin", id: "tool_fail", builtin_tool_name: "fail" },
          ],
        },
      });
      return SearchResultSchema.parse(result.data[0]).result.items;
    });

    const posts = found.filter(
      (p) => p.verdict.trim().toLowerCase() === "suspicious",
    );
    if (posts.length === 0) {
      return { checked: found.length, flagged: 0, found };
    }

    const posted = await ctx.step("post-alert", async () =>
      sdk.runAction({
        appKey: "slack",
        actionType: "write",
        actionKey: "channel_message",
        connection: "slack",
        inputs: {
          channel: SLACK_CHANNEL,
          text: alertText(posts),
          as_bot: "yes",
          username: BOT_NAME,
          unfurl: "no",
          add_edit_link: "no",
        },
      }),
    );

    return {
      checked: found.length,
      flagged: posts.length,
      found,
      posted: posted.data[0] ?? null,
    };
  },
);

export default workflow;
