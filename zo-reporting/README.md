# Zo Reporting Command Center

> Real-time news dashboard for Zo Computer updates across 12 platforms

## Live Demo

**URL:** https://dagawdnyc.zo.space/zo-desk

## Features

- **Real-time News Ticker** - Scrolling headlines with auto-pause on hover
- **12 Source Monitoring** - X, Reddit, Instagram, LinkedIn, TikTok, YouTube, Discord, Hacker News, GitHub, Product Hunt, Dev.to, Indie Hackers
- **Category Badges** - Breaking, Developing, Analysis, Community, Official
- **Read/Unread Tracking** - Headlines grey out after reading (localStorage)
- **Search** - Filter headlines by keyword
- **Keyboard Navigation** - J/K keys to navigate headlines
- **Reading Progress Bar** - Visual progress indicator
- **Notification Bell** - Shows unread count
- **Export** - Download data as JSON
- **Share** - Copy headline links
- **Live Stats** - Viewer count, headline count, coverage metrics

## Update Schedule

Updates **4 times daily**:
- 6:00 AM ET
- 12:00 PM ET  
- 6:00 PM ET
- 12:00 AM ET

## Tech Stack

- **Runtime:** Bun + Hono
- **Frontend:** React + TypeScript
- **Styling:** Tailwind CSS 4
- **Icons:** lucide-react
- **Build:** Vite

## Project Structure

```
zo-reporting/
├── SKILL.md                    # Skill definition
├── scripts/
│   ├── report.ts              # Main report generator
│   └── refresh-desk.ts        # Dashboard data refresh
└── README.md                   # This file
```

## Installation

### Prerequisites

- Zo Computer account
- Zo API access (ZO_CLIENT_IDENTITY_TOKEN)

### Setup

1. Install the skill to `/home/workspace/Skills/zo-reporting/`

2. The dashboard will be available at `/zo-desk`

### Manual Refresh

```bash
bun /home/workspace/Skills/zo-reporting/scripts/refresh-desk.ts
```

## Configuration

### Scheduled Agent

Create a scheduled agent to auto-update with RRULE:
```
FREQ=DAILY;BYHOUR=6,12,18,0;BYMINUTE=0
```

### Data Output

```json
{
  "lastUpdated": "2026-03-06T19:15:00Z",
  "headlines": [...],
  "socialMentions": [...],
  "sources": ["X", "Reddit", "Instagram", ...],
  "status": "active"
}
```

## Sources Monitored

| Platform | Search Type |
|----------|-------------|
| X/Twitter | API search |
| Reddit | Web search |
| Instagram | Web search |
| LinkedIn | Web search |
| TikTok | Web search |
| YouTube | API + Web search |
| Discord | Community servers |
| Hacker News | Web search |
| GitHub | Repo search |
| Product Hunt | Web search |
| Dev.to | Web search |
| Indie Hackers | Web search |

## API

### GET `/api/zo-desk/data`

Returns the latest news data.

**Response:**
```json
{
  "lastUpdated": "ISO timestamp",
  "headlines": [
    {
      "title": "string",
      "url": "string",
      "source": "string",
      "category": "Breaking|Developing|Analysis|Community|Official",
      "sentiment": "positive|negative|neutral"
    }
  ],
  "socialMentions": [...],
  "sources": [...],
  "status": "active"
}
```

## Customization

### Adding New Sources

Edit `scripts/report.ts`:

```typescript
async function searchNewSource(query: string): Promise<any[]> {
  // Add your search logic
}

// Add to searchExternalSources()
const newResults = await searchNewSource("Zo Computer");
mentions.set("NewSource", newResults);
```

## Credits

- **Built by:** DaGawdNYC
- **Powered by:** Zo Computer (https://zo.computer)

## License

MIT License

## Support

- Zo Support: https://support.zocomputer.com
- Discord: https://discord.gg/invite/zocomputer
