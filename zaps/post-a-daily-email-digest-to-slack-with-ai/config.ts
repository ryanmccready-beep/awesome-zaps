// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const SLACK_CHANNEL = "REPLACE_SLACK_CHANNEL"; // Ask the user where the digest should land: a channel only they read (look up its ID with their Slack connection), or their own Slack member ID to get it as a DM.

// Which emails go in the digest, in Gmail search syntax. The schedule runs once a day, so the default reads the last day.
export const INBOX_QUERY = "in:inbox newer_than:1d";
// Most emails one digest reads. A busy inbox gets the newest ones.
export const MAX_EMAILS = 50;
// The groups the digest sorts everything else into. Change them to match the user's inbox.
export const CATEGORIES =
  "newsletters, calendar notices, Google Docs and Drive, auto-replies, work tools, cold outreach";
// Name the digest posts under.
export const BOT_NAME = "Inbox digest";
// AI model tier; "premium/auto" lets AI by Zapier pick an available model.
export const AI_MODEL_ID = "premium/auto";
// "0" uses Zapier-managed AI credentials.
export const AI_AUTHENTICATION_ID = "0";

// The digest prompt. The categories are added after it.
export const DIGEST_INSTRUCTIONS =
  "You write a daily email digest for someone who doesn't open their inbox. They read it in Slack, so in under a minute it has to tell them what needs them and what can wait.\n\nYou get the day's emails as JSON, each with from, subject, snippet and link. Use only what's there. Never invent a sender, a date or an ask, and don't guess at what an email says beyond its snippet.\n\nOpen with one line: today's date, how many emails came in and how many need them.\n\nThen *Needs you*: every email that asks them to do, decide or acknowledge something, and every email a person wrote to them directly. Most urgent first. One bullet each: <link|subject> from the sender, then what it asks in a few words. When a person would expect an answer, add a suggested reply under the bullet as a quote (> ) they can copy: two or three plain sentences in first person that answer what was asked, with no greeting fluff. If nothing needs them, say so in one line.\n\nThen *Everything else*: one bullet per category with a count and up to three linked subjects, so they can still open a newsletter they like. Skip empty categories.\n\nSlack formatting only: *bold* with single asterisks, \"• \" bullets, links as <url|label>. No sign-off, no tips and no emojis.";
