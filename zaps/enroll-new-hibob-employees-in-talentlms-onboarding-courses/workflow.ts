import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import { EVERYONE_COURSE_IDS } from "./config.ts";

const sdk = createZapierSdk();

// HiBob department name mapped to extra TalentLMS course IDs for that department, spelled exactly as HiBob spells it. Empty means everyone gets only EVERYONE_COURSE_IDS.
const COURSES_BY_DEPARTMENT: Record<string, string[]> = {};

// HiBob sends employee fields at the top level or under `work`; accept either.
const InputSchema = z
  .object({
    id: z.union([z.string(), z.number()]).nullable().optional(),
    email: z.string().nullable().optional(),
    firstName: z.string().nullable().optional(),
    surname: z.string().nullable().optional(),
    department: z.string().nullable().optional(),
    work: z
      .object({ department: z.string().nullable().optional() })
      .loose()
      .nullable()
      .optional(),
  })
  .loose();

const TalentUserSchema = z
  .object({ id: z.union([z.string(), z.number()]).optional() })
  .loose();

const workflow = defineDurable(
  "enroll-new-hibob-employees-in-talentlms-onboarding-courses",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const email = (input.email ?? "").trim().toLowerCase();
    if (!email) {
      return {
        skipped: true,
        reason: "no-email",
        employeeId: input.id ?? null,
      };
    }
    const department = (
      input.work?.department ??
      input.department ??
      ""
    ).trim();
    const courseIds = [
      ...new Set([
        ...EVERYONE_COURSE_IDS,
        ...(COURSES_BY_DEPARTMENT[department] ?? []),
      ]),
    ];

    const existing = await ctx.step("find-talentlms-user", async () => {
      try {
        const found = await sdk.runAction({
          appKey: "talentlms",
          actionType: "search",
          actionKey: "find_user",
          connection: "talentlms",
          inputs: { email },
        });
        return found.data?.[0] ? TalentUserSchema.parse(found.data[0]) : null;
      } catch {
        return null;
      }
    });

    const created = existing
      ? null
      : await ctx.step("create-talentlms-user", async () =>
          sdk.runAction({
            appKey: "talentlms",
            actionType: "write",
            actionKey: "user_signup",
            connection: "talentlms",
            inputs: {
              first_name: input.firstName ?? email,
              last_name: input.surname ?? "-",
              email,
              login: email,
              // TalentLMS requires a password; hires sign in with SSO or reset it from the login page.
              password: `${crypto.randomUUID()}Aa1!`,
            },
          }),
        );

    const enrollments: { courseId: string; ok: boolean; error?: string }[] = [];
    for (const courseId of courseIds) {
      enrollments.push(
        await ctx.step(`enroll-in-course-${courseId}`, async () => {
          try {
            await sdk.runAction({
              appKey: "talentlms",
              actionType: "write",
              actionKey: "user_to_course",
              connection: "talentlms",
              inputs: { course_id: courseId, user_email: email },
            });
            return { courseId, ok: true };
          } catch (error) {
            return {
              courseId,
              ok: false,
              error: error instanceof Error ? error.message : String(error),
            };
          }
        }),
      );
    }

    const failed = enrollments.filter((enrollment) => !enrollment.ok);
    if (failed.length === courseIds.length && courseIds.length > 0) {
      throw new Error(
        `Could not enroll ${email} in any course: ${failed.map((item) => item.error).join("; ")}`,
      );
    }

    return {
      email,
      department,
      userCreated: created !== null,
      enrolled: enrollments.filter((enrollment) => enrollment.ok).length,
      failed,
    };
  },
);

export default workflow;
