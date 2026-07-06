# Coach Whitepaper

## A New Approach to Evaluating Pitching Performance

*A baseball philosophy document for pitching coaches. No software installation required.*

---

**Author's intent:** Present a framework for at-bat-level pitching evaluation — EABR (End of At-Bat Result) — and the thinking behind Pitch Sequence Intelligence System (PSIS) as one implementation of that framework.

**Status:** Living document. Invites discussion, not obedience.

---

## Executive Summary

Pitching coaches evaluate plate appearances one at a time. Traditional statistics evaluate seasons in aggregate. The gap between those two views is where pitcher development happens — and where most tools do not go.

**PSIS proposes:**

1. Log every plate appearance as pitcher-favorable (good) or batter-favorable (bad)
2. Weight damage through RBI-adjusted bad units
3. Credit stranded runners when innings end
4. Record pitch sequences as evidence of planning
5. Summarize outings with delta (good − bad) and EABR fraction (good ÷ bad)

This whitepaper explains *why* those choices were made and *how* they map to coaching reality.

---

## Section 1 — The Problem

ERA measures runs. WHIP measures traffic. Wins measure team outcomes. Strikeout rate measures misses.

None answer the dugout question after every hitter:

> **"Did we win that at-bat?"**

Coaches need:

- At-bat memory without recency bias
- Inning narratives, not just final lines
- Sequence patterns across sessions
- Fair review when luck and defense distort results

Spreadsheets and notebooks fill the gap inconsistently. PSIS standardizes the language.

*Full treatment: [The_Baseball_Problem.md](./The_Baseball_Problem.md)*

---

## Section 2 — The Hypothesis

> If pitching quality is evaluated at the plate-appearance level with consistent rules for damage and stranded runners, then long-term development and outing review become more accurate than relying on accumulated traditional statistics alone.

**Assumptions:** At-bats are the right unit; binary classification is useful; context (RBI, LOB) matters; sequences are skill; coaches log honestly; traditional stats remain complementary.

**Proof:** Sustained coach adoption, developmental correlation, and staff alignment — not a single formula beating ERA in projection.

*Full treatment: [The_PSIS_Hypothesis.md](./The_PSIS_Hypothesis.md)*

---

## Section 3 — EABR Philosophy

EABR = End of At-Bat Result.

| Concept | Definition |
|---------|------------|
| **Good unit** | Pitcher won the at-bat |
| **Bad unit** | Hitter won the at-bat |
| **Delta** | Good − Bad |
| **Fraction** | Good ÷ Bad |

**Why every at-bat:** Baseball is sequential; memory lies; development needs feedback loops.

**Why context:** Walks with bases loaded hurt more. Hits that score runners hurt more (RBI bad units). Runners stranded at inning end help the pitcher (LOB good units).

**Why innings:** Delta per inning tells the story of each frame. LOB rewards escaping traffic.

*Full treatment: [The_EABR_Philosophy.md](./The_EABR_Philosophy.md)*

---

## Section 4 — Scoring Rules (Essential Reference)

### Defense → 1 good unit

- Strikeout
- Fly out (location recorded, does not change score)
- Ground out (single play, double play, or triple play — always 1 good unit at base layer)

### Offense → 1 bad unit + 1 per RBI

- Walk (+ forced-in runs)
- Hit: single, double, triple, home run (+ runs scored)

### Inning ends → +1 good unit per runner left on base

Credited on the at-bat that records the third out.

### Examples

| Play | Units |
|------|-------|
| Strikeout, bases empty | 1 good |
| Walk, bases empty | 1 bad |
| Solo home run | 1 bad + 1 RBI = 2 bad |
| Grand slam | 1 bad + 4 RBI = 5 bad |
| Strikeout, 2 on, 3rd out | 1 good + 2 LOB = 3 good |
| Ground-ball DP | 1 good, 2 outs |

*Complete rulebook: [The_Logic_Behind_Every_EABR_Score.md](./The_Logic_Behind_Every_EABR_Score.md)*

---

## Section 5 — Traditional Statistics

PSIS **complements** ERA, WHIP, FIP, strikeouts, ground balls, wins, and quality starts.

