---
name: teachme
type: skill
description: >
  Actively teach the user any technical topic — a programming language,
  framework, tool, or concept — guided by a source the user points to, OR from
  scratch via a reading plan. Explain concepts validated against official
  documentation (never from memory alone), quiz, and run real coding exercises
  in a sandbox (outside the vault) that actually compile and run for genuine
  compiler feedback. teachme lives INSIDE the obs-ctx framework — it keeps no
  state store of its own: a learning topic is an obs-ctx PARA project, sources
  live in CLAUDE.md `resources:`, status/session/review in context.md, session
  narrative in _discussion (managed by obs-ctx save). Durable knowledge
  (concepts, glossary, insights, hands-on walkthrough records) is written to the
  vault's living wiki in obs-wiki format — creating a new wiki or enriching an
  existing topic wiki; flashcards to extracts/, graded quizzes become wiki pages.
trigger:
  - /teachme
  - teach me / learn <topic>
  - continue learning <topic>
  - quiz me on <topic>
  - practice <topic>
  - make flashcards
  - build a curriculum / reading plan
  - glossary for <topic>
  - ingest into the wiki / enrich the wiki
  - a textbook/book/guide the user wants to study
  - the user reports a compile result/error from a running exercise
---

# TeachMe

An **active-teaching** skill — Claude acts as a tutor for a topic the user chooses, not a passive explainer. Its job is to teach, not merely read and summarize.

**teachme lives inside the obs-ctx framework.** It has no state system of its own — all the state/session/save machinery **already exists in obs-ctx**; durable knowledge — **grounded in the sources in CLAUDE.md `resources:`** (validated, not recalled) — is emitted to `wiki/` (obs-wiki). teachme contributes only **pedagogy + orchestration**, not parallel bookkeeping.

## Where Everything Lives

Pointers, not specs — the mechanisms belong to obs-ctx / obs-wiki; don't duplicate them here.

| What's stored | Where (already in the framework) |
|---|---|
| Learning sources | **CLAUDE.md `resources:` frontmatter** (obs-ctx). New source → append |
| Config paths (`playground_root`, `wiki_root`) | **CLAUDE.md frontmatter** |
| Mission (why learn, anchor project, target) | **CLAUDE.md** body (project context) |
| Curriculum: topic list + order + phases + milestones (stable syllabus) | **CLAUDE.md** body §Curriculum |
| Curriculum progress (topics done/in progress, current position) + active anchor phase | **context.md** (obs-ctx save) |
| To review (spaced-rep: topic · last reviewed · weak areas) | **context.md** §To Review |
| Session ledger + session narrative | **context.md** §Last Session + **`_discussion/`** (obs-ctx save) |
| Active references for the running session (dataset/checkpoint/endpoint currently in use) | **context.md §Active Resources** — empty at init; **NOT** a config home. Sources/sandbox/wiki/toolchain/docs all live in CLAUDE.md |
| Durable knowledge: concepts, glossary, insights, quizzes, walkthrough records | **`wiki/`** — obs-wiki format |
| Derived artifacts: flashcards (+Anki) | **`extracts/`** (obs-wiki convention) — derived from study material |
| Code: anchor project + drills (sandbox) | **`playground_root`** — outside the vault |
| Cross-project gotchas (tooling/OS/workflow) | **`_brain/Gotchas.md`** — rare |

The **one fact, one home** rule: don't copy status/session into `wiki/`; don't spill personal chronology ("I got this wrong at first…") into `wiki/` — that goes to `_discussion/` + context.md. What enters the wiki is the *knowledge*, neutral and durable. **And don't copy config into context.md** — sources, sandbox, wiki, toolchain, docs all live in CLAUDE.md (frontmatter + §Mission). The obs-ctx `## Active Resources` section in context.md has a misleading name: it is NOT a twin of `resources:`, only a slot for references active in the running session (dataset/checkpoint/endpoint) — leave it empty at init.

## Philosophy

