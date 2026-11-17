import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import { SPREADSHEET_ID, WORKSHEET_ID } from "./config.ts";

const sdk = createZapierSdk();

// Entry field key (as the Gravity Forms entry names it) to the sheet column that holds it, in COL$A form.
// The keys below are examples; match them to your form's fields and the columns to your sheet's headers.
const ENTRY_COLUMNS: Record<string, string> = {
  Name: "COL$A",
  Email: "COL$B",
  Phone: "COL$C",
  Message: "COL$D",
};
// Column for the time the entry was submitted.
const DATE_SUBMITTED_COLUMN = "COL$E";

const EntrySchema = z
  .object({ date_created: z.string().nullable().optional() })
  .loose();

function text(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).trim();
}

const workflow = defineDurable(
  "log-gravity-forms-entries-to-google-sheets",
  async (ctx, rawInput) => {
    const entry = EntrySchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const answers = Object.fromEntries(
      Object.entries(ENTRY_COLUMNS).map(([field, column]) => [
        column,
        text(entry[field]),
      ]),
    );
    if (Object.values(answers).every((answer) => answer === "")) {
      return { skipped: true, reason: "no-mapped-answers" };
    }

    const created = await ctx.step("add-entry-row", async () =>
      sdk.runAction({
        appKey: "google-sheets",
        actionType: "write",
        actionKey: "add_row",
        connection: "google-sheets",
        inputs: {
          spreadsheet: SPREADSHEET_ID,
          worksheet: WORKSHEET_ID,
          ...answers,
          [DATE_SUBMITTED_COLUMN]: text(entry.date_created),
        },
      }),
    );

    return {
      dateSubmitted: entry.date_created ?? null,
      row: created.data?.[0] ?? null,
    };
  },
);

export default workflow;
