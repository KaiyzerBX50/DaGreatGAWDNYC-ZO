---
name: zo-reporting
description: Generate comprehensive daily reports about Zo.Computer. Gathers updates from official sources, social media, forums, reviews, and more. Produces a structured brief with headlines, external mentions, trust signals, opportunities, and priority actions.
compatibility: Created for Zo Computer
metadata:
  author: dagawdnyc.zo.computer
  display_name: Zo Daily Reporting
---
# Zo Report Lead, Instant Update Command Center

PURPOSE: Fast, source-backed daily brief about Zo.Computer. High signal, tight attribution, zero filler.

## Prerequisites

- [ ] Zo API access (ZO_CLIENT_IDENTITY_TOKEN environment variable)

## Trigger

- If message starts with **UPDATE** → generate report immediately
- If message starts with **SCHEDULE** → set up recurring report
- Otherwise reply: "Type UPDATE for an instant report, or SCHEDULE to set up daily reports."

## Schedule Protocol

When user asks to schedule a recurring report:

1. **Ask for preferences:**
   - Desired time (e.g., "8am ET every weekday")
   - Delivery method: email or SMS

2. **Create the scheduled agent:**
   - Use `tool create_agent` with:
     - `rrule`: Convert user's preferred time to RRULE format (UTC)
     - `delivery_method`: "email" or "sms" per user preference
     - `instruction`: 
       ```
       Run: bun /home/workspace/Skills/zo-reporting/scripts/report.ts
       
       Send the full output to the user.
       ```

3. **Confirm setup:**
   - Tell the user the schedule is set
   - Show the exact RRULE and delivery method

### Example RRULE Conversions

| User Request | RRULE |
|--------------|-------|
| Every day at 8am ET | `FREQ=DAILY;BYHOUR=13;BYMINUTE=0` (8am ET = 13:00 UTC) |
| Weekdays at 9am ET | `FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;BYHOUR=14;BYMINUTE=0` |
| Every Monday at 10am ET | `FREQ=WEEKLY;BYDAY=MO;BYHOUR=15;BYMINUTE=0` |

## Scripts

- `scripts/report.ts` — Generates the full report following this protocol. Outputs markdown to stdout.

## For End Users

**Just installed this skill? Here's how to use it:**

### Get an Instant Report
Just say:
- `UPDATE`
- "Give me the Zo report"
- "Run the Zo report now"

### Schedule Recurring Reports
Just ask naturally:
- "Schedule Zo report for 9am daily"
- "Send me the Zo report every morning at 8"
- "I want daily Zo reports at 9am and 5pm"

Zo will ask you for:
1. **Time** — What time each day (e.g., "9am", "8:30 AM")
2. **Delivery** — Email or SMS

That's it. Zo creates the schedule automatically.

### Manage Your Schedules
View, edit, or delete your scheduled reports at [Scheduled Tasks](/?t=agents).

---

## Schedule Protocol

When the user asks to schedule recurring reports:

1. **Ask for preferences:**
   - "What time would you like to receive the daily report? (e.g., '8am', '9:00 AM')"
   - "How would you like to receive it? Email or SMS?"

2. **Convert time to rrule:**
   - Use America/New_York timezone unless user specifies otherwise
   - For 9am ET: `FREQ=DAILY;BYHOUR=9;BYMINUTE=0`
   - For 5pm ET: `FREQ=DAILY;BYHOUR=17;BYMINUTE=0`
   - For weekdays only: Add `BYDAY=MO,TU,WE,TH,FR`

3. **Create the scheduled agent:**
   - Use `tool create_agent` with:
     - `rrule`: The calculated recurrence rule
     - `instruction`: The exact instruction below
     - `delivery_method`: "email" or "sms" per user preference

4. **Agent instruction (copy exactly):**
```
Run the Zo daily reporting script and send the output:

bun /home/workspace/Skills/zo-reporting/scripts/report.ts

After the script completes, send the full report output via the configured delivery method.
```

5. **Confirm setup:**
   - "Done! You'll receive daily Zo reports at [time] via [method]."
   - "You can manage this scheduled task at [Scheduled Tasks](/?t=agents)"

## Instant Report Protocol

For immediate reports (UPDATE trigger):

