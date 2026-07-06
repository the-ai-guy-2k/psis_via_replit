# Glossary

PSIS words explained in simple language.

---

## Project & Process

| Term | Meaning |
|------|---------|
| **PSIS** | Pitch Sequence Intelligence System — the baseball coaching app |
| **ACI** | Agentic Change Instruction — a written mission with clear tasks and pass/fail criteria |
| **GVCA** | (Your org) Governance framework for changes — ask mentor if assigned |
| **ACICE** | (Your org) Extended governance checklist — ask mentor if assigned |
| **PA** | Production Artifact — the tested, published Docker image on Docker Hub |
| **PE** | Production Environment — where the app runs live (e.g. future AWS) |
| **Current Truth** | What is officially done and true at the start of an ACI |
| **Minority Report** | Summary report back after completing an ACI |

---

## Technical

| Term | Meaning |
|------|---------|
| **API** | How the website talks to the server (URLs under `/api`) |
| **Frontend** | The website coaches see — React code in `artifacts/psis` |
| **Backend** | The server — Express code in `artifacts/api-server` |
| **REST** | Style of API using URLs and HTTP methods (GET, POST) |
| **JSON** | Text format for structured data — how PSIS saves entries |
| **JSON Persistence** | Saving data in `.json` files instead of a database |
| **Docker** | Tool that packages the app into a container image |
| **Container** | A running copy of the Docker image |
| **Docker Hub** | Website where our production image is published |
| **CI/CD** | Continuous Integration / Delivery — robots test and publish on each merge |
| **GitHub Actions** | GitHub's CI robots — workflow file in `.github/workflows/` |
| **Smoke Test** | Quick check that app starts and health/frontend work |
| **Health Endpoint** | `GET /api/healthz` — returns `{"status":"ok"}` if server is alive |
| **Codegen** | Auto-generating TypeScript from `openapi.yaml` |
| **OpenAPI** | Standard format describing all API endpoints |
| **pnpm** | Package manager — installs libraries (like npm but required here) |
| **Monorepo** | One git repo with many packages (`artifacts/`, `lib/`) |
| **Workspace** | pnpm's way of linking packages together |

---

## Baseball / PSIS Domain

| Term | Meaning |
|------|---------|
| **EABR** | End of At-Bat Result — final outcome of a plate appearance |
| **Plate appearance** | One batter's turn at the plate |
| **Tracker** | The PSIS screen where coaches log at-bats |
| **Dashboard** | Screen showing saved session summaries |
| **Session** | A coaching unit saved when coach clicks End Session |
| **gameId** | Internal boundary between games — New Game bumps it |
| **Inning** | Baseball inning — 3 outs to complete |
| **Outs** | Defensive outs in current inning (0–3) |
| **LOB** | Runners Left on Base at end of inning |
| **RBI** | Run Batted In — run scored because of batter |
| **Good unit** | Pitcher-favorable credit in EABR scoring |
| **Bad unit** | Pitcher-unfavorable credit in EABR scoring |
| **Delta** | Good units minus bad units |
| **Fraction** | Good units divided by bad units |
| **Outcome wizard** | Click-through UI to select at-bat result |
| **Defense** | Pitcher-favorable outcomes (strikeout, outs) |
| **Offense** | Batter-favorable outcomes (hits, walks) |

---

## Files & Folders

| Term | Meaning |
|------|---------|
| **artifacts/** | Runnable applications |
| **lib/** | Shared libraries |
| **psis-game-logic** | The rulebook for all scoring math |
| **openapi.yaml** | API contract — menu of endpoints |
| **generated/** | Auto-created code — do not edit by hand |
| **Scenario test** | Automated EABR test script |

---

## Git

| Term | Meaning |
|------|---------|
| **Clone** | Download repo |
| **Pull** | Get latest changes |
| **Branch** | Your own copy line for changes |
| **Commit** | Save a snapshot |
| **Push** | Upload to GitHub |
| **PR** | Pull Request — ask to merge your branch |
| **main** | Primary branch — triggers release |
| **merge** | Combine your branch into main |

---

## When You See an Unknown Word

1. Search this glossary
2. Search [Project_Tour.md](./Project_Tour.md)
3. Ask your mentor
