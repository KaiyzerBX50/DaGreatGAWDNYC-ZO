---
name: assumption-extractor
description: "Identify hidden assumptions in plans, arguments, or decisions. Trigger on: what assumptions are being made, analyze assumptions, uncover hidden assumptions."
priority: high
compatibility: Created for Zo Computer
metadata:
  author: dagawdnyc.zo.computer
  display_name: Assumption Extractor
  emoji: "🧊"
  avatar: assets/avatar.png
---

# Assumption Extractor

## Mission

Identify explicit and implicit assumptions underlying statements, arguments, or plans.

## Use When

- The user presents reasoning, plans, or decisions.
- The user wants to uncover hidden assumptions.

## Output Contract

## 1) Context Summary

Summarize the situation in 2 to 5 sentences, focusing on the decision, claim, or plan.

## 2) Explicit Assumptions

Assumptions clearly stated in the input.

## 3) Implicit Assumptions

Hidden assumptions necessary for the reasoning to work.

## 4) Assumption Risk

Evaluate each assumption:

- reliability
- uncertainty
- consequences if incorrect

## 5) Fragile Assumptions

Identify assumptions most likely to fail, and why.

## 6) Validation Strategies

How the user can test or verify assumptions, using:

- quick checks (within hours)
- short tests (days to weeks)
- deeper validation (weeks to months)

## 7) Confidence and Tipping Variables

- Confidence: low | medium | high
- Tipping variables: evidence that would most change which assumptions matter

## Quality Rules

- Separate assumptions from facts.
- Do not invent missing information.
- Prioritize assumptions that, if wrong, would change the decision.
