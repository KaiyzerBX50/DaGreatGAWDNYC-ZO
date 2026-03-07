---
name: zo-reporting
description: Real-time news command center for Zo Computer. Monitors 18 platforms with sentiment analysis, engagement tracking, and live dashboard. 100% verified data only.
compatibility: Created for Zo Computer
metadata:
  author: dagawdnyc.zo.computer
  display_name: Zo News Desk
---

# Zo News Desk Command Center

PURPOSE: Real-time, source-backed news dashboard about Zo.Computer with 100% verified data, sentiment analysis, and news station aesthetics.

## Live Dashboard

**URL:** https://dagawdnyc.zo.space/zo-desk

## Features

### News Station Interface
- **Zo Pegasus Logo** - Official branding
- **Breaking News Ticker** - Scrolling headlines with gradient styling
- **ON AIR Indicator** - Live broadcast status
- **Clock** - Real-time ET display
- **Scanline Effects** - CRT-style visual overlay

### Analytics Panels
- **Sentiment Score** - AI-calculated from actual content (positive/negative/neutral)
- **Platform Distribution** - Mentions by source with percentages
- **Activity Timeline** - Mention frequency over 24 hours
- **VS Yesterday** - Comparison to previous period
- **Engagement Leaderboard** - Top performing content
- **Top Keywords** - Trending topics extracted from mentions

### Data Integrity
- **100% Verified** - All URLs are real and verifiable
- **No Hallucinations** - No placeholder or estimated data
- **Data Protection** - Preserves existing data if API fails
- **Sentiment Analysis** - Calculated from actual post content using AI

## Sources (18 platforms)

| Category | Platforms |
|----------|-----------|
| Social Media | X, Instagram, LinkedIn, TikTok, YouTube, Bluesky, Threads, Facebook |
| Forums/Community | Reddit, Discord, Hacker News |
| Developer | GitHub, Dev.to, Indie Hackers |
| Product/Reviews | Product Hunt, Trustpilot |
| Publications | Medium, Substack |

## Update Frequency

**Every 4 hours** automatically via scheduled agent:
- 2:00 AM ET
- 6:00 AM ET
- 10:00 AM ET
- 2:00 PM ET
- 6:00 PM ET
- 10:00 PM ET

## Scripts

```
Skills/zo-reporting/
├── SKILL.md                    # This file
├── README.md                   # Project documentation
└── scripts/
    ├── report.ts              # Main report generator
    ├── refresh-desk.ts        # Dashboard data refresh
    └── analyze-sentiment.ts   # Sentiment analysis
```

## For End Users

### View the Dashboard
Visit: https://dagawdnyc.zo.space/zo-desk

### Manual Refresh
```bash
bun /home/workspace/Skills/zo-reporting/scripts/refresh-desk.ts
```

### Check Status
```bash
cat /home/workspace/zo-desk-latest.json
```

## Data Structure

```json
{
  "lastUpdated": "2026-03-07T01:20:00Z",
  "headlines": [
    {
      "title": "string",
      "source": "X|Reddit|LinkedIn|...",
      "timestamp": "ISO timestamp",
      "url": "https://...",
      "category": "Breaking|Developing|Analysis|Community|Official",
      "summary": "string"
    }
  ],
  "socialMentions": [...],
  "sentiment": {
    "positive": 80,
    "negative": 0,
    "neutral": 20
  },
  "platformStats": { "X": 5, "Reddit": 3 },
  "topKeywords": [
    { "term": "openclaw", "count": 3 }
  ],
  "activityTimeline": [
    { "hour": "16:00", "count": 1 }
  ],
  "engagementLeaderboard": [...],
  "previousPeriod": {
    "headlines": 5,
    "social": 5
  }
}
```

## API Endpoint

### GET `/api/zo-desk/data`

Returns the latest news data in JSON format.

**Response Headers:**
```
Content-Type: application/json
Access-Control-Allow-Origin: *
```

## Data Integrity Rules

1. **No Hallucinations** - Never invent headlines or mentions
2. **Verified URLs** - Every URL must be real and accessible
3. **Calculated Metrics** - Sentiment calculated from actual content
4. **Data Preservation** - If refresh fails, keep existing data
5. **Real Engagement** - Only use metrics shown on source pages

## Customization

### Adding New Sources

Edit `scripts/report.ts`:

```typescript
async function searchNewPlatform(query: string): Promise<any[]> {
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
  // ...
}
```

### Adjusting Update Frequency

Edit the scheduled agent RRULE:
```
FREQ=HOURLY;INTERVAL=4  # Every 4 hours
FREQ=HOURLY;INTERVAL=2  # Every 2 hours
FREQ=DAILY;BYHOUR=9     # Daily at 9am
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
