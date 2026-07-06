# Understanding PSIS

What PSIS does — without heavy technical detail.

---

## The Problem PSIS Solves

Baseball pitching coaches need to remember:

- What pitch sequences were thrown
- Whether each plate appearance helped or hurt the pitcher
- How the whole session went

Writing notes on paper or scattered spreadsheets is messy. PSIS gives coaches **one web app** to log everything consistently.

---

## What PSIS Stands For

**P**itch **S**equence **I**ntelligence **S**ystem

It is a tool for **pitching coaches** and staff who review sessions.

---

## The Three Main Screens

| Screen | URL path | What coaches do |
|--------|----------|-----------------|
| **Home** | `/` | Learn about the app |
| **Tracker** | `/track` | Log each plate appearance during practice or a game |
| **Dashboard** | `/dashboard` | Review saved pitching sessions |

---

## How a Pitching Session Works

```
1. Coach opens Tracker
2. For each batter, coach clicks through the Outcome wizard
   (Was it a strikeout? A hit? A walk? etc.)
3. Coach adds optional notes and logs the entry
4. Repeat for each plate appearance
5. When done, coach clicks "End Session"
6. Session summary is saved
7. Coach opens Dashboard to review stats
```

A **session** is one unit of work — like one practice block — that gets saved when the coach ends it.

---

## The Outcome Wizard (Simple View)

Coaches do not type free-form results. They **click** through choices:

```
Start → Defense or Offense? → Specific outcome → (maybe one more click) → Log
```

Examples:

- Defense: Strikeout, Fly Out, Ground Out
- Offense: Walk, Single, Home Run

This keeps data consistent.

---

## How Data Flows (Big Picture)

```
Coach clicks in browser
        ↓
Information sent to server (API)
        ↓
Server applies scoring rules
        ↓
Result saved in a JSON file
        ↓
Dashboard reads saved data and displays it
```

You do not need to know JSON yet — think of it as a **structured text file** on the server.

---

## What Gets Saved for Each Plate Appearance

Each log entry stores things like:

- Pitch sequence (e.g. "Fastball - Slider - Changeup")
- Outcome (strikeout, single, etc.)
- Which inning it was
- Good and bad units for scoring
- Runs, base runners, and more (calculated automatically)

**Coaches enter choices. The server calculates the numbers.**

---

## New Game vs End Session

| Button | What it does |
|--------|--------------|
| **New Game** | Clears the live tracker view for a fresh game — old data stays for history |
| **End Session** | Saves a full session summary to the Dashboard, then resets the live view |

---

## Who Uses PSIS (Not You as Developer)

| User | Role |
|------|------|
| Pitching coach | Logs data in Tracker |
| Head coach | Reviews Dashboard |
| IT staff | Installs Docker container |
| **You** | Improve and fix the software |

---

## What PSIS Does NOT Do (Today)

- Login / passwords
- Store data in a cloud database automatically
- Tell coaches what pitches to throw (no AI advice)

---

## Why This Matters for Your Code

When you change code, ask:

> "Does this help coaches log or review plate appearances correctly?"

If yes, you are on track. If you are adding login or a database without being asked — stop and ask your mentor.

---

## Next Steps

- Learn scoring words: [Understanding_EABR.md](./Understanding_EABR.md)
- Learn where code lives: [Project_Tour.md](./Project_Tour.md)
- Learn safe editing: [Safe_Code_Changes.md](./Safe_Code_Changes.md)
