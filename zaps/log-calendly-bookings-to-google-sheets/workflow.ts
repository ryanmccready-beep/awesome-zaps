import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  SPREADSHEET_ID,
  WORKSHEET_ID,
  NAME_COLUMN,
  EMAIL_COLUMN,
  EVENT_NAME_COLUMN,
  START_TIME_COLUMN,
  END_TIME_COLUMN,
  TIMEZONE_COLUMN,
  CANCEL_URL_COLUMN,
  RESCHEDULE_URL_COLUMN,
  BOOKED_AT_COLUMN,
} from "./config.ts";

const sdk = createZapierSdk();

const InputSchema = z
  .object({
    // Calendly payload keys. Check these against a real invitee_created payload when you set up the trigger.
    invitee_name: z.string().nullable().optional(),
    invitee_email: z.string().nullable().optional(),
    event_name: z.string().nullable().optional(),
    event_start_time: z.string().nullable().optional(),
    event_end_time: z.string().nullable().optional(),
    invitee_timezone: z.string().nullable().optional(),
    cancel_url: z.string().nullable().optional(),
    reschedule_url: z.string().nullable().optional(),
    invitee_created_at: z.string().nullable().optional(),
  })
  .loose();

const workflow = defineDurable(
  "log-calendly-bookings-to-google-sheets",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    if (!input.invitee_email) {
      return { skipped: true, reason: "missing-invitee-email" };
    }

    const created = await ctx.step("add-booking-row", async () =>
      sdk.runAction({
        appKey: "google-sheets",
        actionType: "write",
        actionKey: "add_row",
        connection: "google-sheets",
        inputs: {
          spreadsheet: SPREADSHEET_ID,
          worksheet: WORKSHEET_ID,
          [NAME_COLUMN]: input.invitee_name ?? "",
          [EMAIL_COLUMN]: input.invitee_email,
          [EVENT_NAME_COLUMN]: input.event_name ?? "",
          [START_TIME_COLUMN]: input.event_start_time ?? "",
          [END_TIME_COLUMN]: input.event_end_time ?? "",
          [TIMEZONE_COLUMN]: input.invitee_timezone ?? "",
          [CANCEL_URL_COLUMN]: input.cancel_url ?? "",
          [RESCHEDULE_URL_COLUMN]: input.reschedule_url ?? "",
          [BOOKED_AT_COLUMN]: input.invitee_created_at ?? "",
        },
      }),
    );

    return {
      inviteeEmail: input.invitee_email,
      eventName: input.event_name ?? null,
      row: created.data?.[0] ?? null,
    };
  },
);

export default workflow;
