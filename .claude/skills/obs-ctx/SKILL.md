---
name: obs-ctx
type: skill
description: >
  Obsidian Context — switch focus to a different project in the vault.
  Loads the CLAUDE.md chain + context.md for the selected project,
  displays PARA state, and saves progress at end of session.
trigger:
  - /obs-ctx
  - /cs
  - obs-ctx switch
  - obs-ctx init
  - obs-ctx save
  - obs-ctx fix
  - obs-ctx audit
---

# obs-ctx — Obsidian Context Switch

## File Responsibilities

**CLAUDE.md** — Claude's guide to a folder (static):
notes that exist, organization, conventions. Changes because the vault grows.

**context.md** — session state (dynamic):
current status, open items, last session. Changes because sessions happen.

> Don't mix the two. Templates → `references/templates.md`.

## Project Detection

Project = folder that contains a `CLAUDE.md`, except the vault root.
If nested → take the leaf (deepest level).

## Hierarchy Model (OOP)

The CLAUDE.md chain = class hierarchy: root context → parent context → child context.
A parent context must register its child contexts. A child context follows the parent's
conventions or explicitly overrides them.
Definitions and details for `@Final`/`@Abstract` → `references/oop-hierarchy.md` (loaded
on-demand by Fix and Audit).

---

## Flow

### Init (`obs-ctx init`)

> Register a new project in the vault index, create CLAUDE.md and context.md if missing.
> Use this the first time you add a project folder to obs-ctx.

Trigger: project not yet in the vault index.

1. Scan vault → find all folders with `CLAUDE.md`, except root
2. Display unregistered ones — user picks:
   ```
   Not yet registered:
   1. work/projects/my-project/
   2. technology/ai-setup/

   Select (number/space-separated/'all'):
   ```
3. For each selected folder:
   - **CLAUDE.md missing** → ask description + stack + conventions → suggest PARA → generate from template
   - **CLAUDE.md exists** → read its content, do not overwrite
   - **context.md missing** → create via script: `node .claude/scripts/vault.js ctx init "<folder>"`
   - **context.md exists** → read its content, ask user before overwriting
   - **`para: project` or `area` and `resources:` empty** → run resource suggestion (see `references/fix-procedure.md` item 7)
4. Register in the index:
   ```
   node .claude/scripts/vault.js index add "<name>" "<folder>"
   ```
5. Confirm: `✅ Initialized: [name] → [folder]`

> CLAUDE.md and context.md templates → see `references/templates.md`

---

### Switch (`/cs` · `obs-ctx switch`)

> Move focus to a different project — load the CLAUDE.md chain + context.md, show PARA state and open items.
> This is the main mode used at the start of every work session.

1. Read the list of indexed projects:
   ```
   node .claude/scripts/vault.js index list
   ```
2. Display the list — user picks
3. Load project data:
   ```
   node .claude/scripts/vault.js index get <name>   # para, folder, parent
   node .claude/scripts/vault.js ctx read <name>    # status, open items, last session
   ```
   Read CLAUDE.md **directly** — the script cannot analyze content
4. Read documents referenced in open items:
   - Check for `[[Doc]]` format, backtick path, or `per <filename>`
   - Prioritize the most authoritative document (status/planning doc > raw backlog)
5. Build the chain: walk up from the project folder to root, collecting all CLAUDE.md files found
6. Run inconsistency detection → see `references/inconsistency-checks.md`
7. Extract the `resources:` field from CLAUDE.md frontmatter — if present, display it and note it
   as the first reference when answering questions within this context.

8. Display confirmation:

```
✅ Context loaded: My Project
   PARA      : project
   Area      : work/
   Chain     : root → work → my-project
   Resources : technology/spring/, technology/quarkus/
```

If `resources:` is empty or absent → display without the Resources line.

If issues are found:
```
✅ Context loaded: My Project
   PARA: project | Area: work/ | Chain: root → work → my-project

⚠️  Found 2 issues:
    1. context.md contains static content (lines 3-7)
    2. CLAUDE.md missing para field

Fix now? (y/skip)
```

---

### Fix (`obs-ctx fix`)

