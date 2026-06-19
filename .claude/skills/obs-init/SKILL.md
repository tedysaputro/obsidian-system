---
name: obs-init
type: skill
description: >
  Initialize an Obsidian vault with Claude Code integration. Creates a root
  CLAUDE.md containing owner context, folder structure, daily notes config,
  and memory system setup, plus the `_index.yml` PARA index that obs-ctx and
  para depend on. Optionally generates onboarding docs (Getting Started/) that
  walk through creating a project, switching context, daily sessions, and goal
  tracking with this framework's own skills. Run once when setting up a new vault.
trigger:
  - obs-init
  - vault init
  - initialize vault
  - setup new vault
---

# obs-init — Vault Initializer

Initializes a new Obsidian vault with Claude Code integration.
Primary output: `CLAUDE.md` at the vault root containing personal context and vault
configuration, plus `_index.yml` — the PARA index that `vault.js index` reads and writes.
Without `_index.yml`, `obs-ctx init` has nothing to register projects into.

---

## Flow

### Step 1 — Check existing state

Check natively (using folder listing/checking tools rather than spawning shell commands if possible) whether `CLAUDE.md` already exists at the vault root.

If it exists:
```
⚠️  CLAUDE.md already exists at the vault root.
    Continuing will overwrite its current content.
    Proceed anyway? (y / n)
```

If `n` → stop, no changes made.

---

### Step 2 — Collect setup preferences (Consolidated)

Ask the user to fill out the following configuration in a single turn. If the user has already provided some of this information inline in their trigger message, pre-fill those fields and ask only for the missing ones.

Present this unified template for them to fill:
```
📋 Please customize or confirm the vault setup details below:

👤 Name: [Your Name]
💼 Role/Job: [e.g., Software Engineer, Writer]
🛠️ Tech Expertise: [e.g., Python, React, AWS - optional]
🎯 Purpose: [1. Personal PKM / 2. Work / 3. Learning / 4. Mixed]

📁 Folder Topology: [Topic-based folders, e.g., "Work: client projects and tasks",
   "Personal: side projects and hobbies", "Reading: books and articles"]
   * PARA categorization (project/area/resource/archive) is applied later as metadata
     per-folder via `_index.yml` + CLAUDE.md frontmatter (`para:` field) — not by
     physically naming or restructuring folders into Projects/Areas/Resources/Archive.
     Any topical folder can hold a project, an area, or a resource depending on what's
     actually inside it; status can change without moving files. See `para classify`.

📅 Daily Notes:
   * Folder Name: [Default: Daily]
   * Filename Format: [Default: YYYY-MM-DD]
```

---

### Step 3 — Preview & Confirm

Generate the proposed `CLAUDE.md` content based on the collected preferences.
Show a preview of the file and ask:
```
📄 Preview of CLAUDE.md to be created:

---
[Generated CLAUDE.md content - see template below]
---

Write to CLAUDE.md and proceed with setup? (y / edit / n)
```

- `y` → write `CLAUDE.md` and move to Step 4.
- `edit` → ask which section to modify, update, and preview again.
- `n` → cancel.

---

### Step 4 — Write files and Folders (Setup Brain & Skeleton)

Once confirmed, write `CLAUDE.md` to the vault root.

Then create the PARA index — required infrastructure, not optional:
```
node .claude/scripts/vault.js index init
```
This creates an empty `_index.yml` at the vault root. `obs-ctx init` needs this file to
exist before it can register any project. If `_index.yml` already exists, the command fails
with "already exists" — that's fine, skip it and move on.

Next, ask the user if they want to automate the follow-up skeleton creation:
```
✅ CLAUDE.md created successfully.

Would you like to auto-create the recommended folders and memory system?
   a. Create both topical folders and _brain/ skeleton (Recommended)
   b. Create folders only (with .gitkeep)
   c. Create _brain/ memory system skeleton only
   d. Skip

Choose (a/b/c/d):
```

**If creating folders:** Create the topical folders defined in Step 2. Place a `.gitkeep` file in each folder so it is tracked by git. Do not name or restructure folders as `Projects/`, `Areas/`, `Resources/`, `Archive/` — PARA state is assigned later, per-context, as metadata (not as physical folder location).
**If creating _brain/:** Create the following files with standard metadata:
- `_brain/North Star.md` (Goals & focus)
- `_brain/Gotchas.md` (Pitfalls to avoid)
- `_brain/Patterns.md` (Convention & workflow patterns)
- `_brain/Key Decisions.md` (Architecture decisions)
- `_brain/Skills.md` (Slash commands & workflow guides)

Each file format:
```markdown
---
tags:
  - brain
---

# {Title}

> {One-line description}

(no entries yet)
```

---

### Step 4b — Offer Onboarding Docs

Ask, regardless of what was chosen in Step 4:
```
📘 Want me to generate onboarding docs — how to create a new project, switch context,
   run a daily session, and track goals with this framework?

Generate onboarding docs? (y/n)
```

