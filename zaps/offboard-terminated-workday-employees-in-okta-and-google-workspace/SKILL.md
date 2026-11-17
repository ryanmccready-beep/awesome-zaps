---
name: offboard-terminated-workday-employees-in-okta-and-google-workspace
description: Build a Zap on Zapier that, when an employee is terminated in Workday, posts a heads-up to your IT Slack channel, waits until the end of their last day, deactivates or suspends them in Okta, suspends their Google Workspace account, and posts a per-system summary with the manual steps left. Use when an HR, People Ops or IT team runs Workday and wants offboarding across identity and Google Workspace to run on the termination date without anyone remembering to do it.
license: MIT
metadata:
  author: zapier
  summary: "When someone is terminated in Workday, IT gets a Slack heads-up, and at the end of their last day the zap removes their Okta and Google Workspace access and posts what worked, what failed and what's left to do by hand."
  apps: "Workday, Okta, Google Workspace Admin, Slack"
  category: "Human Resources (HR)"
  job: "HR operations"
---

# Offboard terminated Workday employees in Okta and Google Workspace

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/offboard-terminated-workday-employees-in-okta-and-google-workspace. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** an employee is terminated in Workday (`workday`, `employee_terminated`), with the worker's name, primary work email and termination date chosen in the trigger's fields.
2. **No work email:** if the trigger sent none, Slack alerts the IT channel to offboard by hand and the run stops. Nothing is removed.
3. **Slack** posts a heads-up to the IT channel with the person's name, email and when access will be removed. It posts as the Zapier bot, with mentions and link previews turned off.
4. **Wait:** until 23:00 UTC on the termination date. If that time has passed, or Workday sent no date, access is removed right away.
5. **Okta** finds the user by email and deactivates them (or suspends them, if configured). Deactivation runs Okta's own deprovisioning, which covers Slack and other apps provisioned through Okta.
6. **Google Workspace Admin** finds the user by email and suspends them. The account isn't deleted, so their Drive, mail and calendar stay intact for handover.
7. **Slack** posts a summary: one line per system marked done or failed with the reason, then the manual follow-ups.

Each system is handled on its own: a missing Okta user or a failed Google suspension is reported in the summary without stopping the other step. The Zap never deletes an account.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                            | What goes there                                                                                |
| ---------------------------------- | ---------------------------------------------------------------------------------------------- |
| `REPLACE_IT_CHANNEL_ID`            | The Slack channel where IT and People Ops track offboarding, by its ID (C…)                    |
| `REPLACE_…_FIELD_CHOICE` (trigger) | The Workday report fields for name, work email and termination date (look these up; don't ask) |
| `REPLACE_…_FIELD` (`config.ts`)    | The trigger output keys for those three fields (sample the trigger; don't ask)                 |

Also review the defaults with them:

- `OKTA_OFFBOARD_ACTION` (`workflow.ts`): `"deactivate_user"` (default) or `"suspend_user"`. Deactivation triggers Okta's downstream deprovisioning; suspension keeps the account recoverable but leaves app assignments alone. Which does their IT team want on the last day?
- `ACCESS_CUTOFF_UTC_HOUR` (`workflow.ts`): the UTC hour on the termination date when access is cut. Defaults to 23, the end of the US business day. Where are most of their people based?
- `MANUAL_FOLLOW_UPS` (`workflow.ts`): the checklist at the end of the summary. Does it match what their IT team still does by hand?

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `workday` (can read terminated employees) to the user's Workday connection, `okta` (an Okta admin who can manage users) to their Okta connection, `google-workspace-admin` (a Google Workspace admin who can suspend users) to their Google Workspace Admin connection, and `slack` (the workspace with the IT channel) to their Slack connection. Every app in this zap needs a connection.
2. **Trigger fields:** call `get_trigger_field_choices` for `fields` on Workday's `employee_terminated` trigger with the user's connection, and put the choices for the worker's name, primary work email and termination date in `triggers/employee-terminated.ts`. Then sample the trigger and set `WORK_EMAIL_FIELD`, `NAME_FIELD` and `TERMINATION_DATE_FIELD` in `config.ts` to the output keys holding those values.
3. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced. `triggers/employee-terminated.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
4. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
5. **Fields:** inspect each action's fields with the user's connections before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

This zap removes real access, so test only against a throwaway user that exists in both Okta and Google Workspace, and confirm with the user before running. Set `cutoff_wait_seconds` so the run doesn't wait for a real date. Run this sample once as a draft test, with the keys renamed to the ones in `config.ts` and the email set to that test user:

```json
{
  "employeeID": "99999",
  "worker": "Test Leaver",
  "email_PrimaryWork": "test.leaver@example.com",
  "terminationDate": "2026-01-15",
  "cutoff_wait_seconds": 5
}
```

Check that the heads-up and the summary both landed in the IT channel, that the summary shows Okta and Google Workspace as done, and that the test user is deactivated (or suspended) in Okta and suspended in Google Workspace. If run-status tools aren't available, check Slack, the Okta admin console and the Google Admin console directly. Ask the user to reactivate the test user and delete the test messages; the agent doesn't undo test changes. Then publish, and tell the user to confirm the trigger is active before relying on it.

## Notes

- Workday's trigger can fire when the termination is entered, which may be weeks before the last day. The run waits until the termination date, so a rescinded termination still cuts access unless someone cancels the run.
- Okta and Google Workspace matches use the Workday primary work email, so it must be the same address people sign in with.
- Suspending a Google Workspace user keeps their license assigned. Reclaim it after handover, or add a Revoke License step if they want it freed on the last day.
- If Slack isn't provisioned through Okta, deactivate the Slack user by hand; Zapier's Slack integration has no deactivate action.
- To customize: add a "remove from groups" step in Okta or Google Workspace, or DM the manager with the Drive transfer reminder.
- Never commit a real channel ID or email address.
