# Assign TalentLMS compliance training on HiBob department change

When someone moves to a new department in HiBob, they're enrolled in that department's required TalentLMS compliance courses, skipping any they already have.

**Apps:** HiBob, TalentLMS

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/assign-talentlms-compliance-training-on-hibob-department-change

The agent follows `SKILL.md`: it asks you which departments need which compliance courses, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`hibob`, `talentlms`)
- `triggers/`: what starts it
