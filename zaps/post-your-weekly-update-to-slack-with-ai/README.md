# Post your weekly update to Slack with AI

Every Friday, AI by Zapier writes your weekly update from what you did in Slack, Gmail and Google Calendar, then posts it in your team's channel as you. It leads with your wins, ranked by what your readers care about, and ends with next week's focus.

**Apps:** Slack, Gmail, Google Calendar, AI by Zapier, Schedule by Zapier

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/post-your-weekly-update-to-slack-with-ai

The agent follows `SKILL.md`: it asks about your role, your readers and where the update goes, then builds, tests and turns on the Zap in your account.

## Make it yours

Ask your agent to add any of these once the basic version works:

- **Add the docs you worked on** from Google Drive, so a doc you finished counts even if you never mentioned it in Slack.
- **Read your tracker,** a Google Sheet or Zapier Table where you log projects, for outcomes and numbers.
- **Search company knowledge with Glean** for launches and projects you were part of.
- **Approve it before it posts:** DM it to you with a button, and post to the channel only after you approve.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings, including your role, your readers, the ranking and the writing prompt
- `connections/`: the accounts it uses (`slack`, `gmail`, `google-calendar`, `ai`)
- `triggers/`: what starts it
