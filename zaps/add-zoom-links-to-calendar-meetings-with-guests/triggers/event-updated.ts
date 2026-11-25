// What starts the zap: a new or changed event on the user's primary calendar.
export default {
  app: "google-calendar",
  event: "event_updated",
  connection: "google-calendar",
  params: {
    // The user's primary calendar, whose ID is their email address. Look it up with their Google Calendar connection.
    calendarid: "REPLACE_CALENDAR_ID",
    // Not expanded, so a recurring series starts the zap once rather than once per instance.
    expand_recurring: false,
  },
};
