import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import { CLAIMS_EMAIL } from "./config.ts";

const sdk = createZapierSdk();

// Question names as they appear in the Typeform entry. They are per form, so match them to the user's form.
const QUESTIONS = {
  customerName: "Name",
  customerEmail: "Email",
  product: "Product",
  serialNumber: "Serial or order number",
  purchaseDate: "Purchase date",
  issue: "Describe the issue",
};
// Other questions to list under the main ones, in this order. Empty answers are left out.
const EXTRA_QUESTIONS = ["Phone number", "Preferred resolution"];

const InputSchema = z.record(z.string(), z.unknown());

const workflow = defineDurable(
  "email-typeform-warranty-claims-via-gmail",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );

    const answer = (question: string) => {
      const value = input[question];
      return value == null ? "" : String(value).trim();
    };

    const customerName = answer(QUESTIONS.customerName);
    const customerEmail = answer(QUESTIONS.customerEmail);
    const product = answer(QUESTIONS.product);
    const issue = answer(QUESTIONS.issue);

    if (!product && !issue) {
      return { skipped: true, reason: "no-claim-details" };
    }

    const lines = [
      `Customer name: ${customerName}`,
      `Customer email: ${customerEmail}`,
      `Product: ${product}`,
      `Serial or order number: ${answer(QUESTIONS.serialNumber)}`,
      `Purchase date: ${answer(QUESTIONS.purchaseDate)}`,
      `Issue: ${issue}`,
      ...EXTRA_QUESTIONS.filter((question) => answer(question)).map(
        (question) => `${question}: ${answer(question)}`,
      ),
    ];

    const email = await ctx.step("send-claim-email", async () =>
      sdk.runAction({
        appKey: "gmail",
        actionType: "write",
        actionKey: "message",
        connection: "gmail",
        inputs: {
          to: [CLAIMS_EMAIL],
          subject: `Warranty claim: ${product || "unknown product"} from ${customerName || "unknown customer"}`,
          body: lines.join("\n"),
          body_type: "plain",
          // Replies go straight to the customer, only when they gave an address.
          ...(customerEmail.includes("@") ? { reply_to: customerEmail } : {}),
        },
      }),
    );

    return { sent: email.data[0] ?? null };
  },
);

export default workflow;
