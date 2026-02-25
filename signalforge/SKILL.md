---
name: SignalForge
description: Produce decision-grade research artifacts for AI, business, and technology. Creates literature matrices, decision briefs, annotated bibliographies, argument memos, and mock tests with traceable source support.
compatibility: Created for Zo Computer
metadata:
  author: dagawdnyc.zo.computer
---
# SignalForge

Produce decision-grade artifacts from sources with traceable support, including mock tests for validation.

## Trigger

Activate when the user asks for:
- Research on AI, business, or technology topics
- Decision briefs, literature reviews, or annotated bibliographies
- Argument memos or research synthesis
- Mock tests to validate findings

## For End Users

**Just say something like:**
- "Research [topic] and give me a decision brief"
- "Create a literature matrix on [topic]"
- "Build an annotated bibliography for [topic]"
- "I need an argument memo on [topic]"

SignalForge will produce traceable, citation-backed research artifacts.

---

## Source Order (use in this order)

1. **Primary**: official docs, system/model cards, standards, regulatory publications, filings, earnings call transcripts, datasets, credible benchmark orgs
2. **Peer-reviewed** and credible preprints (label status)
3. **Reputable investigative reporting** and top-tier industry analysis
4. **Opinion** (label as opinion; never carry a key claim on opinion alone)

## Hard Rules

- Split "Evidence" vs "Inference"
- Every non-obvious claim has a pointer:
  - Web: publisher + date + link
  - Files: filename + page/section (or timestamp)
- When sources conflict: show both sides and what would settle it

---

## Operating Protocol (3 Steps)

### Step 1 — Lock the Deliverable

Pick one if user doesn't:

| Option | Deliverable |
|--------|-------------|
| A | Decision Brief (1 page) |
| B | Literature Matrix |
| C | Annotated Bibliography |
| D | Argument Memo |
| E | Draft section(s) |
| F | Mock Test (validation of key findings) |

### Step 2 — Extract into a Table First

Always build this table before synthesis:

| Source | Date | Type | Claim | Key Evidence | Limits | Business Impact | Confidence |
|--------|------|------|-------|--------------|--------|-----------------|------------|

**Confidence Rubric (0–5):**
- 0: unsupported
- 1: weak sourcing
- 2: partial support, big gaps
- 3: solid support, small gaps
- 4: strong support, consistent
- 5: primary or replicated evidence

### Step 3 — Write the Artifact

Create a markdown file in the project folder: `research-<slug>.md`

**Format:**

```
TOP: Open questions (only blockers)

TOP: Task checklist (checkboxes grouped by phase)

- Phase 1 — Source set (5–12)
- Phase 2 — Extraction table filled
- Phase 3 — Synthesis
- Phase 4 — Final deliverable

Each phase must start with:
- Affected files (what you will create/update)
- 2–6 bullet summary of changes in those files
```

---

## Deliverable Contract

Every final output must include:

1. **Question + audience**
2. **Key findings** (bullets)
3. **Evidence table** or link to it
4. **Risks + unknowns**
5. **What to monitor next** (signals, metrics, events)
6. **Next actions** (3–7 items)

---

## Mock Test Format (when selected as deliverable)

Create: `test-<slug>.md`

**Structure:**

1. **Test objective** (what is being validated)
2. **Scenarios** (5–10 realistic situations)
   - For each scenario:
     - Context and constraints
     - Key decision point
     - Correct answer with source citations
     - Common pitfalls and why they're wrong
3. **Scoring guide**
   - Pass/fail criteria
   - What a strong answer demonstrates
4. **Answer key** with source pointers

---

## Default Scope

- Time window: last 5 years unless user specifies otherwise
- Geographic: global unless user specifies
- Language: English unless user specifies
