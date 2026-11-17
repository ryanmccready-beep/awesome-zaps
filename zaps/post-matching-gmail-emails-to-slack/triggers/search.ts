// What starts the zap: a new email that matches the Gmail search below.
export default {
  app: "gmail",
  event: "search",
  connection: "gmail",
  params: {
    // Ask the user which emails to forward, then write them as a Gmail search, e.g. `from:billing@example.com in:inbox` or `subject:(invoice OR receipt) has:attachment in:inbox`. Without `in:inbox` it also matches sent mail.
    query: "REPLACE_GMAIL_SEARCH",
  },
};
