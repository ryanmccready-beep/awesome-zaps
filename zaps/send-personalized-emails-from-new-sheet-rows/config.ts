// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const SUBJECT_TEMPLATE = "REPLACE_SUBJECT_TEMPLATE"; // Ask the user what the subject line should say. Write it with {{COL$B}}-style placeholders for the cells to fill in, such as "Question about {{COL$B}}".
export const BODY_TEMPLATE = "REPLACE_BODY_TEMPLATE"; // Ask the user what the email should say, in plain text. Write it with {{COL$B}}-style placeholders for the cells to fill in; line breaks are kept.

// Column holding the recipient's email address (COL$A = column A).
export const RECIPIENT_COLUMN = "COL$A";
// Name shown as the sender. Leave empty to use the Gmail account's own name.
export const FROM_NAME = "";
