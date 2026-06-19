---
name: obs-audit
type: skill
description: >
  Vault-wide health check for an Obsidian vault. Runs a Python script for an
  efficient (token-minimal) scan, interprets the JSON output, reports findings
  by severity, and offers fixes with confirmation.

  Trigger when the user says: "audit the vault", "check vault health", "vault
  health", "obs-audit", "is the vault healthy?", "check broken links", "check
  orphans", or "is anything wrong with the vault?".

  Mode: Claude Code only — run the script, read the JSON output, don't read
  individual files unless they've already been flagged.
---

# obs-audit — Vault Health Check

An efficient vault-wide audit: one Python script scans every file in a single pass, Claude
reads the JSON output — no reading files one by one.

---

## Step 1: Run the Script

```bash
cd "<vault root>" && \
python3 ".claude/scripts/vault_health.py" 2>/dev/null
```

Progress logs go to stderr (not shown). Stdout is pure JSON.

---

## Step 2: Parse & Categorize

From the JSON output, read `summary` first for the quick picture, then the per-section detail.

Group into three buckets:

**🔴 Critical** — breaks navigation, needs handling:
- `broken_links` — wikilinks pointing to a file that doesn't exist
- `root_clutter` — files at the vault root that shouldn't be there

**🟡 Warning** — needs attention, not urgent:
- `stale_context` — `context.md` not updated in > 30 days
- `brain.issues` — North Star empty, Gotchas/Patterns not yet filled in
- `daily_gaps` — workdays with no daily note (10 most recent)

**⚪ Info** — good to know, not always a problem:
- `orphan_notes` — no other note links here

---

## Step 3: Show the Report

```
🏥 Vault Health — YYYY-MM-DD HH:MM

📊 Summary
  Files scanned : N
  🔴 Critical   : N issues
  🟡 Warning    : N issues
  ⚪ Info        : N notes

──────────────────────────────

🔴 Critical

Broken links (N):
  - [file.md] → [[target that doesn't exist]]
  ...

Root clutter (N files at root):
  - filename.md → suggestion: move to [folder]
  - filename.py → suggestion: move to .claude/scripts/
  ...

──────────────────────────────

🟡 Warning

Stale context.md (N, not updated in > 30 days):
  - path/context.md (X days ago)
  ...

_brain/ issues (N):
  - North Star.md: Current Focus is still empty
  ...

Daily note gaps (N workdays with no note):
  - YYYY-MM-DD, YYYY-MM-DD, ...

──────────────────────────────

⚪ Info

Orphan notes (N — no incoming links):
  - path/note.md
  ...
  (daily notes and old clippings are reasonably orphans)
```

---

## Step 4: Offer Actions

After showing the report, ask:

> Which would you like to tackle first?
> 1. Broken links — identify the intended target + suggest a fix
> 2. Root clutter — suggest a folder per file, wait for confirmation before moving
> 3. Stale context.md — open and review each one together with the user
> 4. _brain/ — fill in North Star together with the user
> 5. Done

Handle one group per turn. Don't move to the next group until the current one is done or
the user skips it.

---

## Rules

- **Never auto-fix** — every change needs explicit user confirmation
- **Don't read individual files** unless the script has already flagged them
- **Broken links are top priority** — they do the most damage to vault navigation
- **Orphan notes aren't always a problem** — daily notes and old clippings are often
  standalone by design; ask the user before suggesting links
- **Root clutter: use `git mv`** to move files so history is preserved
- **Never delete anything** without explicit confirmation
