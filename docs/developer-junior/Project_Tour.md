# Project Tour

A friendly walk through the PSIS repository.

Think of the repo as a **building with floors**. Each floor has a job. You do not need to memorize everything — bookmark this page.

---

## The Whole Building (Top Level)

```
psis_via_replit/          ← The whole project (root)
├── artifacts/            ← The apps users actually run
├── lib/                  ← Shared code used by the apps
├── scripts/              ← Automated tests
├── docs/                 ← Documentation (you are here!)
├── .github/workflows/    ← Robots that test & publish on GitHub
├── Dockerfile            ← Recipe for the production container
└── package.json          ← Project scripts ("run tests", "build")
```

---

## Floor 1: `artifacts/` — The Applications

These are the **real programs**.

### `artifacts/psis/` — The Website (Frontend)

What coaches see in the browser.

| Inside | What it is |
|--------|------------|
| `src/pages/` | Whole screens: Home, Tracker, Dashboard |
| `src/components/` | Reusable buttons, layouts, dialogs |
| `src/lib/outcome.ts` | Wizard choices (Strikeout, Hit, etc.) |
| `public/reports/` | Test result files you can download |

**Remember:** Frontend = React = what you **see**.

### `artifacts/api-server/` — The Server (Backend)

Talks to the frontend over HTTP. Saves data.

| Inside | What it is |
|--------|------------|
| `src/routes/` | URL handlers like `/api/entries` |
| `src/lib/psisStore.ts` | Reads and writes JSON data files |
| `data/` | The actual saved data (`.json` files) |
| `dist/` | Built server code (after `pnpm run build`) |

**Remember:** Backend = Express = what **saves and calculates** on the server.

### `artifacts/mockup-sandbox/`

Old design experiments. **Ignore this** as a junior — it is not the real app.

---

## Floor 2: `lib/` — Shared Libraries

Code used by **both** frontend and backend.

| Folder | Simple explanation |
|--------|-------------------|
| `api-spec/` | The **menu** of all API endpoints (`openapi.yaml`) |
| `api-zod/` | **Auto-generated** validation rules (do not edit by hand) |
| `api-client-react/` | **Auto-generated** React hooks to call the API |
| `psis-game-logic/` | ★ **The rulebook** for baseball scoring math |
| `db/` | Database template — **not used** by PSIS today |

**Most important for you:** `psis-game-logic` — all EABR math lives here.

---

## Floor 3: `scripts/` — The Test Robot

| File | What it does |
|------|--------------|
| `src/test-psis-scenarios.ts` | Runs 14 scoring scenarios automatically |

You run it with:

```bash
pnpm run test:psis
```

---

## Floor 4: `docs/` — Documentation

| Folder | Written for |
|--------|-------------|
| `developer-junior/` | **You** — learning |
| `developer-mid/` | Developers writing code daily |
| `developer/` | Senior engineers |
| `operator/` | IT installing Docker |
| `manager/` | Managers |
| `reports/` | Official ACI test reports |

---

## Where Reports Live

After you run tests:

```
artifacts/psis/public/reports/
├── PSIS_Test_Report.md
└── PSIS_Test_Report.json
```

The Dashboard has download buttons for these files.

---

## The Path of One Button Click

When a coach logs a plate appearance:

```
1. Tracker page (artifacts/psis)
       ↓ clicks "Log PA Entry"
2. React sends POST to /api/entries
       ↓
3. entries.ts (artifacts/api-server)
       ↓ asks
4. psis-game-logic (lib/) — math
       ↓ saves via
5. psisStore.ts → psis_entries.json
```

You will learn each step in more detail later. For now, just know: **UI → API → rules → file**.

---

## Files You Will Touch Soon

| When you… | Open this |
|-----------|-----------|
| Change page text or layout | `artifacts/psis/src/pages/` |
| Fix API behavior | `artifacts/api-server/src/routes/` |
| Fix scoring math | `lib/psis-game-logic/src/index.ts` |
| Add a test | `scripts/src/test-psis-scenarios.ts` |
| Change API shape | `lib/api-spec/openapi.yaml` (then ask mentor about codegen) |

---

## Files You Should NOT Touch Yet

| File | Why |
|------|-----|
| `lib/api-zod/src/generated/` | Auto-generated |
| `lib/api-client-react/src/generated/` | Auto-generated |
| `.github/workflows/` | CI robots — senior/DevOps |
| `Dockerfile` | Production — senior/DevOps |
| `pnpm-workspace.yaml` | Complex workspace config |

---

## Next Step

Read [Understanding_PSIS.md](./Understanding_PSIS.md) to learn what coaches actually do with the app.
