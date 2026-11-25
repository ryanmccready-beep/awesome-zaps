export default {
  app: "slack",
  event: "mention_v2",
  connection: "slack",
  params: {
    // People type this word in a thread to call the bot. Slack also matches it inside longer words, so keep it distinctive.
    word: "socialbot",
    // The bot's own replies can contain the word, so they must not start another run.
    listen_for_bots: false,
    public_only: true,
  },
};
