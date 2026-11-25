// This zap's settings. They are defaults you can change; nothing needs setting per person.

// Events whose title contains any of these words are left alone. Case doesn't matter.
export const SKIP_WORDS = ["hold", "focus", "lunch", "OOO"];
// On meetings the user organizes, a Google Meet call is swapped for Zoom. Set false to leave Meet calls alone.
export const REPLACE_MEET = true;
// Who Google emails about the change. "externalOnly" emails only guests who don't use Google Calendar, since their
// copies of the invite update only by email. "all" emails every guest, and "none" emails no one.
export const SEND_UPDATES = "externalOnly";
