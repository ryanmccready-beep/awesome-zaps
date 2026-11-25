// The account this zap uses as "slack"; workflow.ts refers to it by that alias.
export default {
  app: "slack",
  description:
    "The user's own Slack connection. It searches the messages they posted this week and posts the update as them.",
};
