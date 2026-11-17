---
name: post-google-forms-leads-to-slack
description: Build a Zap on Zapier that posts every new Google Forms lead response to your team's Slack channel as one message, with the lead's name as the headline and each answered question listed below it. Use when leads arrive through a Google Form and the team should hear about each one at once, instead of someone checking the responses sheet.
license: MIT
metadata:
  author: zapier
  summary: "When a lead submits your Google Form, a Slack message with their name and every answer is posted to your team channel, so follow-up starts quickly."
  apps: "Google Forms, Slack"
  category: "Sales"
  job: "Lead management"
  source: "https://zapier.com/templates/details/8be91dbad7f7e13d464b462bb129bb77efa7a7d1f2aaa4162d132afd27c1648d"
---

# Post Google Forms leads to Slack

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/post-google-forms-leads-to-slack. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new response is submitted to the lead form (`google-forms`, `new_form_response`). The form is set on the trigger.
2. **Code:** builds one message. The first line is `New lead: <name>` in bold, taken from the form question named in `NAME_QUESTION`. Below it, each answered question appears as `*Question*: answer`. Questions left blank are skipped, and multiple-choice answers with several picks are joined with commas. A response with no answers at all stops the run and posts nothing.
3. **Slack:** posts the message to the team channel. Mentions and link previews are switched off, so a lead's answers never ping anyone by accident.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                 | Where                                     | What goes there                                                                                                            |
| ----------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `REPLACE_FORM_ID`       | `triggers/new-form-response.ts`, `formId` | The Google Form that collects the leads, looked up from the user's Google Forms connection                                 |
| `REPLACE_SLACK_CHANNEL` | `config.ts`, `SLACK_CHANNEL`              | The channel that gets the lead notices, looked up from the user's Slack connection. The Slack app must be in that channel. |

Also review the default with them: `NAME_QUESTION` in `workflow.ts` (`Name`) is the title of the form question that holds the lead's name. It must match the form's question exactly, or the headline reads `New lead: (no name given)`.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-forms` (the trigger's connection) to the Google account that owns the lead form, and `slack` to the user's Slack connection for the workspace with the team channel.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-form-response.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them, and set the trigger's `formId` from the trigger file. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect each action's fields with the user's connections and sample the trigger before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test before publishing (`run_workflow_draft` in Zapier MCP). Use a test channel, not the team's real one. The sample is labelled `[install-test]`; its keys are question titles, so change them to match the user's form:

```json
{
  "Name": "[install-test] Alex Example",
  "Email": "you@example.com",
  "Company": "Example Co",
  "Phone": "",
  "What are you interested in?": "A demo"
}
```

Check that the run finished and that one message appeared in the test channel: `New lead: [install-test] Alex Example` in bold, then `Email`, `Company` and the interest question as bold-labelled lines, with no `Phone` line because it was blank. If run-status tools aren't available, check the test channel in Slack directly. Ask the user to delete the test message, since the user deletes test data, not the agent. Then publish, and confirm the trigger is active.

## Notes

- The code reads answers as a flat object keyed by question title, the way the other Google Forms zaps here do. The trigger's real output shape is only known from a real response, so confirm that against the first sample. If answers arrive nested or under other keys, change `buildMessage` to read them.
- Answers appear in the order the trigger delivers them, not necessarily the order of the form. Any extra keys the trigger adds besides the answers would also be listed, so remove them in `buildMessage` if the first sample shows some.
- Anyone who can read the channel sees every lead's answers, including contact details. Pick a channel with the right audience.
- To extend it: add the lead to a CRM or a sheet after the Slack post, or send a follow-up email to the lead.
