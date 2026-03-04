# DaGreatGAWDNYC-ZO

This repository is the home for your Zo Skills and projects.

## Featured Project: Zo Teacher OS

**Lesson planning that ends with a real package.**

A prompt-builder web app for K-12 educators to generate ready-to-teach lesson packages in minutes.

- **Live:** https://dagawdnyc.zo.space/teacher-os
- **Public Preview:** https://dagawdnyc.zo.space/teacher-os-public
- **Tech:** React + TypeScript, Tailwind CSS, zo.space (Bun + Hono)
- **Documentation:** `zo-teacher-os/README.md`

**Two export paths:**
- **Path A:** Generate directly in Zo (requires API token)
- **Path B:** Copy prompt to Claude, ChatGPT, or any AI

**Latest (March 4, 2026):**
- Removed "Send anonymous usage stats" checkbox
- Created public preview with Path A disabled
- Fixed runtime errors and optimized bundle loading
- Updated referral flow to Zo signup

See `zo-teacher-os/README.md` for full documentation and setup guide.

---

## Current skills

- ai-adoption-playbook-for-teams
- automation-builder-no-code
- assumption-ledger
- bias-auditor
- classroom-packager
- classroom-materials-packager
- cognitive-orchestrator
- communication-studio
- consequence-engine
- decision-architect
- decision-postmortem
- evidence-calibrator
- experiment-designer
- fixpoint
- premortem-register
- reputation-modeler
- signalforge
- stakeholder-map
- tool-stack-designer-for-nontech
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
