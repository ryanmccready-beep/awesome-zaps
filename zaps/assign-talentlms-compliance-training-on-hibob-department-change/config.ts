// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const COMPLIANCE_COURSES_BY_DEPARTMENT: Record<string, string[]> = {
  REPLACE_DEPARTMENT_NAME: ["REPLACE_COMPLIANCE_COURSE_ID"], // Ask the user which HiBob department needs its own compliance training, spelled exactly as HiBob spells it, and which TalentLMS courses that is; look up each course's ID with their TalentLMS connection. Repeat this entry for each department.
};
