# The PSIS Hypothesis

A testable claim about how pitching should be evaluated.

---

## The Hypothesis

> **If pitching quality is evaluated at the plate-appearance level — using a consistent framework that credits process, context, and damage — then long-term pitcher development and outing review become more accurate than relying on accumulated traditional statistics alone.**

PSIS (Pitch Sequence Intelligence System) is built to test this hypothesis in daily coaching practice.

---

## What "More Accurate" Means Here

PSIS does not claim to predict future ERA better than projection systems. It claims something more practical:

| Claim | Meaning |
|-------|---------|
| **Richer feedback** | Coaches can point to specific at-bats, not just final lines |
| **Faster diagnosis** | Patterns emerge across innings and sessions |
| **Fairer review** | Process can be praised even when runs score |
| **Shared language** | Staff discusses the same unit for each outcome |

"More accurate" means **closer to how good coaches already think** — made visible and repeatable.

---

## Core Assumptions

The hypothesis rests on assumptions. They should be stated openly so they can be challenged.

### Assumption 1: At-bats are the right unit of analysis

Baseball offense is built from plate appearances. Pitching evaluation should align with that grain.

**If wrong:** Inning-level or pitch-level-only models might be superior. PSIS would need to adapt.

### Assumption 2: Each at-bat can be classified as pitcher-favorable or batter-favorable

Not every at-bat feels binary in the dugout — but coaching decisions often collapse to: *Did we get the out we needed? Did we avoid damage?*

**If wrong:** A spectrum model (partial credit) might be better. EABR would need revision.

### Assumption 3: Context matters — especially damage and stranded runners

A walk with the bases loaded is worse than a walk with the bases empty. A single that drives in two runs hurts more than a single with no one on. Runners left on base when the inning ends represent a pitching success worth crediting.

**If wrong:** Flat per-event scoring would suffice. PSIS intentionally rejects that for offensive damage and LOB.

### Assumption 4: Pitch sequencing is part of pitching skill

The pitches thrown before the outcome are not decoration. They are evidence of planning and execution.

**If wrong:** Outcome-only logging would be enough. PSIS would not need sequence fields.

### Assumption 5: Coaches will log honestly and consistently

EABR only works if staff classify outcomes the same way.

**If wrong:** The framework fails regardless of software. Training and staff alignment matter.

### Assumption 6: Traditional stats remain valuable

PSIS assumes complementarity, not replacement. ERA, WHIP, and FIP still describe outcomes the organization cares about.

---

## Expected Outcomes

If the hypothesis holds in practice, coaches should observe:

| Outcome | Signal |
|---------|--------|
| **Clearer bullpen conversations** | "Your delta was positive despite two hits — you stranded six." |
| **Better trend detection** | Session-over-session EABR fraction moves before ERA does |
| **Sequence insight** | Repeated sequences linked to good or bad at-bats |
| **Reduced outcome bias** | Praise for strikeouts and weak contact even when BABIP hurts |
| **Staff alignment** | Fewer arguments about "how bad was that inning?" |

---

## How the Hypothesis Could Be Proven

| Evidence type | Example |
|---------------|---------|
| **Coaching utility** | Staff uses EABR language in meetings without prompting |
| **Development correlation** | Pitchers with improving EABR trends show improved traditional outcomes over time |
| **Predictive value** | Session-level EABR delta correlates with coach ratings of outing quality |
| **Consistency** | Independent coaches classify the same at-bat the same way after training |
| **Retention** | Coaches continue logging after the novelty wears off |

Formal statistical proof is possible but not required for coaching value. **Sustained use by respected coaches** is the primary practical test.

---

## How the Hypothesis Could Be Disproven

| Failure mode | What it would mean |
|--------------|-------------------|
| **Coaches reject the framework** | Classifications feel arbitrary or unfair |
| **No developmental signal** | EABR trends do not relate to anything coaches care about |
| **Logging burden too high** | At-bat logging abandoned mid-season |
| **Gaming the metric** | Pitchers optimize for EABR at the expense of real pitching |
| **Context rules wrong** | RBI or LOB weighting feels miscalibrated in practice |

PSIS treats these as **live risks**, not theoretical objections. See [Limitations_Of_The_Model.md](./Limitations_Of_The_Model.md).

---

## Relationship to EABR

EABR (End of At-Bat Result) is the **measurement instrument** for this hypothesis:

- Every plate appearance receives a classification
- Good and bad units accumulate into inning and session summaries
- Delta and fraction summarize performance at a glance

The hypothesis is the **why**. EABR is the **how**.

---

## A Coach's Version

> "I already judge every at-bat in my head. PSIS asks: what if we wrote it down the same way every time — including when we strand runners and when damage happens — so we can actually see patterns?"

That is the hypothesis in one sentence.

---

## Related

- [The_EABR_Philosophy.md](./The_EABR_Philosophy.md) — the philosophy behind the instrument
- [Coach_Whitepaper.md](./Coach_Whitepaper.md) — full synthesis
