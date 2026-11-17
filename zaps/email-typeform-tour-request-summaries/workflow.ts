import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import { OWNER_EMAIL } from "./config.ts";

const sdk = createZapierSdk();

// The form's question names for each detail in the summary. Question names differ per form, so match them to the form's real questions.
const QUESTIONS = {
  name: "Name",
  email: "Email",
  phone: "Phone",
  preferredDate: "Preferred date",
  preferredTime: "Preferred time",
  partySize: "Party size",
  notes: "Notes",
};

const InputSchema = z
  .object({
    id: z.string().nullable().optional(),
    answers: z.record(z.string(), z.unknown()).nullable().optional(),
  })
  .loose();

const workflow = defineDurable(
  "email-typeform-tour-request-summaries",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const answers = input.answers ?? {};
    const answer = (question: string) =>
      answers[question] == null ? "" : String(answers[question]).trim();

    const name = answer(QUESTIONS.name);
    const email = answer(QUESTIONS.email);
    if (!name && !email) {
      return { skipped: true, reason: "no-contact-details" };
    }

    const preferredDate = answer(QUESTIONS.preferredDate);
    const mapped = new Set<string>(Object.values(QUESTIONS));
    const otherAnswers = Object.entries(answers)
      .filter(([question, value]) => !mapped.has(question) && value != null)
      .map(([question, value]) => `${question}: ${String(value)}`);

    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${answer(QUESTIONS.phone)}`,
      `Preferred date: ${preferredDate}`,
      `Preferred time: ${answer(QUESTIONS.preferredTime)}`,
      `Party size: ${answer(QUESTIONS.partySize)}`,
      `Notes: ${answer(QUESTIONS.notes)}`,
      ...(otherAnswers.length > 0
        ? ["", "Other answers:", ...otherAnswers]
        : []),
    ].join("\n");

    const sent = await ctx.step("send-tour-summary-email", async () =>
      sdk.runAction({
        appKey: "email",
        actionType: "write",
        actionKey: "outbound",
        inputs: {
          to: OWNER_EMAIL,
          subject: `Tour request: ${name || email} on ${preferredDate || "no date given"}`,
          body,
        },
      }),
    );

    return { submissionId: input.id ?? null, sent: sent.data?.[0] ?? null };
  },
);

export default workflow;
