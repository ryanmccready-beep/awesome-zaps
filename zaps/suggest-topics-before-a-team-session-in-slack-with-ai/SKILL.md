---
name: suggest-topics-before-a-team-session-in-slack-with-ai
description: Build a Zap on Zapier that posts a reminder in a team's Slack channel the day before a recurring session on Google Calendar, waits for replies, then suggests in the thread what to work on, based on the replies and the channel's week. Use when a team runs office hours or a help desk and wants people to arrive with a problem to work on.
license: MIT
metadata:
  author: zapier
  summary: "The day before your team's session, a bot asks who's coming and what they want to work on. Twelve hours later, AI suggests focus areas from the replies and the week's messages."
  apps: "Google Calendar, Slack, AI by Zapier"
  category: "Personal Productivity"
  job: "Meeting management"
---

# Suggest topics before a team session in Slack with AI

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/suggest-topics-before-a-team-session-in-slack-with-ai. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** one day before each event on the chosen calendar whose title contains the session's name (`google-calendar`, `event_start`).
2. **Slack** gets a reminder in the team channel, posted as the bot: "_[session name]_ is tomorrow. React with :+1: if you're coming, and reply in this thread with a problem you'd like to work on."
3. **Wait:** the Zap pauses for `WAIT_HOURS` (12) so people can react and reply.
4. **Workflow** reads the reminder's reactions and replies, and the channel's messages from the last `LOOKBACK_DAYS` (7) days. The bot's own posts and Slack's notices, such as "has joined the channel", are left out.
5. **AI by Zapier** suggests two or three focus areas. What people asked for in the replies comes first, then problems from the week that came up more than once or that someone was stuck on. It opens with how many people reacted that they're coming. If nobody replied and the week was quiet, it says the floor is open.
6. **Slack** posts the suggestions as a reply in the reminder's thread.

## Ask the user

Each `REPLACE_…` value is set per person.

| Setting                 | Where                                      | What goes there                                                                                                                            |
| ----------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `REPLACE_SLACK_CHANNEL` | `SLACK_CHANNEL` in `config.ts`             | The channel the team talks in. The reminder goes there and the week's messages come from there. Look up its ID with their Slack connection |
| `REPLACE_CALENDAR_ID`   | `calendarid` in `triggers/event-start.ts`  | The calendar that holds the session. Look up its ID with their Google Calendar connection                                                  |
| `REPLACE_EVENT_NAME`    | `search_term` in `triggers/event-start.ts` | The session's name as it appears on the calendar, such as "Office hours"                                                                   |

With the defaults, the reminder goes out 24 hours before the session and the suggestions 12 hours before, which is overnight for most sessions. Ask when they'd like each one to land, and set `time_length` in the trigger and `WAIT_HOURS` in `config.ts` to match.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-calendar` to the user's Google Calendar connection for the calendar with the session, and `slack` to a Slack connection that can read and post in the team channel. `ai` uses AI by Zapier and needs no account of its own.
2. **Source:** publish `workflow.ts` and `config.ts`, with the `REPLACE_` values set to the user's answers. `triggers/event-start.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect the Slack `channel_message` action and the AI by Zapier `get_completion` action with the user's connections before the first test run, and fix any key in `workflow.ts` that doesn't match. Confirm the calendar trigger's payload has `summary` (the event's title), and map it if the name differs.

## Test it

Set `WAIT_HOURS` to `0.05` (three minutes) and `SLACK_CHANNEL` to a test channel the user owns, then run this sample as a draft test (`run_workflow_draft` in Zapier MCP):

```json
{
  "summary": "[install-test] Team build session"
}
```

When the reminder appears, post a reply in its thread labelled `[install-test]`, such as "[install-test] I'd like to work on getting our weekly report Zap to stop timing out on big sheets." Confirm that after three minutes the thread gets the suggestions, with the test reply as the first focus area. Then set `WAIT_HOURS` and `SLACK_CHANNEL` back. The user deletes the test messages, not the agent.

## Notes

- Everything posted in the channel that week goes to AI by Zapier. Use the team's working channel and keep sensitive threads somewhere else.
- Replies to the reminder are the strongest signal. If the user rewrites `REMINDER_TEXT`, keep the ask for a reply in the thread.
- Messages people post through other Zaps count as theirs. Only posts under this Zap's `BOT_NAME` and Slack's own notices are left out.
