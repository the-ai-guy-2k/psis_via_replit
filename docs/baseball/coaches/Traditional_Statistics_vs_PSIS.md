# Traditional Statistics vs PSIS

A fair comparison — PSIS complements traditional metrics; it does not declare war on them.

---

## How to Read This Document

| Column | Meaning |
|--------|---------|
| **Measures well** | What the stat does better than PSIS |
| **Misses** | What PSIS tries to add |
| **PSIS role** | How EABR fits alongside |

PSIS is **at-bat-level process and outcome logging**. Traditional stats are **aggregated results**. Different tools for different questions.

---

## ERA (Earned Run Average)

| Aspect | Assessment |
|--------|------------|
| **Measures well** | Run prevention — the currency of winning |
| **Misses** | At-bat wins, sequencing, contact quality, luck, defense |
| **PSIS role** | Explains *how* runs happened through bad units and RBI weighting; does not replace earned-run accounting |

**Agreement:** Runs matter. EABR adds RBI bad units so damage is visible inside the at-bat log.  
**Challenge:** ERA can punish a pitcher for one mistake after dominant outs — EABR preserves the outs as good units.

---

## WHIP (Walks + Hits per Inning)

| Aspect | Assessment |
|--------|------------|
| **Measures well** | Baserunner traffic — simple and portable |
| **Misses** | Hit quality, strikeouts, sequencing, inning navigation |
| **PSIS role** | Separates walks and hits as offensive events; adds LOB credit when traffic is stranded |

**Agreement:** Allowing baserunners is generally bad.  
**Challenge:** WHIP treats a weak ground-ball single like a line-drive double. EABR still records one bad unit for any hit — but sequence logging and coach notes capture contact quality outside the unit score.

---

## FIP (Fielding Independent Pitching)

| Aspect | Assessment |
|--------|------------|
| **Measures well** | Strikeouts, walks, home runs — outcomes less dependent on defense |
| **Misses** | Non-HR contact outcomes, sequencing, inning context, development narrative |
| **PSIS role** | Logs every at-bat outcome, not just the "three true outcomes" FIP emphasizes |

**Agreement:** Defense and luck distort ERA; FIP corrects some of that.  
**Challenge:** Most balls in play are not home runs. EABR classifies fly outs and ground outs as good — honoring contact management FIP largely ignores.

---

## Strikeouts

| Aspect | Assessment |
|--------|------------|
| **Measures well** | Miss ability — the cleanest out |
| **Misses** | Whether strikeouts came in big spots; what pitches set them up |
| **PSIS role** | Strikeout = 1 good unit; sequence field captures setup |

**Agreement:** Strikeouts are pitcher wins. EABR agrees completely.  
**Challenge:** Strikeout rate alone does not tell you if the pitcher avoided damage between strikeouts.

---

## Ground Balls

| Aspect | Assessment |
|--------|------------|
| **Measures well** | Contact type tendency — sinker/slider programs often target GB% |
| **Misses** | Quality of ground ball (weak vs rocket); double-play context as a process win |
| **PSIS role** | Ground out = 1 good unit; double play logged with 2 outs recorded |

**Agreement:** Inducing ground balls is generally pitcher-favorable.  
**Challenge:** GB% is a rate; EABR logs each ground out as a won at-bat. A double play is still one good unit — the extra out is reflected in inning progression, not double-counted in units.

---

## Wins

| Aspect | Assessment |
|--------|------------|
| **Measures well** | Team success (barely a pitching stat) |
| **Misses** | Pitching process entirely |
| **PSIS role** | Ignores wins — intentional |

**Agreement:** Winning matters to the team.  
**Challenge:** PSIS rejects wins as a pitching evaluation tool. Session EABR delta is the pitching-side summary.

---

## Quality Starts

| Aspect | Assessment |
|--------|------------|
| **Measures well** | Length + run threshold — a durability benchmark |
| **Misses** | How those runs were allowed; bullpen-inherited messes |
| **PSIS role** | Session summaries with inning breakdowns replace the binary QS label for coaching review |

**Agreement:** Going deep with limited damage is valuable.  
**Challenge:** A "quality start" with three cheap outs and one disastrous inning looks the same as a dominant start. EABR inning deltas expose the difference.

---

## Side-by-Side Summary

| Question | Best tool |
|----------|-----------|
| How many earned runs per nine? | ERA |
| How much traffic per inning? | WHIP |
| Strikeouts, walks, HRs in one number? | FIP |
| Did we win each plate appearance? | **EABR / PSIS** |
| What pitches preceded success? | **PSIS sequences** |
| Did we strand runners? | **EABR LOB units** |
| How costly was damage? | **EABR RBI bad units** |

---

## What PSIS Intentionally Does Not Do

| Traditional need | PSIS stance |
|------------------|-------------|
| League-wide percentile ranks | Out of scope — single-team tool |
| Predictive ERA models | Not the goal |
| Replace Statcast | Complementary — different data |
| Declare one "best" pitcher | Coaches decide |

---

## The Complement, Not Replacement, Principle

> Use ERA, WHIP, and FIP for **organizational comparison and run prevention**.  
> Use EABR for **coaching conversation, development, and outing review**.

A pitcher can improve EABR delta while ERA lags (balls find holes), or post a clean ERA with negative EABR (weak contact, lucky outs). **Both truths matter.**

---

## Related

- [The_Baseball_Problem.md](./The_Baseball_Problem.md)
- [Limitations_Of_The_Model.md](./Limitations_Of_The_Model.md)
