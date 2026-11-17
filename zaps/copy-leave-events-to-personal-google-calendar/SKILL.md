---
name: copy-leave-events-to-personal-google-calendar
description: Build a Zap on Zapier that copies new leave events (PTO, OOO, vacation, holiday) from a team or leave Google Calendar onto your personal calendar. Use when you want your own schedule to show leave that is booked somewhere else, without re-entering it by hand.
license: MIT
metadata:
  author: zapier
  summary: "When a new leave event appears on a Google Calendar you watch, a copy is created on your personal calendar, so planning on your own schedule reflects it."
  apps: "Google Calendar"
  category: "Personal Productivity"
  job: "Scheduling coordination"
  source: "https://zapier.com/templates/details/8375c17fa73a61954c72a79a0d92aa7a5ce4dfb833bef5056f8fceff774d2b04"
---

# Sync new leave events from Google Calendar to personal calendar

The Zap's code lives at https://github.com/zapier/awesome-zaps/tree/main/zaps/copy-leave-events-to-personal-google-calendar. Read the files there if this skill was installed on its own.

## What it does

1. **Trigger:** a new event is created on the source Google Calendar (`google-calendar`, `new_event`).
2. **Filter (in code):** the event is skipped if it is cancelled, if its title doesn't match the leave pattern (`leave`, `PTO`, `OOO`, `out of office`, `vacation` or `holiday`, case-insensitive), or if it has no start or end. Nothing is created for skipped events.
3. **Google Calendar** creates a copy on the personal calendar with the same title, start, end, all-day setting, description and location, shown as busy.

## Ask the user

Each `REPLACE_…` value is set per person. Resolve calendar names to IDs with the user's own Google Calendar connection; don't ask them to paste an ID you can look up.

| Setting                   | Where                                 | What goes there                                                                               |
| ------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------- |
| `REPLACE_SOURCE_CALENDAR` | `triggers/new-event.ts`, `calendarid` | The calendar that holds leave events, such as a team or leave calendar                        |
| `REPLACE_TARGET_CALENDAR` | `config.ts`                           | The personal calendar that receives the copies. The connected account needs edit access to it |

Also review `LEAVE_PATTERN` at the top of `workflow.ts` with them. Add the words their team uses for leave, such as a local term for time off.

## Build it

Build with Zapier MCP. If the user wants the Zap kept in their project, copy this folder into `zaps/` there first, then deploy those files. No Zapier MCP tools? Read https://docs.zapier.com/mcp/get-started/quickstart.md and follow the page for the app you are running in to get the user connected, then continue with this build.

1. **Accounts:** bind `google-calendar` to the user's Google Calendar connection. The trigger and the action use the same one, so it must be able to read the source calendar and edit the personal calendar. If they sit in different Google accounts, a single connection can't reach both; share one calendar with the other account first.
2. **Source:** publish `workflow.ts` and `config.ts`, with each `REPLACE_…` replaced by the user's answer. `triggers/new-event.ts` and `connections/` are settings, not code: set the workflow's trigger and connection bindings from them, including `calendarid`. The trigger file names the app by its slug; for the trigger's `selected_api`, call `search_triggers` with that slug, find the row whose `key` is the trigger's `event`, and use `<app_key>@<app_version>` from it.
3. **Build guide:** load Zapier's build guide with `get_zapier_skill("zapier:build-workflows")` and follow it to create, test and publish the workflow.
4. **Fields:** inspect the action's fields with the user's connection and sample the trigger before the first test run. Confirm the keys for the all-day setting (`all_day`) and the busy setting (`transparency`, set to `opaque`), and how an all-day event's start and end dates are entered, and fix any key or value in `workflow.ts` that doesn't match.

## Test it

Run this sample as a draft test run before publishing. Point `TARGET_CALENDAR_ID` at a calendar that is safe to write to:

```json
{
  "id": "hjerpm2k1ov4vq2uf6215hg718",
  "summary": "[install-test] PTO",
  "description": "[install-test] Sample leave event. Safe to delete.",
  "location": "[install-test] Home",
  "status": "confirmed",
  "start": { "dateTime": "2026-11-03T09:00:00-05:00" },
  "end": { "dateTime": "2026-11-03T17:00:00-05:00" }
}
```

The run should create one event on the target calendar with the same title, description, location and time. A second sample with a title such as `[install-test] Team lunch` should be skipped with `not-a-leave-event`. If run-status tools aren't available, check the result in Google Calendar directly. The user deletes the test event, not the agent. Then publish, confirm the trigger is active, and tell the user which events it copies.

## Notes

- The trigger fires on new events only. Edits and cancellations on the source calendar are not synced, so a changed or cancelled leave event leaves its old copy in place.
- For a sync that also handles updates, see `create-company-calendar-events-from-personal-calendar-updates`.
- All-day leave events are copied as all-day. Google gives an all-day event an exclusive end date, so the agent must confirm on the first sample that the copy spans the same days.
- No attendees are copied, so the copy sends no invitations.
- The title test is a simple word match, so a title such as "Holiday party" is copied too. Tighten `LEAVE_PATTERN` if that matters.
- Google Calendar can also create the copy as an Out of Office event (`eventType: "outOfOffice"`), which auto-declines meetings during the leave. It is left as a standard busy event so it works on every calendar type; switch it if the user wants auto-declines.
