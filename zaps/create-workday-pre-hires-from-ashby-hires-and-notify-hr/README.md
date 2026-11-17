# Create Workday pre-hires from Ashby hires and notify HR

When a candidate is hired in Ashby, their Workday pre-hire is created with name, email, job and start date, and People Ops gets a Slack message saying it's ready or what went wrong.

**Apps:** Ashby, Workday, Slack

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/create-workday-pre-hires-from-ashby-hires-and-notify-hr

The agent follows `SKILL.md`: it asks you for the HR Slack channel and your default country, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`ashby`, `slack`, `workday`)
- `triggers/`: what starts it
