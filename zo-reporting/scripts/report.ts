#!/usr/bin/env bun

/**
 * Zo Computer Daily Report Generator
 * Outputs PLAIN TEXT format for mobile/email readability
 * 
 * Usage: bun run report.ts
 * 
 * Sources: X, Reddit, Instagram, LinkedIn, TikTok, YouTube, Discord, 
 *          Hacker News, GitHub, Product Hunt, Dev.to, Indie Hackers
 */

const SEARCH_TERMS = [
  "Zo.Computer",
  "Zo Computer",
  "zo.computer",
];

const TIME_WINDOW_HOURS = 24;

interface Source {
  platform: string;
  title: string;
  author?: string;
  date: string;
  url: string;
  excerpt?: string;
  engagement?: string;
  sentiment?: string;
}

interface Headline {
  what: string;
  url: string;
  whyMatters: string;
  status: string;
  confidence: string;
}

async function searchWeb(query: string, timeRange: string = "day"): Promise<any[]> {
  const response = await fetch("https://api.zo.computer/zo/ask", {
    method: "POST",
    headers: {
      "authorization": process.env.ZO_CLIENT_IDENTITY_TOKEN || "",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      input: `Search the web for: "${query}"

Return results as a JSON array with objects containing:
- title: string
- url: string
- date: string (YYYY-MM-DD if available, otherwise "unknown")
- author: string (if available)
- excerpt: string (1-2 sentences)
- platform: string (e.g., "X", "Reddit", "Blog", "GitHub")

Limit to 10 most relevant results. Focus on the last 24 hours if possible.

Output ONLY valid JSON, no other text.`,
      model_name: "openrouter:z-ai/glm-5",
    }),
  });

  const result = await response.json();
  try {
    return JSON.parse(result.output);
  } catch {
    return [];
  }
}

async function searchX(query: string): Promise<any[]> {
  const response = await fetch("https://api.zo.computer/zo/ask", {
    method: "POST",
    headers: {
      "authorization": process.env.ZO_CLIENT_IDENTITY_TOKEN || "",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      input: `Search X (Twitter) for: "${query}"

Use x_search tool. Return results as a JSON array with objects containing:
- title: string (post text, truncated to 200 chars)
- url: string
- date: string
- author: string (handle)
- engagement: string (likes/retweets if shown)
- sentiment: string (positive/negative/neutral/mixed)

Limit to 15 most relevant posts from the last 24 hours.

Output ONLY valid JSON, no other text.`,
      model_name: "openrouter:z-ai/glm-5",
    }),
  });

  const result = await response.json();
  try {
    return JSON.parse(result.output);
  } catch {
    return [];
  }
}

async function searchReddit(query: string): Promise<any[]> {
  const response = await fetch("https://api.zo.computer/zo/ask", {
    method: "POST",
    headers: {
      "authorization": process.env.ZO_CLIENT_IDENTITY_TOKEN || "",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      input: `Search Reddit for: "${query}"

Use web_search with include_domains=["reddit.com"]. Return results as a JSON array with objects containing:
- title: string
- url: string
- date: string
- author: string
- excerpt: string
- subreddit: string
- sentiment: string

Limit to 10 results from the last 24 hours.

Output ONLY valid JSON, no other text.`,
      model_name: "openrouter:z-ai/glm-5",
    }),
  });

  const result = await response.json();
  try {
    return JSON.parse(result.output);
  } catch {
    return [];
  }
}

async function searchInstagram(query: string): Promise<any[]> {
  const response = await fetch("https://api.zo.computer/zo/ask", {
    method: "POST",
    headers: {
      "authorization": process.env.ZO_CLIENT_IDENTITY_TOKEN || "",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      input: `Search Instagram for: "${query}"

Use web_search with include_domains=["instagram.com"]. Return results as a JSON array with objects containing:
- title: string (caption text, truncated)
- url: string
- date: string
- author: string (handle)
- engagement: string (likes/comments if shown)
- sentiment: string

Limit to 10 results.

Output ONLY valid JSON, no other text.`,
      model_name: "openrouter:z-ai/glm-5",
    }),
  });

  const result = await response.json();
  try {
    return JSON.parse(result.output);
  } catch {
    return [];
  }
}