| Use traditional stats for | Use EABR for |
|---------------------------|--------------|
| Run prevention comparison | At-bat battle log |
| Organizational benchmarks | Inning narratives |
| Projection and scouting | Development conversations |
| League context | Sequence patterns |

A pitcher can post positive EABR delta with a high ERA (balls find holes), or negative EABR with a clean line (weak contact, lucky outs). **Both views matter.**

*Full treatment: [Traditional_Statistics_vs_PSIS.md](./Traditional_Statistics_vs_PSIS.md)*

---

## Section 6 — Pitch Sequencing

Pitching is not throwing pitches — it is throwing the **right pitch after the right pitch**.

PSIS logs sequences (e.g., FB-FB-SL) so coaches can correlate patterns with EABR outcomes over time. Sequencing captures:

- Setup and finish
- Eye-level change
- Speed change
- Plan execution

Sequences do not change unit scores. They explain **how** good and bad units happened.

*Full treatment: [Pitch_Sequencing_Philosophy.md](./Pitch_Sequencing_Philosophy.md)*

---

## Section 7 — Thinking Like a Coach

Good coaches separate process from outcome. EABR preserves strikeouts and outs when runs score on mistakes elsewhere. It records damage when traffic converts. It rewards stranding runners.

The model is a **skeleton** for coaching conversation. Video, mechanics, and judgment attach to the bones.

*Full treatment: [Thinking_Like_A_Pitching_Coach.md](./Thinking_Like_A_Pitching_Coach.md)*

---

## Section 8 — Development Application

| Use case | EABR application |
|----------|------------------|
| Bullpen planning | Target sequences that failed |
| Game review | Inning deltas + RBI clusters |
| Confidence | Point to good units when line score hurts |
| Trends | Session delta over weeks |
| 1-on-1 meetings | Specific, data-backed language |

The framework works in a notebook without software. PSIS automates aggregation.

*Full treatment: [Using_PSIS_To_Develop_Pitchers.md](./Using_PSIS_To_Develop_Pitchers.md)*

---

## Section 9 — Limitations (Honest)

PSIS does not measure:

- Mechanics, velocity, spin, movement
- Weather, defense quality, luck (directly)
- Mental state, hitter quality weighting
- Full situational baseball (sac flies, FC, steals — MVP boundaries)

**Coaching remains necessary.** PSIS is a consistent notebook, not a replacement for the coach.

*Full treatment: [Limitations_Of_The_Model.md](./Limitations_Of_The_Model.md)*

---

## Section 10 — Conclusion

Traditional statistics summarize seasons. Coaches live plate appearance by plate appearance.

EABR offers a disciplined language for that reality:

- Win or lose each at-bat
- Charge for damage
- Credit stranded runners
- Remember sequences
- Summarize with delta and fraction

PSIS is one way to practice that language. The philosophy stands whether or not you ever open the application.

**We invite coaches to read, disagree, adapt, and tell us where the baseball reasoning breaks down.** That is how good frameworks survive.

---

## Document Map

| Topic | Document |
|-------|----------|
| Problem | [The_Baseball_Problem.md](./The_Baseball_Problem.md) |
| Hypothesis | [The_PSIS_Hypothesis.md](./The_PSIS_Hypothesis.md) |
| Philosophy | [The_EABR_Philosophy.md](./The_EABR_Philosophy.md) |
| Every score | [The_Logic_Behind_Every_EABR_Score.md](./The_Logic_Behind_Every_EABR_Score.md) |
| vs traditional stats | [Traditional_Statistics_vs_PSIS.md](./Traditional_Statistics_vs_PSIS.md) |
| Sequencing | [Pitch_Sequencing_Philosophy.md](./Pitch_Sequencing_Philosophy.md) |
| Coach mindset | [Thinking_Like_A_Pitching_Coach.md](./Thinking_Like_A_Pitching_Coach.md) |
| Development | [Using_PSIS_To_Develop_Pitchers.md](./Using_PSIS_To_Develop_Pitchers.md) |
| Limitations | [Limitations_Of_The_Model.md](./Limitations_Of_The_Model.md) |
| Review | [Coach_Philosophy_Review.md](./Coach_Philosophy_Review.md) |

---

*ACI-011 — PSIS Coach Baseball Philosophy — 2026*
