# PARA Review

Periodic audit of all PARA objects. Read-only — makes no changes.

## Flow

### 1. Run a Scan

```
node .claude/scripts/vault.js scan
```

The script reads the vault index, scans every folder, and outputs JSON containing:
- `name`, `folder`, `para`, `area`
- `anomalies[]` — array of detected anomalies:
  - `unclassified` — no `para` field, or `para: unknown`
  - `inactive` — last session > 30 days ago (+ `lastActivity`, `inactiveDays`)
  - `all_done` — all open items are `[x]`
  - `might_be_project` — area but CLAUDE.md mentions a deadline/milestone
  - `missing_context` — no context.md
  - `missing_resources` — `para: project` or `para: area` with no `resources:` frontmatter field
  - `residual` — folder no longer exists in the vault
  - `broken_entry` — no CLAUDE.md

### 2. Render the Table

From the `vault.js scan` JSON output, render a table:

```
📋 PARA Review — YYYY-MM-DD

State     Folder                              Anomaly
────────────────────────────────────────────────────────────────
project   work/projects/my-project/          ⚠️  inactive 45 days
project   work/projects/migration/           ✅ active
project   personal/obsidian-system/          ⚠️  all_done
area      work/                              ✅
area      personal/teaching/                 ✅
resource  technology/java/                   ✅
resource  literature/books/                  ✅
unknown   learning/some-course/               ⚠️  unclassified

Summary: N project, N area, N resource, N archive, N unknown
Anomalies: N folders need attention
```

### 3. Follow Up

If there are anomalies:
```
Follow up on anomalies? (y/n)
```

If `y` → route by anomaly type from the JSON:
- `unclassified` → run `/para classify` for that folder
- `missing_resources` → run the resource suggestion flow (see `obs-ctx/references/fix-procedure.md` item 7)
- `inactive` → offer to archive (show `inactiveDays` from the JSON)
- `all_done` → offer to archive
- `might_be_project` → offer to reclassify as project via `/para classify`
- `missing_context` → run `vault.js ctx init "<folder>"`
- `residual` → confirm, then `vault.js index remove "<name>"`
- `broken_entry` → flag to the user, fix manually

If `n` → done, nothing changes.

## Rules

- Review never changes anything — output and suggestions only
- Changes only happen through the classify or archive flow
- If there are no anomalies → show the table + "All PARA states look healthy ✅"