async function searchLinkedIn(query: string): Promise<any[]> {
  const response = await fetch("https://api.zo.computer/zo/ask", {
    method: "POST",
    headers: {
      "authorization": process.env.ZO_CLIENT_IDENTITY_TOKEN || "",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      input: `Search LinkedIn for: "${query}"

Use web_search with include_domains=["linkedin.com"]. Return results as a JSON array with objects containing:
- title: string
- url: string
- date: string
- author: string
- excerpt: string
- type: string (post, article, company page)
- sentiment: string

Limit to 10 results.

Output ONLY valid JSON, no other text.`,
      model_name: "openrouter:z-ai/glm-5",
    }),
  });

  const result = await response.json();
  try {
    return JSON.parse(result.output);
  } catch {
    return [];
  }
}

async function searchTikTok(query: string): Promise<any[]> {
  const response = await fetch("https://api.zo.computer/zo/ask", {
    method: "POST",
    headers: {
      "authorization": process.env.ZO_CLIENT_IDENTITY_TOKEN || "",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      input: `Search TikTok for: "${query}"

Use web_search with include_domains=["tiktok.com"]. Return results as a JSON array with objects containing:
- title: string (video description)
- url: string
- date: string
- author: string (handle)
- engagement: string (views/likes)
- sentiment: string

Limit to 10 results.

Output ONLY valid JSON, no other text.`,
      model_name: "openrouter:z-ai/glm-5",
    }),
  });

  const result = await response.json();
  try {
    return JSON.parse(result.output);
  } catch {
    return [];
  }
}

async function searchYouTube(query: string): Promise<any[]> {
  const response = await fetch("https://api.zo.computer/zo/ask", {
    method: "POST",
    headers: {
      "authorization": process.env.ZO_CLIENT_IDENTITY_TOKEN || "",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      input: `Search YouTube for: "${query}"

Use web_search with include_domains=["youtube.com"]. Return results as a JSON array with objects containing:
- title: string
- url: string
- date: string
- author: string (channel name)
- engagement: string (views)
- excerpt: string (description snippet)
- sentiment: string

Limit to 10 results.

Output ONLY valid JSON, no other text.`,
      model_name: "openrouter:z-ai/glm-5",
    }),
  });

  const result = await response.json();
  try {
    return JSON.parse(result.output);
  } catch {
    return [];
  }
}

async function searchDiscord(query: string): Promise<any[]> {
  const response = await fetch("https://api.zo.computer/zo/ask", {
    method: "POST",
    headers: {
      "authorization": process.env.ZO_CLIENT_IDENTITY_TOKEN || "",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      input: `Search for Discord mentions of: "${query}"

Use web_search. Return results as a JSON array with objects containing:
- title: string
- url: string
- date: string
- server: string (if identifiable)
- excerpt: string
- sentiment: string

Limit to 5 results.

Output ONLY valid JSON, no other text.`,
      model_name: "openrouter:z-ai/glm-5",
    }),
  });

  const result = await response.json();
  try {
    return JSON.parse(result.output);
  } catch {
    return [];
  }
}

async function searchProductHunt(query: string): Promise<any[]> {
  const response = await fetch("https://api.zo.computer/zo/ask", {
    method: "POST",
    headers: {
      "authorization": process.env.ZO_CLIENT_IDENTITY_TOKEN || "",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      input: `Search Product Hunt for: "${query}"

Use web_search with include_domains=["producthunt.com"]. Return results as a JSON array with objects containing:
- title: string
- url: string
- date: string
- author: string (maker)
- engagement: string (upvotes)
- excerpt: string (tagline)
- sentiment: string

Limit to 5 results.

Output ONLY valid JSON, no other text.`,
      model_name: "openrouter:z-ai/glm-5",
    }),
  });

  const result = await response.json();
  try {
    return JSON.parse(result.output);
  } catch {
    return [];
  }
}

async function searchDevTo(query: string): Promise<any[]> {
  const response = await fetch("https://api.zo.computer/zo/ask", {
    method: "POST",
    headers: {
      "authorization": process.env.ZO_CLIENT_IDENTITY_TOKEN || "",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      input: `Search Dev.to for: "${query}"

Use web_search with include_domains=["dev.to"]. Return results as a JSON array with objects containing:
- title: string
- url: string
- date: string
- author: string
- engagement: string (reactions)
- excerpt: string
- sentiment: string

Limit to 5 results.

Output ONLY valid JSON, no other text.`,
      model_name: "openrouter:z-ai/glm-5",
    }),
  });

  const result = await response.json();
  try {
    return JSON.parse(result.output);
  } catch {
    return [];
  }
}

