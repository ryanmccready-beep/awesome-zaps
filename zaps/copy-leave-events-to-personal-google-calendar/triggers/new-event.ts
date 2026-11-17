// What starts the zap: a new event on the calendar that holds leave entries.
export default {
  app: "google-calendar",
  event: "new_event",
  connection: "google-calendar",
  params: {
    // Ask the user which calendar to watch for leave, such as a team or leave calendar, then look up its ID with their Google Calendar connection.
    calendarid: "REPLACE_SOURCE_CALENDAR",
  },
};
