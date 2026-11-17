export default {
  app: "typeform",
  event: "entries_resthook_v2",
  connection: "typeform",
  params: {
    // Ask the user which Typeform form collects warranty claims, then look up its ID with their Typeform connection.
    formId: "REPLACE_TYPEFORM_FORM_ID",
  },
};
