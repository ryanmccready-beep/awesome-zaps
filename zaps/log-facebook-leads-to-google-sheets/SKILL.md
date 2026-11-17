---
name: log-facebook-leads-to-google-sheets
description: Build a Zap on Zapier that adds a row to a Google Sheet for every new Facebook Lead Ads submission, with the lead's ID, time, name, email, phone and the form, ad and campaign it came from. Use when a sales or marketing team runs Facebook lead forms and wants every lead in one sheet for faster follow-up.
license: MIT
metadata:
  author: zapier
  summary: "Every new Facebook lead form submission is logged as a row in Google Sheets with the lead's contact details and the form, ad and campaign it came from, so follow-up starts from one list."
  apps: "Facebook Lead Ads, Google Sheets"
  category: "Marketing"
  job: "Lead management"
  source: "https://zapier.com/templates/details/f34b293b7bb3fb8a1a19e436333b8491549e29fe94ba37be38f9d5101d757399"
---

# Log Facebook leads to Google Sheets

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/log-facebook-leads-to-google-sheets. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new lead from a Facebook Lead Ads form (`facebook-lead-ads`, `lead`), for one Page and optionally one form.
2. **Google Sheets** adds one row (`google-sheets`, `add_row`) to the lead log worksheet with the lead ID, created time, full name, email, phone number, form name, ad name and campaign name. Every lead gets a new row.

The Zap only writes to the sheet. It doesn't contact the lead.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting          | Where it lives     | What goes there                                                                                                                     |
| ---------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `FACEBOOK_PAGE`  | `triggers/lead.ts` | The Facebook Page that owns the lead form. Ask which Page, then look up its ID with the user's Facebook Lead Ads connection.        |
| `FACEBOOK_FORM`  | `triggers/lead.ts` | The lead form to log. Ask which form, then look up its ID. If they want every form on the Page, leave the `form` param out instead. |
| `SPREADSHEET_ID` | `config.ts`        | The lead log sheet. Ask which sheet it is, then look up its ID with the user's Google Sheets connection.                            |
| `WORKSHEET_ID`   | `config.ts`        | The tab that gets the rows. Ask which tab, then look up its ID with the user's Google Sheets connection; the first tab is `"0"`.    |

Also ask about the sheet's columns. The `COLUMNS` map at the top of `workflow.ts` sends lead fields to column keys such as `COL$A`, not header names. The sheet's header row must match it: lead ID, created time, full name, email, phone number, form name, ad name, campaign name, in columns A to H. If the user's sheet is laid out differently, change the map, or add headers to match.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `facebook-lead-ads` (the Facebook account that owns the lead form's Page, used by the trigger) and `google-sheets` (the account that owns the lead log sheet) to the user's connections. No other app needs a connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/lead.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them, with the trigger's `page` and `form` set to the user's answers. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match, such as the lead field names (`form_name`, `ad_name`, `campaign_name`).

## Test it

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing, pointed at a copy of the lead log sheet:

```json
{
  "id": "lead-1001",
  "created_time": "2026-12-01T09:30:00+0000",
  "full_name": "[install-test] Jane Example",
  "email": "jane.example@example.com",
  "phone_number": "+15550100100",
  "form_name": "[install-test] Spring Promo",
  "ad_name": "[install-test] Spring Promo Ad",
  "campaign_name": "[install-test] Spring Campaign"
}
```

Confirm one new row appears with these values in the mapped columns. If run-status tools aren't available, check the result in Google Sheets directly. Ask the user to delete the test row; the agent doesn't delete it.

Then publish and confirm the trigger is active.

## Notes

- Facebook lead field names depend on the Zapier trigger version. If a column comes through blank, sample the trigger and update the input schema and `COLUMNS` map in `workflow.ts`.
- To log extra answers from the form, add a column to the sheet and a matching entry in `COLUMNS`, the schema and the `add_row` inputs.
- Each submission adds a row, so a lead that submits twice appears twice. To alert the sales team, add a Slack message or email after the row is created.
- The sheet holds leads' names, emails and phone numbers. Share it only with the people who follow up, and don't commit a real spreadsheet ID to a repository.
