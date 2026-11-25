---
name: alert-slack-to-fake-job-posts-using-your-company-name
description: Build a Zap on Zapier that searches the web every morning for job posts naming the user's company as the employer, checks each one against the company's careers page, and alerts Slack about any that don't match a real opening or show scam signs. Use when a recruiting or people team wants to catch job scams that use their company's name before candidates fall for them.
license: MIT
metadata:
  author: zapier
  summary: "Every morning, AI searches job boards for posts that use your company's name and checks each one against your careers page. Slack hears about the ones that don't match a real role."
  apps: "AI by Zapier, Slack, Schedule by Zapier"
  category: "Human Resources (HR)"
  job: "Recruiting"
---

# Alert Slack to fake job posts using your company name

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/alert-slack-to-fake-job-posts-using-your-company-name. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** every day at 7:45 AM in the account's timezone, weekends included (`schedule`, `everyDay`).
2. **AI by Zapier** reads the careers page with its web scrape tool and notes every real open role. Then it uses web search to find job posts from the last `LOOKBACK_DAYS` (14) days that name the company as the employer, on job boards, social posts and sites that copy listings. It opens each post it can. Many job boards block that, so for those it judges from the search result and says so.
3. **Each post** gets a verdict. It's real when it matches a role on the careers page or sends applicants to the company's own site. It's suspicious when the role isn't on the careers page, or when it asks people to apply through a chat app, asks for payment or bank details, uses a personal email address, or offers pay far out of line for the role. If the careers page won't load, the step fails rather than judging posts without it.
4. **Slack** gets one alert when anything is suspicious, listing each post with its site and the reason, plus a link to the careers page. When nothing is, Slack hears nothing, and the run's output lists every post that was checked.

## Ask the user

Each `REPLACE_…` value is set per person.

| Setting                 | Where                          | What goes there                                                                                                                 |
| ----------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `REPLACE_COMPANY_NAME`  | `COMPANY_NAME` in `config.ts`  | The company's name as it appears in job posts                                                                                   |
| `REPLACE_CAREERS_URL`   | `CAREERS_URL` in `config.ts`   | The public page that lists every open role. If the roles live on a hosted job board, such as Greenhouse or Ashby, use that page |
| `REPLACE_SLACK_CHANNEL` | `SLACK_CHANNEL` in `config.ts` | Where alerts go, such as the recruiting team's channel. Look up its ID with their Slack connection                              |

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `slack` to the user's Slack connection for the workspace with the alerts channel. `ai` uses AI by Zapier and needs no account of its own.
2. **Source:** publish `workflow.ts` and `config.ts`, with the `REPLACE_` values set to the user's answers. `triggers/every-day.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect the Slack `channel_message` action and the AI by Zapier `get_completion` action with the user's connections before the first test run, and fix any key in `workflow.ts` that doesn't match.

## Test it

Run a draft test (`run_workflow_draft` in Zapier MCP) with `SLACK_CHANNEL` set to a test channel the user owns. The schedule trigger sends nothing the Zap reads, so any input works:

```json
{}
```

The search takes a couple of minutes. When every post it finds is real, the run finishes with `"flagged": 0` and posts nothing. Confirm that the output's `found` list has posts naming the company and that each verdict and reason holds up against the careers page. Then set `SLACK_CHANNEL` to the alerts channel. If a test does post an alert, the user deletes it, not the agent.

## Notes

- Web search won't find every post, and the AI can mark a real role suspicious when it's worded differently from the careers page. Treat an alert as a lead to check before reporting a post.
- A fake post shows up in the alert every day until the site takes it down.