1. Run the script directly:
   ```
   bun /home/workspace/Skills/zo-reporting/scripts/report.ts
   ```

2. Output the full report to the user.

## Time Window

Last 24 hours (America/New_York). Fallback: last 7 days if no qualifying updates.

Use `--hours=N` flag to customize:
```
bun scripts/report.ts --hours=168  # Last 7 days
```

## Scope

Zo.Computer, Zo Computer, zo.computer (company/product/brand). Exclude Zoho unless explicitly references Zo.Computer. Exclude unrelated "Zo" brands.

## Research Order (10 min max)

1. **Official**: zo.computer pages, docs, X, LinkedIn, Instagram, Facebook, TikTok, Threads, Bluesky, YouTube, GitHub, Discord
2. **External**: news/blogs, Medium, Reddit, Hacker News, Product Hunt, Dev.to, Indie Hackers, Stack Overflow, G2/Capterra/Trustpilot, app stores, Crunchbase, podcasts, newsletters (Substack/beehiiv), Discord communities

## Platform Capture Rules

| Platform | Capture |
|----------|---------|
| X/Threads/Bluesky | post text, handle, timestamp, URL, engagement |
| TikTok | video description, creator, timestamp, URL, views |
| Instagram/Facebook | caption/preview, handle/page, timestamp, URL, engagement |
| YouTube | title, channel, date, URL, views, key comments |
| Reddit/HN | subreddit, title, author, timestamp, URL, top themes |
| Discord | server, channel, message preview, timestamp (public only) |
| GitHub | repo, item type, title, timestamp, URL, summary |
| Product Hunt | product, launch date, maker, upvotes, URL, top comments |
| Dev.to/Indie Hackers/Medium | title, author, date, URL, key points |
| Stack Overflow | question, tags, answer status, votes, URL |
| G2/Capterra/Trustpilot/app stores | reviewer, rating, date, pros/cons, URL |
| Crunchbase | item type, date, details, URL |
| Podcasts | show, episode, platform, URL, timestamp if found |
| Newsletters | name, author, date, URL, key excerpt |

## Source Quality

**Confirmed** = official Zo page/social OR reputable publisher OR primary evidence OR 2+ independent sources.

Otherwise: Unverified, Low confidence, list missing evidence.

## Search Terms

"Zo.Computer", "Zo Computer", "zo.computer", plus variations with review/pricing/bug/outage/support/security

## Non-Negotiables

- No invention
- Every claim needs URL
- Paywalled/gated = Access: Unavailable
- Metrics only if shown on page

---

## Output Format

### Zo.Computer Update Report

#### 1. Metadata
Run time, coverage window, search terms, sources used (Publisher | Title | Date | URL)

#### 2. Headlines (5-10)
What happened | URL | Why it matters | Status | Confidence

#### 3. Official Zo Changes
- **Product updates/releases**: Source, Status, Facts, Unknowns, Impact, Next step
- **Docs/policy/pricing**: Source, Status, Facts, Unknowns, Risk/opportunity, Next step

#### 4. External Mentions (group by channel)
Channels: News/blogs, Social (X/LinkedIn/Instagram/Facebook/TikTok/Threads/Bluesky), Forums (Reddit/HN/Discord), Dev (GitHub/Dev.to/Stack Overflow/Indie Hackers), Product Hunt, Reviews (G2/Capterra/Trustpilot/app stores), Business (Crunchbase), Video/Audio (YouTube/TikTok/podcasts), Newsletters

For each: Channel | Source | Title | Author | Date | URL | Relevance | Sentiment + why | Status | Summary (2-4 sentences) | Key quote | Unverified claims | Recommended response

#### 5. Trust & Safety Signals
- **Scams/impersonation/phishing**: Facts, URL, Status, Risk level, Action
- **Reliability/incidents**: Source, Status, Facts, Unknowns, Internal check, Customer messaging

#### 6. Opportunities (up to 7)
Opportunity | Source | Why it matters | Next step | Owner

#### 7. Priority Actions (up to 12)
Priority (P0/P1/P2) | Action | Owner | Why now | Success criteria | Rollback plan

#### 8. Monitoring Checklist (8-12)
What | Where | Signal | Trigger | Response play

#### 9. Watchlist
Official pages/handles discovered, external sources to scan
