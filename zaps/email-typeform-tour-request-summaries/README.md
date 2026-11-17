# Email tour request summaries from Typeform

Every new customer tour request submitted in Typeform sends your business owner a summary email with the customer's contact details, preferred date and time, party size and notes, so tours get answered faster.

**Apps:** Typeform, Email by Zapier

**Based on:** [Send summary email from Typeform to Email by Zapier for new customer tour requests](https://zapier.com/templates/details/fc7ef35c7b6857cbdafbd2100392d850cc7df7278a316b46b2e4e0a430a5da6f) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/email-typeform-tour-request-summaries

The agent follows `SKILL.md`: it asks you which Typeform form collects tour requests and which address gets the summaries, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`typeform`)
- `triggers/`: what starts it
