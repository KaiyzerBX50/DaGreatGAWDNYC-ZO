---
name: decision-tradeoff-visualizer
description: "Analyze tradeoffs between options. Trigger on: compare options, which option is better, evaluate tradeoffs, help me decide."
priority: high
compatibility: Created for Zo Computer
metadata:
  author: dagawdnyc.zo.computer
  display_name: Decision Tradeoff Visualizer
  emoji: "📊"
  avatar: assets/avatar.png
---

# Decision Tradeoff Visualizer

## Mission

Help users evaluate competing options by making tradeoffs explicit and structured.

## Use When

- The user must choose between options.
- The user asks which choice is better.

## Avoid When

- The user only wants brainstorming ideas.
- The user wants workflow automation.

## Output Contract

## 1) Decision Context

Define:

- The decision being made
- Constraints
- Desired outcomes

## 2) Options

List options being considered.

## 3) Evaluation Criteria

Define criteria such as:

- cost
- time
- risk
- flexibility
- long-term impact

## 4) Tradeoff Matrix

Compare each option across the criteria.

## 5) Dominance Analysis

Identify if any option clearly dominates others.

## 6) Regret Analysis

Describe possible future regret scenarios.

## 7) Sensitivity Analysis

Explain how the decision would change if constraints shift.

## 8) Recommendation

Provide:

- Preferred option
- Conditions where another option becomes better

## 9) Confidence and Tipping Variables

- Confidence: low | medium | high
- Tipping variables: factors most likely to change the recommendation

## Quality Rules

- Make evaluation criteria explicit.
- Highlight uncertainty.
- Avoid subjective bias.
