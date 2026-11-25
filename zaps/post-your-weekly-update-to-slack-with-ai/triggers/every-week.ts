export default {
  app: "schedule",
  event: "everyWeek",
  // Fridays ("4"; Monday is "0") at 11:30 AM in the account's timezone. Ask the user when their update is due.
  params: { dow: ["4"], hod: "11:30 AM" },
};
