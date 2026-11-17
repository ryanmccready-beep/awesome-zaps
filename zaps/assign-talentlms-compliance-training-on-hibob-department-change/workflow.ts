import { defineDurable } from "@zapier/zapier-durable";
import { createZapierSdk } from "@zapier/zapier-sdk";
import { z } from "zod";

import { COMPLIANCE_COURSES_BY_DEPARTMENT } from "./config.ts";

const sdk = createZapierSdk();

// HiBob sends employee fields at the top level or under `work`; accept either.
const InputSchema = z
  .object({
    id: z.union([z.string(), z.number()]).nullable().optional(),
    email: z.string().nullable().optional(),
    department: z.string().nullable().optional(),
    work: z
      .object({ department: z.string().nullable().optional() })
      .loose()
      .nullable()
      .optional(),
  })
  .loose();

const TalentUserSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    courses: z
      .array(
        z.object({ id: z.union([z.string(), z.number()]).optional() }).loose(),
      )
      .nullable()
      .optional(),
  })
  .loose();

const workflow = defineDurable(
  "assign-talentlms-compliance-training-on-hibob-department-change",
  async (ctx, rawInput) => {
    const input = InputSchema.parse(
      typeof rawInput === "string" ? JSON.parse(rawInput) : rawInput,
    );
    const email = (input.email ?? "").trim().toLowerCase();
    const department = (
      input.work?.department ??
      input.department ??
      ""
    ).trim();
    const courseIds = COMPLIANCE_COURSES_BY_DEPARTMENT[department] ?? [];
    if (!email || courseIds.length === 0) {
      return {
        skipped: true,
        reason: email ? "department-not-mapped" : "no-email",
        department,
      };
    }

    const user = await ctx.step("find-talentlms-user", async () => {
      const found = await sdk.runAction({
        appKey: "talentlms",
        actionType: "search",
        actionKey: "find_user",
        connection: "talentlms",
        inputs: { email },
      });
      return found.data?.[0] ? TalentUserSchema.parse(found.data[0]) : null;
    });
    if (!user) {
      return { skipped: true, reason: "no-talentlms-user", email, department };
    }

    // HiBob fires on any profile edit, so courses the user already has are skipped to keep reruns quiet.
    const enrolledIds = new Set(
      (user.courses ?? []).map((course) => String(course.id)),
    );
    const newCourseIds = courseIds.filter((id) => !enrolledIds.has(id));

    const enrollments: { courseId: string; ok: boolean; error?: string }[] = [];
    for (const courseId of newCourseIds) {
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
    if (failed.length > 0 && failed.length === newCourseIds.length) {
      throw new Error(
        `Could not enroll ${email} in ${department} compliance training: ${failed.map((item) => item.error).join("; ")}`,
      );
    }

    return {
      email,
      department,
      alreadyEnrolled: courseIds.length - newCourseIds.length,
      enrolled: enrollments.filter((enrollment) => enrollment.ok).length,
      failed,
    };
  },
);

export default workflow;
