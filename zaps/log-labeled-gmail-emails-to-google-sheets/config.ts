// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const SPREADSHEET_ID = "REPLACE_SPREADSHEET_ID"; // Ask the user which sheet is the email log, then look up its ID (the long ID in the sheet's URL) with their Google Sheets connection.
export const WORKSHEET_ID = "REPLACE_WORKSHEET_ID"; // Ask the user which tab of that sheet is the email log, then look up its ID with their Google Sheets connection.
