---
name: email-team-about-new-sheet-leads
description: Build a Zap on Zapier that emails a team member or shared inbox for every new lead row added to a Google Sheets worksheet, with the lead's name, email, phone, company and notes. Use when a sales or marketing team collects leads in a spreadsheet and wants someone told right away so they can follow up.
license: MIT
metadata:
  author: zapier
  summary: "When a new lead is added to your Google Sheet, your team gets an email with the lead's details so they can follow up quickly."
  apps: "Google Sheets, Email by Zapier"
  category: "Sales"
  job: "Lead management"
  source: "https://zapier.com/templates/details/2905f83ce2232499f6cdd64bd4f283fbd38fcd734da79521cef80a17e48e88be"
---

# Email team about new sheet leads

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/email-team-about-new-sheet-leads. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new row is added to the bottom of the leads worksheet in Google Sheets (`google-sheets`, `new_row_notify_hook`).
2. If the row has neither a name nor an email, the run stops (blank row).
3. **Email by Zapier** sends one plain-text email to the team address. The subject is `New lead: <name>` (the email address when the name is blank). The body lists each filled column as `Label: value`: Name, Email, Phone, Company, Notes.

The Zap only reads the sheet and sends email. It never edits a row.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting       | Where it lives                                               | What goes there                                                   |
| ------------- | ------------------------------------------------------------ | ----------------------------------------------------------------- |
| `TEAM_EMAIL`  | `config.ts`                                                  | The team member or shared inbox address that gets each lead email |
| `spreadsheet` | `triggers/new-row-notify-hook.ts` (`REPLACE_SPREADSHEET_ID`) | The leads spreadsheet: the long ID in its URL                     |
| `worksheet`   | `triggers/new-row-notify-hook.ts` (`REPLACE_WORKSHEET_ID`)   | The tab holding the leads (the first tab is `"0"`)                |

Also review the column map with them: `LEAD_COLUMNS` in `workflow.ts` assumes columns A to E hold name, email, phone, company and notes. The worksheet needs a header row, and its headers must match that order.

Ask them:

- Which spreadsheet and tab holds the leads, and which columns hold the name, email, phone, company and notes? If they have no sheet yet, offer to create one with those five headers.
- Which team member or shared inbox should get the emails?

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-sheets` (the account that owns the leads spreadsheet) to the user's connection. The trigger uses it. Email by Zapier needs no connection and gets no alias.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-row-notify-hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them, with the trigger's `spreadsheet` and `worksheet` params from the user's answers. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Add a row to a test sheet the user controls (or use one they just added), and set `TEAM_EMAIL` to an address the user controls so no one else gets the test email. Then run it as a draft test run (`run_workflow_draft` in Zapier MCP) with the trigger's record as input. Sample input:

```json
{
  "id": 2,
  "row": 2,
  "COL$A": "[install-test] Sample Lead",
  "COL$B": "sample.lead@example.com",
  "COL$C": "555-0100",
  "COL$D": "Example Co",
  "COL$E": "Asked for a demo"
}
```

Check that one email arrived with the subject `New lead: [install-test] Sample Lead` and a body listing the five fields. A row with only a name still sends, with the empty fields left out. A row with no name and no email returns `{ skipped: true, reason: "empty-lead" }` and sends nothing. If run-status tools aren't available, check the inbox directly. Publish after the checks pass, and wait until the trigger reads back as active. The user deletes the test rows and emails, not the agent.

## Notes

- The trigger fires only for rows added at the bottom of the sheet; editing an existing row doesn't send again.
- Email by Zapier sends from a Zapier address, so the team can't reply straight to the lead. They copy the lead's email address out of the message. Use Gmail for sending from a team address.
- Email by Zapier is limited to 10 sends an hour on paid plans, so a burst of leads can hit that limit.
- Empty cells are left out of the trigger record and so out of the email.
- Never commit a real team address or spreadsheet ID.
