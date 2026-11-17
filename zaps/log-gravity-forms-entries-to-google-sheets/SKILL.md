---
name: log-gravity-forms-entries-to-google-sheets
description: Build a Zap on Zapier that adds a row to a Google Sheets worksheet for every Gravity Forms submission, with the answers mapped to columns and the submission time. Use when form responses collected on a WordPress site should be logged in a sheet for analysis and follow-up instead of being read from the Gravity Forms admin.
license: MIT
metadata:
  author: zapier
  summary: "When someone submits your Gravity Forms form, their answers land as a new row in a Google Sheets worksheet, with the submission time, so you can sort, filter and follow up from one place."
  apps: "Gravity Forms, Google Sheets"
  category: "Data & Analytics"
  job: "Data automation"
  source: "https://zapier.com/templates/details/a6ed389f9202f7dafc82e1e7bbaa7c19fc73259e94fc7585c8460cf968f552a0"
---

# Log Gravity Forms entries to Google Sheets

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/log-gravity-forms-entries-to-google-sheets. Read the files there if this skill was installed on its own.

Based on the zapier.com template [Capture form responses from Gravity Forms and create rows in Google Sheets](https://zapier.com/templates/details/a6ed389f9202f7dafc82e1e7bbaa7c19fc73259e94fc7585c8460cf968f552a0).

## What it does

1. **Trigger:** a submission of the chosen Gravity Forms form (`gravity-forms`, `getEntry`). The entry carries the answers keyed by the form's field labels.
2. **Code:** picks the mapped answers out of the entry. If none of the mapped fields has a value, the run stops and writes nothing.
3. **Google Sheets** adds one row to the worksheet with each answer in its column and the entry's submission time in the date column.

The Zap only writes to the sheet. It does not change anything in Gravity Forms.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                  | What goes there                                                                                                       | Where                                      |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `REPLACE_SPREADSHEET_ID` | The sheet that logs the entries. Ask which sheet it is, then look up its ID with the user's Google Sheets connection. | `SPREADSHEET_ID` in `config.ts`            |
| `REPLACE_WORKSHEET_ID`   | The tab that gets the rows, with a header row. Look up its ID with the user's Google Sheets connection.               | `WORKSHEET_ID` in `config.ts`              |
| `REPLACE_GRAVITY_FORM`   | The form to log. Ask which form it is, then look up its ID with the user's Gravity Forms connection.                  | `form_id` in `triggers/form-submission.ts` |

Also review the defaults with them:

- `feed_name` in `triggers/form-submission.ts`: the name Gravity Forms uses to route submissions to this Zap. Make it unique for this Zap (for example by adding the form's name) and never change it after the first deploy.
- `ENTRY_COLUMNS` and `DATE_SUBMITTED_COLUMN` in `workflow.ts`: the example map covers name, email, phone and message. Gravity Forms entries are keyed by each form's own field labels, which differ per form, so the example keys will not match yours. Ask which form fields they want logged and which column of their sheet each goes in, then rewrite the map with the exact field keys and column keys such as `COL$A` (not header names). The sheet's headers must match that map.

Ask which Gravity Forms connection the trigger should use, for the site that hosts the form, and which Google Sheets account owns the log sheet.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `gravity-forms` (the trigger's account, for the site that hosts the form) and `google-sheets` (the account that owns the log sheet) to the user's connections. No other app needs a connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/form-submission.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them, with `REPLACE_GRAVITY_FORM` replaced there too. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run. Rewrite `ENTRY_COLUMNS` in `workflow.ts` to match the field keys in the sample, and fix any other key that doesn't match.

## Test it

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing, pointed at a copy of the log sheet. The sample uses the example field keys, so replace them with the keys from the real trigger sample if you changed `ENTRY_COLUMNS`:

```json
{
  "Name": "[install-test] Jordan Rivera",
  "Email": "jordan.rivera@example.com",
  "Phone": "555-0100",
  "Message": "Sample submission",
  "date_created": "2026-12-01 09:30:00"
}
```

Confirm one new row appears with those values in the mapped columns. Then send an input with the mapped fields empty and check that no row is added and the run reports `no-mapped-answers`. If run-status tools aren't available, check the result in Google Sheets directly. Ask the user to delete the test row; the agent doesn't delete it.

Then publish and confirm the trigger is active.

## Notes

- Every submission adds a new row, so a resubmitted form is logged twice.
- The `date_created` field is the entry's submission time as Gravity Forms stores it. Confirm that name on the first sample; if the trigger delivers it under another key, change it in `workflow.ts`. If it is missing, the date cell is left blank.
- Multi-part fields such as a name or address may arrive as separate keys (for example `Name (First)`); map each key to its own column.
- It suits any form-to-sheet log, for example collecting athlete program sign-ups or feedback so a coach can sort and follow up. To act on new rows, add a Slack message or email after the row is created.
- The sheet holds respondents' personal details. Share it only with the people who need it, and don't commit a real spreadsheet ID to a repository.
