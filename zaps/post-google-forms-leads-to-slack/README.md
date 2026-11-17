# Post Google Forms leads to Slack

Every new response to your lead form is posted to your team's Slack channel as one message, with the lead's name as the headline and each answered question below it, so the team can follow up straight away.

**Apps:** Google Forms, Slack

**Based on:** [Notify team channel in Slack when new lead response is submitted in Google Forms](https://zapier.com/templates/details/8be91dbad7f7e13d464b462bb129bb77efa7a7d1f2aaa4162d132afd27c1648d) on zapier.com

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/post-google-forms-leads-to-slack

The agent follows `SKILL.md`: it asks you which Google Form collects the leads and which Slack channel gets the notices, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`google-forms`, `slack`)
- `triggers/`: what starts it
