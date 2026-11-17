---
name: email-team-about-webhook-events
description: Build a Zap on Zapier that emails your team whenever an event is posted to a webhook URL, with the event's title as the subject and its fields in the body. Use when an app, script or service can post events (new tasks, orders, alerts) and the right people should hear about them by email, optionally only for certain event types.
license: MIT
metadata:
  author: zapier
  summary: "Notify your team via email when a specific event is posted to your webhook, so new tasks and updates reach people quickly."
  apps: "Webhooks by Zapier, Email by Zapier"
  category: "Business Owners"
  job: "Team communication"
  source: "https://zapier.com/templates/details/fde58fdfc14c26768647670c2dc70e01551a5489ef28f3e882f7146a2b867094"
---

# Email team about webhook events

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/email-team-about-webhook-events. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** an event posted to a Webhooks by Zapier catch hook (`webhook`, `hook_v2`). Each POST starts one run.
2. **Filter (built as code, not a step):** optional list of event names worth emailing, read from the payload field named by `EVENT_FIELD`. The list is empty by default, so every event is emailed. Events not on a non-empty list are skipped.
3. **Email by Zapier** sends one plain-text email to the recipient. The subject is the payload's title field, or "New <event> event" when there is none. The body lists each field in `FIELDS` as `Label: value`; nested values appear as compact JSON.

The Zap only sends email. It never writes back to the sender.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                   | What goes there                                                         |
| ------------------------- | ----------------------------------------------------------------------- |
| `REPLACE_RECIPIENT_EMAIL` | The email address or team list that gets each event email (`config.ts`) |

Also settle with them, since the payload shape differs for every sender:

- **What the sender posts:** ask for an example payload. Rename `EVENT_FIELD`, `TITLE_FIELD` and the `field` names in `FIELDS` (all in `workflow.ts`) to match its keys, and drop or add rows so the body shows what the team needs.
- **`EVENTS_TO_EMAIL`** (in `workflow.ts`): optional. Event names worth emailing, such as `task.created`. Empty emails every event.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** none. Webhooks by Zapier and Email by Zapier need no connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/hook.ts` is a setting, not code: set the workflow's trigger binding from it. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect the email action's fields, and sample the trigger, before the first test run. Fix any key in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test before publishing, with `REPLACE_RECIPIENT_EMAIL` set to an address the user controls so no one else gets the test email:

```json
{
  "event": "task.created",
  "title": "[install-test] Review the Q3 plan",
  "description": "[install-test] Sample task for the install check.",
  "assignee": "install-test@example.com",
  "url": "https://example.com/tasks/install-test-001"
}
```

Check that one email arrived with the subject `[install-test] Review the Q3 plan` and a body listing the event, title, description, assignee and link. If `EVENTS_TO_EMAIL` is set, also send an event not on the list and check that no email arrives. If run-status tools aren't available, check the inbox directly. Then publish, confirm the trigger is active, and give the user their webhook URL to point the sender at. The user deletes the test emails, not the agent.

## Notes

- The field names in the sample are defaults, not a contract. The agent must adjust them to the user's real payload.
- Nested values (objects and lists) appear in the body as compact JSON. Fields missing from a payload are left out of the body.
- Email by Zapier sends from a zapiermail.com address and is limited to 10 sends an hour on paid plans. A busy sender will hit that limit; use Gmail or SMTP for higher volume.
- Anyone with the webhook URL can trigger emails to the recipient, so keep it private.
- Never commit a real recipient address or webhook URL.
