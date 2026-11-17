// What starts the zap: a submission of the chosen Gravity Forms form.
export default {
  app: "gravity-forms",
  event: "getEntry",
  connection: "gravity-forms",
  params: {
    // Ask the user which form to log, then look up its ID with their Gravity Forms connection.
    form_id: "REPLACE_GRAVITY_FORM",
    // Gravity Forms uses this name to route submissions to this zap. Make it unique per zap and never change it after the first deploy.
    feed_name: "awesome-zaps-sheet-log",
    // Delivers entries keyed by the form's field labels, not by the admin-only labels.
    admin_labels: false,
  },
};
