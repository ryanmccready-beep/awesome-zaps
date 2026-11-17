---
name: offboard-departing-hibob-employees-in-okta-and-google-workspace
description: Build a Zap on Zapier that, when an employee's termination date arrives in HiBob, deactivates or suspends them in Okta, suspends their Google Workspace account, and posts a per-system summary with the manual steps left to your IT Slack channel. Use when an HR, People Ops or IT team runs HiBob and wants offboarding across identity and Google Workspace to happen on the last day without anyone remembering to do it.
license: MIT
metadata:
  author: zapier
  summary: "When an employee's termination date arrives in HiBob, their Okta and Google Workspace access is removed and IT gets a Slack summary of what worked, what failed and what's left to do by hand."
  apps: "HiBob, Okta, Google Workspace Admin, Slack"
  category: "Human Resources (HR)"
  job: "HR operations"
---

# Offboard departing HiBob employees in Okta and Google Workspace

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/offboard-departing-hibob-employees-in-okta-and-google-workspace. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** an employee's termination date arrives in HiBob (`hibob`, `employee_left`, no settings).
2. **No email:** if the record has none, Slack alerts the IT channel to offboard by hand and the run stops. Nothing is removed.
3. **Okta** finds the user by email and deactivates them (or suspends them, if configured). Deactivation runs Okta's own deprovisioning, which covers Slack and other apps provisioned through Okta.
4. **Google Workspace Admin** finds the user by email and suspends them. The account isn't deleted, so their Drive, mail and calendar stay intact for handover.
5. **Slack** posts a summary to the IT channel: one line per system marked done or failed with the reason, then the manual follow-ups. It posts as the Zapier bot, with mentions and link previews turned off.

Each system is handled on its own: a missing Okta user or a failed Google suspension is reported in the summary without stopping the other step. The Zap never deletes an account.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                 | What goes there                                                             |
| ----------------------- | --------------------------------------------------------------------------- |
| `REPLACE_IT_CHANNEL_ID` | The Slack channel where IT and People Ops track offboarding, by its ID (C…) |

Also review the defaults with them:

- `OKTA_OFFBOARD_ACTION` (`workflow.ts`): `"deactivate_user"` (default) or `"suspend_user"`. Deactivation triggers Okta's downstream deprovisioning; suspension keeps the account recoverable but leaves app assignments alone. Which does their IT team want on the last day?
- `MANUAL_FOLLOW_UPS` (`workflow.ts`): the checklist at the end of the summary. Does it match what their IT team still does by hand?

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `hibob` (can see terminations) to the user's HiBob connection, `okta` (an Okta admin who can manage users) to their Okta connection, `google-workspace-admin` (a Google Workspace admin who can suspend users) to their Google Workspace Admin connection, and `slack` (the workspace with the IT channel) to their Slack connection. Every app in this zap needs a connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/employee-left.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run. HiBob may send the email, title and department under different keys than `email`, `work.title` and `work.department`; fix `InputSchema` in `workflow.ts` to match the sample.

## Test it

This zap removes real access, so test only against a throwaway user that exists in both Okta and Google Workspace, and confirm with the user before running. Run this sample once as a draft test, with `email` set to that test user:

```json
{
  "id": "3332883884017713238",
  "firstName": "Test",
  "surname": "Leaver",
  "email": "test.leaver@example.com",
  "work": { "title": "Test Account", "department": "Operations" }
}
```

Check that the summary landed in the IT channel showing Okta and Google Workspace as done, and that the test user is deactivated (or suspended) in Okta and suspended in Google Workspace. If run-status tools aren't available, check Slack, the Okta admin console and the Google Admin console directly. Ask the user to reactivate the test user and delete the test message; the agent doesn't undo test changes. Then publish, and tell the user to confirm the trigger is active before relying on it.

## Notes

- HiBob fires this trigger when the termination date arrives, not when the termination is entered, so there's no wait step. Access goes when HiBob's daily check runs, which may be early in the day.
- Okta and Google Workspace matches use the HiBob email, so it must be the same address people sign in with.
- Suspending a Google Workspace user keeps their license assigned. Reclaim it after handover, or add a Revoke License step if they want it freed on the last day.
- If Slack isn't provisioned through Okta, deactivate the Slack user by hand; Zapier's Slack integration has no deactivate action.
- To customize: post a heads-up to IT when the termination is entered with HiBob's `employee_inactivated` trigger, or DM the manager with the Drive transfer reminder.
- Never commit a real channel ID or email address.
