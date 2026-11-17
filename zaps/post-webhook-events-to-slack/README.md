# Post webhook events to Slack

When another system sends an event to a Webhooks by Zapier catch hook, a message with its title and key details is posted to your team's Slack channel, so the team sees it straight away and can act.

**Apps:** Webhooks by Zapier, Slack

**Based on:** [Notify team channel in Slack when a specific event occurs via Webhooks by Zapier](https://zapier.com/templates/details/826314421c4b77d6dc38631b6394a17fdc52dde944441ee6d7728cd2e42c40af) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/post-webhook-events-to-slack

The agent follows `SKILL.md`: it asks you which Slack channel gets the notices and what your webhook payload looks like, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the account it uses (`slack`)
- `triggers/`: what starts it
