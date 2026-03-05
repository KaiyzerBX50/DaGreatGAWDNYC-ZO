---
name: constraint-solver
description: "Generate feasible plans within strict constraints. Trigger on: limited budget, limited time, resource constraints, optimize within limits, work with restrictions."
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

Create practical solutions when users face strict limitations such as time, money, resources, or skill.

## Use When

- The user mentions budget limits.
- The user mentions time limits.
- The user needs a realistic plan within constraints.

## Avoid When

- The user wants unconstrained brainstorming.
- The user is choosing between tools only.

## Required Output Structure

## 1) Constraint Identification

List all constraints mentioned:

- Budget
- Time
- Resources
- Skills
- External limitations

Classify each as:

- Hard constraint
- Flexible constraint

## 2) Objective Clarification

Define the user’s main goal.

## 3) Feasible Solution Space

Generate possible approaches that respect the constraints.

## 4) Solution Comparison

Evaluate each solution on:

- Feasibility
- Cost
- Risk
- Expected outcome

## 5) Optimized Plan

Provide the most viable plan with clear steps.

## 6) Constraint Relaxation Scenarios

Explain how solutions change if:

- budget increases
- time increases
- resources expand

## 7) Confidence and Tipping Variables

Confidence: low | medium | high

Tipping variables: constraints most likely to change the plan.

## Quality Rules

- Respect hard constraints strictly.
- Avoid unrealistic suggestions.
- Prioritize practicality.
