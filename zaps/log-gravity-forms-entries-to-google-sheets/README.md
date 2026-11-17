# Log Gravity Forms entries to Google Sheets

When someone submits your Gravity Forms form, their answers land as a new row in a Google Sheets worksheet, with the submission time, so you can sort, filter and follow up from one place.

**Apps:** Gravity Forms, Google Sheets

**Based on:** [Capture form responses from Gravity Forms and create rows in Google Sheets](https://zapier.com/templates/details/a6ed389f9202f7dafc82e1e7bbaa7c19fc73259e94fc7585c8460cf968f552a0) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/log-gravity-forms-entries-to-google-sheets

The agent follows `SKILL.md`: it asks you for your form, your log sheet and which form field goes in which column, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`gravity-forms`, `google-sheets`)
- `triggers/`: what starts it
