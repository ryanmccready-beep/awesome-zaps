# Offboard terminated BambooHR employees in Okta and Google Workspace

When someone is terminated in BambooHR, IT gets a Slack heads-up, and at the end of their last day the zap removes their Okta and Google Workspace access and posts what worked, what failed and what's left to do by hand.

**Apps:** BambooHR, Okta, Google Workspace Admin, Slack

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/offboard-terminated-bamboohr-employees-in-okta-and-google-workspace

The agent follows `SKILL.md`: it asks you for the IT Slack channel and how Okta should handle leavers, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`bamboohr`, `google-workspace-admin`, `okta`, `slack`)
- `triggers/`: what starts it
