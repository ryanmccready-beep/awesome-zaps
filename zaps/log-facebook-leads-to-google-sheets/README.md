# Log Facebook leads to Google Sheets

When someone fills in a Facebook lead form, a row with their lead ID, name, email, phone and the form, ad and campaign they came from is added to your Google Sheet, so your team can follow up from one list.

**Apps:** Facebook Lead Ads, Google Sheets

**Based on:** [Capture new leads from Facebook Lead Ads and log details in Google Sheets](https://zapier.com/templates/details/f34b293b7bb3fb8a1a19e436333b8491549e29fe94ba37be38f9d5101d757399) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/log-facebook-leads-to-google-sheets

The agent follows `SKILL.md`: it asks you which Facebook Page and lead form feed it and which Google Sheet and tab hold the log, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`facebook-lead-ads`, `google-sheets`)
- `triggers/`: what starts it
