# Post new or updated sheet rows to Slack

When a row is added to a Google Sheets worksheet, or an existing row is edited, a short message listing its key columns is posted to a Slack channel. Use it to keep a team informed about changes such as new or updated user accounts.

**Apps:** Google Sheets, Slack

**Based on:** [Notify Slack channel when Google Sheets entry is new or updated](https://zapier.com/templates/details/d3ad4b678522a063cc97ebd001f6af57ebfe50254e0494488e0d1f594b6f1c08) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/post-new-or-updated-sheet-rows-to-slack

The agent follows `SKILL.md`: it asks you which spreadsheet and tab to watch, which column edits should trigger a post, which columns to show and which Slack channel gets the posts, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`google-sheets`, `slack`)
- `triggers/`: what starts it
