# DaGreatGAWDNYC-ZO

This repository is the home for your Zo Skills.

## Current skills

- assumption-ledger
- bias-auditor
- classroom-packager
- cognitive-orchestrator
- communication-studio
- consequence-engine
- decision-architect
- evidence-calibrator
- experiment-designer
- fixpoint
- premortem-register
- reputation-modeler
- signalforge
- stakeholder-map
- Arbitrage Detector
- stickie-zo
- Option Generator
- zo-reporting
- zo-signal-pulse
- zo-space
- zo-teacher-os

## Folder layout

- Each top-level folder is one Skill.
- Inside each Skill folder:
  - `SKILL.md` describes the Skill and how Zo should use it
  - `scripts/` contains optional code for the Skill
  - `assets/` contains optional images and other static files (for example, an avatar)

## Optional skill metadata

In `SKILL.md` frontmatter, under `metadata:` you can add:

- `display_name`: A human-friendly name shown to users
- `avatar`: Relative path to an image for the skill, for example `assets/avatar.png`

## Adding a new Skill

1. Create a new folder at the repo root (use a short, lowercase name with hyphens)
2. Add a `SKILL.md`
3. Add `scripts/` if the Skill needs code

## Secrets

Do not commit API keys or passwords.
Store secrets in Zo at **Settings → Advanced → Secrets**.
