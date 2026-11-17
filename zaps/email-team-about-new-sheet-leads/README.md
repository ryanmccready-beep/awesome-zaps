# Email team about new sheet leads

When a new lead is added to your Google Sheet, your team gets an email with the lead's details so they can follow up quickly.

**Apps:** Google Sheets, Email by Zapier

**Based on:** [Notify team member via email when new lead is added in Google Sheets](https://zapier.com/templates/details/2905f83ce2232499f6cdd64bd4f283fbd38fcd734da79521cef80a17e48e88be) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/email-team-about-new-sheet-leads

The agent follows `SKILL.md`: it asks you which spreadsheet holds the leads and who gets the emails, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` value is filled in for each person
- `connections/`: the account it uses (`google-sheets`)
- `triggers/`: what starts it; the spreadsheet and worksheet are set here
