# Offboard departing HiBob employees in Okta and Google Workspace

When an employee's termination date arrives in HiBob, their Okta and Google Workspace access is removed and IT gets a Slack summary of what worked, what failed and what's left to do by hand.

**Apps:** HiBob, Okta, Google Workspace Admin, Slack

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/offboard-departing-hibob-employees-in-okta-and-google-workspace

The agent follows `SKILL.md`: it asks you for the IT Slack channel and how Okta should handle leavers, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`google-workspace-admin`, `hibob`, `okta`, `slack`)
- `triggers/`: what starts it
