export default {
  app: "facebook-lead-ads",
  event: "lead",
  connection: "facebook-lead-ads",
  params: {
    // Ask the user which Facebook Page owns the lead form, then look up its ID with their Facebook Lead Ads connection.
    page: "REPLACE_FACEBOOK_PAGE",
    // Ask the user which lead form to log, then look up its ID with their Facebook Lead Ads connection. Leave the form out to log leads from any form on the Page.
    form: "REPLACE_FACEBOOK_FORM",
  },
};
