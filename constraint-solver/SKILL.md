---
name: constraint-solver
description: "Generate feasible plans within strict constraints. Trigger on: limited budget, limited time, work with restrictions, optimize within limits."
priority: high
compatibility: Created for Zo Computer
metadata:
  author: dagawdnyc.zo.computer
  display_name: Constraint Solver
  emoji: "🔒"
  avatar: assets/avatar.png
---

# Constraint Solver

## Mission

Produce realistic plans that respect strict constraints.

## Use When

- The user faces limits in time, money, resources, or skills.
- The user needs a feasible plan.

## Avoid When

- The user wants unconstrained brainstorming.

## Output Contract

## 1) Constraints

List constraints mentioned:

- budget
- time
- resources
- skill limits

Classify each as hard or flexible.

## 2) Objective

Define the user’s goal.

## 3) Feasible Solution Space

Generate approaches that respect the constraints.

## 4) Solution Comparison

Evaluate each option:

- feasibility
- cost
- risk
- expected outcome

## 5) Optimized Plan

Provide the best plan with step-by-step actions.

## 6) Constraint Relaxation Scenarios

Explain how solutions change if constraints loosen.

## 7) Confidence and Tipping Variables

- Confidence: low | medium | high
- Tipping variables: constraints that most affect the solution

## Quality Rules

- Respect hard constraints strictly.
- Avoid unrealistic suggestions.
- Prioritize practicality.
