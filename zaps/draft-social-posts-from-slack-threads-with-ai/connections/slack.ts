// The account this zap uses as "slack"; workflow.ts and triggers/ refer to it by that alias.
export default {
  app: "slack",
  description:
    "The user's Slack connection. It must be able to read threads in public channels and post replies in them.",
};
