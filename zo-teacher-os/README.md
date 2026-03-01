# Zo Teacher OS

**Lesson planning that ends with a real package.**

A web-based tool that turns 2-minute classroom descriptions into complete, ready-to-teach lesson packages with differentiation, rubrics, trackers, and more.

## Overview

Zo Teacher OS is a prompt-builder interface hosted on zo.space that helps K–12 educators create standards-aligned lesson packages in minutes. Teachers describe their class, copy a prompt, paste it into any AI chat, and download 7 formatted exports (DOCX, PDF, CSV, PPTX).

**Live:** https://dagawdnyc.zo.space/teacher-os

## Features

- **Prompt Builder** — Visual form to describe class context (grade, subject, duration, differentiation needs, materials constraints)
- **Preset Workflows** — One-click templates for common scenarios (2nd Grade ELA, 7th Grade Science, 9th Grade Algebra, 5th Grade Social Studies)
- **Copy-Paste Prompts** — Generate AI-ready prompts that work with Claude, ChatGPT, Gemini, or any LLM
- **Export Options**
  - Download ZIP locally
  - Export directly to your Zo workspace
- **Ready-to-Use Outputs**
  - Lesson Plan (DOCX)
  - One-Page Plan (PDF)
  - Rubric (DOCX)
  - Trackers/Gradebook (CSV)
  - Sub Plan (DOCX)
  - Parent Letter (DOCX)
  - Slide Outline (PPTX)
- **Social Proof** — Real-time trending topics and lesson creation stats
- **Privacy-First** — All data stays on your device or Zo workspace; prompts are never stored

## Tech Stack

- **Framework:** React + TypeScript
- **Styling:** Tailwind CSS
- **Hosting:** zo.space (Bun + Hono)
- **Icons:** Lucide React

## File Structure

```
zo-teacher-os/
├── README.md (this file)
├── SKILL.md (if registering as a Zo skill)
└── samples/
    └── 7th-science/
        ├── lesson-plan.docx
        ├── one-page-plan.pdf
        ├── rubric.docx
        ├── trackers.csv
        ├── sub-plan.docx
        ├── parent-letter.docx
        └── slides-outline.pptx
```

## How It Works

### 1. Fill the Builder
Users input:
- Grade level (PreK–12)
- Subject (Math, ELA, Science, Social Studies, etc.)
- Lesson topic
- Duration (5 min to multi-day)
- Instructional model (optional)
- Standards or goals (optional, plain text)
- Class profile (supports, language needs, IEP/504)
- Materials constraints
- Handout type (Worksheet, Study Guide, Exit Ticket, etc.)
- Assessment preference (Mixed, Exit ticket, Quiz, etc.)

### 2. Copy & Paste Prompt
The builder generates a structured prompt:
```
Create a complete instructional package using Zo Teacher OS.

Inputs
- grade_level: 7
- subject: Science
- lesson_topic: Food Webs and Human Impact
- ...

Requirements
- Do not invent official standard codes.
- Include differentiation for struggling learners, advanced learners, English learners, and IEP/504.
- Include behavior and classroom management supports.
- Include 3 embedded formative checks, 1 summative, and a 4-level rubric.
- Include 3 CSV blocks (gradebook, standards mastery, MTSS) with 10 empty rows each.

Output
Return Teacher Snapshot, then (if Unit) Unit Export, then Word Export, PDF Export, Excel Export, then Bonus Exports.
```

Users paste this into Claude, ChatGPT, or any AI chat.

### 3. Export Package
After AI generates content, users can:
- **Download ZIP** — Downloads all files locally
- **Export to Zo Workspace** — Saves directly to their Zo account (requires personal Zo API token)

## Key UI Sections

1. **Hero** — Value prop, trust signals, 3-step CTA
2. **How It Works** — Visual walkthrough of the workflow
3. **Prompt Builder** — Interactive form (presets, grade selector, subject, topic, etc.)
4. **Copy-Paste Prompt** — Code block with copy button
5. **Zo Access Token Field** — Secure input for workspace export
6. **"What's Included" Grid** — Visual preview of export files
7. **Next Steps** — 3-step numbered guide
8. **Trending This Week** — Social proof (trending topics + lesson creation stat)
9. **Sample Package** — Grade 7 Science example with download links
10. **Reviews** — 3 teacher testimonials
11. **Before/After Comparison** — Without vs. With Zo Teacher OS
12. **FAQ** — 5 common questions

