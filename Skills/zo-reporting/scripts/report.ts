#!/usr/bin/env bun

/**
 * Zo Computer Daily Report Generator
 * Outputs PLAIN TEXT format for mobile/email readability
 * 
 * Usage: bun run report.ts
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

  const newsResults = await searchWeb(`"Zo Computer" OR "Zo.Computer" -site:zo.computer`);
  mentions.set("News/Blogs", newsResults.slice(0, 10).map(r => ({
    platform: "News",
    title: r.title,
    author: r.author,
    date: r.date,
    url: r.url,
    excerpt: r.excerpt,
  })));

  const redditResults = await searchReddit("Zo Computer OR Zo.Computer");
  mentions.set("Reddit", redditResults.slice(0, 10).map(r => ({
    platform: "Reddit",
    title: r.title,
    author: r.author,
    date: r.date,
    url: r.url,
    excerpt: r.excerpt,
  })));

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

  const hnResults = await searchWeb(`"Zo Computer" site:news.ycombinator.com`);
  mentions.set("Hacker News", hnResults.slice(0, 5).map(r => ({
    platform: "Hacker News",
    title: r.title,
    author: r.author,
    date: r.date,
    url: r.url,
    excerpt: r.excerpt,
  })));

  const ghResults = await searchWeb(`"zo-computer" OR "zocomputer" site:github.com`);
  mentions.set("GitHub", ghResults.slice(0, 5).map(r => ({
    platform: "GitHub",
    title: r.title,
    author: r.author,
    date: r.date,
    url: r.url,
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
  report += `Sources Found: ${allSources.length}\n\n`;
  
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
  
  // External Mentions
  report += `EXTERNAL MENTIONS\n`;
  report += `-----------------\n`;
  let hasMentions = false;
  for (const [channel, sources] of externalMentions) {
    if (sources.length === 0) continue;
    hasMentions = true;
    report += `${channel}:\n`;
    for (const s of sources.slice(0, 3)) {
      const title = s.title.length > 60 ? s.title.slice(0, 57) + "..." : s.title;
      report += `  - ${title}\n`;
      report += `    ${s.url}\n`;
    }
    report += `\n`;
  }
  if (!hasMentions) {
    report += `No external mentions found.\n\n`;
  }
  
  // Trust & Safety
  report += `TRUST & SAFETY\n`;
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
  report += `\n`;
  
  // Opportunities
  report += `OPPORTUNITIES\n`;
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
  report += `\n`;
  
  // Priority Actions
  report += `PRIORITY ACTIONS\n`;
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
  report += `${actionNum}. [P2] Engage with community mentions\n`;
  report += `\n`;
  
  // Watchlist
  report += `WATCHLIST\n`;
  report += `---------\n`;
  report += `Official: zo.computer, @zocomputer\n`;
  report += `External: reddit/r/selfhosted, news.ycombinator.com\n`;
  
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