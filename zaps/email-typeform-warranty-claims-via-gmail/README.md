# Receive email notifications for new warranty claim submissions from Typeform to Gmail

Each warranty claim submitted through your Typeform is emailed to your claims address with the customer's details, product and issue, and replies go straight to the customer.

**Apps:** Typeform, Gmail

**Based on:** [Receive email notifications for new warranty claim submissions from Typeform to Gmail](https://zapier.com/templates/details/d4f26050c548522061981e86e3f7ad93ed91dbd7244da0c0cbd6d7861edec6da) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/email-typeform-warranty-claims-via-gmail

The agent follows `SKILL.md`: it asks you for your warranty claim form and the claims email address, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`gmail`, `typeform`)
- `triggers/`: what starts it
