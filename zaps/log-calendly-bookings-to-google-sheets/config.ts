// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const SPREADSHEET_ID = "REPLACE_SPREADSHEET_ID"; // Ask the user which sheet is the booking log, then look up its ID (the long ID in the sheet's URL) with their Google Sheets connection.
export const WORKSHEET_ID = "REPLACE_WORKSHEET_ID"; // Look up the ID of the booking log's tab with the user's Google Sheets connection; the first tab is usually "0".

// Column for the invitee's name (COL$A = column A).
export const NAME_COLUMN = "COL$A";
// Column for the invitee's email.
export const EMAIL_COLUMN = "COL$B";
// Column for the Calendly event type name.
export const EVENT_NAME_COLUMN = "COL$C";
// Column for when the event starts.
export const START_TIME_COLUMN = "COL$D";
// Column for when the event ends.
export const END_TIME_COLUMN = "COL$E";
// Column for the invitee's timezone.
export const TIMEZONE_COLUMN = "COL$F";
// Column for the link the invitee uses to cancel.
export const CANCEL_URL_COLUMN = "COL$G";
// Column for the link the invitee uses to reschedule.
export const RESCHEDULE_URL_COLUMN = "COL$H";
// Column for when the booking was made.
export const BOOKED_AT_COLUMN = "COL$I";
