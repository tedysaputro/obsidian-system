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
   - **`para: project` or `area` and `resources:` empty** → run resource suggestion flow (see Fix flow below)
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

1. If `<name>` is already given → skip straight to step 2 (skip the list).
   If not → list: `node .claude/scripts/vault.js index list --names` (compact mode — saves ~1.7k tokens vs full JSON), user picks.
2. Load project data:
   ```
   node .claude/scripts/vault.js index get <name>   # para, folder, parent
   node .claude/scripts/vault.js ctx read <name>    # status, 5 open items, 3 most recent sessions
   ```
   Default `ctx read` caps at 5 open items (open only — `[x]` items are skipped) + 3 most recent sessions.
   The `openItemsCount`/`openItemsCapped` fields flag if there are more; `doneItemsCount` covers `[x]` items.
   Override: `ctx read <name> --open-limit N` (0 = all), `--recent N` (0 = no sessions).
   Read CLAUDE.md **directly** — the script cannot analyze content
3. Read documents referenced in open items:
   - Check for `[[Doc]]` format, backtick path, or `per <filename>`
   - Prioritize the most authoritative document (status/planning doc > raw backlog)
4. Build the chain: walk up from the project folder to root, collecting all CLAUDE.md files found
5. Run mechanical anomaly detection via script (read-only, compact JSON output):
   ```
   node .claude/scripts/vault.js diagnose <name>
   ```
   Display a summary of anomaly codes. Semantic checks (static-vs-dynamic content, text duplication) remain the responsibility of `obs-ctx fix`.
6. Extract the `resources:` field from CLAUDE.md frontmatter — if present, display it and note it
   as the first reference when answering questions within this context.

7. Display confirmation:

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

1. Run `node .claude/scripts/vault.js diagnose <name>` → get anomaly codes
2. Mechanical anomalies → resolve via existing commands:
   - `missing_context` → `vault.js ctx init`
   - `para_drift` → `vault.js para set <state>`
   - `para_unknown` → `/para classify`
   - `missing_area` / `invalid_area` → set during init
   - `missing_memory_section` / `missing_child_contexts_section` → Claude adds the missing section to CLAUDE.md
   - **Resource suggestion flow** (`missing_resources`): scan `index list` filter `para: resource`, cross-match domain with project, show suggestions, confirm, then write `resources:` to CLAUDE.md frontmatter.
   Show diff per item, confirm before writing.
3. Semantic anomalies (static-vs-dynamic content, text duplication, `@Final` identical-vs-different, content migration context.md↔CLAUDE.md):
   - Read `references/inconsistency-checks.md` + `references/fix-procedure.md` — full procedure guide
   - Read `references/oop-hierarchy.md` — load `@Final` and `@Abstract` definitions
   - Claude reads both files (CLAUDE.md + context.md), judges manually, confirms per item.
4. Show the diff per item, confirm before writing

---

### Audit (`obs-ctx audit`)

> Scan the CLAUDE.md chain from root to the active project — validate @Final, @Abstract, PARA
> state, and index paths. Read-only: makes no changes. Used for a health check before or after fix.

1. Read `references/oop-hierarchy.md` — load `@Final` and `@Abstract` definitions (for interpretation of @Final/@Abstract results)
2. Run `node .claude/scripts/vault.js diagnose <name>` — check mechanics via script. Makes no changes.

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
