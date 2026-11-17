---
name: post-new-or-updated-sheet-rows-to-slack
description: Build a Zap on Zapier that posts a short message to a Slack channel whenever a row in a Google Sheets worksheet is added or edited, listing the columns you choose. Use when a team keeps records in a sheet, such as user accounts, and wants changes to show up in chat so people can respond quickly.
license: MIT
metadata:
  author: zapier
  summary: "When a row in your Google Sheet is added or edited, its key columns are posted to your team's Slack channel so everyone stays informed."
  apps: "Google Sheets, Slack"
  category: "Business Owners"
  job: "Team communication"
  source: "https://zapier.com/templates/details/d3ad4b678522a063cc97ebd001f6af57ebfe50254e0494488e0d1f594b6f1c08"
---

# Post new or updated sheet rows to Slack

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/post-new-or-updated-sheet-rows-to-slack. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a row is added to the watched worksheet, or an existing row is edited, in Google Sheets (`google-sheets`, `updated_row_notify_hook`). The event carries the full row, so no extra lookup is needed. If the trigger's `dedupe_column` is set, only edits to that column trigger the Zap; new rows always do.
2. **Filter (in code):** if none of the mapped columns has a value, the run stops and posts nothing.
3. **Slack** posts one bot message to the channel. The first line is "Row changed", then one line per mapped column as `*Header*: value`, skipping empty cells. Mentions and link previews are switched off.

The Zap only reads the sheet and posts to Slack. It never edits a row.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                  | Where                                                           | What goes there                                                                                                                                          |
| ------------------------ | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `REPLACE_SPREADSHEET_ID` | `params.spreadsheet` in `triggers/updated-row-notify-hook.ts`   | The spreadsheet to watch, looked up by name with the user's Google Sheets connection                                                                     |
| `REPLACE_WORKSHEET_ID`   | `params.worksheet` in `triggers/updated-row-notify-hook.ts`     | The tab to watch, looked up with the same connection                                                                                                     |
| `REPLACE_TRIGGER_COLUMN` | `params.dedupe_column` in `triggers/updated-row-notify-hook.ts` | The column whose edits trigger the Zap, from the trigger's field choices. If the user wants any edit to trigger a post, remove the `dedupe_column` param |
| `REPLACE_SLACK_CHANNEL`  | `config.ts`                                                     | The channel that gets the posts, looked up from the user's Slack connection. The Slack app must be in that channel                                       |

Also review `COLUMN_LABELS` at the top of `workflow.ts` with them. It maps each column key (`COL$A` for column A) to the label shown in Slack, and the labels must match the sheet's headers. The defaults are placeholders: replace them with the user's columns.

Ask them:

- Which spreadsheet and tab should be watched, and which columns should appear in the post, with which headers?
- Which column's edits should trigger a post? Every edit to a watched row posts again, so a narrow trigger column keeps the channel quiet.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-sheets` (the account that owns the spreadsheet, used by the trigger) and `slack` (the workspace with the channel, used by the post) to the user's connections.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer and `COLUMN_LABELS` edited for their sheet. `triggers/updated-row-notify-hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test run before publishing (`run_workflow_draft` in Zapier MCP). It is the shape of a trigger payload for one row. Use a test spreadsheet and a test channel, not live data:

```json
{
  "id": 2,
  "row": 2,
  "COL$A": "[install-test] Test User",
  "COL$B": "test.user@example.com",
  "COL$C": "Active",
  "COL$D": "[install-test] Account created"
}
```

Check that one message appears in the test channel: "Row changed", then one `*Header*: value` line for each mapped column. Then run `{ "id": 3, "row": 3 }`: it should finish with `reason: "no-mapped-columns-filled"` and post nothing.

If run-status tools aren't available, check the test channel in Slack directly. Ask the user to delete the test messages and any test sheet, since the user deletes test data, not the agent. Then publish, and wait until the trigger reads back as active.

## Notes

- Every edit to a watched row posts again. Without a trigger column, even fixing a typo in an unrelated cell posts a new message, so set `dedupe_column` unless the user wants that.
- The trigger may not say whether a row is new or changed, so the first line is always "Row changed". If the first sample shows a field that tells them apart, use it for the first line.
- The trigger delivers each row keyed by column letter, and empty cells are left out. If the columns move, update `COLUMN_LABELS`.
- The subtitle's use case, telling a team about new or updated user accounts, is one example. Any sheet of records works.
- Never commit a real spreadsheet ID or channel ID.
- To DM someone instead of posting to a channel, or to create a task for each change, add or swap a step after the filter.
