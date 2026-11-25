// The account this zap uses as "google-calendar"; workflow.ts and triggers/ refer to it by that alias.
export default {
  app: "google-calendar",
  description:
    "The user's Google Calendar. The zap reads each new or changed event and adds the Zoom link to it.",
};
