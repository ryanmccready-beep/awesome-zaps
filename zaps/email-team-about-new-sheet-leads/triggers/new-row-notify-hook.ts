export default {
  app: "google-sheets",
  event: "new_row_notify_hook",
  connection: "google-sheets",
  params: {
    // Ask the user which spreadsheet holds the leads, then look up its ID with their Google Sheets connection. It is the long ID in the sheet's URL.
    spreadsheet: "REPLACE_SPREADSHEET_ID",
    // Ask the user which tab of that spreadsheet holds the leads, then look up its ID with their Google Sheets connection. The first tab is "0".
    worksheet: "REPLACE_WORKSHEET_ID",
  },
};
