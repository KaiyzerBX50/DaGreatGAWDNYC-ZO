# Zo Space Documentation

> Last updated: March 7, 2026

## Overview

This document covers all routes, APIs, and features deployed on dagawdnyc.zo.space.

---

## Routes

### Public Pages

| Route | Description | Status |
|-------|-------------|--------|
| `/` | Demo/Landing page | Active |
| `/demo` | Skills & Projects showcase | Active |
| `/zo-desk` | Zo News Desk Command Center | Active |
| `/signal-pulse` | AI-powered prompt generator (passcode protected) | Active |
| `/signal-pulse-demo` | Public demo of Signal Pulse | Active |
| `/eats` | Food/restaurant finder | Active |
| `/cyber` | Cybersecurity dashboard | Active |
| `/teacher-os-public` | Teacher OS public page | Active |

### APIs

| Route | Description | Auth |
|-------|-------------|------|
| `/api/zo-desk/data` | News desk data feed | Public |
| `/api/yelp-data` | Yelp data API | Public |
| `/api/cyber/news` | Cybersecurity news feed | Public |
| `/api/stocks` | Stock data API | Public |
| `/api/teacher-os/script/render_one_page_pdf.py` | PDF rendering script | Public |

---

## Zo News Desk Command Center

**URL:** https://dagawdnyc.zo.space/zo-desk

### News Station Interface

- **Zo Pegasus Logo** - Official Zo Computer branding
- **Breaking News Ticker** - Scrolling headlines with gradient styling
- **ON AIR Indicator** - Live broadcast status
- **Real-time Clock** - ET timezone display
- **Scanline Effects** - CRT-style visual overlay
- **Dark Theme** - News broadcast aesthetic

### Analytics Panels

- **Sentiment Score** - AI-calculated from actual content
- **Platform Distribution** - Mentions by source with percentages
- **Activity Timeline** - Mention frequency over 24 hours
- **VS Yesterday** - Period comparison with real change percentages
- **Engagement Leaderboard** - Top performing content
- **Top Keywords** - Trending topics

### Data Integrity

- **100% Verified** - All URLs are real and verifiable
- **No Hallucinations** - No placeholder, estimated, or mocked data
- **Data Protection** - Preserves existing data if API fails
- **Sentiment Analysis** - Calculated from actual post content

### Sources (18 platforms)

| Category | Platforms |
|----------|-----------|
| Social Media | X, Instagram, LinkedIn, TikTok, YouTube, Bluesky, Threads, Facebook |
| Forums/Community | Reddit, Discord, Hacker News |
| Developer | GitHub, Dev.to, Indie Hackers |
| Product/Reviews | Product Hunt, Trustpilot |
| Publications | Medium, Substack |

### Data Sources

```
/home/workspace/zo-desk-latest.json
```

### Update Schedule

**Every 4 hours** automatically:
- 2:00 AM ET
- 6:00 AM ET
- 10:00 AM ET
- 2:00 PM ET
- 6:00 PM ET
- 10:00 PM ET

### Scheduled Agent

- **Agent ID:** `ed509cef-7932-499f-9226-73dfe16c113a`
- **Model:** vercel:minimax/minimax-m2.5
- **Script:** `/home/workspace/Skills/zo-reporting/scripts/refresh-desk.ts`

---

## Signal Pulse

### Routes

| Route | Purpose |
|-------|---------|
| `/signal-pulse` | AI-powered prompt generator (requires passcode) |
| `/signal-pulse-demo` | Public demo version |

### Security

- Passcode protected via `SIGNAL_PULSE_PASSCODE` environment variable
- Set in Settings > Advanced > Secrets

### Skill Location

```
/home/workspace/Skills/zo-signal-pulse/
```

### Recent Updates (March 7, 2026)

- **Fixed API Response Handling:** Now reads response as text first, then parses as JSON, preventing "Unexpected token" errors
- **Added 3-Minute Timeout:** AI processing has a 3-minute timeout with clear error message if exceeded
- **Improved Error Display:** Shows actual error messages from API instead of cryptic JSON parsing errors
- **Fixed Result Display:** Analysis results now properly display after successful API calls

---

## Skills

Located in `/home/workspace/Skills/`:

| Skill | Description |
|-------|-------------|
| `zo-reporting` | Real-time news command center for Zo Computer |
| `zo-signal-pulse` | Signal Pulse prompt generator |
| `zo-teacher-os` | Teacher OS lesson builder |
| `zo-space` | Zo space utilities |
| `signalforge` | Signal analysis tools |

---

## Scheduled Agents

| Agent | Schedule | Delivery |
|-------|----------|----------|
| Zo News Desk | Every 4 hours | None (updates JSON) |
| DLP/DSPM Report | Daily 11am UTC | SMS |
| Threat Intel Report | Daily 2pm UTC | SMS |

---

## Environment Variables

Set in Settings > Advanced > Secrets:

| Variable | Purpose |
|----------|---------|
| `SIGNAL_PULSE_PASSCODE` | Passcode for Signal Pulse AI version |
| `SIGNAL_PULSE_ZO_API_KEY` | Zo API key for Signal Pulse |
| `ZO_CLIENT_IDENTITY_TOKEN` | Auto-provided for API calls |

---

## Architecture

### Tech Stack

- **Runtime:** Bun + Hono
- **Styling:** Tailwind CSS 4
- **Icons:** lucide-react
- **Build:** Vite

### Data Flow

```
Scheduled Agent (every 4 hours)
    ↓
refresh-desk.ts script
    ↓
report.ts (gathers news from 18 sources)
    ↓
analyze-sentiment.ts (calculates sentiment)
    ↓
zo-desk-latest.json
    ↓
/api/zo-desk/data (API route)
    ↓
/zo-desk (React page with news station UI)
```

---

## Maintenance

### Manual Data Refresh

```bash
bun /home/workspace/Skills/zo-reporting/scripts/refresh-desk.ts
```

### Check Agent Status

Go to [Agents](/?t=agents)

### View Errors

Use `get_space_errors` tool

---

## Footer Branding

All pages include:
```
Built by DaGawdNYC on Zo
Powered by Zo Computer
```

---

## Contact & Support

- **Zo Support:** https://support.zocomputer.com
- **Zo Discord:** https://discord.gg/invite/zocomputer
- **Email:** help@zocomputer.com
- **X:** https://x.com/zocomputer
