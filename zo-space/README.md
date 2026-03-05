# zo.space backup (source-of-truth export)

This folder stores copies of key routes from **dagawdnyc.zo.space** so the code lives in GitHub.

Notes
- zo.space routes do not live in the workspace by default. They are stored in Zo Space.
- These files are an export for version control, review, and portability.

Exported routes (Signal Pulse)
- Public prompt generator: `/signal-pulse` (page) → `routes/signal-pulse.page.tsx`
- Private runner UI: `/signal-pulse-private` (page) → `routes/signal-pulse-private.page.tsx`
- Public API (disabled): `/api/signal-pulse` (api) → `routes/api.signal-pulse.ts`
- Private API (runs AI): `/api/signal-pulse-private` (api) → `routes/api.signal-pulse-private.ts`
- Health check: `/api/signal-pulse-health` (api) → `routes/api.signal-pulse-health.ts`

Secrets (private runner)
- `ZO_API_KEY`: Your own Zo access token. This is what runs AI and uses your credits.
- `SIGNAL_PULSE_PASSCODE`: Required to use the private runner. Pick a long passcode.

Never use someone else’s `ZO_API_KEY`.
