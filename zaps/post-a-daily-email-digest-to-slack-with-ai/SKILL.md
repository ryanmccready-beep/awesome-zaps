---
name: post-a-daily-email-digest-to-slack-with-ai
description: Build a Zap on Zapier that reads the user's Gmail inbox once a day and posts a digest in Slack, with the emails that need them first, a suggested reply for each, and everything else grouped by type. Use when someone wants to stop checking email through the day without missing what needs them.
license: MIT
metadata:
  author: zapier
  summary: "Once a day, AI reads your Gmail inbox and posts what needs you in Slack, each with a reply you can copy. Everything else is grouped so you can skip it."
  apps: "Gmail, Slack, AI by Zapier, Schedule by Zapier"
  category: "Personal Productivity"
  job: "Email management"
---

# Post a daily email digest to Slack with AI

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/post-a-daily-email-digest-to-slack-with-ai. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** every day at 4:00 PM in the account's timezone, weekends included (`schedule`, `everyDay`).
2. **Gmail** is searched with `INBOX_QUERY` (by default, the last day's inbox, up to 50 emails). The workflow reads each email's sender, subject and Gmail's short preview through Gmail's API, and builds a link that opens the email. When nothing came in, the Zap stops there.
3. **AI by Zapier** writes the digest. It opens with how many emails came in and how many need the user. Under _Needs you_ it lists every email that asks something of them or that a person wrote to them directly, most urgent first, with a suggested reply they can copy when someone expects an answer. Under _Everything else_ it groups the rest by `CATEGORIES`, each with a count and up to three links.
4. **Slack** posts the digest as the bot, in a channel or as a DM.

## Ask the user

Each `REPLACE_…` value is set per person.

| Setting                 | Where                          | What goes there                                                                                                                             |
| ----------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `REPLACE_SLACK_CHANNEL` | `SLACK_CHANNEL` in `config.ts` | Where the digest goes: a channel only they read, or their own Slack member ID to get it as a DM. Look up the ID with their Slack connection |

Also ask what time they want it and what usually fills their inbox. Set `hod` in `triggers/every-day.ts` and `CATEGORIES` in `config.ts` to match, since the categories decide how easy _Everything else_ is to skim.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `gmail` to the user's Gmail connection for the inbox to read, and `slack` to their Slack connection. `ai` uses AI by Zapier and needs no account of its own.
2. **Source:** publish `workflow.ts` and `config.ts`, with the `REPLACE_` values set to the user's answers. `triggers/every-day.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect the Slack `channel_message` and `direct_message` actions and the AI by Zapier `get_completion` action with the user's connections before the first test run, and fix any key in `workflow.ts` that doesn't match. Gmail is read through its API with the `gmail` connection, so there's no Gmail action to inspect.

## Test it

Run a draft test (`run_workflow_draft` in Zapier MCP) with `SLACK_CHANNEL` set to the user's own member ID, so the digest arrives as a DM only they see. The schedule trigger sends nothing the Zap reads, so any input works:

```json
{}
```

Confirm that the DM opens with the count line, that each link under _Needs you_ opens the right email, and that each suggested reply answers what its email asked. Then set `SLACK_CHANNEL` to where the user wants the digest. The user deletes the test DM, not the agent.

## Notes

- The AI sees each email's sender, subject and preview. It can't open the full email, so a suggested reply answers only what the preview shows, and the user reads the email before sending one.
- The digest copies email subjects and previews into Slack. Send it to a DM or a channel only the user can read.
- `INBOX_QUERY` takes any Gmail search. `in:inbox newer_than:1d -category:promotions` drops promotions, and `-from:` leaves out a sender.
- To skip weekends, set `weekends` to `"no"` in `triggers/every-day.ts`.
