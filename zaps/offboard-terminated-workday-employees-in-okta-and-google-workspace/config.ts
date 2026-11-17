// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.

export const IT_CHANNEL_ID = "REPLACE_IT_CHANNEL_ID"; // Ask the user which Slack channel IT and People Ops watch for offboarding, then look up its ID (C…) with their Slack connection.
export const WORK_EMAIL_FIELD = "REPLACE_WORK_EMAIL_FIELD"; // Sample the Workday trigger with the user's connection and use the output key that holds the primary work email.
export const NAME_FIELD = "REPLACE_NAME_FIELD"; // Sample the Workday trigger and use the output key that holds the worker's name.
export const TERMINATION_DATE_FIELD = "REPLACE_TERMINATION_DATE_FIELD"; // Sample the Workday trigger and use the output key that holds the termination date.
