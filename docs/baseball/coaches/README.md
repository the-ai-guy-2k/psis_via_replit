# PSIS Coach Baseball Philosophy

**Baseball thinking for pitching coaches — no software required.**

---

## What This Is

This folder is a **baseball whitepaper**, not an application guide. It explains the coaching philosophy that produced PSIS: why at-bat-level evaluation matters, what EABR measures, and how those ideas relate to traditional statistics.

The software is one implementation of these ideas. The ideas stand on their own.

---

## Intended Audience

- Pitching coaches
- Coaching staff who review bullpen and game performance
- Anyone who wants to understand *why* PSIS scores plate appearances the way it does

**Not here:** install instructions, API details, or developer setup. See `docs/operator/` and `docs/developer/` for those.

---

## Reading Order

| # | Document | Focus |
|---|----------|-------|
| 1 | [The_Baseball_Problem.md](./The_Baseball_Problem.md) | What traditional stats miss |
| 2 | [The_PSIS_Hypothesis.md](./The_PSIS_Hypothesis.md) | The core scientific claim |
| 3 | [The_EABR_Philosophy.md](./The_EABR_Philosophy.md) | Why every at-bat matters |
| 4 | [Traditional_Statistics_vs_PSIS.md](./Traditional_Statistics_vs_PSIS.md) | Fair comparison to ERA, WHIP, FIP, etc. |
| 5 | [The_Logic_Behind_Every_EABR_Score.md](./The_Logic_Behind_Every_EABR_Score.md) | Every scoring decision justified |
| 6 | [Pitch_Sequencing_Philosophy.md](./Pitch_Sequencing_Philosophy.md) | Why sequences are a skill |
| 7 | [Thinking_Like_A_Pitching_Coach.md](./Thinking_Like_A_Pitching_Coach.md) | Process vs outcome |
| 8 | [Using_PSIS_To_Develop_Pitchers.md](./Using_PSIS_To_Develop_Pitchers.md) | Development and review |
| 9 | [Limitations_Of_The_Model.md](./Limitations_Of_The_Model.md) | Honest boundaries |
| 10 | [Coach_Whitepaper.md](./Coach_Whitepaper.md) | Full synthesis — start here for the executive read |
| 11 | [Coach_Philosophy_Review.md](./Coach_Philosophy_Review.md) | Peer review of this documentation |

**Short path:** Read [Coach_Whitepaper.md](./Coach_Whitepaper.md), then [The_Logic_Behind_Every_EABR_Score.md](./The_Logic_Behind_Every_EABR_Score.md) if you want the full rulebook.

---

## Core Vocabulary

| Term | Meaning |
|------|---------|
| **EABR** | End of At-Bat Result — the terminal outcome of a plate appearance |
| **Good unit** | Credit to the pitcher for a pitcher-favorable at-bat |
| **Bad unit** | Debit against the pitcher for a batter-favorable at-bat |
| **Delta** | Good units minus bad units (inning or session) |
| **EABR Fraction** | Good units divided by bad units |
| **LOB** | Runners left on base when the inning ends — each adds a good unit |
| **Pitch sequence** | The ordered pitches thrown before the at-bat ended |

---

## A Note on Truth

PSIS does not claim to replace coaching judgment. It offers a **consistent language** for discussing what happened in each plate appearance. Disagreement is welcome — the goal is better conversation, not a final scoreboard of truth.

---

## Document Control

| Field | Value |
|-------|-------|
| **ACI** | ACI-011 — Coach Baseball Philosophy |
| **Last reviewed** | 2026-07-06 |
| **Review outcome** | PASS — see [Coach_Philosophy_Review.md](./Coach_Philosophy_Review.md) |
| **Standalone** | No software or install required to read this folder |
