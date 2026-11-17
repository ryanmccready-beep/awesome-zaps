# Post matching Gmail emails to Slack

When a new email matches a Gmail search you choose, its sender, subject and a short preview are posted to a Slack channel, with a link back to the original email, so your team sees important emails without anyone forwarding them.

**Apps:** Gmail, Slack

**Based on:** [Notify team member in Slack when new relevant email arrives in Gmail](https://zapier.com/templates/details/ff77c790cfb1aaf87df112cf6da7529fd91fb98b30ef066e38157b4386b7160c) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/post-matching-gmail-emails-to-slack

The agent follows `SKILL.md`: it asks you which Gmail search picks the emails and which Slack channel gets the posts, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`gmail`, `slack`)
- `triggers/`: what starts it, including the Gmail search
