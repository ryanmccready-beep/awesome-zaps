---
name: create-workday-pre-hires-from-ashby-hires-and-notify-hr
description: Build a Zap on Zapier that, when a candidate is marked hired in Ashby, creates their pre-hire record in Workday and posts the result to your People Ops Slack channel. Use when a team runs Ashby as its ATS and Workday as its HRIS and wants hires to land in Workday without retyping them, the Workday and Ashby version of a BambooHR to Greenhouse automation.
license: MIT
metadata:
  author: zapier
  summary: "When a candidate is hired in Ashby, their Workday pre-hire is created with name, email, job and start date, and People Ops gets a Slack message saying it's ready or what went wrong."
  apps: "Ashby, Workday, Slack"
  category: "Human Resources (HR)"
  job: "Recruiting"
---

# Create Workday pre-hires from Ashby hires and notify HR

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/create-workday-pre-hires-from-ashby-hires-and-notify-hr. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a candidate is marked hired in Ashby (`ashby`, `candidate_hired`, no settings).
2. **Missing data:** if the hire has no email or only one name, Slack alerts the HR channel to add them by hand and the run stops.
3. **Workday** creates a pre-hire with first name, last name, email and country. The comment on the pre-hire records the job title, start date, hiring manager and Ashby application ID.
4. **Slack** posts to the HR channel: the pre-hire is ready for the Hire Employee step, or creating it failed and why. It posts as the Zapier bot, with mentions and link previews turned off.

The Zap creates the pre-hire only. Hiring them into a position (Workday's Hire Employee business process) stays with People Ops, because it needs a position, start date and compensation decided in Workday.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                   | What goes there                                                                    |
| ------------------------- | ---------------------------------------------------------------------------------- |
| `REPLACE_HR_CHANNEL_ID`   | The Slack channel where People Ops tracks new hires, by its ID (C…)                |
| `REPLACE_DEFAULT_COUNTRY` | The country for the pre-hire's legal name, as a value from Workday's Country field |

Also review the defaults with them:

- `HIRING_MANAGER_ROLE` (`workflow.ts`): the Ashby hiring team role treated as the hiring manager. Defaults to `"Hiring Manager"`. Does their Ashby use that role name?

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `ashby` (can see hires) to the user's Ashby connection, `workday` (can create pre-hires) to their Workday connection, and `slack` (the workspace with the HR channel) to their Slack connection. Every app in this zap needs a connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/candidate-hired.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

This creates a real Workday record, so test in a Workday sandbox tenant if the user has one, and confirm with them before running. Run this sample once as a draft test:

```json
{
  "application": {
    "id": "test-application-1",
    "candidate": {
      "name": "Test Prehire",
      "primaryEmailAddress": { "value": "test.prehire@example.com" }
    },
    "job": { "title": "Test Role" },
    "hiringTeam": [
      { "firstName": "Hannah", "lastName": "Manager", "role": "Hiring Manager" }
    ]
  },
  "offer": { "latestVersion": { "startDate": "2026-01-05" } }
}
```

Check that a pre-hire for Test Prehire exists in Workday with the comment filled in, and that one message landed in the HR channel. If run-status tools aren't available, check Workday and Slack directly. Ask the user to remove the test pre-hire and delete the test message; the agent doesn't delete test data. Then publish, and tell the user to confirm the trigger is active before relying on it.

## Notes

- Ashby sends a full name, and the Zap splits it at the last space: everything before is the first name. Check names with several parts in Workday.
- Every pre-hire gets `DEFAULT_COUNTRY`. For hires in several countries, map Ashby's job location to Workday countries in `workflow.ts`.
- A rehire who already exists in Workday gets a new pre-hire. Workday's duplicate check usually flags it in the Hire Employee step.
- To customize: add Workday's Hire Employee action once their positions and compensation can come from Ashby offer fields, or DM the hiring manager instead of posting to a channel.
- Never commit a real channel ID or email address.
