export default {
  app: "google-calendar",
  event: "event_start",
  connection: "google-calendar",
  params: {
    // Ask the user which calendar holds the session, then look up its ID with their Google Calendar connection.
    calendarid: "REPLACE_CALENDAR_ID",
    // Ask the user for the session's name as it appears on the calendar. Only events whose title contains it start the zap.
    search_term: "REPLACE_EVENT_NAME",
    // Fire one day before each session starts.
    time_unit: "days",
    time_length: "1",
  },
};