async function searchIndieHackers(query: string): Promise<any[]> {
  const response = await fetch("https://api.zo.computer/zo/ask", {
    method: "POST",
    headers: {
      "authorization": process.env.ZO_CLIENT_IDENTITY_TOKEN || "",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      input: `Search Indie Hackers for: "${query}"

Use web_search with include_domains=["indiehackers.com"]. Return results as a JSON array with objects containing:
- title: string
- url: string
- date: string
- author: string
- engagement: string (likes/replies)
- excerpt: string
- sentiment: string

Limit to 5 results.

Output ONLY valid JSON, no other text.`,
      model_name: "openrouter:z-ai/glm-5",
    }),
  });

  const result = await response.json();
  try {
    return JSON.parse(result.output);
  } catch {
    return [];
  }
}

async function searchOfficialSources(): Promise<Source[]> {
  const sources: Source[] = [];

  const xResults = await searchX("from:zocomputer OR from:zo_computer");
  for (const post of xResults.slice(0, 10)) {
    sources.push({
      platform: "X",
      title: post.title,
      author: post.author,
      date: post.date,
      url: post.url,
      engagement: post.engagement,
      sentiment: post.sentiment,
    });
  }

  const siteResults = await searchWeb("site:zo.computer");
  for (const result of siteResults.slice(0, 5)) {
    sources.push({
      platform: "Official Site",
      title: result.title,
      date: result.date,
      url: result.url,
      excerpt: result.excerpt,
    });
  }

  return sources;
}

async function searchExternalSources(): Promise<Map<string, Source[]>> {
  const mentions = new Map<string, Source[]>();

  // News/Blogs
  const newsResults = await searchWeb(`"Zo Computer" OR "Zo.Computer" -site:zo.computer`);
  mentions.set("News/Blogs", newsResults.slice(0, 10).map(r => ({
    platform: "News",
    title: r.title,
    author: r.author,
    date: r.date,
    url: r.url,
    excerpt: r.excerpt,
  })));

  // X/Twitter
  const xResults = await searchX("Zo Computer OR Zo.Computer -from:zocomputer");
  mentions.set("X", xResults.slice(0, 15).map(r => ({
    platform: "X",
    title: r.title,
    author: r.author,
    date: r.date,
    url: r.url,
    engagement: r.engagement,
    sentiment: r.sentiment,
  })));

  // Reddit
  const redditResults = await searchReddit("Zo Computer OR Zo.Computer");
  mentions.set("Reddit", redditResults.slice(0, 10).map(r => ({
    platform: "Reddit",
    title: r.title,
    author: r.author,
    date: r.date,
    url: r.url,
    excerpt: r.excerpt,
  })));

  // Instagram
  const igResults = await searchInstagram("zocomputer OR zo.computer");
  mentions.set("Instagram", igResults.slice(0, 10).map(r => ({
    platform: "Instagram",
    title: r.title,
    author: r.author,
    date: r.date,
    url: r.url,
    engagement: r.engagement,
    sentiment: r.sentiment,
  })));

  // LinkedIn
  const liResults = await searchLinkedIn("Zo Computer OR Zo.Computer");
  mentions.set("LinkedIn", liResults.slice(0, 10).map(r => ({
    platform: "LinkedIn",
    title: r.title,
    author: r.author,
    date: r.date,
    url: r.url,
    excerpt: r.excerpt,
  })));

  // TikTok
  const ttResults = await searchTikTok("zocomputer OR zo computer");
  mentions.set("TikTok", ttResults.slice(0, 10).map(r => ({
    platform: "TikTok",
    title: r.title,
    author: r.author,
    date: r.date,
    url: r.url,
    engagement: r.engagement,
    sentiment: r.sentiment,
  })));

  // YouTube
  const ytResults = await searchYouTube("Zo Computer OR Zo.Computer");
  mentions.set("YouTube", ytResults.slice(0, 10).map(r => ({
    platform: "YouTube",
    title: r.title,
    author: r.author,
    date: r.date,
    url: r.url,
    engagement: r.engagement,
    excerpt: r.excerpt,
  })));

  // Discord
  const dcResults = await searchDiscord("Zo Computer OR Zo.Computer");
  mentions.set("Discord", dcResults.slice(0, 5).map(r => ({
    platform: "Discord",
    title: r.title,
    date: r.date,
    url: r.url,
    excerpt: r.excerpt,
  })));

  // Hacker News
  const hnResults = await searchWeb(`"Zo Computer" site:news.ycombinator.com`);
  mentions.set("Hacker News", hnResults.slice(0, 5).map(r => ({
    platform: "Hacker News",
    title: r.title,
    author: r.author,
    date: r.date,
    url: r.url,
    excerpt: r.excerpt,
  })));

  // GitHub
  const ghResults = await searchWeb(`"zo-computer" OR "zocomputer" site:github.com`);
  mentions.set("GitHub", ghResults.slice(0, 5).map(r => ({
    platform: "GitHub",
    title: r.title,
    author: r.author,
    date: r.date,
    url: r.url,
    excerpt: r.excerpt,
  })));

  // Product Hunt
  const phResults = await searchProductHunt("Zo Computer");
  mentions.set("Product Hunt", phResults.slice(0, 5).map(r => ({
    platform: "Product Hunt",
    title: r.title,
    author: r.author,
    date: r.date,
    url: r.url,
    engagement: r.engagement,
    excerpt: r.excerpt,
  })));

  // Dev.to
  const devResults = await searchDevTo("Zo Computer");
  mentions.set("Dev.to", devResults.slice(0, 5).map(r => ({
    platform: "Dev.to",
    title: r.title,
    author: r.author,
    date: r.date,
    url: r.url,
    engagement: r.engagement,
    excerpt: r.excerpt,
  })));

  // Indie Hackers
  const ihResults = await searchIndieHackers("Zo Computer");
  mentions.set("Indie Hackers", ihResults.slice(0, 5).map(r => ({
    platform: "Indie Hackers",
    title: r.title,
    author: r.author,
    date: r.date,
    url: r.url,
    engagement: r.engagement,
    excerpt: r.excerpt,
  })));

  return mentions;
}

