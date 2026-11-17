import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import { SPREADSHEET_ID, WORKSHEET_ID } from "./config.ts";

const sdk = createZapierSdk();

// Sheet column key (COL$A = column A) for each field logged. The sheet's headers must match these, in this order.
const COLUMNS = {
  receivedAt: "COL$A",
  senderName: "COL$B",
  senderEmail: "COL$C",
  subject: "COL$D",
  preview: "COL$E",
  messageId: "COL$F",
  messageLink: "COL$G",
};

// Longest body preview written to the sheet; keeps every row a similar height.
const PREVIEW_LENGTH = 200;

const InputSchema = z
  .object({
    id: z.string().nullable().optional(),
    message_id: z.string().nullable().optional(),
    from: z
      .object({
        name: z.string().nullable().optional(),
        email: z.string().nullable().optional(),
      })
      .loose()
      .nullable()
      .optional(),
    subject: z.string().nullable().optional(),
    body_plain: z.string().nullable().optional(),
    date: z.string().nullable().optional(),
    message_url: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable(
  "log-labeled-gmail-emails-to-google-sheets",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const messageId = input.message_id ?? input.id ?? "";
    // Gmail can wrap display names in quotes ("Jane Doe").
    const senderName = (input.from?.name ?? "").replace(/^"(.*)"$/, "$1");
    const preview = (input.body_plain ?? "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, PREVIEW_LENGTH);

    const created = await ctx.step("add-email-row", async () =>
      sdk.runAction({
        appKey: "google-sheets",
        actionType: "write",
        actionKey: "add_row",
        connection: "google-sheets",
        inputs: {
          spreadsheet: SPREADSHEET_ID,
          worksheet: WORKSHEET_ID,
          [COLUMNS.receivedAt]: input.date ?? "",
          [COLUMNS.senderName]: senderName,
          [COLUMNS.senderEmail]: input.from?.email ?? "",
          [COLUMNS.subject]: input.subject ?? "",
          [COLUMNS.preview]: preview,
          [COLUMNS.messageId]: messageId,
          [COLUMNS.messageLink]: input.message_url ?? "",
        },
      }),
    );

    return {
      messageId: messageId || null,
      row: created.data?.[0] ?? null,
    };
  },
);

export default workflow;
