---
name: post-webhook-events-to-slack
description: Build a Zap on Zapier that catches events sent to a Webhooks by Zapier hook and posts each one to your team's Slack channel, with a title line and the payload fields you choose. Use when another system can call a webhook and the team wants specific events in Slack for immediate awareness and action.
license: MIT
metadata:
  author: zapier
  summary: "When a system sends an event to a webhook, its title and key details are posted to your team channel, optionally only for the event names you care about."
  apps: "Webhooks by Zapier, Slack"
  category: "Engineering"
  job: "Dev ops"
  source: "https://zapier.com/templates/details/826314421c4b77d6dc38631b6394a17fdc52dde944441ee6d7728cd2e42c40af"
---

# Post webhook events to Slack

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/post-webhook-events-to-slack. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a system posts each event to a Webhooks by Zapier catch hook (`webhook`, `hook_v2`).
2. **Filter (in code):** the event name is read from the first of the `EVENT_FIELDS` that has a value (`event`, then `type`). If `ALLOWED_EVENTS` lists any names, an event not on the list stops the run and posts nothing. The list is empty by default, so every event posts.
3. **Slack:** one message is posted to the team channel. The first line is the title in bold, taken from the `title` field and falling back to the event name. Under it, each field in `FIELDS` that has a value is written as `*Label*: value`. Nested values are written as compact JSON. Mentions and link previews are switched off, so an event never pings the whole channel.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve channel names to IDs with the user's Slack connection; don't ask them to paste an ID you can look up.

| Setting         | What goes there                                                                                                       |
| --------------- | --------------------------------------------------------------------------------------------------------------------- |
| `SLACK_CHANNEL` | The channel that gets the notices, looked up from the user's Slack connection. The Slack app must be in that channel. |

Also review the constants at the top of `workflow.ts` with them: `EVENT_FIELDS` (which payload fields hold the event name), `ALLOWED_EVENTS` (the event names worth posting, empty for all), `TITLE_FIELD` and `FIELDS` (which payload fields to show, and their labels).

- What does the sender's payload look like? The payload shape differs per sender, so ask for a sample, or have them send one test event to the hook, and change the field names in `EVENT_FIELDS`, `TITLE_FIELD` and `FIELDS` to match before building. The defaults are only a guess.
- Which events should reach Slack? Put their exact names in `ALLOWED_EVENTS`, or leave it empty to post everything.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `slack` to the user's Slack connection for the workspace with the team channel. Webhooks by Zapier needs no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer and the field constants adjusted to their payload. `triggers/hook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test run (`run_workflow_draft` in Zapier MCP) before publishing, using a test channel, not the team's real one:

```json
{
  "event": "[install-test] deployment.failed",
  "title": "[install-test] Deployment failed for example-service",
  "description": "The release build exited with an error.",
  "severity": "high",
  "source": "ci",
  "url": "https://example.com/deployments/install-test-1",
  "details": { "attempt": 2, "region": "us-east-1" }
}
```

Check that one message appears in the test channel with the title in bold followed by the labelled fields. If `ALLOWED_EVENTS` is set, run a second sample whose `event` is not on the list, and check that the run finishes as `skipped` with reason `event-not-in-allowed-list` and that nothing appears in the channel. If run-status tools aren't available, check the test channel in Slack directly. Ask the user to delete the test messages; the agent doesn't delete them. Then publish and confirm the trigger is active.

## Notes

- After publishing, give the user the catch hook URL to point their system at. Anyone with that URL can post into the channel, so keep it out of shared documents and public repositories.
- Values are posted as the sender wrote them. Don't add fields that carry secrets or personal data to `FIELDS`, because everyone in the channel can read them.
- Fields not listed in `FIELDS` are ignored. To show a nested field, list its top-level key and it is written as compact JSON.
- To route some events to a different channel or tag an on-call person, add a second Slack step filtered on the event name.
