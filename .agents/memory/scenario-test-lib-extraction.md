---
name: Scenario test via extracted pure-logic lib
description: Pattern for adding standalone scenario-based logic tests without a full test framework, when the app's real rules live inside a server file.
---

When a request asks for scenario/logic tests that exercise the "real" app logic (not a duplicated reimplementation), and the target logic currently lives inline inside a server-only file (e.g. a store/service module that mixes pure rules with file/DB I/O):

- Extract the pure, side-effect-free rule functions into their own composite lib package. Keep only I/O (read/write/append) in the original server file, re-exporting the pure functions from the new lib so no call sites need to change.
- A standalone test script (run via a root-level `pnpm run test:*` convenience script delegating to a `scripts/` package) can then import the lib directly — no server boot, no HTTP, no DB/file fixtures needed.
- If the script needs to generate a downloadable report, write it into the relevant Vite app's `public/` dir — it becomes servable at `${BASE_URL}<path>` for free, no new server route required.

**Why:** this satisfies "tests must import the actual logic, not a duplicate" requirements cleanly, and avoids needing a full test framework (vitest/jest) when the task explicitly wants a simple scenario-script + generated report instead.

**How to apply:** when duplicating logic into a test would violate "use real logic" requirements, prefer this extract-to-lib approach over mocking the server or spinning up a live server for tests.
