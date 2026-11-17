import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import { IT_CHANNEL_ID } from "./config.ts";

const sdk = createZapierSdk();

// Deactivating runs Okta's downstream deprovisioning (Slack and other SCIM apps, if configured). Use "suspend_user" to keep the account recoverable instead.
const OKTA_OFFBOARD_ACTION: "deactivate_user" | "suspend_user" =
  "deactivate_user";
// Offboarding work this zap can't do through Zapier, listed in the summary so IT can close it out.
const MANUAL_FOLLOW_UPS = [
  "Transfer Google Drive files and calendar ownership to their manager",
  "Deactivate Slack if it isn't provisioned through Okta",
  "Recover devices and remove them from device management",
  "Remove access to any apps that sign in outside Okta",
];

// HiBob sends employee fields at the top level or under `work`; accept either.
const InputSchema = z
  .object({
    id: z.union([z.string(), z.number()]).nullable().optional(),
    firstName: z.string().nullable().optional(),
    surname: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    department: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
    work: z
      .object({
        department: z.string().nullable().optional(),
        title: z.string().nullable().optional(),
      })
      .loose()
      .nullable()
      .optional(),
  })
  .loose();

const FoundUserSchema = z
  .object({ id: z.union([z.string(), z.number()]).optional() })
  .loose();

type Outcome = { system: string; ok: boolean; detail: string };

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

async function postToItChannel(text: string) {
  return sdk.runAction({
    appKey: "slack",
    actionType: "write",
    actionKey: "channel_message",
    connection: "slack",
    inputs: {
      channel: IT_CHANNEL_ID,
      text,
      as_bot: "yes",
      link_names: "no",
      unfurl: "no",
      add_edit_link: "no",
    },
  });
}

const workflow = defineDurable(
  "offboard-departing-hibob-employees-in-okta-and-google-workspace",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const fullName =
      [input.firstName, input.surname].filter(Boolean).join(" ") ||
      `HiBob employee ${input.id ?? "(no id)"}`;
    const email = (input.email ?? "").trim().toLowerCase();
    const title = input.work?.title ?? input.title ?? "";
    const department = input.work?.department ?? input.department ?? "";

    if (!email) {
      await ctx.step("alert-missing-work-email", async () =>
        postToItChannel(
          `:warning: ${fullName} reached their termination date in HiBob, but the record has no email, so no access was removed. Please offboard them by hand.`,
        ),
      );
      return { employee: fullName, skipped: true, reason: "no-work-email" };
    }

    const outcomes: Outcome[] = [];

    const oktaUser = await ctx.step("find-okta-user", async () => {
      try {
        const found = await sdk.runAction({
          appKey: "okta",
          actionType: "search",
          actionKey: "find_user_by_email",
          connection: "okta",
          inputs: { email },
        });
        const user = FoundUserSchema.parse(found.data?.[0] ?? {});
        return { id: user.id ? String(user.id) : null, error: null };
      } catch (error) {
        return { id: null, error: errorMessage(error) };
      }
    });
    if (!oktaUser.id) {
      outcomes.push({
        system: "Okta",
        ok: false,
        detail: oktaUser.error ?? "no user found with that email",
      });
    } else {
      const userId = oktaUser.id;
      outcomes.push(
        await ctx.step("remove-okta-access", async () => {
          try {
            await sdk.runAction({
              appKey: "okta",
              actionType: "write",
              actionKey: OKTA_OFFBOARD_ACTION,
              connection: "okta",
              inputs: { userId },
            });
            return {
              system: "Okta",
              ok: true,
              detail:
                OKTA_OFFBOARD_ACTION === "deactivate_user"
                  ? "deactivated"
                  : "suspended",
            };
          } catch (error) {
            return { system: "Okta", ok: false, detail: errorMessage(error) };
          }
        }),
      );
    }

    const googleUser = await ctx.step("find-google-user", async () => {
      try {
        const found = await sdk.runAction({
          appKey: "google-workspace-admin",
          actionType: "search",
          actionKey: "find_user",
          connection: "google-workspace-admin",
          inputs: { email_to_search_for: email },
        });
        const user = FoundUserSchema.parse(found.data?.[0] ?? {});
        return { id: user.id ? String(user.id) : null, error: null };
      } catch (error) {
        return { id: null, error: errorMessage(error) };
      }
    });
    if (!googleUser.id) {
      outcomes.push({
        system: "Google Workspace",
        ok: false,
        detail: googleUser.error ?? "no user found with that email",
      });
    } else {
      const userId = googleUser.id;
      outcomes.push(
        await ctx.step("suspend-google-user", async () => {
          try {
            await sdk.runAction({
              appKey: "google-workspace-admin",
              actionType: "write",
              actionKey: "suspend_user",
              connection: "google-workspace-admin",
              inputs: { user_id: userId },
            });
            return {
              system: "Google Workspace",
              ok: true,
              detail: "suspended",
            };
          } catch (error) {
            return {
              system: "Google Workspace",
              ok: false,
              detail: errorMessage(error),
            };
          }
        }),
      );
    }

    const allDone = outcomes.every((outcome) => outcome.ok);
    const summary = [
      `${allDone ? ":white_check_mark:" : ":warning:"} Offboarding for ${fullName} (${email}${title ? `, ${title}` : ""}${department ? `, ${department}` : ""}), whose termination date arrived in HiBob`,
      ...outcomes.map(
        (outcome) =>
          `${outcome.ok ? ":white_check_mark:" : ":x:"} ${outcome.system}: ${outcome.detail}`,
      ),
      "",
      "Still to do by hand:",
      ...MANUAL_FOLLOW_UPS.map((item) => `• ${item}`),
    ].join("\n");

    await ctx.step("post-offboarding-summary", async () =>
      postToItChannel(summary),
    );

    return { employee: fullName, email, allDone, outcomes };
  },
);

export default workflow;
