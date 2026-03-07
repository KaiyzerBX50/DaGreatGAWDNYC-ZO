# Zo News Desk Command Center

> Real-time news dashboard for Zo Computer with 100% verified data, sentiment analysis, and news station aesthetics.

## Live Dashboard

**URL:** https://dagawdnyc.zo.space/zo-desk

## Features

### News Station Interface
- **Zo Pegasus Logo** - Official Zo Computer branding
- **Breaking News Ticker** - Scrolling headlines with gradient styling
- **ON AIR Indicator** - Live broadcast status
- **Real-time Clock** - ET timezone display
- **Scanline Effects** - CRT-style visual overlay
- **Dark Theme** - News broadcast aesthetic

### Analytics Panels
- **Sentiment Score** - AI-calculated from actual content (positive/negative/neutral)
- **Platform Distribution** - Mentions by source with percentages  
- **Activity Timeline** - Mention frequency over 24 hours
- **VS Yesterday** - Period comparison with real change percentages
- **Engagement Leaderboard** - Top performing content by platform
- **Top Keywords** - Trending topics extracted from mentions

### Data Integrity
- **100% Verified** - All URLs are real and verifiable
- **No Hallucinations** - No placeholder, estimated, or mocked data
- **Data Protection** - Preserves existing data if API fails
- **Sentiment Analysis** - Calculated from actual post content using AI analysis

## Sources (18 platforms)

| Category | Platforms |
|----------|-----------|
| Social Media | X, Instagram, LinkedIn, TikTok, YouTube, Bluesky, Threads, Facebook |
| Forums/Community | Reddit, Discord, Hacker News |
| Developer | GitHub, Dev.to, Indie Hackers |
| Product/Reviews | Product Hunt, Trustpilot |
| Publications | Medium, Substack |

## Update Frequency

**Every 4 hours** automatically via scheduled agent.

## Tech Stack

- **Runtime:** Bun + Hono
- **Frontend:** React + TypeScript
- **Styling:** Tailwind CSS 4
- **Icons:** lucide-react
- **Build:** Vite
- **Data:** JSON file storage with fallback protection

## Project Structure

```
Skills/zo-reporting/
├── SKILL.md                    # Skill definition
├── README.md                   # This file
└── scripts/
    ├── report.ts              # Main report generator
    ├── refresh-desk.ts        # Dashboard data refresh
    └── analyze-sentiment.ts   # Sentiment analysis

zo.space routes:
├── /zo-desk                   # Dashboard page
└── /api/zo-desk/data          # JSON API endpoint
```

## Installation

### Prerequisites

- Zo Computer account
- Zo API access (ZO_CLIENT_IDENTITY_TOKEN environment variable)

### Setup

1. Skill is installed at `/home/workspace/Skills/zo-reporting/`
2. Dashboard is available at https://dagawdnyc.zo.space/zo-desk
3. Scheduled agent runs every 4 hours automatically

### Manual Refresh

```bash
bun /home/workspace/Skills/zo-reporting/scripts/refresh-desk.ts
```

## API

### GET `/api/zo-desk/data`

Returns the latest news data.

**Response:**
```json
{
  "lastUpdated": "2026-03-07T01:20:00Z",
  "headlines": [
    {
      "title": "Since I asked if I can use @zocomputer to run OpenClaw...",
      "source": "X",
      "timestamp": "2026-03-06T23:07:18Z",
      "url": "https://x.com/ZhengYixian/status/2030057663489257947",
      "category": "Community",
      "summary": "Non-coder successfully using Zo to run OpenClaw"
    }
  ],
  "socialMentions": [...],
  "sentiment": {
    "positive": 80,
    "negative": 0,
    "neutral": 20
  },
  "platformStats": { "X": 5 },
  "topKeywords": [
    { "term": "openclaw", "count": 3 }
  ],
  "activityTimeline": [...],
  "engagementLeaderboard": [...],
  "previousPeriod": { "headlines": 5, "social": 5 }
}
```

## Data Integrity

All data follows these strict rules:

1. **No Hallucinations** - Never invent headlines or mentions
2. **Verified URLs** - Every URL must be real and accessible
3. **Calculated Metrics** - Sentiment calculated from actual content via AI
4. **Data Preservation** - If refresh fails, existing data is preserved
5. **Real Engagement** - Only use metrics shown on source pages

## Metric Explanations

Each metric includes a "How it works" note:

- **Sentiment Score:** Analyzes each social mention using AI. Words like "love", "amazing" indicate positive; "hate", "broken" indicate negative. Percentages are calculated from actual results.
- **Platform Distribution:** Counts are derived from the actual `socialMentions` array grouped by platform.
- **Activity Timeline:** Shows mention frequency over 24 hours from the `activityTimeline` data.
- **VS Yesterday:** Compares headline and mention counts from the previous refresh cycle.

## Customization

### Adding New Sources

Edit `scripts/report.ts`:

```typescript
async function searchNewSource(query: string): Promise<any[]> {
  const response = await fetch("https://api.zo.computer/zo/ask", {
    method: "POST",
    headers: {
      "authorization": process.env.ZO_CLIENT_IDENTITY_TOKEN || "",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      input: `Search [Platform] for: "${query}" ...`,
      model_name: "vercel:zai/glm-5",
    }),
  });
  return JSON.parse((await response.json()).output);
}
```

### Adjusting Update Frequency

Edit the scheduled agent:
```bash
# View current agents
zo agents list

# Update RRULE
FREQ=HOURLY;INTERVAL=2  # Every 2 hours
```

## Troubleshooting

### Dashboard shows old data
```bash
# Manual refresh
bun /home/workspace/Skills/zo-reporting/scripts/refresh-desk.ts

# Check data file
cat /home/workspace/zo-desk-latest.json
```

### API errors
```bash
# Check scheduled agent logs
# Visit: /?t=agents
```

## Credits

- **Built by:** DaGawdNYC (dagawdnyc.zo.computer)
- **Powered by:** Zo Computer (https://zo.computer)
- **Logo:** Zo Pegasus

## Support

- Zo Support: https://support.zocomputer.com
- Discord: https://discord.gg/invite/zocomputer
- X: https://x.com/zocomputer

## License

MIT License
