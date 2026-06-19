---
name: obs-sync
type: skill
disable-model-invocation: true
description: >
  Check sub-task consistency across three locations: the task file
  (`TaskNotes/Tasks/`), the daily note, and the project's `context.md`. Report
  inconsistencies and offer to fix them.

  Called automatically by obs-session (morning mode), obs-compass, and obs-task.
  Can also be called manually: "check sync", "sync check", "/obs-sync".

  This skill assumes the [TaskNotes](https://github.com/callumalpass/tasknotes)
  community plugin's file conventions. If this vault doesn't use TaskNotes, this
  skill doesn't apply.

  Trigger: "check sync", "sync sub-tasks", "obs-sync", or called from another skill.
---

# obs-sync — Sub-task Sync Check

Hybrid approach: an Obsidian CLI (if present) for discovery and toggling, Read/Edit tools
for reading/writing content (faster than spawning a CLI call per file).

Falls back automatically to file tools if no Obsidian CLI is available.

---

## Step 0: Detect Mode

Check for an Obsidian CLI with Bash — cross-platform detection (Linux & Windows):

```bash
# Linux: check PATH and common locations
which obsidian 2>/dev/null || \
  ls ~/.local/bin/obsidian 2>/dev/null || \
  echo "not found"
```

On Windows (PowerShell):
```powershell
$obsidian = "$env:LOCALAPPDATA\Programs\Obsidian\Obsidian.com"
if (Test-Path $obsidian) { & $obsidian version } else { "not found" }
```

- **Found (Linux)** → use **CLI mode** with `obsidian <command>`
- **Found (Windows)** → use **CLI mode** with `& "$env:LOCALAPPDATA\Programs\Obsidian\Obsidian.com" <command>`
- **Not found** → use **Fallback mode** (file tools only)

Save the resolved binary to a variable `$OBS` for use in later steps:
- Linux: `OBS="obsidian"`
- Windows: `$OBS = "$env:LOCALAPPDATA\Programs\Obsidian\Obsidian.com"`

> If this vault has no Obsidian CLI available at all, always use Fallback mode — there's no
> need to re-check every time.

---

## Step 1: Discover Task Files

### CLI Mode (preferred)

```bash
# Linux
obsidian tasks

# Windows (PowerShell)
& $OBS tasks
```

Filter the output to lines whose path is under `TaskNotes/Tasks/` with status `[ ]` or `[/]`.
Save: file path + line number for each sub-task.

### Fallback Mode

```bash
grep -rl "status: open\|status: in-progress" "TaskNotes/Tasks/" 2>/dev/null
```

---

## Step 2: Read Task File Content and References

Use the **Read tool** for both modes — faster than spawning a CLI call per file.

For each task file:
1. `Read` → task file → extract `Reference:` and every `- [ ]` / `- [x]` line
2. `Read` → the referenced file (daily note or context.md) → extract sub-tasks that have a
   wikilink back to this task

---

## Step 3: Compare and Report

| Condition | Type |
|---|---|
| Item exists in task file, not in Reference | `MISSING_IN_REF` |
| Item exists in Reference, not in task file | `MISSING_IN_TASK` |
| `[ ]` in task file, `[x]` in Reference | `DONE_IN_REF` |
| `[x]` in task file, `[ ]` in Reference | `DONE_IN_TASK` |

**If in sync:**
```
✅ Sub-tasks in sync — everything consistent.
```

**If there's an inconsistency:**
```
⚠️ Sub-tasks out of sync:

[[202606141630 Infrastructure Cleanup]]
  DONE_IN_REF   : "Set up the tunnel" — done in context.md, still [ ] in task file
  MISSING_IN_REF: "Clean up infra config" — in task file, not in Reference
```

Offer:
> "Want me to sync these? Source of truth: whichever location changed most recently."

---

## Step 4: Fix (if confirmed)

Principle: **follow whatever changed most recently** — today's daily note > context.md >
an old task file.

### Toggle status (`DONE_IN_REF` / `DONE_IN_TASK`)

| Mode | Command |
|---|---|
| **CLI Linux** | `obsidian task path="TaskNotes/Tasks/{file}.md" line={N} toggle` |
| **CLI Windows** | `& $OBS task path="TaskNotes/Tasks/{file}.md" line={N} toggle` |
| **Fallback** | `Edit` tool — swap `- [ ]` ↔ `- [x]` on the exact line |

CLI is safer for toggling because it's atomic and Obsidian is immediately aware of the change.

### Add a missing item to the daily note

| Mode | Command |
|---|---|
| **CLI Linux** | `obsidian daily:append content="- [ ] {sub-task} — [[{zettel-id} {title}]]"` |
| **CLI Windows** | `& $OBS daily:append content="- [ ] {sub-task} — [[{zettel-id} {title}]]"` |
| **Fallback** | `Edit` tool — append to the carry-over section of the daily note |

### Add a missing item to context.md or another file

Use the `Edit` tool for both modes — no benefit to spawning a CLI call for this.

### Add a missing item to the task file

Use the `Edit` tool for both modes — append to the task file body.

---

## Step 5: Confirm

```
✅ Sync complete:
  - "Set up the tunnel" → marked done in task file (CLI toggle)
  - "Clean up infra config" → added to context.md (Edit)
  Mode: CLI / Fallback
```

---

## Rules

- **Detect mode first** — check the Linux path, then Windows, then fall back if neither
- **Platform-neutral via `$OBS`** — resolve the binary path once, use consistently in every command
- **Always use the Read tool for reading** — faster than CLI per file, true on every platform
- **CLI for toggling** — atomic, Obsidian-aware; falls back to Edit if no CLI
- **CLI for daily:append** — keeps the Journal plugin aware; falls back to Edit
- **Edit tool for context.md** — no CLI advantage for non-daily files
- **Never write without confirmation** — report first, wait for user OK
- **Never delete an item** — only add or toggle status
- **Source of truth = most recently changed** — if it can't be determined, ask the user
- **Skip tasks with no Reference** — can't be checked, just skip them
