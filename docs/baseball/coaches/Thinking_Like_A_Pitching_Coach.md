# Thinking Like a Pitching Coach

How coaches evaluate outings — and how EABR models that thought process.

---

## The Coach's Mental Model

After an outing, a good pitching coach asks:

1. **How many battles did we win?** (plate appearances)
2. **When we lost, how costly was it?** (runs, traffic)
3. **Did we escape jams?** (stranded runners)
4. **Was the process repeatable?** (sequences, execution trends)
5. **What would I change next time?** (specific hitters, counts, pitch mix)

Box score answers question 2 partially. EABR answers questions 1, 2, 3, and 4 in a structured way.

---

## Process vs Outcome

Coaches live in tension between two truths:

| Truth | Example |
|-------|---------|
| **Process was good** | Three strikeouts, weak contact, positive delta |
| **Outcome was bad** | BABIP single, bloop double, two runs score |

Traditional stats emphasize outcome. EABR preserves **both**:

- Good units remember the strikeouts and outs
- Bad units and RBI remember the damage
- Delta shows the net of the outing's battles

A coach can say: *"The line score looks rough, but we won more at-bats than we lost — here's the delta."* Or the opposite: *"The ERA looks fine, but we were behind in too many counts — look at the bad units."*

---

## Separating Pitcher from Defense and Luck

Coaches routinely adjust mental scores:

- "That wasn't his fault — shortstop ate it"
- "That's a hit 8 times out of 10"
- "Great pitch, better hitter"

EABR does not automate that separation perfectly. It gives a **consistent baseline** so the coach's adjustment happens in conversation, not in silence.

Fly outs count as good units even when the ball was smoked. That matches how coaches often evaluate: *"I'll live with that contact."* Notes and video handle the nuance.

---

## Inning-by-Inning Storytelling

Coaches rarely summarize a start in one number. They tell innings:

> "First was clean. Second we walked the leadoff guy but stranded him. Third they scored two on a double and a single — bad inning. Fourth we bounced back."

EABR inning deltas mirror that narrative:

| Inning | Coach language | EABR language |
|--------|----------------|---------------|
| 1st | "Clean" | Positive delta |
| 2nd | "Traffic but escaped" | LOB good units may offset walks |
| 3rd | "Damage" | High bad units + RBI |
| 4th | "Bounced back" | Positive delta again |

The 9-box inning view (in the application) is the visual version of how coaches already chunk outings.

---

## What Coaches Reward (Mapped to EABR)

| Coach behavior praised | EABR reflection |
|------------------------|-----------------|
| "Competed with runners on" | LOB units when inning ends |
| "Put him away with two strikes" | Strikeout good unit |
| "Induced a double play" | Good unit + 2 outs |
| "Avoided the big inning" | Session delta vs runs allowed |
| "Stuck to the plan" | Sequence logs + consistent outcomes |

---

## What Coaches Discourage (Mapped to EABR)

| Coach frustration | EABR reflection |
|-------------------|-----------------|
| "Free 90" | Walk bad unit |
| "Cement mixer in a hitter count" | Hit bad unit + possible RBI |
| "Couldn't put him away" | Multiple at-bats, cumulative bad units |
| "One pitch away from getting out of it" | LOB rewards if they stranded; bad units if they didn't |

---

## The Model Is Simplification — On Purpose

Real coaching thought includes:

- Body language
- Velocity trends within the outing
- Matchup history
- Game situation beyond base state

EABR captures the **skeleton** of coaching evaluation — at-bat wins, damage, stranding — so the flesh (video, mechanics, conversation) has bones to attach to.

---

## When EABR Disagrees With the Coach's Gut

That is a feature, not a bug.

| Situation | Response |
|-----------|----------|
| EABR positive, coach frustrated | Discuss contact quality, sequences, execution |
| EABR negative, coach satisfied | Discuss luck, defense, big pitches in leverage |
| Staff disagreement on classification | Align on definitions; update notes |

PSIS encourages **discussion**, not obedience.

---

## Related

- [The_EABR_Philosophy.md](./The_EABR_Philosophy.md)
- [Using_PSIS_To_Develop_Pitchers.md](./Using_PSIS_To_Develop_Pitchers.md)
