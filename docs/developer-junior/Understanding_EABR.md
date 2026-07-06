# Understanding EABR

EABR scoring explained for junior developers — with examples.

---

## Why EABR Exists

Coaches need a **consistent way** to score each plate appearance:

- Did the pitcher win that at-bat (good) or lose it (bad)?
- How did the whole inning compare?
- How did the whole session compare?

**EABR** = **E**nd of **A**t-**B**at **R**esult — the final outcome when the at-bat is over (strikeout, single, walk, etc.).

---

## Good vs Bad (The Simplest Rule)

| Coach selects… | Category | Unit |
|----------------|----------|------|
| **Defense** outcome (strikeout, fly out, ground out) | Good for pitcher | +1 good unit |
| **Offense** outcome (hit, walk) | Bad for pitcher | +1 bad unit (plus RBI — see below) |

Think: **Defense = pitcher succeeded. Offense = batter succeeded.**

---

## Delta (How Much the Pitcher Won the Inning)

```
Delta = Good Units − Bad Units
```

### Example inning

| At-bat | Type | Good | Bad |
|--------|------|------|-----|
| 1 | Strikeout | 1 | 0 |
| 2 | Single | 0 | 1 |
| 3 | Fly out | 1 | 0 |

**Inning totals:** Good = 2, Bad = 1  
**Delta = 2 − 1 = +1** (pitcher-favorable inning)

Positive delta = good for pitcher. Negative = bad for pitcher.

---

## Fraction (Good ÷ Bad)

```
Fraction = Good Units / Bad Units
```

Same example: **2 / 1 = 2.0**

Shown on scoreboard as `2/1` (goodCount/badCount).

If bad units = 0, the UI handles edge cases — ask mentor if you touch this.

---

## RBI and Bad Units

When an offensive play drives in runs, it hurts the pitcher more:

```
Bad units for an offensive at-bat = 1 + RBI
```

### Example: Home run with no one on base

- 1 bad unit (the hit) + 1 RBI (batter scores) = **2 bad units**

### Example: Strikeout

- **0 bad units** from offense (it's a good defensive outcome — 1 good unit instead)

---

## Runners Left on Base (LOB)

When the third out ends the inning, runners still on base count as **+1 good unit each** for the pitcher (batter did not score them).

These LOB units are added to the **last at-bat of the inning**.

---

## Where the Math Happens (For Your Code)

| You should NOT calculate in React | Calculate here |
|-----------------------------------|----------------|
| ❌ `track.tsx` | ✅ `lib/psis-game-logic` |

Functions like `computeEabrUnits`, `computeInningState`, `rawOutsForOutcome` — all in game logic.

The server runs these when `POST /api/entries` is called.

---

## Visual: One Plate Appearance

```
Coach clicks: Defense → Strikeout
        ↓
Server sets: goodCount=1, badCount=0, delta contributes +1
        ↓
Saved in psis_entries.json
        ↓
Tracker scoreboard updates
```

---

## Visual: Full Inning

```
At-bat 1: Strikeout     (1 out)
At-bat 2: Walk          (0 outs)
At-bat 3: Fly out       (2 outs)
At-bat 4: Single        (2 outs)
At-bat 5: Ground out    (3 outs — inning over)
        ↓
Inning delta = sum(good) − sum(bad)
LOB added on final at-bat if runners stranded
```

---

## What You Must Not Do

| Mistake | Why |
|---------|-----|
| Change delta formula in UI | Wrong numbers for everyone |
| Let frontend send `goodCount` | Cheating / bugs |
| Change test expectations to match your bug | Hides real problems |

---

## Practice Questions (Check With Mentor)

1. Strikeout — good or bad unit for pitcher? **Good**
2. Triple — good or bad? **Bad**
3. Delta formula? **Good − Bad**
4. Where does math live? **psis-game-logic**

---

## Learn More

- [Safe_Code_Changes.md](./Safe_Code_Changes.md)
- [Mid-Level EABR guide](../developer-mid/Working_With_EABR.md)
- Scenario tests: `scripts/src/test-psis-scenarios.ts`
