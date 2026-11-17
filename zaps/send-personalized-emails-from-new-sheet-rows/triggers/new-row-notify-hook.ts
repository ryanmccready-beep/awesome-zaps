// What starts the zap: a new row added to the bottom of the worksheet. Each new row is one email.
export default {
  app: "google-sheets",
  event: "new_row_notify_hook",
  connection: "google-sheets",
  params: {
    spreadsheet: "REPLACE_SPREADSHEET_ID", // Ask the user which spreadsheet holds the rows to email, then look up its ID with their Google Sheets connection. It is the long ID in the sheet's URL.
    worksheet: "REPLACE_WORKSHEET_ID", // Ask the user which tab of that spreadsheet to watch, then look up its ID with their Google Sheets connection. The first tab is "0".
  },
};