function formatCoverageWindow(): string {
  const now = new Date();
  const start = new Date(now.getTime() - TIME_WINDOW_HOURS * 60 * 60 * 1000);
  const format = (d: Date) => d.toISOString().split('T')[0];
  return `${format(start)} to ${format(now)} (ET)`;
}

function generateHeadlines(sources: Source[]): Headline[] {
  const headlines: Headline[] = [];
  
  for (const s of sources.slice(0, 10)) {
    headlines.push({
      what: s.title,
      url: s.url,
      whyMatters: s.excerpt || "External mention of Zo Computer",
      status: "Confirmed",
      confidence: s.url.includes("zo.computer") || s.url.includes("zocomputer") ? "High" : "Medium",
    });
  }
  
  return headlines;
}

async function generateReport(): Promise<string> {
  console.error("Starting Zo Computer daily report...");
  console.error(`Time window: ${formatCoverageWindow()}`);
  console.error("Sources: X, Reddit, Instagram, LinkedIn, TikTok, YouTube, Discord, Hacker News, GitHub, Product Hunt, Dev.to, Indie Hackers");
  
  // Gather sources
  console.error("Searching official sources...");
  const officialSources = await searchOfficialSources();
  
  console.error("Searching external sources...");
  const externalMentions = await searchExternalSources();
  
  // Combine all sources
  const allSources = [...officialSources];
  for (const sources of externalMentions.values()) {
    allSources.push(...sources);
  }
  
  // Generate headlines
  const headlines = generateHeadlines(allSources);
  
  // Build PLAIN TEXT report
  let report = `ZO.COMPUTER DAILY REPORT\n`;
  report += `========================\n\n`;
  
  // Metadata
  report += `Run Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET\n`;
  report += `Coverage: ${formatCoverageWindow()}\n`;
  report += `Sources: X, Reddit, Instagram, LinkedIn, TikTok, YouTube, Discord, HN, GitHub, ProductHunt, Dev.to, IndieHackers\n`;
  report += `Total Mentions Found: ${allSources.length}\n\n`;
  
  // Headlines
  report += `HEADLINES\n`;
  report += `---------\n`;
  if (headlines.length === 0) {
    report += `No significant headlines today.\n\n`;
  } else {
    for (let i = 0; i < Math.min(headlines.length, 5); i++) {
      const h = headlines[i];
      report += `${i + 1}. ${h.what}\n`;
      report += `   ${h.url}\n`;
      report += `   Why: ${h.whyMatters.slice(0, 80)}\n\n`;
    }
  }
  
  // Official Updates
  report += `OFFICIAL UPDATES\n`;
  report += `----------------\n`;
  const productUpdates = officialSources.filter(s => 
    s.title.toLowerCase().includes("release") || 
    s.title.toLowerCase().includes("update") ||
    s.title.toLowerCase().includes("launch")
  );
  if (productUpdates.length > 0) {
    for (const u of productUpdates.slice(0, 3)) {
      report += `* ${u.title}\n`;
      report += `  ${u.url}\n\n`;
    }
  } else {
    report += `No new product releases detected.\n\n`;
  }
  
  // External Mentions by Platform
  report += `EXTERNAL MENTIONS BY PLATFORM\n`;
  report += `-----------------------------\n`;
  let hasMentions = false;
  for (const [channel, sources] of externalMentions) {
    if (sources.length === 0) continue;
    hasMentions = true;
    report += `\n${channel} (${sources.length} mentions):\n`;
    for (const s of sources.slice(0, 3)) {
      const title = s.title.length > 60 ? s.title.slice(0, 57) + "..." : s.title;
      report += `  - ${title}\n`;
      if (s.author) report += `    By: ${s.author}\n`;
      if (s.engagement) report += `    Engagement: ${s.engagement}\n`;
      report += `    ${s.url}\n`;
    }
  }
  if (!hasMentions) {
    report += `No external mentions found.\n\n`;
  }
  
  // Trust & Safety
  report += `\nTRUST & SAFETY\n`;
  report += `--------------\n`;
  const scamMentions = allSources.filter(s => 
    s.title.toLowerCase().includes("scam") || 
    s.title.toLowerCase().includes("phishing") ||
    s.title.toLowerCase().includes("fake")
  );
  if (scamMentions.length > 0) {
    report += `WARNING: Potential issues detected:\n`;
    for (const s of scamMentions) {
      report += `  - ${s.title}\n`;
      report += `    ${s.url}\n`;
    }
  } else {
    report += `No scams, impersonation, or phishing detected.\n`;
  }
  
  // Opportunities
  report += `\nOPPORTUNITIES\n`;
  report += `-------------\n`;
  const questions = allSources.filter(s =>
    s.title.includes("?") ||
    s.excerpt?.toLowerCase().includes("how do") ||
    s.excerpt?.toLowerCase().includes("help")
  );
  if (questions.length > 0) {
    report += `User questions (content opportunities):\n`;
    for (const q of questions.slice(0, 5)) {
      const title = q.title.length > 50 ? q.title.slice(0, 47) + "..." : q.title;
      report += `  - ${title}\n`;
    }
  } else {
    report += `No immediate opportunities identified.\n`;
  }
  
  // Priority Actions
  report += `\nPRIORITY ACTIONS\n`;
  report += `----------------\n`;
  let actionNum = 1;
  if (scamMentions.length > 0) {
    report += `${actionNum}. [P0] Investigate potential scam mentions\n`;
    actionNum++;
  }
  if (productUpdates.length > 0) {
    report += `${actionNum}. [P1] Update docs for new releases\n`;
    actionNum++;
  }
  report += `${actionNum}. [P2] Engage with community mentions across platforms\n`;
  report += `${actionNum + 1}. [P2] Monitor sentiment trends on TikTok and Instagram\n`;
  
  // Watchlist
  report += `\nWATCHLIST\n`;
  report += `---------\n`;
  report += `Official: zo.computer, @zocomputer (X), @zo.computer (IG)\n`;
  report += `Social: reddit/r/selfhosted, news.ycombinator.com, producthunt.com\n`;
  report += `Video: youtube.com, tiktok.com\n`;
  report += `Dev: github.com, dev.to, indiehackers.com\n`;
  
  console.error("Report generation complete.");
  return report;
}

// Main execution
generateReport().then(report => {
  console.log(report);
}).catch(err => {
  console.error("Error generating report:", err);
  process.exit(1);
});