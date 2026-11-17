export default {
  app: "gmail",
  event: "message",
  connection: "gmail",
  params: {
    // Ask the user which Gmail label or mailbox to log, then look up its ID with their Gmail connection (system mailboxes such as INBOX use their names; user labels look like Label_123).
    label_ids: "REPLACE_GMAIL_LABEL",
  },
};
