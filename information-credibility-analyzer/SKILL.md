---
name: information-credibility-analyzer
description: "Evaluate credibility of claims, posts, articles, or research. Trigger on: fact check this, is this credible, evaluate this source, verify this claim, detect misinformation."
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

Assess the credibility of information by examining claims, evidence, sources, reasoning, and context.

This skill focuses on credibility evaluation, not summarization.

## Use When

- The user pastes text and asks if it is credible.
- The user wants verification or fact-checking.
- The user is concerned about misinformation.

## Avoid When

- The user only wants a summary.
- The user asks for speculation or opinion without evidence.

## Output Contract

## 1) Claim Identification

List the primary claim and supporting claims.

## 2) Evidence Assessment

For each claim:

- Evidence type: data, anecdote, expert opinion, citation, unknown
- Evidence strength: weak | moderate | strong
- Missing evidence

## 3) Source Credibility

Evaluate:

- Author expertise
- Publication reputation
- Transparency of sources
- Possible bias or incentives

## 4) Reasoning Analysis

Identify:

- Logical strengths
- Logical fallacies
- Unsupported assumptions

## 5) Context Check

Explain missing context needed to properly evaluate the claim.

## 6) Credibility Judgment

Provide:

- Credibility: low | moderate | high
- Misinformation risk: low | moderate | high
- Key reasons

## 7) Verification Steps

List actions the user can take to verify the claim.

## 8) Confidence and Tipping Variables

Confidence: low | medium | high

Tipping variables: evidence that could significantly change the assessment.

## Quality Rules

- Separate verified facts from assumptions.
- Avoid certainty without evidence.
- Clearly mark uncertainty.
