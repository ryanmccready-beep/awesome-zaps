# Alert Slack to fake job posts using your company name

Every morning, AI by Zapier searches job boards and social posts for jobs that name your company as the employer, and checks each one against your careers page. When a post doesn't match a real opening or looks like a scam, your team gets a Slack alert with the link and the reason.

**Apps:** AI by Zapier, Slack, Schedule by Zapier

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/alert-slack-to-fake-job-posts-using-your-company-name

The agent follows `SKILL.md`: it asks for your company name, careers page and alerts channel, then builds, tests and turns on the Zap in your account.

## Make it yours

Ask your agent to add any of these once the basic version works:

- **Alert only on new posts:** log each flagged post in a Zapier Table and skip the ones you've already seen.
- **Draft the report** for each flagged post, ready to send to the site it's on, with an approval step in Slack before anything goes out.
- **Warn candidates:** when a post is confirmed fake, add it to a page on your careers site that lists known scams.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings, including the company, the careers page, the lookback and the search prompt
- `connections/`: the accounts it uses (`slack`, `ai`)
- `triggers/`: what starts it
