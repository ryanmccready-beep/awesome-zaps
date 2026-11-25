# Suggest topics before a team session in Slack with AI

The day before your team's office hours or working session, a bot posts in your Slack channel asking who's coming and what they want to work on. Twelve hours later, AI by Zapier replies in the thread with two or three focus areas, drawn from the replies and what the team posted that week.

**Apps:** Google Calendar, Slack, AI by Zapier

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/suggest-topics-before-a-team-session-in-slack-with-ai

The agent follows `SKILL.md`: it asks which channel and calendar event to use, then builds, tests and turns on the Zap in your account.

## Make it yours

Ask your agent to add any of these once the basic version works:

- **Put the topics on the invite,** so they're in the calendar event when people join.
- **Follow up on last time:** read the notes from the last session in Google Docs and suggest what to pick back up.
- **Track topics over time** in a Zapier Table, so problems that keep coming back stand out.
- **Remind the people who reacted** an hour before the session, with the final topics.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings, including the reminder, the wait, the lookback and the prompt
- `connections/`: the accounts it uses (`google-calendar`, `slack`, `ai`)
- `triggers/`: what starts it