If `y`, ask which language to write them in before generating anything:
```
🌐 What language should the onboarding docs be written in?
```

Don't guess this from the conversation so far — ask explicitly, then:
1. Load `references/onboarding-templates.md`
2. Generate each file it describes into `Getting Started/` at the vault root, filling
   placeholders from the choices already made in Step 2 (folder names, daily-notes config)
   and from the skills actually present in `.claude/skills/` — skip any section describing
   a skill that isn't in this copy of the framework
3. **Write in the language the user picked** — the templates in
   `references/onboarding-templates.md` are English structural references, not literal
   output. Translate headings, prose, and table content into the chosen language; keep
   skill names, trigger phrases, commands, and file paths as-is (don't translate
   `obs-ctx switch` or `_brain/North Star.md`).
4. No `.gitkeep` needed here — these are real files, not empty folders

If `n` → skip, move to Step 5.

---

### Step 5 — Final confirmation

Provide a final summary:
```
✅ Vault initialized successfully!

Created:
   - CLAUDE.md (Vault root configuration)
   - _index.yml (PARA index, empty — ready for obs-ctx init)
   - [Topical folders created, e.g., Work/, Personal/, Reading/, Daily/]
   - [_brain/ skeleton files - if selected]
   - [Getting Started/ onboarding docs - if selected]

Next steps:
   → Run /obs-ctx init to register your first project.
   → Fill in _brain/North Star.md with your core goals.
   → Read Getting Started/00 Overview.md for a walkthrough — if generated.
```

---

## CLAUDE.md Template

Use this template when writing CLAUDE.md. Fill `{...}` placeholders from Step 2 answers.

````markdown
# CLAUDE.md

This file provides guidance to Claude Code when working with this Obsidian vault.

## What This Repository Is

This is an **Obsidian vault** — a personal knowledge management (PKM) system.
All content is Markdown with Obsidian-specific syntax.

## Owner Context

- **Name:** {name}
- **Roles:** {roles}
- **Primary tech expertise:** {tech expertise}

## Memory System

This vault uses two memory layers:

**Layer 1 — Cross-project (`_brain/`):** memory that applies across all projects —
North Star, patterns, key decisions, gotchas, skills.

**Layer 2 — Project-level (`context.md`):** memory specific to one project —
status, open items, last session. Managed by `obs-ctx save`.

| File | Contents |
|---|---|
| `_brain/Gotchas.md` | Pitfalls and traps |
| `_brain/Patterns.md` | Recurring patterns from actual work |
| `_brain/Key Decisions.md` | Architecture and workflow decisions |
| `_brain/North Star.md` | Goals and current focus |
| `_brain/Skills.md` | Slash commands and vault workflows |

### Storage Hierarchy

| Signal | Destination | Mechanism |
|---|---|---|
| End of session, "obs-ctx save" | Active project `context.md` | `obs-ctx save` |
| "remember this", architecture decision, incident resolved | Matching `_brain/` note | Write to brain |
| "create a doc", "save to [folder]" | New file in requested folder | Create file |

### READ — automatically when topic is relevant

| Topic | Brain note |
|---|---|
| Bug, error, something not working | `Gotchas.md` |
| Working patterns, conventions | `Patterns.md` |
| Architecture decisions, tech stack | `Key Decisions.md` |
| Slash commands, vault workflows | `Skills.md` |
| Goals, priorities, focus | `North Star.md` |

### WRITE — only on explicit signal

Write to `_brain/` only when:
1. User explicitly asks: "remember this", "note this", "save to brain"
2. An incident is resolved → `Gotchas.md`
3. An architecture decision is made → `Key Decisions.md`
4. The same pattern appears a second time → `Patterns.md`

## Folder Topology

{folder topology — from Step 2}

## Daily Notes

Daily notes live at `{daily-folder}/YYYY-MM-DD.md` with this frontmatter:

```markdown
---
journal: Daily
journal-date: YYYY-MM-DD
journal-start-date: YYYY-MM-DD
journal-end-date: YYYY-MM-DD
---
```

## Projects

(none yet — run `/obs-ctx init` to register your first project)
````

---

## Rules

- **Preview before writing** — never overwrite CLAUDE.md without confirmation
- **Default values** — if the user skips an optional field, use the default (`Daily/`, `YYYY-MM-DD`)
- **Folder topology** — always build from the topic-based folders the user described in Step 2. Never propose or create folders literally named `Projects/`, `Areas/`, `Resources/`, `Archive/` — PARA is a metadata classification (`para:` field + `_index.yml`), not a folder naming scheme.
- **`_index.yml` is mandatory, not optional** — unlike folders and `_brain/`, always create it via `vault.js index init`. `obs-ctx init` will fail without it.
- **No project registration** — this skill only sets up the vault root + empty index; registering individual projects is handled by `obs-ctx init`
- **`_brain/` is optional** — do not create it without offering the choice first
