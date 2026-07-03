---
name: Non-standard stack requests
description: What to do when a user's spec names a stack the workspace can't run (e.g. Flask/Python, specific file layout)
---

The workspace's artifact system only supports certain artifact kinds (web/React+Vite, api/Express, design, mobile/Expo, slides, etc). If a user's spec names a stack or file layout the workspace has no artifact type for (e.g. "Flask app.py + templates/ + JSON file storage"), pick the closest supported combination that preserves the *intent* of the spec (e.g. React+Vite frontend + Express backend), and proceed to build rather than stopping to ask.

**Why:** Asking first stalls a working preview for no real benefit — the user's underlying goal is almost always "give me a working app with these features," not "use exactly these file names." Environment constraints make the literal request non-viable anyway, so surfacing the substitution as a decision point front-loads friction without adding user control (the workspace genuinely can't run Flask).

**How to apply:** Preserve intent where possible (e.g. if they asked for JSON-file storage instead of a DB because they wanted "simplest storage," keep JSON-file storage even though this workspace defaults to Postgres/Drizzle). Explain the substitution clearly in the final summary to the user (what changed and why) rather than mid-task.
