# Obsidian System

A skill, script, and convention layer for running an Obsidian vault as a Claude Code
workspace — project tracking, a PARA-based index, structured memory, and a living wiki, all
driven through plain Markdown files and one small CLI.

This framework grew out of daily use in a real vault, then got generalized and
de-personalized for reuse in any vault.

## Table of Contents

- [Core Ideas](#core-ideas)
- [Requirements](#requirements)
- [Quick Start](#quick-start)
- [Skills](#skills)
- [How Skills Compose](#how-skills-compose)
- [The `vault.js` CLI](#the-vaultjs-cli)
- [Optional Plugin Dependencies](#optional-plugin-dependencies)
- [Status](#status)

## Core Ideas

- **A project is a folder with a `CLAUDE.md`.** Each one declares its PARA state
  (`project` / `area` / `resource` / `archive`), conventions, and an inventory of its notes.
- **PARA is metadata, not folder layout.** Vault folders stay topic-based (`Work/`,
  `Reading/`, whatever fits); PARA state lives in `_index.yml` + CLAUDE.md frontmatter and
  can change without moving a single file. See `para` skill → "Just-in-Time Organization".
- **`context.md` carries session state** — status, open items, last session — separate from
  `CLAUDE.md`'s static structure. One file changes because the vault grows, the other
  because sessions happen.
- **`_index.yml` is the source of truth** for which folders are tracked and their PARA
  state. Skills read and write it through `vault.js`, never by hand.
- **`_brain/` is cross-project memory** — North Star, recurring patterns, gotchas, key
  decisions — separate from any single project's `context.md`.
- **A living wiki** (`wiki/`) can be grown incrementally from any source in the vault,
  topic-numbered, with inline-only wikilinks and an MOC as the single entry point.

## Requirements

- **Claude Code** (or another agent runner that reads `.claude/skills/*/SKILL.md` —
  `setup-junction.js` mirrors skills to a `.agent/` convention for non-Claude runners)
- **Node.js** — for `vault.js` and `setup-junction.js`. No `npm install` needed; both use
  only built-in modules (`fs`, `path`).
- **Python 3** — for `vault_health.py` (`obs-audit`'s scanner). Standard library only.
- **Obsidian** — to actually view/edit the vault. The framework itself only touches
  Markdown and YAML files, so it works even without Obsidian open.
- Everything else (TaskNotes, Dataview) is optional — see
  [Optional Plugin Dependencies](#optional-plugin-dependencies).

## Quick Start

**1. Bootstrap the vault root.**

```bash
node .claude/setup-junction.js   # cross-platform symlinks for memory + non-Claude agents
```

Then, inside Claude Code:

```
obs-init
```

Walks you through Owner Context (name, role, expertise), your topic-based folder layout,
and daily-notes config. Writes the root `CLAUDE.md`, an empty `_index.yml`, and — if you
opt in — your folders, a `_brain/` skeleton, and a `Getting Started/` folder with onboarding
docs (creating a project, switching context, daily sessions, goal tracking) generated for
this specific vault's setup.

**2. Register your first project.**

```
obs-ctx init
```

Scans for folders with a `CLAUDE.md` that aren't in `_index.yml` yet, or walks you through
creating one for a new project folder. This is what makes a folder show up in
`obs-ctx switch` and `para` commands.

**3. Run the daily loop.**

```
good morning          → obs-session (Morning mode): git + daily note + open tasks
obs-ctx switch         → load a project's CLAUDE.md + context.md, see open items
...do the work...
obs-task               → log a task, linked to a goal
wrap up                → obs-session (Wrapup mode): brain capture, context save, goal pulse
```

**4. Once you have goals worth tracking.**

```
obs-compass
```

First run drafts a North Star + goals from what it can infer about you (memory, CLAUDE.md
Owner Context) — nothing is written until you confirm. From there it can also review weekly/
monthly/quarterly alignment, and generate a structured action plan per goal.

## Skills

| Skill | Purpose | Auto-triggers from chat? |
|---|---|---|
| `obs-init` | Bootstrap a new vault — root `CLAUDE.md` + `_index.yml`, optional `Getting Started/` onboarding docs | Yes |
| `obs-ctx` | Switch between project contexts, save session progress, fix CLAUDE.md/context.md drift | Yes |
| `para` | Classify, review, and archive folders by PARA lifecycle state | No — manual or called by `obs-ctx` |
| `obs-session` | Morning briefing (git + daily note + tasks) and end-of-session wrap-up review | Yes |
| `obs-task` | Create a goal-linked task (assumes the TaskNotes plugin) | Yes |
| `obs-sync` | Reconcile sub-task checklists across task files, daily notes, and context.md | No — called by `obs-session`, `obs-compass`, `obs-task` |
| `obs-compass` | Review activity against goals/North Star; weekly/monthly/quarterly cadence; generate a structured action plan (gap analysis, milestones, accountability) per goal | Yes |
| `obs-audit` | Vault-wide health scan — broken links, orphan notes, stale context, root clutter | Yes |
| `obs-wiki` | Build and grow a living, topic-structured wiki from any vault source | Yes |
| `obs-base` | Create and edit Obsidian `.base` files — table/card views, filters, formulas | Yes |
| `build-wiki` / `lint-wiki` | Earlier wiki-building tools, kept for now alongside `obs-wiki` — not yet reconciled | Yes |

Each skill is a `.claude/skills/<name>/SKILL.md`, optionally with a `references/` folder for
material that's loaded on demand rather than every time.

The "auto-triggers" column matters: a skill with `disable-model-invocation: true` in its
frontmatter (`para`, `obs-sync`) won't fire on its own from a natural-language match — it
only runs when explicitly invoked (`/para`, `/obs-sync`) or called by another skill. This is
deliberate for skills that are sub-routines of a larger flow rather than something a user
asks for directly.

## How Skills Compose

A few skills call into others rather than duplicating logic:

```
obs-session (Morning)  ──┐
obs-compass (Review)   ──┼──► obs-sync     (sub-task consistency check)
obs-task                 ┘

obs-ctx (init/fix)     ──────► para         (PARA state classification)

obs-compass (new goal) ──────► obs-compass Mode: Plan  (gap analysis + action plan,
                                                          same skill, different mode)
```

Two rules that keep this from turning into a tangle:

- **`obs-task` is the only skill allowed to write to `TaskNotes/Tasks/`.** `obs-compass`
  updates goal-file progress; it never creates tasks directly.
- **The built-in session-only task tool is never used for persisted tasks.** Anything that
  needs to survive past the current conversation goes through `obs-task`, which writes an
  actual file.

## The `vault.js` CLI

All vault file I/O — index, `context.md`, PARA frontmatter, the health-anomaly scan — goes
through one script. Skills call it; they don't write these files directly.

```bash
node .claude/scripts/vault.js index init
node .claude/scripts/vault.js index list
node .claude/scripts/vault.js index get <name-or-folder>
node .claude/scripts/vault.js index add <name> <folder> [--para <state>] [--description <text>] [--parent <name>]
node .claude/scripts/vault.js index remove <name>

node .claude/scripts/vault.js ctx init <name-or-folder>
node .claude/scripts/vault.js ctx read <name-or-folder>
node .claude/scripts/vault.js ctx status <name-or-folder> --text <text>
node .claude/scripts/vault.js ctx session <name-or-folder> --date <date> --title <title> --summary <text> [--discussion <path>]

node .claude/scripts/vault.js para get <name-or-folder>
node .claude/scripts/vault.js para set <name-or-folder> <state>

node .claude/scripts/vault.js scan
```

`para set` writes to both `_index.yml` (source of truth) and the folder's `CLAUDE.md`
frontmatter, if one exists. `scan` walks every registered folder and reports anomalies:
`unclassified`, `inactive`, `all_done`, `might_be_project`, `missing_context`,
`missing_resources`, `para_drift`, `residual`, `broken_entry`.

`obs-audit`'s vault-wide health check is a separate script, `.claude/scripts/vault_health.py`
— a single-pass scanner that outputs JSON for broken links, orphan notes, stale
`context.md` files, root clutter, and `_brain/` freshness.

## Optional Plugin Dependencies

A few skills assume specific Obsidian community plugins and degrade gracefully if they're
not installed:

- **[TaskNotes](https://github.com/callumalpass/tasknotes)** (`obs-task`, `obs-sync`, parts
  of `obs-session`/`obs-compass`) — task frontmatter and `TaskNotes/Tasks/` file
  conventions. Without it, `obs-session` and `obs-compass` fall back to git log + daily
  notes as an activity proxy; `obs-task`/`obs-sync` simply don't apply.
- **Dataview** — used in generated goal-file templates (`## Tasks` block). Drop the block
  or replace it if you're not running Dataview.

## Status

Actively being ported and generalized from a personal vault. Some skills still have
unreconciled overlap (`obs-wiki` vs `build-wiki`) or drift between this repo and the source
vault — see `.claude/skills/*/SKILL.md` for the current state of each. No LICENSE file yet.
