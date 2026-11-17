---
name: log-calendly-bookings-to-google-sheets
description: Build a Zap on Zapier that adds a row to a Google Sheets worksheet every time someone books a Calendly event, with the invitee's name and email, the event type, start and end times, timezone and the cancel and reschedule links. Use when a team wants a running log of every scheduled meeting in a spreadsheet for tracking, reporting or hand-off, without copying details out of Calendly.
license: MIT
metadata:
  author: zapier
  summary: "Log scheduled events from Calendly into Google Sheets to improve tracking and management. Capture every invitee's details in real-time for better organization and oversight."
  apps: "Calendly, Google Sheets"
  category: "Personal Productivity"
  job: "Scheduling coordination"
  source: "https://zapier.com/templates/details/c652adf0ae70e0c94fd45bb6fc80372b15ab4f9599f5de7ca80bd2738ebc204b"
---

# Log Calendly bookings to Google Sheets

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/log-calendly-bookings-to-google-sheets. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** someone books a Calendly event (`calendly`, `invitee_created`). By default only new bookings start the Zap, not reschedules, and every event type is included.
2. **Filter (in code):** a booking with no invitee email stops the run and writes nothing.
3. **Google Sheets** adds one row to the booking log with the invitee's name and email, the event name, the start and end times, the invitee's timezone, the cancel and reschedule links, and when the booking was made.

The Zap only writes to the sheet. It does not change anything in Calendly.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting          | Where                         | What goes there                                                                                                                                    |
| ---------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SPREADSHEET_ID` | `config.ts`                   | The booking log sheet. Ask which sheet it is, then look up its ID with the user's Google Sheets connection.                                        |
| `WORKSHEET_ID`   | `config.ts`                   | The tab that holds the log, looked up with the user's Google Sheets connection. The first tab is usually `"0"`.                                    |
| `event_type`     | `triggers/invitee-created.ts` | The Calendly event type to log, looked up with the user's Calendly connection. To log every event type, remove this key from the trigger's params. |

Also review the defaults with them:

- `COL$A` through `COL$I` in `config.ts` (`NAME_COLUMN` through `BOOKED_AT_COLUMN`): column keys, not header names. The sheet's headers must match the order: name, email, event name, start time, end time, timezone, cancel link, reschedule link, booked at. Ask whether their sheet uses a different order and remap the letters.
- `webhook_subscription_scope_with_group` on the trigger: `"user"` (default) logs the connected user's own events. `"organization"` logs the whole Calendly organization and needs an organization owner or admin.
- `invitee_type` on the trigger: `"new"` (default) logs only new bookings. Ask whether they also want reschedules logged; remove the key for both, or set `"rescheduled"` for reschedules only.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `calendly` (the user's Calendly account; the trigger uses it) and `google-sheets` (the account that owns the booking log sheet) to the user's connections. No other apps are used.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/invitee-created.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match. Check that the Calendly payload uses `invitee_name`, `invitee_email` and `event_name`, and confirm the names of the other fields the workflow reads: `event_start_time`, `event_end_time`, `invitee_timezone`, `cancel_url`, `reschedule_url` and `invitee_created_at`.

## Test it

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing, pointed at a copy of the booking log sheet:

```json
{
  "invitee_name": "[install-test] Jane Example",
  "invitee_email": "jane.example@example.com",
  "event_name": "[install-test] 30 Minute Meeting",
  "event_start_time": "2026-12-01T15:00:00Z",
  "event_end_time": "2026-12-01T15:30:00Z",
  "invitee_timezone": "America/New_York",
  "cancel_url": "https://example.com/cancel/install-test",
  "reschedule_url": "https://example.com/reschedule/install-test",
  "invitee_created_at": "2026-11-17T12:00:00Z"
}
```

Confirm one new row appears with those values in the mapped columns. Then run a sample with no `invitee_email`: it should stop at the filter and write nothing. If run-status tools aren't available, check the result in Google Sheets directly. Ask the user to delete the test row; the agent doesn't delete it.

Then publish and confirm the trigger is active.

## Notes

- The trigger defaults to `invitee_type: "new"` so a reschedule doesn't add a second row for the same booking. If the user wants reschedules logged too, remove the key; each reschedule then adds its own row, and the sheet has no column that marks which rows are reschedules.
- Calendly's field names for the start, end, timezone, link and booked-at values are not confirmed by this folder. The agent must confirm them on the first trigger sample; a wrong name leaves that column blank rather than failing the run.
- The sheet holds invitees' names and emails. Share it only with the people who need the log, and don't commit a real spreadsheet ID to a repository.
- To alert a team on each booking, add a Slack message or email step after the row is created.
