import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import { TEAM_EMAIL } from "./config.ts";

const sdk = createZapierSdk();

// Label and column for each lead field, in the order they appear in the email. The sheet's headers must match.
const NAME_COLUMN = "COL$A";
const EMAIL_COLUMN = "COL$B";
const LEAD_COLUMNS: [label: string, column: string][] = [
  ["Name", NAME_COLUMN],
  ["Email", EMAIL_COLUMN],
  ["Phone", "COL$C"],
  ["Company", "COL$D"],
  ["Notes", "COL$E"],
];

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

const workflow = defineDurable(
  "email-team-about-new-sheet-leads",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const rowNumber = Number(input.row ?? input.id ?? 0);

    const name = cell(input, NAME_COLUMN);
    const email = cell(input, EMAIL_COLUMN);

    if (!name && !email) {
      return { skipped: true, reason: "empty-lead", row: rowNumber };
    }

    const lines = LEAD_COLUMNS.flatMap(([label, column]) => {
      const value = cell(input, column);
      return value ? [`${label}: ${value}`] : [];
    });

    const sent = await ctx.step("send-lead-email", async () =>
      sdk.runAction({
        appKey: "email",
        actionType: "write",
        actionKey: "outbound",
        inputs: {
          to: TEAM_EMAIL,
          subject: `New lead: ${name || email}`,
          body: `A new lead was added to the sheet.\n\n${lines.join("\n")}`,
        },
      }),
    );

    return { row: rowNumber, name, email, sent: sent.data?.[0] ?? null };
  },
);

export default workflow;
