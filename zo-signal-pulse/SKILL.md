---
name: zo-signal-pulse
description: Detect execution signals in meeting notes. Extract action items, decisions, risks, and dependencies. Score accountability, clarity, and execution risk. Output a pulse snapshot plus a follow-up message draft.
compatibility: Created for Zo Computer
metadata:
  author: dagawdnyc.zo.computer
  display_name: Zo Signal Pulse
---
# Zo Signal Pulse

## What this skill does

Turn raw meeting notes into execution intelligence:

- Action items with owners and deadlines
- Decision clarity
- Risks and blockers
- Dependency mapping
- Accountability gaps
- Execution risk level
- Meeting effectiveness score and grade
- Concrete improvement actions
- A ready-to-send follow-up message

## Setup (one-time)

Want a one-click web interface with your own API key and passcode?

```bash
bun /home/workspace/Skills/zo-signal-pulse/scripts/setup.ts
```

This creates your private Signal Pulse pages on zo.space and configures them with your Zo API key. You'll be prompted to save two secrets: `SIGNAL_PULSE_ZO_API_KEY` and `SIGNAL_PULSE_PASSCODE`.

**Important:** Each Zo Computer user sets up their own secrets in **Settings → Advanced → Secrets**. Your secrets are stored only on your Zo instance and are never visible to anyone else. Likewise, you cannot see anyone else's secrets.

If you skip this, you can always run Signal Pulse from the command line.

## Quick start

### CLI

```
bun /home/workspace/Skills/zo-signal-pulse/scripts/pulse.ts \
  --notes-file /home/workspace/meeting-notes.md \
  --team "Alex,Blair,Casey" \
  --meeting-type "Weekly team sync" \
  --tone "Structured professional"
```

### Web interface

After running the setup script, you'll have a private web interface on your zo.space. The URL will be `https://<your-handle>.zo.space/signal-pulse`.

If you skip the setup, you can always run Signal Pulse from the command line.

## Inputs

- Meeting notes (required)
- Team members list (optional). If provided, owners must match this list or the task is marked **Unassigned**.
- Meeting type (optional)
- Output tone (optional)

## Output

The script prints a complete report to stdout and saves:

- `runs/<timestamp>/report.md`
- `runs/<timestamp>/signals.json`
- `runs/<timestamp>/run.json`
- `history.jsonl` (one line per run)

## How to run

### With a notes file

```
bun /home/workspace/Skills/zo-signal-pulse/scripts/pulse.ts \
  --notes-file /home/workspace/meeting-notes.md \
  --team "Alex,Blair,Casey" \
  --meeting-type "Weekly team sync" \
  --tone "Structured professional"
```

### With inline notes

```
bun /home/workspace/Skills/zo-signal-pulse/scripts/pulse.ts \
  --notes "<paste meeting notes here>" \
  --meeting-type "Client delivery review"
```

### By piping notes (stdin)

If you do not pass `--notes` or `--notes-file`, the script reads meeting notes from stdin:

```
cat /home/workspace/meeting-notes.md | bun /home/workspace/Skills/zo-signal-pulse/scripts/pulse.ts \
  --team "Alex,Blair,Casey" \
  --meeting-type "Weekly team sync"
```

### Optional flags

- `--outdir <path>`: Override where outputs are saved (default is `runs/<timestamp>`)

## Requirements

- Bun runtime available on Zo
- `ZO_CLIENT_IDENTITY_TOKEN` environment variable (available on Zo)

## Notes on scoring

This skill computes scores deterministically from extracted signals. If you want the scoring rules to match a specific rubric you wrote, put the full rubric text into this skill (or provide it in chat) and update the scoring block in `scripts/pulse.ts`.
