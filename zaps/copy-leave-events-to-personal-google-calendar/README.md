# Sync new leave events from Google Calendar to personal calendar

Sync new leave events from your Google Calendar to your personal calendar, ensuring all leave requests are accurately reflected in your schedule for better planning and visibility.

**Apps:** Google Calendar

**Based on:** [Sync new leave events from Google Calendar to personal calendar](https://zapier.com/templates/details/8375c17fa73a61954c72a79a0d92aa7a5ce4dfb833bef5056f8fceff774d2b04) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/copy-leave-events-to-personal-google-calendar

The agent follows `SKILL.md`: it asks you for the calendar that holds leave events and the personal calendar that receives the copies, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`google-calendar`)
- `triggers/`: what starts it
