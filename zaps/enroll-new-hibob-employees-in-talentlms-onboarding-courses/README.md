# Enroll new HiBob employees in TalentLMS onboarding courses

On a new hire's first day in HiBob, they get a TalentLMS account and are enrolled in the onboarding courses for everyone and for their department.

**Apps:** HiBob, TalentLMS

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/enroll-new-hibob-employees-in-talentlms-onboarding-courses

The agent follows `SKILL.md`: it asks you which onboarding courses new hires take, then builds, tests and turns on the Zap in your account.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings; the `REPLACE_…` values are filled in for each person
- `connections/`: the accounts it uses (`hibob`, `talentlms`)
- `triggers/`: what starts it
