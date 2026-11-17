---
name: assign-talentlms-compliance-training-on-hibob-department-change
description: Build a Zap on Zapier that, when an employee's HiBob record changes, checks their department and enrolls them in that department's TalentLMS compliance courses they don't already have. Use when a People, L&D or compliance team runs HiBob and TalentLMS and needs required training assigned automatically when someone moves departments.
license: MIT
metadata:
  author: zapier
  summary: "When someone moves to a new department in HiBob, they're enrolled in that department's required TalentLMS compliance courses, skipping any they already have."
  apps: "HiBob, TalentLMS"
  category: "Human Resources (HR)"
  job: "Learning development"
---

# Assign TalentLMS compliance training on HiBob department change

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/assign-talentlms-compliance-training-on-hibob-department-change. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** an employee is updated in HiBob (`hibob`, `employee_updated`, no settings).
2. **Department:** the run looks up the employee's current department in `COMPLIANCE_COURSES_BY_DEPARTMENT`. A department that isn't listed, or a record with no email, ends the run without changes.
3. **TalentLMS** finds the user by email. If they have no TalentLMS account, the run stops.
4. **TalentLMS** enrolls them in each of the department's courses they aren't already in. One failed enrollment doesn't stop the others; if all of them fail, the run fails so it shows up in Zap history.

HiBob fires this trigger on any profile edit, so most runs end at step 2 or enroll nothing new. That's expected.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                        | What goes there                                                                  |
| ------------------------------ | -------------------------------------------------------------------------------- |
| `REPLACE_DEPARTMENT_NAME`      | A HiBob department with its own compliance training, spelled exactly as in HiBob |
| `REPLACE_COMPLIANCE_COURSE_ID` | The TalentLMS courses that department requires, by ID                            |

Repeat the department entry in `config.ts` for every department that has required training.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `hibob` (can see employee updates) to the user's HiBob connection and `talentlms` (an admin who can enroll users) to their TalentLMS connection. Every app in this zap needs a connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/employee-updated.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run. Fix `InputSchema` if HiBob sends email or department under other keys, and check that TalentLMS Find User returns the user's `courses`; if it doesn't, already-enrolled courses get a harmless failed enrollment instead of being skipped.

## Test it

Run this sample once as a draft test, with `email` set to a TalentLMS test user and `work.department` set to a department in `config.ts` that points at a test course:

```json
{
  "id": "3332883884017713238",
  "email": "test.mover@example.com",
  "work": { "department": "Finance" }
}
```

Check that the test user is now enrolled in the department's courses, then run the same sample again and check that nothing new is enrolled. If run-status tools aren't available, check TalentLMS directly. Ask the user to remove the test enrollments; the agent doesn't delete test data. Then publish, and tell the user to confirm the trigger is active before relying on it.

## Notes

- The Zap adds training for the new department. It doesn't remove courses from the old one, since completed compliance records usually need to stay.
- Department names must match HiBob exactly, including capitalization.
- To customize: post a Slack DM to the employee or their manager when new courses are assigned, or add a due date reminder.
- Never commit a real email address.
