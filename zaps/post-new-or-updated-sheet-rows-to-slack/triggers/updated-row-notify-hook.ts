// What starts the zap: a new row, or an edit to an existing row, in the watched worksheet. Every such event posts to Slack, so set dedupe_column to limit which edits count.
export default {
  app: "google-sheets",
  event: "updated_row_notify_hook",
  connection: "google-sheets",
  params: {
    // Ask the user which spreadsheet to watch, then look up its ID with their Google Sheets connection.
    spreadsheet: "REPLACE_SPREADSHEET_ID",
    // Ask the user which tab to watch, then look up its worksheet ID with their Google Sheets connection.
    worksheet: "REPLACE_WORKSHEET_ID",
    // Ask the user which column should trigger the Zap when it is edited (new rows always trigger), then look up its value from the trigger's field choices. Leave this param out to trigger on any edit.
    dedupe_column: "REPLACE_TRIGGER_COLUMN",
  },
};
