---
name: add-zoom-links-to-calendar-meetings-with-guests
description: Build a Zap on Zapier that gives each meeting with guests on the user's Google Calendar a Zoom link when it's created or changed, and swaps Google Meet for Zoom on meetings they organize. Use when someone runs their calls on Zoom and keeps sending invites without a link, or with a Meet link they don't use.
license: MIT
metadata:
  author: zapier
  summary: "Invite someone to a meeting on Google Calendar, and a Zoom link shows up on the invite. Meetings that already have a video link are left alone."
  apps: "Google Calendar, Zoom"
  category: "Personal Productivity"
  job: "Meeting management"
---

# Add Zoom links to calendar meetings with guests

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/add-zoom-links-to-calendar-meetings-with-guests. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new or changed event on the user's primary Google Calendar (`google-calendar`, `event_updated`). Recurring events aren't expanded, so a series starts the Zap once.
2. **Google Calendar** gives the event fresh, since the trigger's copy can be out of date. For one instance of a recurring event, the workflow reads its series.
3. **Workflow** decides whether the event needs Zoom. It leaves alone any event that is cancelled, all-day, already over, or not a regular event (focus time, out of office). It also skips events with no other guests, a title containing one of `SKIP_WORDS` (hold, focus, lunch, OOO), Zoom already on them, or another tool's link (Teams, Webex and others). A Meet call someone else set up stays as it is. So does a meeting someone else organizes when guests can't edit it, because Google keeps a guest's edit on the guest's own copy.
4. **Zoom** creates a meeting with the event's title, start time, length and timezone. A recurring series gets one recurring Zoom meeting with no fixed time, the kind Zoom's own calendar add-on makes.
5. **Google Calendar** gets the link. A "Join Zoom Meeting" block with the link, meeting ID and passcode goes at the end of the description, and the link becomes the location if there isn't one. On a meeting the user organizes, the Meet call is removed when `REPLACE_MEET` is on. The event is tagged so the Zap's own edit doesn't start it again.

## Ask the user

Each `REPLACE_…` value is set per person.

| Setting               | Where                                       | What goes there                                                                                                  |
| --------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `REPLACE_CALENDAR_ID` | `calendarid` in `triggers/event-updated.ts` | The ID of their primary calendar, which is their email address. Look it up with their Google Calendar connection |

The Zap works on the primary calendar, so the trigger watches that one too. Also ask whether they want Meet swapped for Zoom on their own meetings (`REPLACE_MEET`), and which words in a title mean an event needs no video link (`SKIP_WORDS`).

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-calendar` to the user's Google Calendar connection, and `zoom` to the Zoom account that should host the meetings.
2. **Source:** publish `workflow.ts` and `config.ts`. `triggers/event-updated.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** Google Calendar and Zoom are called through their APIs with the connections, so there are no actions to inspect. Confirm the trigger's payload has the event's `id`, and map it if the name differs.

## Test it

Create a test event on the user's primary calendar for tomorrow, 30 minutes long, titled "[install-test] Zoom link test", with one guest at an example.com address. Create it with `sendUpdates=none` so nobody gets an invite. Run a draft test (`run_workflow_draft` in Zapier MCP) with the event's ID and `dry_run` first:

```json
{
  "id": "abc123def456",
  "dry_run": true
}
```

Confirm the output says `"mode": "add"` and shows the Zoom request. Then run it again without `dry_run`, and confirm the event's description has the Join Zoom block, its location is the Zoom link, and the output has a `zoom_url`. The user deletes the test event and its Zoom meeting, not the agent.

## Notes

- If another Zap or a calendar add-on also adds video links, it may get to an event first. This Zap then skips the event because it already has a link.
- With `SEND_UPDATES` set to `externalOnly`, Google emails the change only to guests who don't use Google Calendar. Guests on Google Calendar see the link on their copy. Set it to `all` to email every guest.
- Each meeting gets its own Zoom meeting, so the user's Zoom account fills with scheduled meetings. Deleting the calendar event doesn't delete the Zoom meeting.