## User Privacy & Data

- **Prompts:** Never stored. Generated and displayed only in the browser.
- **Tokens:** Stored only in browser localStorage. Users can clear with "Clear token" button.
- **Exports:** Saved to user's device (ZIP download) or Zo workspace (with token permission).
- **No Tracking:** Page uses no analytics or third-party tracking.

## Teacher Testimonials

- "I walked into planning with a blank page and left with a full package I could hand to a sub."
- "The differentiation section saved me. I stopped rewriting the same supports every day."
- "Having the trackers and rubric in the same output made grading feel organized again."

## Trending Topics (Sample)

Current trending lesson topics:
- Food Webs
- Fractions
- Civil Rights
- Photosynthesis
- Persuasive Writing

*Stat: 1,200+ lesson packages created by educators*

## Sample Downloads

A Grade 7 Science example (Food Webs and Human Impact, 60 min lesson) is available:
- [Lesson Plan (DOCX)](https://dagawdnyc.zo.space/teacher-os/samples/7th-science/lesson-plan.docx)
- [One-Page Plan (PDF)](https://dagawdnyc.zo.space/teacher-os/samples/7th-science/one-page-plan.pdf)
- [Unit Plan (DOCX)](https://dagawdnyc.zo.space/teacher-os/samples/7th-science/unit-plan.docx)
- [Rubric (DOCX)](https://dagawdnyc.zo.space/teacher-os/samples/7th-science/rubric.docx)
- [Trackers (CSV)](https://dagawdnyc.zo.space/teacher-os/samples/7th-science/trackers.csv)
- [Sub Plan (DOCX)](https://dagawdnyc.zo.space/teacher-os/samples/7th-science/sub-plan.docx)
- [Parent Letter (DOCX)](https://dagawdnyc.zo.space/teacher-os/samples/7th-science/parent-letter.docx)
- [Slides Outline (PPTX)](https://dagawdnyc.zo.space/teacher-os/samples/7th-science/slides-outline.pptx)

## Supported Subjects

Tested and working with:
- ELA (English Language Arts)
- Mathematics
- Science
- Social Studies
- Visual Arts
- Music
- Physical Education
- World Languages
- Career & Technical Education
- *And more — works with any subject*

## FAQ

**How long does it actually take?**
2–3 minutes to fill the form. AI generates the lesson. Downloads ready to teach immediately.

**Can I edit the outputs?**
Absolutely. All exports are standard DOCX, PDF, and CSV files. Edit them however you want.

**What if my state standards are different?**
Customize the "Standards or goals" field for your state. The prompt includes your specific standards in every export.

**Works with ChatGPT, Claude, Gemini?**
Yes. Copy the prompt into any AI chat you use. The prompt is designed to work everywhere.

**Will this work for my subject?**
We've tested ELA, Math, Science, Social Studies, Visual Arts, Music, PE, World Languages, Career & Technical Education, and more. If you have a subject in mind, give it a try. The prompt adapts to any grade level and any subject.

## Installation & Setup

This is a **zo.space hosted page**, not a standalone app. To set up locally or self-host:

1. Clone the repo
2. Copy the route code from `https://dagawdnyc.zo.space/teacher-os`
3. Deploy using Bun + Hono or adapt to your framework
4. Update sample file links to point to your hosting

## Contributing

Feedback, feature requests, and improvements welcome. Please open an issue or PR on GitHub.

## License

[Your license here — check LICENSE file]

## Contact

Created by **dagawdnyc** for educators using Zo Computer.

- **Website:** https://dagawdnyc.zo.space/teacher-os
- **GitHub:** https://github.com/DaGreatGAWDNYC/DaGreatGAWDNYC-ZO
- **Zo Computer:** https://zocomputer.com

---

**Last Updated:** February 28, 2026
