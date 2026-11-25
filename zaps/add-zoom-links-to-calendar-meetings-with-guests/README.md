# Add Zoom links to calendar meetings with guests

When you create or change a meeting with guests on Google Calendar, this Zap creates a Zoom meeting for it and puts the link on the invite. On meetings you organize, it swaps Google Meet for Zoom. Meetings that already have a video link are left alone.

**Apps:** Google Calendar, Zoom

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/add-zoom-links-to-calendar-meetings-with-guests

The agent follows `SKILL.md`: it asks which calendar to watch, then builds, tests and turns on the Zap in your account.

## Make it yours

Ask your agent to add any of these once the basic version works:

- **Get a link for meetings you can't edit:** when someone else organizes a meeting and guests can't edit it, DM yourself a Zoom link in Slack to send them.
- **Record meetings with outside guests** by turning on Zoom's auto-recording for those meetings when the Zap creates them.
- **Clean up after cancellations:** delete the Zoom meeting when its calendar event is cancelled.
- **Skip by calendar color** instead of title words, if you already color-code holds and focus time.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings, including the skip words, the Meet swap and who Google emails
- `connections/`: the accounts it uses (`google-calendar`, `zoom`)
- `triggers/`: what starts it
