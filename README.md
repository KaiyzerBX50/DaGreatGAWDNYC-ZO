# DaGreatGAWDNYC-ZO

This repository is the home for your Zo Skills.

## Current skills

- ai-adoption-playbook-for-teams
- automation-builder-no-code
- assumption-ledger
- assumption-extractor
- bias-auditor
- classroom-packager
- classroom-materials-packager
- cognitive-orchestrator
- communication-studio
- consequence-engine
- constraint-solver
- decision-architect
- decision-postmortem
- decision-tradeoff-visualizer
- evidence-weight-calculator
- evidence-calibrator
- experiment-designer
- ethical-impact-evaluator
- fixpoint
- information-credibility-analyzer
- knowledge-structure-mapper
- opportunity-gap-finder
- premortem-register
- problem-reframer
- research-method-advisor
- reputation-modeler
- scenario-comparison-engine
- signalforge
- signal-vs-noise-filter
- stakeholder-map
- system-failure-analyzer
- tool-stack-designer-for-nontech
- Arbitrage Detector
- stickie-zo
- Option Generator
- zo-reporting
- zo-signal-pulse
- zo-space
- zo-teacher-os
- misinformation-pattern-detector
- learning-path-architect
- negotiation-strategy-designer
- risk-scenario-simulator
- stakeholder-incentive-analyzer
- complexity-simplifier
- argument-rebuilder
- research-question-generator

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
