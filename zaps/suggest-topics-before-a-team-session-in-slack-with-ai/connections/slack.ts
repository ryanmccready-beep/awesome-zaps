// The account this zap uses as "slack"; workflow.ts refers to it by that alias.
export default {
  app: "slack",
  description:
    "The user's Slack connection. It must be able to read the team channel and post in it.",
};
