// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const SLACK_CHANNEL = "REPLACE_SLACK_CHANNEL"; // Ask the user which channel their team talks in, then look up its ID with their Slack connection. The reminder goes there, and the week's messages come from there.

// What the reminder asks. The session's name from the calendar goes in front of it.
export const REMINDER_TEXT =
  "is tomorrow. React with :+1: if you're coming, and reply in this thread with a problem you'd like to work on.";
// How long people get to react and reply before the topics are suggested.
export const WAIT_HOURS = 12;
// How far back the channel is read for topics.
export const LOOKBACK_DAYS = 7;
// Name the reminder and the suggestions post under.
export const BOT_NAME = "Session prep";
// AI model tier; "premium/auto" lets AI by Zapier pick an available model.
export const AI_MODEL_ID = "premium/auto";
// "0" uses Zapier-managed AI credentials.
export const AI_AUTHENTICATION_ID = "0";

// The prompt for the suggestions.
export const TOPICS_INSTRUCTIONS =
  "Your team has a working session tomorrow, and you suggest what to spend it on. You get the replies to the reminder, the reactions on it, and what the team posted in the channel this week.\n\nPick two or three focus areas. Put what people asked for in the replies first. Then add problems from the week's messages that came up more than once or that someone was stuck on. Each one is a bullet: a short name for the problem in *bold*, then one sentence on why it's worth the time, naming who raised it when the data says so.\n\nUse only what's in the data. If nobody replied and the week was quiet, suggest one open topic and say the floor is open. Start with one line saying how many people reacted that they're coming. Slack formatting: *bold* with single asterisks and \"• \" bullets. No sign-off and no emojis.";
