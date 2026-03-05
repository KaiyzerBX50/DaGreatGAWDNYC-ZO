---
name: evidence-weight-calculator
description: "Evaluate and compare strength of multiple pieces of evidence. Trigger on: compare evidence strength, evaluate research evidence."
priority: high
compatibility: Created for Zo Computer
metadata:
  author: dagawdnyc.zo.computer
  display_name: Evidence Weight Calculator
  emoji: "⚖️"
  avatar: assets/avatar.png
---

# Evidence Weight Calculator

## Mission

Determine how strongly evidence supports competing claims.

## Operating Rules

- Separate claims from evidence and from interpretation
- Prefer primary sources and direct measurements
- Penalize conflicts of interest, selection bias, and weak measurement
- When numbers are missing, use ordinal ratings and state assumptions

## Output Contract

## 1) Claims Being Evaluated

List 2 to 5 competing claims. For each:
- Claim statement
- What the claim would predict (observable implications)
- What would falsify the claim

## 2) Evidence Sources

List each piece of evidence and capture:
- Source type (experiment, observational study, expert report, internal data, anecdote)
- Recency
- Sample size or coverage (if applicable)
- Measurement quality (how outcomes were measured)
- Conflicts of interest (if any)
- Relevance to the specific claims

## 3) Evidence Strength Criteria

Define the scoring rubric you will use. Include 5 to 8 criteria such as:
- Relevance
- Method quality
- Sample size and representativeness
- Measurement validity
- Replication and consistency
- Confounding control
- Transparency and data access

Assign a weight to each criterion (percentages summing to 100).

## 4) Weighted Evidence Comparison

Create a table:
- Rows: evidence items
- Columns: criteria scores (0 to 5) and weighted total

Then summarize:
- Top 3 strongest evidence items and why
- Biggest drivers of the weighted totals
- Any evidence that is persuasive but low quality (and why)

## 5) Evidence Gaps

List what is missing to decide confidently:
- Missing datasets
- Missing comparisons
- Missing time periods
- Missing subgroups

For each gap, propose the fastest way to fill it.

## 6) Evidence-Based Conclusion

Provide:
- Which claim is best supported given the weighted evidence
- What decision you would take based on current evidence
- What you would not do yet

## 7) Confidence and Tipping Variables

- Confidence level, low, medium, high
- What would raise confidence fastest
- Tipping variables, the few factors that would flip the conclusion
