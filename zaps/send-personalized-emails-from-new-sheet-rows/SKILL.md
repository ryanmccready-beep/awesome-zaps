---
name: send-personalized-emails-from-new-sheet-rows
description: Build a Zap on Zapier that sends a personalized email through Gmail for each new row added to a Google Sheets spreadsheet, filling the subject and body from the row's cells. Use when someone keeps a list of contacts, organizations or requests in a sheet and wants each new entry emailed automatically, such as a request for a copy of their data.
license: MIT
metadata:
  author: zapier
  summary: "When a new row is added to your Google Sheet, a personalized email is sent through Gmail to the address in that row, with the subject and body filled in from the row's cells."
  apps: "Google Sheets, Gmail"
  category: "Personal Productivity"
  job: "Email management"
  source: "https://zapier.com/templates/details/35ab831474746711f241639781a7423b05e2bbd9c72d33ba6b8dac8adedb48ae"
---

# Send personalized emails from new sheet rows

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/send-personalized-emails-from-new-sheet-rows. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new row is added to the bottom of the worksheet in Google Sheets (`google-sheets`, `new_row_notify_hook`).
2. If the recipient column does not hold a valid email address, the run stops and nothing is sent.
3. **Gmail** sends one plain-text email to that address. The subject and body come from the two templates in `config.ts`, with each `{{COL$X}}` placeholder replaced by that cell of the new row. A placeholder whose cell is empty, or whose column does not exist, becomes an empty string.

The Zap only reads the sheet and sends email. It never edits a row, and a skipped run sends nothing.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                    | Lives in                          | What goes there                                                                                        |
| -------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `REPLACE_SPREADSHEET_ID`   | `triggers/new-row-notify-hook.ts` | The spreadsheet that holds the rows to email. Look up its ID from the user's Google Sheets connection. |
| `REPLACE_WORKSHEET_ID`     | `triggers/new-row-notify-hook.ts` | The tab to watch. Look up its ID from the same connection; the first tab is `"0"`.                     |
| `REPLACE_SUBJECT_TEMPLATE` | `config.ts`                       | The subject line, with `{{COL$B}}`-style placeholders for the cells to fill in.                        |
| `REPLACE_BODY_TEMPLATE`    | `config.ts`                       | The email text, in plain text with the same placeholders. Line breaks are kept.                        |

Also review the defaults with them, in `config.ts`: `RECIPIENT_COLUMN` (`COL$A` is column A) and `FROM_NAME`, the sender name shown to the recipient (empty uses the Gmail account's own name). The worksheet needs a header row, and the user's columns decide which `COL$` letters go in the templates.

Ask them:

- Which spreadsheet and tab gets the new rows, and which column holds the recipient's email address?
- What should the subject and body say, and which columns should fill in the blanks? Show them the finished wording with a sample row before building.

Also confirm that the emails should go out from the connected Gmail account. Gmail only sends from that account or its aliases.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-sheets` (the account that owns the spreadsheet) and `gmail` (the account that sends the emails) to the user's connections. No other apps need a connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-row-notify-hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them, with the spreadsheet and worksheet from the trigger's `params`. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect the Gmail action's fields with the user's connection, and sample the trigger, before the first test run, and fix any key in `workflow.ts` that doesn't match. The sample shows which `COL$` keys the row arrives under.

## Test it

Run this sample as a draft test (`run_workflow_draft` in Zapier MCP) before publishing. The recipient address is the connected Gmail account's own, so nothing leaves the account. Fill in the user's own address in `COL$A`, and use their column keys if they differ:

```json
{
  "id": 2,
  "row": 2,
  "COL$A": "you@example.com",
  "COL$B": "[install-test] Example Organization",
  "COL$C": "[install-test] Alex Example",
  "_content_hash": "2e8b284be27bd3338ed3e0308d916839"
}
```

Check that the run completed with no failed step and that the user's inbox has one email with the subject and body filled in from the sample cells. Then run it once with `COL$A` set to `not-an-email` and check that the run is skipped with reason `no-valid-recipient` and nothing is sent. Publish once the tests pass, confirm the trigger is active, and tell the user where the sent emails appear (Gmail's Sent folder).

## Notes

- Example wording for asking organizations for a copy of their data, with the organization name in column B and a contact name in column C: subject `Data copy request for {{COL$B}}`, body `Hello {{COL$C}},\n\nPlease send us a copy of the data you hold on us at {{COL$B}}, and let us know when we can expect it.\n\nThank you.`
- Only rows added after the Zap is on trigger it. Rows already in the sheet are not emailed.
- A row added with the email cell still blank is skipped for good; filling it in later does not trigger the Zap.
- The body is plain text. To send HTML, change `body_type` in `workflow.ts` to `"html"` and write the body template in HTML.
- Never commit a real spreadsheet ID or recipient address.
