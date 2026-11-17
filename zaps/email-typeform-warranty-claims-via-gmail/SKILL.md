---
name: email-typeform-warranty-claims-via-gmail
description: Build a Zap on Zapier that emails the claims address every warranty claim submitted through a Typeform form, with the customer's details, the product and the issue. Use when warranty claims come in through a Typeform and the claims team should get one email per claim, with replies going straight to the customer.
license: MIT
metadata:
  author: zapier
  summary: "Each warranty claim submitted through your Typeform is emailed to your claims address with the customer's details, product, purchase details and issue, and replies go straight to the customer."
  apps: "Typeform, Gmail"
  category: "Customer Service & Success"
  job: "Customer support operations"
  source: "https://zapier.com/templates/details/d4f26050c548522061981e86e3f7ad93ed91dbd7244da0c0cbd6d7861edec6da"
---

# Receive email notifications for new warranty claim submissions from Typeform to Gmail

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/email-typeform-warranty-claims-via-gmail. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a Typeform submission arrives for the warranty claim form (`typeform`, `entries_resthook_v2`, New Entry).
2. **Gmail** sends one email per claim to the claims address, with the subject "Warranty claim: <product> from <customer name>". The body lists the customer name, email, product, serial or order number, purchase date, issue description and any other answers listed in `EXTRA_QUESTIONS`. When the customer gave an email address, it is set as the reply-to, so the claims team replies straight to them.

A submission with neither a product nor an issue is skipped and sends nothing.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve names to IDs with the user's own connections; don't ask them to paste an ID you can look up.

| Setting                    | Where                                    | What goes there                                     |
| -------------------------- | ---------------------------------------- | --------------------------------------------------- |
| `REPLACE_TYPEFORM_FORM_ID` | `triggers/entries-resthook.ts`, `params` | The Typeform form that collects warranty claims     |
| `CLAIMS_EMAIL`             | `config.ts`                              | The email address that receives each warranty claim |

Also review the question names in `QUESTIONS` and `EXTRA_QUESTIONS` at the top of `workflow.ts` with them. They are per form, so after sampling the trigger, set each one to the matching question name in the user's form and add or remove extra questions as needed.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `typeform` (reads the warranty claim form, for the trigger) and `gmail` (the Gmail account that sends the claim emails) to the user's connections. Every app in this Zap needs a connection.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/entries-resthook.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it. Set the trigger's `formId` to the user's form.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** sample the trigger on the user's form first and match the question names in `QUESTIONS` and `EXTRA_QUESTIONS` to the keys in the sample. Then inspect the Gmail action's fields with the user's connection and fix any key in `workflow.ts` that doesn't match.

## Test it

Run it once as a draft test, with `CLAIMS_EMAIL` set to an address the user controls and a sample entry. The keys are the question names in `workflow.ts`; this sample uses the defaults, so swap in the user's:

```json
{
  "Name": "[install-test] Sample Customer",
  "Email": "customer@example.com",
  "Product": "Sample Blender",
  "Serial or order number": "SN-0001",
  "Purchase date": "2026-10-01",
  "Describe the issue": "The motor stops after a few seconds.",
  "Phone number": "555-0100"
}
```

Check that:

- One email arrives at `CLAIMS_EMAIL` with the subject "Warranty claim: Sample Blender from [install-test] Sample Customer" and every answer in the body.
- Replying to it addresses the customer's email.
- An entry with no product and no issue sends nothing.

If run-status tools aren't available, check the result in Gmail directly. Ask the user to delete the test email; the agent does not delete it.

## Notes

- The Typeform New Entry output is read as fields keyed by question name. Confirm that shape and the exact names on the first sample before relying on them.
- If the customer's email answer is empty or has no `@`, the email is still sent, without a reply-to.
- Never commit a real form ID or email address.
