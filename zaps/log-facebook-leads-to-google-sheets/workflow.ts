import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import { SPREADSHEET_ID, WORKSHEET_ID } from "./config.ts";

const sdk = createZapierSdk();

// Sheet column (COL$A = column A) for each lead field. The sheet's header row must match this order.
const COLUMNS = {
  id: "COL$A",
  created_time: "COL$B",
  full_name: "COL$C",
  email: "COL$D",
  phone_number: "COL$E",
  form_name: "COL$F",
  ad_name: "COL$G",
  campaign_name: "COL$H",
} as const;

const InputSchema = z
  .object({
    id: z.string(),
    created_time: z.string().nullable().optional(),
    full_name: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    phone_number: z.string().nullable().optional(),
    form_name: z.string().nullable().optional(),
    ad_name: z.string().nullable().optional(),
    campaign_name: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable(
  "log-facebook-leads-to-google-sheets",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const created = await ctx.step("add-lead-row", async () =>
      sdk.runAction({
        appKey: "google-sheets",
        actionType: "write",
        actionKey: "add_row",
        connection: "google-sheets",
        inputs: {
          spreadsheet: SPREADSHEET_ID,
          worksheet: WORKSHEET_ID,
          [COLUMNS.id]: input.id,
          [COLUMNS.created_time]: input.created_time ?? "",
          [COLUMNS.full_name]: input.full_name ?? "",
          [COLUMNS.email]: input.email ?? "",
          [COLUMNS.phone_number]: input.phone_number ?? "",
          [COLUMNS.form_name]: input.form_name ?? "",
          [COLUMNS.ad_name]: input.ad_name ?? "",
          [COLUMNS.campaign_name]: input.campaign_name ?? "",
        },
      }),
    );

    return { leadId: input.id, row: created.data?.[0] ?? null };
  },
);

export default workflow;
