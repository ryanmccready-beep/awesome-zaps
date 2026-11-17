# Log Calendly bookings to Google Sheets

When someone books a Calendly event, a row with the invitee's name and email, the event type, start and end times, timezone and cancel and reschedule links is added to your Google Sheets booking log.

**Apps:** Calendly, Google Sheets

**Based on:** [Log scheduled events from Calendly to Google Sheets](https://zapier.com/templates/details/c652adf0ae70e0c94fd45bb6fc80372b15ab4f9599f5de7ca80bd2738ebc204b) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/log-calendly-bookings-to-google-sheets

The agent follows `SKILL.md`: it asks you which sheet and tab hold the log, which Calendly event type to log, and whether to include reschedules, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`calendly`, `google-sheets`)
- `triggers/`: what starts it
