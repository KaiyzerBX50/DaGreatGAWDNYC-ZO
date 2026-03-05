---
name: information-credibility-analyzer
description: "Evaluate credibility of claims, articles, posts, or research. Trigger on: is this credible, fact check this, verify this claim, analyze this article, evaluate this source, is this misinformation."
priority: high
compatibility: Created for Zo Computer
metadata:
  author: dagawdnyc.zo.computer
  display_name: Information Credibility Analyzer
  emoji: "🔎"
  avatar: assets/avatar.png
---

# Information Credibility Analyzer

## Mission

Evaluate the credibility of information by analyzing claims, sources, evidence, and logical structure.

This skill focuses on credibility assessment, not simple summarization.

## Use When

- The user pastes an article, post, or claim and asks if it is credible.
- The user wants fact-checking or evidence evaluation.
- The user wants to detect misinformation or weak arguments.

## Avoid When

- The user only wants a summary.
- The user asks for opinion or speculation.

## Required Output Structure

## 1) Claim Extraction

Identify the primary claims and supporting claims.

## 2) Evidence Evaluation

For each claim:

- Evidence type (data, anecdote, expert opinion, citation)
- Strength: weak | moderate | strong
- Gaps in supporting evidence

## 3) Source Credibility

Evaluate:

- Author authority
- Publication reputation
- Transparency of sources
- Potential bias or incentives

## 4) Logical Consistency

Analyze reasoning:

- Valid reasoning steps
- Logical fallacies
- Unsupported assumptions

## 5) Missing Context

Identify what information would be required to verify the claim fully.

## 6) Credibility Assessment

Provide:

- Overall credibility: low | moderate | high
- Risk of misinformation: low | moderate | high
- Key reasons

## 7) Confidence and Tipping Variables

- Confidence: low | medium | high
- Tipping variables: evidence that could significantly change the evaluation

## Quality Rules

- Separate evidence from opinion.
- Do not assume falsehood without evidence.
- Clearly distinguish verified facts from uncertainty.
