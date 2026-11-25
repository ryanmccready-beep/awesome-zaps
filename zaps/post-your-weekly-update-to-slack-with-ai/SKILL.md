---
name: post-your-weekly-update-to-slack-with-ai
description: Build a Zap on Zapier that writes the user's weekly update every Friday from what they did that week in Slack, Gmail and Google Calendar, and posts it in their team's Slack channel as them. Use when someone owes a weekly status update and pieces it together from memory each week.
license: MIT
metadata:
  author: zapier
  summary: "Every Friday, AI writes your weekly update from your Slack messages, sent email and calendar, then posts it in your team's channel as you."
  apps: "Slack, Gmail, Google Calendar, AI by Zapier, Schedule by Zapier"
  category: "Personal Productivity"
  job: "Team communication"
---

# Post your weekly update to Slack with AI

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/post-your-weekly-update-to-slack-with-ai. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** every Friday at 11:30 AM in the account's timezone (`schedule`, `everyWeek`). The week counts from Monday at midnight UTC.
2. **Slack** is searched for the messages the user posted since Monday, up to `MAX_ITEMS` (100). DMs and group DMs are left out, so only what they said in channels reaches an update the team reads.
3. **Google Calendar** gives this week's meetings and the ones coming up through the end of next week, from the primary calendar. Focus time, out of office, working location and cancelled events are left out.
4. **Gmail** gives the recipients, subject and preview of each email the user sent since Monday, up to `MAX_ITEMS`.
5. **AI by Zapier** writes the update to the template in `UPDATE_INSTRUCTIONS`: a TL;DR, then wins ranked by `RANKING`, next week's focus from the calendar and any notable context, in under 2,400 characters. It uses only facts in the data, calls drafts and pending work "in progress", credits teammates' work to them, and leaves out anything personal, medical, financial or about another person's performance.
6. **Slack** posts the update as the user in `SLACK_CHANNEL` with link previews off. When `THREAD_MATCH` is set, it goes in today's update thread instead. A member ID in `SLACK_CHANNEL` sends it as a DM.

## Ask the user

Each `REPLACE_…` value is set per person.

| Setting                 | Where                          | What goes there                                                                                                                                   |
| ----------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `REPLACE_SLACK_CHANNEL` | `SLACK_CHANNEL` in `config.ts` | The channel their update goes to. Look up its ID with their Slack connection. Their own member ID sends it to them as a DM to read before sharing |
| `REPLACE_ROLE`          | `ROLE` in `config.ts`          | One or two sentences on their role, their team and what their work covers                                                                         |
| `REPLACE_AUDIENCE`      | `AUDIENCE` in `config.ts`      | Who reads the update and what those readers want to know from it                                                                                  |

Also ask when the update is due, and set `dow` and `hod` in `triggers/every-week.ts`. If their team starts a thread for updates each week, set `THREAD_MATCH` to words from that thread's first message, such as "Friday update". Ask what their readers care about most and reorder `RANKING` to match, since it decides which wins lead.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `slack` to the user's own Slack connection. It searches their messages and posts as them, so a shared or bot connection won't work. Bind `gmail` to their Gmail and `google-calendar` to their Google Calendar. `ai` uses AI by Zapier and needs no account of its own.
2. **Source:** publish `workflow.ts` and `config.ts`, with the `REPLACE_` values set to the user's answers. `triggers/every-week.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect the Slack `channel_message` and `direct_message` actions and the AI by Zapier `get_completion` action with the user's connections before the first test run, and fix any key in `workflow.ts` that doesn't match. Slack, Gmail and Google Calendar are read through their APIs with the connections, so there are no read actions to inspect.

## Test it

Run a draft test (`run_workflow_draft` in Zapier MCP) with `SLACK_CHANNEL` set to the user's own member ID, so the update arrives as a DM only they see. The schedule trigger sends nothing the Zap reads, so any input works:

```json
{}
```

Confirm that the DM follows the template, that every win is something the user did this week, and that nothing from a DM or anything personal appears. A test early in the week only covers the days so far. Then set `SLACK_CHANNEL` to the team channel. The user deletes the test DM, not the agent.

## Notes

- The update knows only what the user wrote in channels, what they emailed and what's on their calendar. Work that happened in DMs or in docs doesn't reach it unless they mention it in a channel.
- The AI sees each sent email's subject and preview. It can't open attachments or the rest of the email.
- It posts as the user, so it's worth reading the first few as DMs before pointing it at the team channel.
