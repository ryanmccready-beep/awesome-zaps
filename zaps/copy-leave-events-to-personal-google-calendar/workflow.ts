import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import { TARGET_CALENDAR_ID } from "./config.ts";

const sdk = createZapierSdk();

// Titles that mark a leave event. Anything else on the source calendar is skipped.
const LEAVE_PATTERN = /\b(leave|PTO|OOO|out of office|vacation|holiday)\b/i;

const TimeSchema = z
  .object({
    dateTime: z.string().nullable().optional(),
    date: z.string().nullable().optional(),
  })
  .loose()
  .nullable()
  .optional();

const InputSchema = z
  .object({
    id: z.string(),
    summary: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    start: TimeSchema,
    end: TimeSchema,
  })
  .loose();

const workflow = defineDurable(
  "copy-leave-events-to-personal-google-calendar",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const sourceId = input.id;
    const summary = input.summary ?? "";

    if (input.status === "cancelled") {
      return { skipped: true, reason: "cancelled", sourceId };
    }
    if (!LEAVE_PATTERN.test(summary)) {
      return { skipped: true, reason: "not-a-leave-event", sourceId };
    }

    const allDay = !input.start?.dateTime && !!input.start?.date;
    const start = input.start?.dateTime ?? input.start?.date ?? null;
    const end = input.end?.dateTime ?? input.end?.date ?? null;
    if (!start || !end) {
      return { skipped: true, reason: "no-start-or-end-time", sourceId };
    }

    const created = await ctx.step("create-personal-event", async () =>
      sdk.runAction({
        appKey: "google-calendar",
        actionType: "write",
        actionKey: "detailed_event",
        connection: "google-calendar",
        inputs: {
          calendarid: TARGET_CALENDAR_ID,
          summary,
          description: input.description ?? "",
          location: input.location ?? "",
          start__dateTime: start,
          end__dateTime: end,
          all_day: allDay ? "yes" : "no",
          transparency: "opaque",
        },
      }),
    );

    return {
      action: "created",
      sourceId,
      personalEventId:
        (created.data[0] as { id?: string } | undefined)?.id ?? null,
    };
  },
);

export default workflow;
