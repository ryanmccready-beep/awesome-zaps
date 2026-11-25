export default {
  app: "schedule",
  event: "everyDay",
  // Every morning at 7:45 AM in the account's timezone, weekends included, since scammers post any day.
  params: { hod: "7:45 AM", weekends: "yes" },
};
