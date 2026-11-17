---
name: email-typeform-tour-request-summaries
description: Build a Zap on Zapier that emails a summary of every new Typeform customer tour request to the business owner. Use when a business takes tour or visit requests through a Typeform form and wants the owner to see the details right away instead of opening the form's responses.
license: MIT
metadata:
  author: zapier
  summary: "Every new customer tour request in Typeform sends the business owner a summary email with the contact details, preferred date and time, party size and notes."
  apps: "Typeform, Email by Zapier"
  category: "Business Owners"
  job: "Scheduling coordination"
  source: "https://zapier.com/templates/details/fc7ef35c7b6857cbdafbd2100392d850cc7df7278a316b46b2e4e0a430a5da6f"
---

# Email tour request summaries from Typeform

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/email-typeform-tour-request-summaries. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new response to a Typeform form (`typeform`, `entries_resthook_v2`, for the form you choose). Each response starts one run.
2. **Filter:** if the response has neither a name nor an email, the run stops and sends nothing.
3. **Email by Zapier** (`email`) sends one plain-text summary to the owner. The subject is `Tour request: <name> on <preferred date>`. The body lists name, email, phone, preferred date and time, party size and notes, then any other answers on the form.

The Zap only sends email. It never replies to the customer.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                    | Where                                    | What goes there                                       |
| -------------------------- | ---------------------------------------- | ----------------------------------------------------- |
| `REPLACE_TYPEFORM_FORM_ID` | `triggers/entries-resthook.ts`, `params` | The Typeform form that collects tour requests         |
| `OWNER_EMAIL`              | `config.ts`                              | The email address that gets each tour request summary |

Also review the default with them: `QUESTIONS` at the top of `workflow.ts` maps each summary line to a question name on the form (`Name`, `Email`, `Phone`, `Preferred date`, `Preferred time`, `Party size`, `Notes`). Question names differ per form, so match them to the real questions on the chosen form.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `typeform` (the alias the trigger in `triggers/` uses) to the user's Typeform connection, for reading the chosen form's responses. Email by Zapier (`email`) needs no connection and gets no alias.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/entries-resthook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** sample the trigger on the chosen form first, then set each `QUESTIONS` value in `workflow.ts` to match the question names in that sample. Inspect the email action's fields too, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test, with `OWNER_EMAIL` set to an address the user controls so no one else gets the test email. The sample is labelled `[install-test]`; swap its answer keys for the form's real question names:

```json
{
  "id": "install-test-0001",
  "answers": {
    "Name": "[install-test] Sample Customer",
    "Email": "customer@example.com",
    "Phone": "555-0100",
    "Preferred date": "2026-12-05",
    "Preferred time": "10:30",
    "Party size": "4",
    "Notes": "[install-test] Wheelchair access needed",
    "How did you hear about us?": "A friend"
  }
}
```

Check that one email arrived with the subject `Tour request: [install-test] Sample Customer on 2026-12-05`, that the body lists each detail, and that the extra answer appears under "Other answers". If run-status tools aren't available, check the inbox directly. Then publish, confirm the trigger is active, and ask the user to delete the test email. The user deletes test data, not the agent.

## Notes

- The Typeform New Entry output may not list answer fields, so the form values are read from an `answers` object keyed by question name. Confirm that shape on the first sample, and adjust `workflow.ts` if the answers arrive another way.
- Email by Zapier sends from Zapier's address, so the owner can't reply to the customer straight from the summary. They copy the customer's address from the summary instead. Use Gmail to send from the owner's own address.
- Email by Zapier is limited to 10 sends an hour on paid plans; a busy form will hit that.
- Never commit a real form ID or email address.
