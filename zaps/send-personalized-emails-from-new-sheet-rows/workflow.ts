import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  SUBJECT_TEMPLATE,
  BODY_TEMPLATE,
  RECIPIENT_COLUMN,
  FROM_NAME,
} from "./config.ts";

const sdk = createZapierSdk();

const EMAIL_PATTERN = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/;

const InputSchema = z
  .object({
    id: z.union([z.string(), z.number()]).nullable().optional(),
    row: z.union([z.string(), z.number()]).nullable().optional(),
  })
  .loose();

function cell(input: Record<string, unknown>, column: string): string {
  const value = input[column];
  return value === null || value === undefined ? "" : String(value).trim();
}

// A placeholder whose column is missing or blank renders as an empty string.
function fill(template: string, input: Record<string, unknown>): string {
  return template.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (_match, column) =>
    cell(input, column),
  );
}

const workflow = defineDurable(
  "send-personalized-emails-from-new-sheet-rows",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const rowNumber = Number(input.row ?? input.id ?? 0);

    const recipient = cell(input, RECIPIENT_COLUMN);
    if (!EMAIL_PATTERN.test(recipient)) {
      return { skipped: true, reason: "no-valid-recipient", row: rowNumber };
    }

    const subject = fill(SUBJECT_TEMPLATE, input);
    const body = fill(BODY_TEMPLATE, input);

    const sent = await ctx.step("send-personalized-email", async () =>
      sdk.runAction({
        appKey: "gmail",
        actionType: "write",
        actionKey: "message",
        connection: "gmail",
        inputs: {
          to: [recipient],
          subject,
          body,
          body_type: "plain",
          ...(FROM_NAME ? { from_name: FROM_NAME } : {}),
        },
      }),
    );

    return {
      sent: true,
      row: rowNumber,
      recipient,
      subject,
      message: sent.data?.[0] ?? null,
    };
  },
);

export default workflow;
