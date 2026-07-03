---
name: Artifact workflow naming
description: How to find the correct workflow name to pass to restart_workflow for a given artifact
---

`restart_workflow` requires the exact workflow name as registered by the platform, not the artifact's title, slug, or the `[[services]] name` field from `artifact.toml`. Guessing (e.g. using the artifact title "PSIS - Pitch Sequence Intelligence", or the service name "web" alone) fails with `RUN_COMMAND_NOT_FOUND`.

**Why:** Workflow names follow the pattern `<artifact dir path>: <service name>` (e.g. `artifacts/psis: web`, `artifacts/api-server: API Server`), which isn't obviously derivable from `artifact.toml` alone.

**How to apply:** Call `listWorkflows()` (via code_execution, per the workflows skill) first to get the exact registered name, then pass that to `restart_workflow`. Do this any time you're unsure of the exact name rather than guessing repeatedly.
