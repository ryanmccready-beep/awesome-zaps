export default {
  app: "schedule",
  event: "everyDay",
  // Once a day at 4:00 PM in the account's timezone, weekends included. Ask the user when they'd read it.
  params: { hod: "4:00 PM", weekends: "yes" },
};
