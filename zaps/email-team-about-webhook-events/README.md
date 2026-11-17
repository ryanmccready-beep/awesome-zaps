# Email team about webhook events

Each event posted to your webhook URL becomes an email to your team, with the event's title as the subject and its details in the body, so people hear about new tasks and updates quickly.

**Apps:** Webhooks by Zapier, Email by Zapier

**Based on:** [Notify user via email when a specific event occurs with Webhooks by Zapier and Email by Zapier](https://zapier.com/templates/details/fde58fdfc14c26768647670c2dc70e01551a5489ef28f3e882f7146a2b867094) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/email-team-about-webhook-events

The agent follows `SKILL.md`: it asks you who gets the emails and what your sender posts, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `triggers/`: what starts it
