# Obsidian System

A skill, script, and convention layer for running an Obsidian vault as a Claude Code
workspace — project tracking, a PARA-based index, structured memory, and a living wiki, all
driven through plain Markdown files and one small CLI.

This framework grew out of daily use in a real vault, then got generalized and
de-personalized for reuse in any vault.

## Core Ideas

- **A project is a folder with a `CLAUDE.md`.** Each one declares its PARA state
  (`project` / `area` / `resource` / `archive`), conventions, and an inventory of its notes.
- **`context.md` carries session state** — status, open items, last session — separate from
  `CLAUDE.md`'s static structure. One file changes because the vault grows, the other
  because sessions happen.
- **`_index.yml` is the source of truth** for which folders are tracked and their PARA
  state. Skills read and write it through `vault.js`, never by hand.
- **`_brain/` is cross-project memory** — North Star, recurring patterns, gotchas, key
  decisions — separate from any single project's `context.md`.
- **A living wiki** (`wiki/`) can be grown incrementally from any source in the vault,
  topic-numbered, with inline-only wikilinks and an MOC as the single entry point.

## Setup

```bash
node .claude/setup-junction.js   # cross-platform symlinks for memory + non-Claude agents
```

Then, inside Claude Code:

```
obs-init
```

This creates the vault root `CLAUDE.md`, the empty `_index.yml` PARA index, and (optionally)
the `_brain/` memory skeleton and PARA folder structure.

## Skills

| Skill | Purpose |
|---|---|
| `obs-init` | Bootstrap a new vault — root `CLAUDE.md` + `_index.yml` |
| `obs-ctx` | Switch between project contexts, save session progress, fix CLAUDE.md/context.md drift |
| `para` | Classify, review, and archive folders by PARA lifecycle state |
| `obs-session` | Morning briefing (git + daily note + tasks) and end-of-session wrap-up review |
| `obs-task` | Create a goal-linked task (assumes the TaskNotes plugin) |
| `obs-sync` | Reconcile sub-task checklists across task files, daily notes, and context.md |
| `obs-compass` | Review actual activity against goals and the North Star; weekly/monthly/quarterly cadence |
| `obs-audit` | Vault-wide health scan — broken links, orphan notes, stale context, root clutter |
| `obs-wiki` | Build and grow a living, topic-structured wiki from any vault source |
| `obs-base` | Create and edit Obsidian `.base` files — table/card views, filters, formulas |
| `build-wiki` / `lint-wiki` | Earlier wiki-building tools, kept for now alongside `obs-wiki` — not yet reconciled |

Each skill is a `.claude/skills/<name>/SKILL.md`, optionally with a `references/` folder for
material that's loaded on demand rather than every time.

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

- **TaskNotes** (`obs-task`, `obs-sync`, parts of `obs-session`/`obs-compass`) — task
  frontmatter and `TaskNotes/Tasks/` file conventions
- **Dataview** — used in generated goal-file templates

## Status

Actively being ported and generalized from a personal vault. Some skills still have
unreconciled overlap (`obs-wiki` vs `build-wiki`) or drift between this repo and the source
vault — see `.claude/skills/*/SKILL.md` for the current state of each.