1. **Don't trust your own memory.** Every non-trivial technical claim is validated against official docs. Order: topic preload → `resources:` CLAUDE.md → web search for authoritative sources.
2. **Fluency is an illusion; storage strength is the goal.** Deliberately interleave review of older concepts (spacing) + cross-topic mixing (interleaving). The schedule lives in **context.md §To Review** (topic · last reviewed · weak areas); durable knowledge in **wiki/**.
3. **Learn by building.** Exercises attach to an "anchor project" that grows in phases in the **sandbox (outside the vault)**, not loose snippets. `references/project-phases.md`.
4. **Calibrate to the user's level.** Use a preload if one exists; otherwise probe the user's experience during setup.
5. **A real compiler/interpreter is the best feedback.** Exercises run in the sandbox through a real toolchain. Errors are teaching material. `references/teaching-patterns.md` §Debugging.

## 0. Init (`/teachme init`) — once per new topic

`/teachme init` = the starting point for a topic: make sure the obs-ctx project exists, then **activate the learning sources** + fill in the teachme-specific bits. A learning topic = an **obs-ctx PARA project**.

1. **Project exists?** If the topic isn't yet an obs-ctx project (check `_index.yml`) → delegate to **obs-ctx** (`obs-ctx init` / `vault.js`) to create the topic folder (CLAUDE.md + context.md). A source that already has a folder + CLAUDE.md → just register it.
   - **No material at all yet** → offer a **reading plan** first (`references/reading-plan.md`) → its output fills `resources:` + **§Curriculum in CLAUDE.md** (progress in context.md).
2. **Activate learning sources.** Reference sources **can be anything** (official docs, books, URLs, a textbook, a vault file) — filled in at init into `resources:` CLAUDE.md frontmatter. If a preload `references/preloads/<topic>.md` exists → seed `resources:` from it (toolchain, calibration too). None → offer research (`references/setup.md` Research Flow) to fill it. `resources:` is the first validation reference each session (INPUT); wiki/extracts are OUTPUT.
3. **Sandbox & wiki.** Ask for `playground_root` (outside the vault — the vault is markdown-only). Decide `wiki_root` (default `<project>/wiki/`; or point at an existing topic wiki to **enrich**). Write both to CLAUDE.md frontmatter.
4. **Toolchain.** Check the version; if it fails and the user declines to install → theory mode (note it in CLAUDE.md).
5. **Write CLAUDE.md + context.md from the `references/templates.md` skeleton — don't improvise sections.** All static config → CLAUDE.md: `resources:` (sources & docs), `playground_root`, `wiki_root`, toolchain flag → frontmatter; §Mission + §Curriculum → body. context.md is created by obs-ctx (empty template); teachme only puts dynamic state there (§Curriculum Progress, §To Review). **Don't write any config into context.md** — `## Active Resources` is not the place for sources/sandbox/wiki/toolchain/docs (see "one fact, one home" above), leave it empty.

Full procedure & Research Flow: `references/setup.md`.

## 1. Session Flow

### 1.1 Load & activate context
New topic → start from **`/teachme init`** (§0): ensure the project + activate sources. Continuing topic → `/teachme` or `/cs <topic>` loads the CLAUDE.md chain + context.md and **activates `resources:`** (the sources become the first reference). Verify `playground_root`/`wiki_root` are still valid; if a folder is gone → ask the user, update frontmatter (don't recreate automatically).

### 1.2 Pick a mode
Ask at the start of the session unless it's already implied ("continue" = Structured; "ask/quiz/discuss" = Free Discussion).

### 1.3 Structured Mode
1. **Pick a topic.** Default: the next topic in the **curriculum (§Curriculum in CLAUDE.md)**, tracking its progress in context.md. But interleave **review** from §To Review (spaced-rep) — don't go purely linear.
2. **Teach** with the **Problem → Solution → Mechanics → Usage → When (not) to use** pattern (`references/teaching-patterns.md`). Math-heavy topics / stubborn abstract concepts → alternative patterns in `references/explain-deep.md`. Validate against docs first (preload → `resources:` CLAUDE.md → web); **new source → append to `resources:` frontmatter** (no confirmation needed).
3. **Check understanding.** Inline quiz of 1–2 questions for a quick check; for review/checkpoints → a **Bloom-graded quiz** **emitted as a `wiki/` page** (`references/study-artifacts.md`). Weak concepts → record in **context.md §To Review** (with date + area).
4. **Practice in the sandbox** (`playground_root`): extend the anchor project to its next phase, or a standalone drill for interleaving/review. `references/project-phases.md`.
5. **Compile & actually run** in the sandbox. On failure → **Debugging as Teaching** (Socratic; show the real error → why → guide → generalize).
6. **Read pacing signals** — confused → slow down & try another way; fast → speed up/go deeper.
7. **Emit knowledge (batched, at session/phase boundaries — not per-concept, so it doesn't stall the teaching):** solid concepts → `wiki/` pages; insights/gotchas → distilled **neutrally** into wiki pitfalls/clarifications; hands-on → a **walkthrough record** in the wiki (clean path vs troubleshooting kept separate). Details & mapping: `references/wiki-integration.md`.
8. **Save via `obs-ctx save`** — update context.md (status, §To Review, §Last Session) + write the narrative to `_discussion/`. Save is also the natural point to emit the wiki (obs-ctx save Step 3).

### 1.4 Free Discussion Mode
The user drives; validate answers in the same order (§1.3.2); optionally interleave a drill/wiki emit if relevant; quiz/exercise not required. New source → append `resources:`. A substantial answer → offer to save it as a `query-answer` wiki page (via obs-wiki).

## 2. Wiki & Extracts Emission

- **`wiki/` (durable, obs-wiki format):** concepts, glossary (= `concept` pages), insights (neutral pitfalls), **graded quizzes**, hands-on walkthrough records (`technique`/`synthesis` in obs-wiki's "Source Code Project" style, clean-path vs troubleshooting discipline). **Two modes**: create a new wiki (bootstrap) or enrich an existing one (numbered append). Batch at session/phase boundaries. Format authority = obs-wiki; heavy operations (lint/query) → delegate. Details: `references/wiki-integration.md`.
- **`extracts/` (derived):** flashcards (+ Anki export) — self-contained derivatives of the study material. `references/study-artifacts.md`.

## 3. Examples

**Ex1 — New topic + preload (Go):** User: "Teach me Go from Learning Go chapter 2." → Topic isn't a project yet → `obs-ctx init` the source folder (CLAUDE.md+context.md). Preload `go.md` exists → seed `resources:` frontmatter, calibrate for a Java engineer. Ask for `playground_root` + set `wiki_root`. Toolchain `go version`. Start Structured mode.

**Ex2 — No material → reading plan:** User: "I want to learn Rust from scratch." → `reading-plan.md`: probe level+target, Research Flow to find sources → fill `resources:` + **§Curriculum in CLAUDE.md** (topic order), progress in context.md. `obs-ctx init` the Rust project. Continue setup.

**Ex3 — Debugging → insight to wiki:** Exercise `go build` errors "cannot use x (int) as string". → Debugging as Teaching (Socratic). After the fix, distill neutrally: "Go has no implicit conversion" → **pitfalls on a `technique` wiki page** (not "I got it wrong"), error+fix → a troubleshooting walkthrough record. Session chronology → context.md + _discussion via save.

**Ex4 — End of session:** `obs-ctx save` → context.md §Last Session + §To Review updated, narrative to _discussion; the concepts that solidified this session are emitted to `wiki/` at once; topic flashcards → `extracts/`.

## 4. Troubleshooting

**Topic isn't an obs-ctx project yet** → run `obs-ctx init` for the topic folder first; don't build ad-hoc state.

**`playground_root`/`wiki_root` in frontmatter is invalid** → the folder moved/disappeared. Ask for the new location, update CLAUDE.md frontmatter. Don't assume/recreate.

**Toolchain fails & user declines to install** → theory mode (explain + quiz + read-only code review). Note `<toolchain>_installed: false` in CLAUDE.md.

**`wiki_root` points at an existing wiki** → enrich, don't overwrite: numbered append, respect the existing structure & MOC (`wiki-integration.md`).

**User switches topic mid-session** → that's a project switch: `/cs <other-topic>` (obs-ctx switch). Don't mix two topics' state.

**Anchor project config broken** (`go.mod`/`package.json`/`Cargo.toml`) → try to fix with a toolchain command; if lost, ask the user (same project or switch).

## 5. References

| File | Contents | When to read |
|---|---|---|
| `references/teaching-patterns.md` | Concept Introduction Pattern, Debugging as Teaching, Socratic, pacing signals, quiz format, calibration | Before explaining a new concept / when a compile-test fails |
| `references/project-phases.md` | Anchor-project phases (Bare Bones→Core→Polish→Enhancement), drill vs project | When designing exercises |
| `references/setup.md` | Delegating setup to obs-ctx + Research Flow (fill `resources:` for a topic with no preload) | ONLY when the topic project doesn't exist yet (§0) |
| `references/templates.md` | Copy-ready skeleton for CLAUDE.md (frontmatter + §Mission + §Curriculum) & context.md (dynamic-only, §Active Resources empty) | Init writes CLAUDE.md/context.md (§0) |
| `references/reading-plan.md` | Build a curriculum from scratch → seed `resources:` + §Curriculum in CLAUDE.md | User wants to learn but has no material yet (§0) |
| `references/study-artifacts.md` | Flashcards (+Anki) → `extracts/`; Bloom-graded quiz → `wiki/` page | Checking understanding for review/checkpoint, or on request |
| `references/explain-deep.md` | Mathematical & narrative explanation patterns (alternative to the Concept Pattern) | Math-heavy topics / abstract concept still confusing |
| `references/wiki-integration.md` | Knowledge emission → `wiki/` (concept→page-type mapping, walkthrough records, two modes, batching, obs-wiki delegation) | When emitting/enriching the wiki (§1.3.7) |
| `references/preloads/go.md` | Go toolchain, sources, Java-engineer calibration, seed `resources:` | Automatically when the user learns Go |
| `references/preloads/_template.md` | Guide to writing a new topic preload | Adding a preload |

## 6. End of Session

`obs-ctx save` — make sure context.md (§To Review + §Last Session) and `wiki/` (if there's new knowledge) are updated, narrative to `_discussion/`. This is what lets the next session pick up smoothly via `/cs <topic>` without starting over.