> Fix inconsistencies between CLAUDE.md and context.md, and OOP chain alignment between parent and child.
> Can be called manually or auto-triggered after switch/save detects an issue.

Trigger: explicit, or auto-triggered when switch/save detects an issue.

1. Read `references/oop-hierarchy.md` — load the `@Final` and `@Abstract` definitions
2. Read `references/inconsistency-checks.md` — check at project level and chain level
3. Display the diagnosis with numbered items
4. Wait for confirmation `y` / `skip`
5. If `y` → run `references/fix-procedure.md` (Phase 1 first, then Phase 2)
6. Show the diff per item, confirm before writing

---

### Audit (`obs-ctx audit`)

> Scan the CLAUDE.md chain from root to the active project — validate @Final, @Abstract, PARA
> state, and index paths. Read-only: makes no changes. Used for a health check before or after fix.

1. Read `references/oop-hierarchy.md` — load the `@Final` and `@Abstract` definitions
2. Scan the CLAUDE.md chain from root → active project. Makes no changes.

| Check | Pass | Fail |
|---|---|---|
| `@Final` in root | No override in chain | A child overrides it |
| `@Abstract` in root | Override exists in at least one child | No override anywhere |
| `para` field | Present and valid | Missing or `unknown` |
| `area` field | Present | Missing |
| Path in index | Valid, folder exists | Path invalid |

Output:
```
📋 CS Audit: My Project
Chain: root → work/ → my-project/

✅ ## Memory System @Final — no override
⚠️  ## Conventions @Abstract — no override in chain
✅ para: project | ✅ area: work/
```

If issues are found → offer `obs-ctx fix`. If clean → `✅ Audit clean: My Project`.

Auto-triggered during switch: display a compact version, only if there are warnings/errors. Does not block.

---

### Save (`obs-ctx save`)

> Save session progress to context.md and create a discussion summary file.
> Used at the end of a work session before closing the project.

Trigger: "close session", "save context", "obs-ctx save"

**Step 1 — Update context.md:**
1. Read the current context.md
2. Create a summary: topic title + one sentence on what was discussed
3. Preview → wait for confirmation
4. Write via script:
   ```
   node .claude/scripts/vault.js ctx session "<folder>" \
     --date "YYYY-MM-DD" \
     --title "[Title]" \
     --summary "[short summary]" \
     --discussion "_discussion/YYYY-MM-DD/[slug].md"
   ```
   The script prepends above old entries — history is never overwritten.
5. Validate references in open items: cross-check against the list in CLAUDE.md, update to the
   most authoritative document if needed
6. If the session produced a significant new note → add it to the table in CLAUDE.md (preview first)

**Step 2 — Save discussion:**
Session summary → `{project-folder}/_discussion/YYYY-MM-DD/{slug}.md`
Format → see `references/templates.md` (Discussion File section)

**Step 3 — Wiki artifact (if there's new technical content):**
Content that can stand on its own → use the `/build-wiki` skill. If it's discussion only → skip.

**Step 4 — PARA Archive Trigger:**
If all open items are `[x]`:
```
💡 All open items complete — archive this project? (y/n)
```
If `y` → run the archive flow via the `/para` skill.

**Final confirmation:**
```
✅ Context saved: [project] → context.md
✅ Discussion saved: _discussion/YYYY-MM-DD/[slug].md
✅ Wiki note created: [path] (if applicable)
```

---

## Rules

- **CLAUDE.md = static** — notes, organization, conventions. context.md = dynamic — status, open items, last session
- **No duplication** — each piece of information lives in exactly one file
- **Switch always reads both files** — CLAUDE.md for structure, context.md for state
- **Project = child context** — a parent context that has child contexts beneath it is skipped during switch
- **PARA source of truth** = the vault index. CLAUDE.md frontmatter `para:` is a copy, updated via `vault.js para set`
- **Resources = first reference** — the `resources:` field is shown at switch. It isn't loaded
  in full, but Claude knows to refer there before answering from training data. Read the relevant
  resource when the user asks something related
- **Vault-wide memory** — root context rules apply. Don't create new files in `.claude/memory/`
- **OOP direction** — inheritance flows downward. Fix chain always starts from the project, walks up to the parent
