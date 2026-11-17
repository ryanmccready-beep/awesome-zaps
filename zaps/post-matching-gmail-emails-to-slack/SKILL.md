---
name: post-matching-gmail-emails-to-slack
description: Build a Zap on Zapier that watches Gmail for emails matching a search you choose and posts each one to a Slack channel, with the sender, subject, a short preview and a link back to the original email. Use when a team should see certain emails, such as those from a key sender or about a topic, in Slack without anyone forwarding them.
license: MIT
metadata:
  author: zapier
  summary: "When a new email matches your Gmail search, its sender, subject and a short preview are posted to a Slack channel with a link to the original, so the team sees it right away."
  apps: "Gmail, Slack"
  category: "Personal Productivity"
  job: "Email management"
  source: "https://zapier.com/templates/details/ff77c790cfb1aaf87df112cf6da7529fd91fb98b30ef066e38157b4386b7160c"
---

# Post matching Gmail emails to Slack

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/post-matching-gmail-emails-to-slack. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new Gmail email matches the search set on the trigger (`gmail`, `search`). The search does all the filtering; the code has no keyword filter.
2. **Slack:** one message is posted to the channel. The first line is the sender's name (or address), then the subject in bold, then the first 300 characters of the body, then a link to the original email. Mentions and link previews are switched off.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve channel names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                | Where                | What goes there                                                                                                                                                                               |
| ---------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `REPLACE_GMAIL_SEARCH` | `triggers/search.ts` | The Gmail search that picks the emails, using Gmail search operators, e.g. `from:billing@example.com in:inbox` or `subject:(invoice OR receipt) has:attachment in:inbox`. Include `in:inbox`. |
| `SLACK_CHANNEL`        | `config.ts`          | The channel that gets the posts, looked up from the user's Slack connection. The Slack app must be in that channel.                                                                           |

Also review the default with them: `PREVIEW_LENGTH` (`300` body characters, in `workflow.ts`).

Confirm with them as well:

- Which Gmail account is searched, and which sender, subject words or label identify the emails?
- Should the team see the full body or only a preview?

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `slack` (used by the workflow's post) to the user's Slack connection for the workspace with the channel, and `gmail` (used by the trigger) to the Gmail account to search. Both apps need a connection; no other apps are used.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/search.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them, with `REPLACE_GMAIL_SEARCH` replaced by the user's search. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections (and sample the trigger, if it has one) before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test before publishing (`run_workflow_draft` in Zapier MCP). Use a test channel, not the team's real one. The sample is labelled `[install-test]` and matches the fields the Gmail trigger declares:

```json
{
  "subject": "[install-test] Weekly report ready",
  "body_plain": "[install-test] The weekly report for test.example.com is ready to review. Open the attached summary for the key numbers.",
  "from": {
    "name": "[install-test] Reports Bot",
    "email": "you@example.com"
  },
  "message_url": "https://mail.google.com/mail/u/0/#inbox/install-test-1"
}
```

Check that the run finished and that one message appeared in the test channel with the sender in bold, the subject in bold, the preview and the link. If run-status tools aren't available, check the test channel in Slack directly. Ask the user to delete the test message, since the user deletes test data, not the agent. Then publish, and confirm the trigger is active.

## Notes

- The Gmail search is the only filter. A search without `in:inbox` also matches mail the user sent, so those would be posted too.
- Gmail's message link opens the original email in the connected account, so only people with access to that inbox can follow it. Anyone who can read the channel sees the sender, subject and preview.
- To post only some of the matches, narrow the search rather than adding code.
