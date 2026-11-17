// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const HR_CHANNEL_ID = "REPLACE_HR_CHANNEL_ID"; // Ask the user which Slack channel People Ops watches for new hires, then look up its ID (C…) with their Slack connection.
export const DEFAULT_COUNTRY = "REPLACE_DEFAULT_COUNTRY"; // Ask the user which country most hires are in, then look up its value in the Country choices of Workday's Create Pre-Hire action with their Workday connection.
