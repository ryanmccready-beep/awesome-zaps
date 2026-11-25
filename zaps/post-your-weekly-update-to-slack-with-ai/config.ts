// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const SLACK_CHANNEL = "REPLACE_SLACK_CHANNEL"; // Ask the user which channel their weekly update goes to, then look up its ID with their Slack connection. Their own member ID DMs it to them instead, to read before sharing.
export const ROLE = "REPLACE_ROLE"; // Ask the user for one or two sentences on their role, their team and what their work covers.
export const AUDIENCE = "REPLACE_AUDIENCE"; // Ask the user who reads the update and what those readers want to know from it.

// If the team posts a thread each Friday for updates, words from that thread's first message, such as "Friday update".
// The update goes in the newest message from today that contains them. Left empty, it posts in the channel.
export const THREAD_MATCH = "";
// The order the update ranks work in. Change it to match what the user's readers care about most.
export const RANKING =
  "1. Customer and account work (always name the account)\n2. Research, analyses and proposals the user led, and who they brought them to\n3. Talks, articles and content they wrote or moved through review\n4. Cross-team work that unblocked something, product feedback and enablement";
// Most sent emails and Slack messages the update reads.
export const MAX_ITEMS = 100;
// AI model tier; "premium/auto" lets AI by Zapier pick an available model.
export const AI_MODEL_ID = "premium/auto";
// "0" uses Zapier-managed AI credentials.
export const AI_AUTHENTICATION_ID = "0";

// The writing prompt. The role, audience and ranking are added after it.
export const UPDATE_INSTRUCTIONS =
  'You write the user\'s weekly update from what they did this week. You get their Slack messages, sent emails, and this week\'s and next week\'s calendar.\n\nEvidence rules:\n- Use only facts in the data. Never invent outcomes, numbers, dates or names.\n- Combine the same work across sources into one bullet.\n- Drafted, scheduled or pending items are "in progress", never "done".\n- Teammates\' work is theirs. Only credit the user for what they did.\n- If they helped plan a session someone else ran, say they helped design it.\n\nLeave out anything personal, medical or financial, and anything about another person\'s performance or HR matters. Skip lunch, focus blocks and routine meetings with no outcome. When unsure, leave it out.\n\nVoice: first person, warm and direct, outcome first, no filler. No em dashes, en dashes or double hyphens.\n\nFormat for Slack: *single asterisks* for bold, "• " bullets, <url|label> links only when the URL is in the data. Under 2,400 characters, one line per bullet:\n*My week: [dates]* :wave:\n*TL;DR:* one or two sentences on the biggest outcomes.\n:rocket: *Progress & Wins* (up to 8 bullets, "*Short outcome*: one line of detail")\n:soon: *Next Week Focus* (up to 4 bullets from next week\'s calendar)\n:fyi: *Notable Context* (up to 3 bullets, skip if none)';
