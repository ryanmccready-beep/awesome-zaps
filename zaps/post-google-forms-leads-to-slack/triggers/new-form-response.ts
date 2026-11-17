// What starts the zap: a new response to the lead form.
export default {
  app: "google-forms",
  event: "new_form_response",
  connection: "google-forms",
  params: {
    formId: "REPLACE_FORM_ID", // Ask the user which Google Form collects the leads, then look up its ID with their Google Forms connection.
  },
};
