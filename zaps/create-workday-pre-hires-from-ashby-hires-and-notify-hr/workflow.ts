import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import { HR_CHANNEL_ID, DEFAULT_COUNTRY } from "./config.ts";

const sdk = createZapierSdk();

// Hiring team role treated as the hiring manager; the first team member is used when nobody has it.
const HIRING_MANAGER_ROLE = "Hiring Manager";

const HiringTeamMember = z
  .object({
    email: z.string().nullable().optional(),
    firstName: z.string().nullable().optional(),
    lastName: z.string().nullable().optional(),
    role: z.string().nullable().optional(),
  })
  .loose();

const Application = z
  .object({
    id: z.string(),
    candidate: z
      .object({
        name: z.string().nullable().optional(),
        primaryEmailAddress: z
          .object({ value: z.string().nullable().optional() })
          .loose()
          .nullable()
          .optional(),
      })
      .loose()
      .nullable()
      .optional(),
    job: z
      .object({ title: z.string().nullable().optional() })
      .loose()
      .nullable()
      .optional(),
    hiringTeam: z.array(HiringTeamMember).nullable().optional(),
  })
  .loose();

const HirePayload = z
  .object({
    application: Application,
    offer: z
      .object({
        latestVersion: z
          .object({ startDate: z.string().nullable().optional() })
          .loose()
          .nullable()
          .optional(),
      })
      .loose()
      .nullable()
      .optional(),
  })
  .loose();

// Ashby's candidateHire webhook wraps the hire in `data`; accept the body or the unwrapped object.
const InputSchema = z.union([
  HirePayload,
  z.object({ data: HirePayload }).loose(),
]);

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  const last = parts.length > 1 ? (parts.pop() ?? "") : "";
  return { first: parts.join(" "), last };
}

async function postToHrChannel(text: string) {
  return sdk.runAction({
    appKey: "slack",
    actionType: "write",
    actionKey: "channel_message",
    connection: "slack",
    inputs: {
      channel: HR_CHANNEL_ID,
      text,
      as_bot: "yes",
      link_names: "no",
      unfurl: "no",
      add_edit_link: "no",
    },
  });
}

const workflow = defineDurable(
  "create-workday-pre-hires-from-ashby-hires-and-notify-hr",
  async (ctx, rawInput) => {
    const parsed = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const hire = "data" in parsed ? HirePayload.parse(parsed.data) : parsed;
    const { application } = hire;

    const fullName = (application.candidate?.name ?? "").trim();
    const email = (
      application.candidate?.primaryEmailAddress?.value ?? ""
    ).trim();
    const jobTitle = application.job?.title ?? "an unnamed job";
    const startDate = hire.offer?.latestVersion?.startDate ?? "";
    const team = application.hiringTeam ?? [];
    const manager =
      team.find((member) => member.role === HIRING_MANAGER_ROLE) ?? team[0];
    const managerName =
      [manager?.firstName, manager?.lastName].filter(Boolean).join(" ") ||
      "no hiring manager listed";

    const { first, last } = splitName(fullName);
    if (!email || !first || !last) {
      await ctx.step("alert-incomplete-hire", async () =>
        postToHrChannel(
          `:warning: ${fullName || "A candidate"} was hired in Ashby for ${jobTitle}, but the record is missing a full name or email, so no Workday pre-hire was created. Please add them in Workday by hand.`,
        ),
      );
      return {
        applicationId: application.id,
        skipped: true,
        reason: "missing-name-or-email",
      };
    }

    const preHire = await ctx.step("create-workday-pre-hire", async () => {
      try {
        const created = await sdk.runAction({
          appKey: "workday",
          actionType: "write",
          actionKey: "create_pre_hire",
          connection: "workday",
          inputs: {
            First_Name: first,
            Last_Name: last,
            Email: email,
            Country: DEFAULT_COUNTRY,
            Applicant_Comments: `Hired in Ashby for ${jobTitle}${startDate ? `, starting ${startDate}` : ""}. Hiring manager: ${managerName}. Ashby application ${application.id}.`,
          },
        });
        return { created: true, record: created.data?.[0] ?? null, error: "" };
      } catch (error) {
        return {
          created: false,
          record: null,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    });

    await ctx.step("notify-hr-channel", async () =>
      postToHrChannel(
        preHire.created
          ? `:tada: ${fullName} (${email}) was hired in Ashby for ${jobTitle}${startDate ? `, starting ${startDate}` : ""}. Their Workday pre-hire is ready for the Hire Employee step. Hiring manager: ${managerName}.`
          : `:x: ${fullName} (${email}) was hired in Ashby for ${jobTitle}, but creating their Workday pre-hire failed: ${preHire.error}. Please add them in Workday by hand.`,
      ),
    );

    return {
      applicationId: application.id,
      email,
      preHireCreated: preHire.created,
      preHire: preHire.record,
      error: preHire.error || null,
    };
  },
);

export default workflow;
