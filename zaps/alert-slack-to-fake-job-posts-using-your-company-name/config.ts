// This zap's settings. Each "REPLACE_…" value is set per person before deploying; its comment says how to get it.
// The other values are defaults you can change.

export const COMPANY_NAME = "REPLACE_COMPANY_NAME"; // Ask the user for the company name as it appears in job posts.
export const CAREERS_URL = "REPLACE_CAREERS_URL"; // Ask the user for the public page that lists every real open role.
export const SLACK_CHANNEL = "REPLACE_SLACK_CHANNEL"; // Ask the user where alerts go (a recruiting channel, say), then look up its ID with their Slack connection.

// How far back the search looks for posts.
export const LOOKBACK_DAYS = 14;
// Name the alert posts under.
export const BOT_NAME = "Job post watch";
// AI model tier; "premium/auto" lets AI by Zapier pick an available model.
export const AI_MODEL_ID = "premium/auto";
// "0" uses Zapier-managed AI credentials.
export const AI_AUTHENTICATION_ID = "0";

// The search prompt. The company, careers page and lookback are added after it. Slack hears only about "suspicious" posts.
export const SEARCH_INSTRUCTIONS =
  "You check whether anyone is posting fake jobs under a company's name. Scammers copy a company's name and logo onto job boards and social posts to collect applicants' personal details or money.\n\nFirst read the careers page with web_scrape and note every real open role: title, team and location.\n\nThen use web_search to find job posts from the lookback window that name the company as the employer: job boards such as Indeed, LinkedIn, Glassdoor and ZipRecruiter, social posts, and sites that copy listings. Try to open each post with web_scrape. Many job boards block it, so when a post won't open, judge it from what the search result shows and say so in the reason.\n\nA post is real when it matches a role on the careers page (same title and roughly the same location), or when it sends applicants to the company's own careers site. A post is suspicious when the role isn't on the careers page, or when it shows scam signs: applying through a chat app, asking for payment or bank details, a personal email address, or pay far out of line for the role.\n\nReturn every post you found, each with its title, the site it's on, its URL, a verdict of \"real\" or \"suspicious\", and one line on why. Return an empty list only when the search finds no posts. Never guess a URL. If the careers page won't load, use the fail tool rather than judging posts without it.";
