import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import {
  IT_CHANNEL_ID,
  WORK_EMAIL_FIELD,
  NAME_FIELD,
  TERMINATION_DATE_FIELD,
} from "./config.ts";

const sdk = createZapierSdk();

// Deactivating runs Okta's downstream deprovisioning (Slack and other SCIM apps, if configured). Use "suspend_user" to keep the account recoverable instead.
const OKTA_OFFBOARD_ACTION: "deactivate_user" | "suspend_user" =
  "deactivate_user";
// Hour (UTC) on the termination date when access is cut. 23 is the end of the US business day; change it for other regions.
const ACCESS_CUTOFF_UTC_HOUR = 23;
// Offboarding work this zap can't do through Zapier, listed in the summary so IT can close it out.
const MANUAL_FOLLOW_UPS = [
  "Transfer Google Drive files and calendar ownership to their manager",
  "Deactivate Slack if it isn't provisioned through Okta",
  "Recover devices and remove them from device management",
  "Remove access to any apps that sign in outside Okta",
];

// Workday's trigger returns the report fields chosen in its settings, so values are read by the keys in config.ts.
const InputSchema = z
  .object({
    employeeID: z.union([z.string(), z.number()]).nullable().optional(),
    cutoff_wait_seconds: z.coerce.number().nullable().optional(),
  })
  .loose();

const textField = (record: Record<string, unknown>, key: string) => {
  const value = record[key];
  if (typeof value === "string") return value.trim();
  if (value && typeof value === "object" && "descriptor" in value) {
    return String((value as { descriptor: unknown }).descriptor).trim();
  }
  return "";
};

const FoundUserSchema = z
  .object({ id: z.union([z.string(), z.number()]).optional() })
  .loose();

type Outcome = { system: string; ok: boolean; detail: string };

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

function secondsUntilCutoff(terminationDate: string, nowMs: number): number {
  const cutoffMs = Date.parse(
    `${terminationDate.slice(0, 10)}T${String(ACCESS_CUTOFF_UTC_HOUR).padStart(2, "0")}:00:00Z`,
  );
  if (Number.isNaN(cutoffMs)) return 1;
  return Math.max(1, Math.round((cutoffMs - nowMs) / 1000));
}

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
  "offboard-terminated-workday-employees-in-okta-and-google-workspace",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const record = input as Record<string, unknown>;
    const fullName =
      textField(record, NAME_FIELD) ||
      `Workday employee ${input.employeeID ?? "(no id)"}`;
    const email = textField(record, WORK_EMAIL_FIELD).toLowerCase();
    const terminationDate = textField(record, TERMINATION_DATE_FIELD);

    if (!email) {
      await ctx.step("alert-missing-work-email", async () =>
        postToItChannel(
          `:warning: ${fullName} was terminated in Workday, but the trigger sent no work email, so no access was removed. Please offboard them by hand and check the zap's email field setting.`,
        ),
      );
      return { employee: fullName, skipped: true, reason: "no-work-email" };
    }

    const startedAt = await ctx.step("capture-start-time", async () =>
      Date.now(),
    );
    const waitSeconds =
      input.cutoff_wait_seconds ??
      (terminationDate ? secondsUntilCutoff(terminationDate, startedAt) : 1);
    const cutoffLabel = terminationDate
      ? `${terminationDate.slice(0, 10)} at ${ACCESS_CUTOFF_UTC_HOUR}:00 UTC`
      : "now (Workday sent no termination date)";

    await ctx.step("announce-offboarding", async () =>
      postToItChannel(
        `:wave: ${fullName} (${email}) is leaving. Okta and Google Workspace access will be removed ${cutoffLabel}.`,
      ),
    );

    await ctx.wait("wait-until-access-cutoff", waitSeconds);

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
      `${allDone ? ":white_check_mark:" : ":warning:"} Offboarding for ${fullName} (${email})`,
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
