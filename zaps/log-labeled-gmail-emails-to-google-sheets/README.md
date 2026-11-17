# Log labeled Gmail emails to Google Sheets

Every new email under a Gmail label or mailbox you choose gets its own row in a Google Sheet, with the date, sender, subject, a short preview and a link back to the message, so you keep a running record of your email in one place.

**Apps:** Gmail, Google Sheets

**Based on:** [Log new Gmail emails into Google Sheets for tracking](https://zapier.com/templates/details/016e3a305029a97da4a2665c3c97800bd7fe6710fa01263b5099098b5261c0fa) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/log-labeled-gmail-emails-to-google-sheets

The agent follows `SKILL.md`: it asks you for the Gmail label or mailbox to log and the sheet and tab that hold the log, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`gmail`, `google-sheets`)
- `triggers/`: what starts it
