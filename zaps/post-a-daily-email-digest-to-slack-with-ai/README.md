# Post a daily email digest to Slack with AI

Once a day, AI by Zapier reads your Gmail inbox and posts a digest in Slack. The emails that need you come first, each with a suggested reply you can copy, and the rest are grouped by type so you can skip them.

**Apps:** Gmail, Slack, AI by Zapier, Schedule by Zapier

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/post-a-daily-email-digest-to-slack-with-ai

The agent follows `SKILL.md`: it asks where the digest should go, then builds, tests and turns on the Zap in your account.

## Make it yours

Ask your agent to add any of these once the basic version works:

- **Draft the replies in Gmail,** so each one is waiting in its thread when you open it.
- **Read the full email** for the ones that need you, so the suggested reply can use more than the preview.
- **Carry over what you didn't answer:** log each _Needs you_ email in a Zapier Table and list it again the next day until you reply.
- **A second digest in the morning,** on its own schedule, for what came in overnight.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings, including the inbox search, the categories and the digest prompt
- `connections/`: the accounts it uses (`gmail`, `slack`, `ai`)
- `triggers/`: what starts it
