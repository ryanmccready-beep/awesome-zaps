import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import { SLACK_CHANNEL } from "./config.ts";

const sdk = createZapierSdk();

// Columns to show in the post, as column key to label. The labels must match the sheet's headers; edit the keys and labels for your sheet.
const COLUMN_LABELS: Record<string, string> = {
  COL$A: "Name",
  COL$B: "Email",
  COL$C: "Status",
  COL$D: "Notes",
};

const InputSchema = z.object({}).loose();

const workflow = defineDurable(
  "post-new-or-updated-sheet-rows-to-slack",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const lines = Object.entries(COLUMN_LABELS).flatMap(([column, label]) => {
      const value = String(input[column] ?? "").trim();
      return value ? [`*${label}*: ${value}`] : [];
    });
    if (lines.length === 0) {
      return { skipped: true, reason: "no-mapped-columns-filled" };
    }

    const text = ["Row changed", ...lines].join("\n");

    await ctx.step("post-row-to-channel", async () =>
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

    return { posted: true, columns: lines.length };
  },
);

export default workflow;
