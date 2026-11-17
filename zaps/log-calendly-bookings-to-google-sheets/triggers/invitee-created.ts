// What starts the zap: someone books a Calendly event. Each booking is one invitee.
export default {
  app: "calendly",
  event: "invitee_created",
  connection: "calendly",
  params: {
    // "user" watches the connected user's own events; "organization" watches the whole Calendly organization and needs an org owner or admin.
    webhook_subscription_scope_with_group: "user",
    // Ask the user which Calendly event type to log, then look up the value this field takes with their Calendly connection. Leave this key out to log every event type.
    event_type: "REPLACE_EVENT_TYPE",
    // "new" skips reschedules so a moved booking doesn't add a second row; "rescheduled" logs only reschedules, and leaving this key out logs both.
    invitee_type: "new",
  },
};
