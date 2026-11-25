---
name: draft-social-posts-from-slack-threads-with-ai
description: Build a Zap on Zapier that drafts a social media post from a Slack thread whenever someone types the bot's word in it, then revises the draft when asked in the thread. Use when a team shares news, launches or wins in Slack and wants a first draft of a post in its own voice without waiting on a social team.
license: MIT
metadata:
  author: zapier
  summary: "Type socialbot in a public Slack thread and AI drafts a social post from it in your voice. Ask for changes in the same thread."
  apps: "Slack, AI by Zapier"
  category: "Marketing"
  job: "Social media marketing"
---

# Draft social posts from Slack threads with AI

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/draft-social-posts-from-slack-threads-with-ai. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new message in a public Slack channel contains the word `socialbot` (`slack`, `mention_v2`). Bot messages are ignored, so the Zap's own replies don't start it again.
2. **Slack** gets a short "One sec." reply in the thread, so people know the request was heard.
3. **Workflow** reads the whole thread (up to 50 messages) with Slack's `conversations.replies` and labels the bot's earlier drafts. Attached files are listed by name.
4. **AI by Zapier** writes the draft in the user's voice guide, for LinkedIn unless the request names another platform. It opens on the angle a reader would care about and marks a missing fact that would make the post stronger as `[NEED: …]`. When the thread already has a draft, it revises the latest one to match the newest request ("shorter", "two versions").
5. **Slack** posts the draft in the thread as the bot. It never posts to a social network. A person copies the draft out.

## Ask the user

Each `REPLACE_…` value is set per person.

| Setting               | Where                        | What goes there                                                                                                |
| --------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `REPLACE_VOICE_GUIDE` | `VOICE_GUIDE` in `config.ts` | How their posts should sound (tone, words to use and avoid), plus two or three past posts they like, pasted in |

The voice guide decides most of the drafts' quality, so ask for real past posts rather than adjectives.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `slack` to the user's Slack connection for the workspace where people will call the bot. `ai` uses AI by Zapier and needs no account of its own.
2. **Source:** publish `workflow.ts` and `config.ts`, with the `REPLACE_` values set to the user's answers. `triggers/mention-v2.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect the Slack `channel_message` action and the AI by Zapier `get_completion` action with the user's connections before the first test run, and fix any key in `workflow.ts` that doesn't match. Confirm the mention event's payload has `channel` (the channel ID), `ts`, `thread_ts` and `text`, and map any name that differs.

## Test it

Run this sample as a draft test (`run_workflow_draft` in Zapier MCP) in a test channel the user owns. Post a parent message there first, labelled `[install-test]`, such as "[install-test] We shipped dark mode today. It's live on web for every plan, and the mobile apps get it next month." Then replace the sample `channel` with the test channel's ID, and `ts` and `thread_ts` with that message's timestamp:

```json
{
  "ts": "1700000000.000200",
  "thread_ts": "1700000000.000200",
  "channel": "C0123456789",
  "text": "socialbot write a LinkedIn post about this"
}
```

Confirm that the thread gets "One sec.", then a reply with a post draft in a code block. Then run it again with `"text": "socialbot shorter, and give me two versions"` and a new `ts`, and confirm the reply revises the first draft. The user deletes the test messages, not the agent.

## Notes

- Change the trigger word in `triggers/mention-v2.ts` and `BOT_NAME` in `config.ts` together, so the name people see is the word they type. Slack matches the word inside longer words too, so pick one that doesn't appear in everyday messages.
- The model sees file names in the thread but can't open the files. Paste the key text from a screenshot or PDF into the thread when the post depends on it.
- People in any public channel the connected user can see can call the bot. To limit it to some channels, add a filter on the channel in the Zapier editor.
- The draft says only what the thread says and marks gaps, but a person still checks every post before it goes out.
