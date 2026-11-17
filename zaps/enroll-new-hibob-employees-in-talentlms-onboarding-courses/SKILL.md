---
name: enroll-new-hibob-employees-in-talentlms-onboarding-courses
description: Build a Zap on Zapier that, on a new hire's start date in HiBob, finds or creates their TalentLMS account and enrolls them in your onboarding courses, plus any extra courses for their department. Use when a People or L&D team runs HiBob as its HRIS and TalentLMS as its LMS and wants new hires enrolled on day one without manual setup.
license: MIT
metadata:
  author: zapier
  summary: "On a new hire's first day in HiBob, they get a TalentLMS account and are enrolled in the onboarding courses for everyone and for their department."
  apps: "HiBob, TalentLMS"
  category: "Human Resources (HR)"
  job: "Learning development"
---

# Enroll new HiBob employees in TalentLMS onboarding courses

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/enroll-new-hibob-employees-in-talentlms-onboarding-courses. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** an employee's start date arrives in HiBob (`hibob`, `employee_joined`, no settings).
2. **No email:** if the HiBob record has no email, the run stops.
3. **Courses:** every hire gets the courses in `EVERYONE_COURSE_IDS`, plus any listed for their HiBob department in `COURSES_BY_DEPARTMENT`.
4. **TalentLMS** finds the user by email. If there is none, it creates one with their name, using the email as the login.
5. **TalentLMS** enrolls them in each course. One failed enrollment doesn't stop the others; if every enrollment fails, the run fails so it shows up in Zap history.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                        | What goes there                                                        |
| ------------------------------ | ---------------------------------------------------------------------- |
| `REPLACE_ONBOARDING_COURSE_ID` | Each TalentLMS course every new hire takes, by its ID (one per course) |

Also review the defaults with them:

- `COURSES_BY_DEPARTMENT` (`workflow.ts`): HiBob department names mapped to extra TalentLMS course IDs, such as `"Engineering": ["12"]`. Empty by default. Do some departments have their own onboarding courses?

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `hibob` (can see employee start dates) to the user's HiBob connection and `talentlms` (an admin who can create users and enroll them) to their TalentLMS connection. Every app in this zap needs a connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/employee-joined.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run. HiBob may send the email and department under different keys than `email` and `work.department`; fix `InputSchema` in `workflow.ts` to match the sample.

## Test it

Run this sample once as a draft test, with `email` set to an address the user controls and the course IDs pointing at a test course:

```json
{
  "id": "3332883884017713238",
  "email": "test.hire@example.com",
  "firstName": "Test",
  "surname": "Hire",
  "work": { "department": "Operations" }
}
```

Check that a TalentLMS user exists for that email and is enrolled in each course. If run-status tools aren't available, check TalentLMS directly. Ask the user to remove the test user; the agent doesn't delete test data. Then publish, and tell the user to confirm the trigger is active before relying on it.

## Notes

- TalentLMS requires a password to create a user. The Zap sets a random one, so hires sign in with SSO or use "Forgot password" on the TalentLMS login page. Tell them which in the welcome email.
- Enrollment happens on the start date, not when the hire is entered. Use HiBob's `employee_created` trigger instead to enroll earlier.
- To customize: add the user to a TalentLMS group or branch per department, or post a Slack message when enrollment fails.
- Never commit a real email address.
