# Zo Space Documentation

> Last updated: March 6, 2026

## Overview

This document covers all routes, APIs, and features deployed on dagawdnyc.zo.space.

---

## Routes

### Public Pages

| Route | Description | Status |
|-------|-------------|--------|
| `/` | Demo/Landing page | Active |
| `/demo` | Skills & Projects showcase | Active |
| `/zo-desk` | Zo Reporting Command Center | Active |
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

## Zo Reporting Command Center

**URL:** https://dagawdnyc.zo.space/zo-desk

### Features

- Real-time news ticker
- 12 source monitoring (X, Reddit, Instagram, LinkedIn, TikTok, YouTube, Discord, Hacker News, GitHub, Product Hunt, Dev.to, Indie Hackers)
- Read/unread tracking
- Category badges (Breaking, Developing, Analysis, Community, Official)
- Search functionality
- Keyboard navigation (J/K keys)
- Reading progress bar
- Notification bell
- Export to JSON
- Share functionality
- Live viewer count

### Data Sources

```
/home/workspace/zo-desk-latest.json
```

### Update Schedule

Updates **4 times daily**:
- 6:00 AM ET
- 12:00 PM ET
- 6:00 PM ET
- 12:00 AM ET

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

---

## Skills

Located in `/home/workspace/Skills/`:

| Skill | Description |
|-------|-------------|
| `zo-reporting` | Daily report generation for Zo news |
| `zo-signal-pulse` | Signal Pulse prompt generator |
| `zo-teacher-os` | Teacher OS lesson builder |
| `zo-space` | Zo space utilities |
| `signalforge` | Signal analysis tools |

---

## Scheduled Agents

| Agent | Schedule | Delivery |
|-------|----------|----------|
| Zo Reporting Command Center | 4x daily (6am, 12pm, 6pm, 12am ET) | None (updates JSON) |
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
Scheduled Agent
    ↓
refresh-desk.ts script
    ↓
report.ts (gathers news from 12 sources)
    ↓
zo-desk-latest.json
    ↓
/api/zo-desk/data (API route)
    ↓
/zo-desk (React page)
```

---

## Maintenance

### Manual Data Refresh

```bash
bun /home/workspace/Skills/zo-reporting/scripts/refresh-desk.ts
```

### Check Agent Status

Go to [Agents](/?t=agents) or run:
```bash
# List all agents
# Use list_agents tool
```

### View Errors

```bash
# Check space errors
# Use get_space_errors tool
```

---

## Footer Branding

All pages should include:
```
Built by DaGawdNYC on Zo
Powered by Zo
```

---

## Contact & Support

- **Zo Support:** https://support.zocomputer.com
- **Zo Discord:** https://discord.gg/invite/zocomputer
- **Email:** help@zocomputer.com
