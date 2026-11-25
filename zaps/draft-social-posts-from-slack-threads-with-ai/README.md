# Draft social posts from Slack threads with AI

When someone types "socialbot" in a public Slack thread, AI by Zapier drafts a social post from the thread in your voice and replies in the same thread. Ask for "shorter" or "two versions" and it revises the draft.

**Apps:** Slack, AI by Zapier

## Install

This folder is a Zap template. Paste this into your AI agent:

> Build me this Zap, read how here: https://github.com/zapier/awesome-zaps/tree/main/zaps/draft-social-posts-from-slack-threads-with-ai

The agent follows `SKILL.md`: it asks for your voice guide, then builds, tests and turns on the Zap in your account.

## Make it yours

Ask your agent to add any of these once the basic version works:

- **Read screenshots and PDFs** in the thread with Google AI Studio (Gemini), so the draft can use what's in them.
- **Make an image** for the post with Google AI Studio's Generate Image action, in your brand's style.
- **Review its own draft:** a second AI step that grades the draft against your voice guide and rewrites it before replying.
- **A voice per person:** a Zapier Table of voice guides, looked up by who asked.

## Files

- `SKILL.md`: what the agent asks, builds and tests
- `workflow.ts`: the Zap's code
- `config.ts`: its settings, including the bot's name, the voice guide and the drafting prompt
- `connections/`: the accounts it uses (`slack`, `ai`)
- `triggers/`: what starts it
