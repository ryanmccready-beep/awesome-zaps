# Send personalized emails from new sheet rows

When a new row is added to your Google Sheet, a personalized email is sent through Gmail to the address in that row, with the subject and body filled in from the row's cells.

**Apps:** Google Sheets, Gmail

**Based on:** [Send personalized email via Gmail when new row is added in Google Sheets](https://zapier.com/templates/details/35ab831474746711f241639781a7423b05e2bbd9c72d33ba6b8dac8adedb48ae) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/send-personalized-emails-from-new-sheet-rows

The agent follows `SKILL.md`: it asks you for your spreadsheet, the column with the email addresses and the wording of the email, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`gmail`, `google-sheets`)
- `triggers/`: what starts it
