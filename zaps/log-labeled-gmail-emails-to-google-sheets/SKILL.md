---
name: log-labeled-gmail-emails-to-google-sheets
description: Build a Zap on Zapier that adds a row to a Google Sheets log for every new email under a chosen Gmail label or mailbox, with the received date, sender name and email, subject, a short body preview and a link to the message. Use when someone wants a running record of the emails in one label or inbox, such as a shared mailbox, a client label or an invoices folder, without copying details by hand.
license: MIT
metadata:
  author: zapier
  summary: "Every new email under a Gmail label or mailbox you choose gets its own row in a Google Sheet, with the date, sender, subject, a short preview and a link back to the message, so you keep a running record of your email in one place."
  apps: "Gmail, Google Sheets"
  category: "Personal Productivity"
  job: "Email management"
  source: "https://zapier.com/templates/details/016e3a305029a97da4a2665c3c97800bd7fe6710fa01263b5099098b5261c0fa"
---

# Log labeled Gmail emails to Google Sheets

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/log-labeled-gmail-emails-to-google-sheets. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new email arrives under the monitored Gmail label or mailbox (`gmail`, `message`).
2. The workflow tidies the email: it strips quotes from the sender's display name and cuts the body to a one-line preview of at most `PREVIEW_LENGTH` characters.
3. **Google Sheets** adds one row to the log worksheet: received date, sender name, sender email, subject, preview, message ID and a link that opens the message in Gmail. Every email gets a new row.

The Zap only writes to the sheet. It does not change, label or move anything in Gmail.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                  | Where                                | What goes there                                                                                                          |
| ------------------------ | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `REPLACE_GMAIL_LABEL`    | `label_ids` in `triggers/message.ts` | The Gmail label or mailbox to log. Ask which one, then look up its ID with the user's Gmail connection.                  |
| `REPLACE_SPREADSHEET_ID` | `config.ts`                          | The spreadsheet that holds the log. Ask which sheet it is, then look up its ID with the user's Google Sheets connection. |
| `REPLACE_WORKSHEET_ID`   | `config.ts`                          | The tab of that sheet that holds the log. Look up its ID with the user's Google Sheets connection.                       |

Also review the defaults with them:

- `COLUMNS` in `workflow.ts`: column keys such as `COL$A`, not header names. The sheet needs a header row in this order: Received At, Sender Name, Sender Email, Subject, Preview, Message ID, Message Link. If the user has no log yet, offer to create a sheet with those headers; if their columns differ, map each field to the right column key.
- `PREVIEW_LENGTH`: `200` characters of the body.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `gmail` (the trigger's account, the mailbox whose emails are logged) and `google-sheets` (the account that owns the log) to the user's connections. No other app needs a connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/message.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it. Set the trigger's `label_ids` param to the monitored label or mailbox. Get the choices with `get_trigger_field_choices` on `label_ids`; system mailboxes use their names (`INBOX`), and user labels look like `Label_123…`. Never leave it empty: an empty value fires on all mail, drafts included.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the Gmail trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing, pointed at a copy of the log sheet. It is made-up data, not a real email:

```json
{
  "id": "1a189f4f3104ae58",
  "message_id": "1a189f4f3104ae58",
  "from": {
    "name": "\"[install-test] Test Sender\"",
    "email": "test-sender@example.com"
  },
  "subject": "[install-test] Weekly project update",
  "body_plain": "Hi team,\n\nHere is this week's update. The draft is ready for review and the launch date is unchanged.\n\nThanks,\nTest Sender",
  "date": "Thu, 29 Oct 2026 16:18:13 -0700",
  "message_url": "https://mail.google.com/mail/u/0/#inbox/install-test-1"
}
```

Confirm one new row appears with the date, `Test Sender` without quotes, `test-sender@example.com`, the subject, a single-line preview, the message ID and the Gmail link in the mapped columns. If run-status tools aren't available, check the result in Google Sheets directly. Ask the user to delete the test row; the agent doesn't delete it.

Then publish, wait until the trigger is active, and confirm it in the editor.

## Notes

- The trigger watches one label or mailbox. If `label_ids` is left empty it fires on all mail, drafts included, so always set it.
- Rows are never deduplicated. If Gmail delivers the same message twice, for example when a label is removed and added again, it can be logged twice.
- The preview is the plain-text body with line breaks collapsed, cut to `PREVIEW_LENGTH` characters. An HTML-only email gets an empty preview.
- The message link is the one Gmail's trigger provides. It opens the email in the connected account, so only people with access to that inbox can follow it.
- Google Sheets may show the date in the sheet's own format and time zone.
- The sheet holds senders' names and email addresses and message previews. Share it only with the people who need it, and don't commit a real spreadsheet ID to a repository.
