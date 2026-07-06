# First Bug Fix

A guided exercise: fix a small UI text issue on the Home page.

**Difficulty:** Beginner  
**Time:** 1–2 hours with mentor  
**Touches:** Frontend only — no game logic risk

---

## The Scenario

Coaches reported that the Home page subtitle still says the app was "built on Replit." PSIS now ships as a Production Artifact on Docker Hub. You will update the meta description to remove the outdated Replit reference.

This is a **realistic junior task**: visible text, low risk, easy to verify in the browser.

---

## What You Will Learn

- Find a page in the frontend
- Make a small edit
- Run tests (should still PASS — you did not touch logic)
- Verify in browser
- Commit and push with mentor review

---

## Step 1 — Baseline Tests

Open terminal in the project folder:

```bash
pnpm run test:psis
```

**Write down the result:** PASS / FAIL

If FAIL before you started — **stop**. Tell your mentor. Do not continue.

---

## Step 2 — Locate the Problem

1. Open `artifacts/psis/index.html` in your editor
2. Search for `Replit` (Ctrl+F)
3. You will find lines like:

```html
<meta name="description" content="PSIS - Pitch Sequence Intelligence — built on Replit. ..." />
```

The outdated text is in the HTML `<meta>` tags and possibly `home.tsx`.

4. Also open `artifacts/psis/src/pages/home.tsx` and read the visible page text

---

## Step 3 — Understand the Code

Ask yourself:

- Is this just display text? **Yes** → safe UI change
- Does this affect scoring? **No**
- Do I need to change the API? **No**

---

## Step 4 — Make the Change

**In `index.html`**, update meta descriptions to something accurate, for example:

```html
<meta name="description" content="PSIS - Pitch Sequence Intelligence System for pitching coaches." />
```

Update matching `og:description` and `twitter:description` tags the same way.

**In `home.tsx`**, update any visible text that mentions Replit if present.

**Keep changes small.** Only fix the outdated reference — do not redesign the page.

---

## Step 5 — Run Tests Again

```bash
pnpm run test:psis
```

**Expected:** Still **PASS** (you only changed display text)

If FAIL — you accidentally changed something else. Use `git diff` to check.

---

## Step 6 — Verify in Browser

With mentor help, build and open the app, or check after CI deploys:

1. Open Home page `/`
2. View page source or inspect — meta description updated
3. Confirm Tracker and Dashboard still load

---

## Step 7 — Commit and Review

```bash
git checkout -b fix/home-remove-replit-reference
git add artifacts/psis/index.html artifacts/psis/src/pages/home.tsx
git commit -m "Update Home page copy to remove outdated Replit reference."
git push origin fix/home-remove-replit-reference
```

Ask mentor to review before merging to `main`.

---

## Checklist

- [ ] Tests PASS before change
- [ ] Only UI/text files changed
- [ ] Tests PASS after change
- [ ] Browser check done
- [ ] Mentor reviewed PR

---

## What If Something Went Wrong?

| Problem | Fix |
|---------|-----|
| Tests FAIL | `git checkout .` to undo, ask mentor |
| Wrong file edited | Undo and re-read Project Tour |
| Build fails | OK on Windows — mentor checks CI |

---

## Congratulations

You completed a safe bug fix. Next: [First_Feature.md](./First_Feature.md)
