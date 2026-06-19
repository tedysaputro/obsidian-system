---
name: obs-wiki
type: skill
description: >
  A living wiki inside an Obsidian vault — built from any source in the vault,
  grown incrementally over time. Combines MOC/numbered-structure/inline-link
  conventions with living-wiki capabilities (incremental ingest, query, lint,
  extract, a lens system).

  Trigger: "obs-wiki", "build a wiki from", "ingest into the wiki", "add to the
  wiki", "query the wiki", or a topic followed by "wiki".

  Mode: Claude Code only.
---

# obs-wiki

A living wiki inside an Obsidian vault. Sources can come from anywhere, structure is built
to match the topic, and content grows incrementally through repeated ingests.

---

## Core Principles

1. **Plan first, write second** — propose the full file tree, wait for approval, then write.
2. **The MOC is the entry point** — `00 MOC.md` at the wiki root is the single entry point.
3. **Inline links only** — wikilinks only appear inside sentences, on the word/phrase that
   names a concept. No "See Also" section or standalone link list.
4. **Match the vault's primary language** — write all content in whatever language this
   vault is written in, except for technical terms that should stay in their original form.
5. **Living** — the wiki grows incrementally; each new ingest enriches what already exists.

---

## Architecture

Two layers:

- **Sources** — original documents anywhere in the vault (`Clippings/`, `Literature/`,
  notes, etc.). No special directory required, nothing needs to be moved.
- **`wiki/`** — the wiki pages Claude writes. Claude owns this layer entirely.

### Special files at the root of `wiki/`

| File | Contents |
|---|---|
| `00 MOC.md` | Map of Content — entry point, lists every page by topic |
| `00 Log.md` | Append-only log — every ingest, saved query, lint pass |
| `00 Overview.md` | High-level synthesis — topics covered, relationships between concepts, remaining gaps, **open items** (questions raised by sources but not yet answered) |

### Directory structure

`wiki/` subdirectories are **topic-based and numbered**:

```
wiki/
├── 00 MOC.md
├── 00 Log.md
├── 00 Overview.md
├── 01 Introduction/
│   ├── 01 What Is X.md
│   └── 02 History of X.md
├── 02 Core Concepts/
│   ├── 01 Concept A.md
│   └── 02 Concept B.md
└── 03 Techniques/
    └── 01 How To Do Y.md
```

Numbering rules:
- New subdirectories and files → get the next number in sequence
- **Never renumber** an existing file or directory
- Descriptive name after the number prefix, in the vault's primary language

---

## Frontmatter

Required on every wiki page:

```yaml
---
title: Page Title
type: concept | technique | entity | synthesis | comparison | query-answer
lens: lens-name          # optional — only if a lens is active
tags: [tag1, tag2]
sources: ["[[Source File Name]]"]          # vault file → wikilink
sources: ["https://external.url/..."]      # external source → URL string
sources: []                                # no source (wiki root file)
created: YYYY-MM-DD
updated: YYYY-MM-DD
---
```

- `type` — records the content kind for query and lint purposes; **doesn't determine the
  subdirectory**. Available types: `concept`, `technique`, `entity`, `synthesis`,
  `comparison`, `query-answer`. Wiki root files use `moc` (00 MOC), `log` (00 Log),
  `synthesis` or `overview` (00 Overview).
- `sources` — reference to the original source. Format depends on the source kind:
  - Vault file → wikilink: `["[[File Name]]"]`
  - External URL → URL string: `["https://..."]`
  - No source (root files: moc, log, overview) → `[]`
  - **Don't** fill it with a wikilink to another wiki page — that creates a fake
    relationship. Wikilinks are only allowed inline in the body text.

---

## Wikilink Rules

**Inline only.** Place the wikilink on the word/phrase inside a sentence, the first time a
concept is mentioned:

✅ Correct:
> Kubernetes uses the [[Container Runtime Interface]] to talk to the runtime.

❌ Wrong:
> ## See Also
> - [[Container Runtime Interface]]

**One link per concept per page** — later mentions in the same note don't need to be linked again.

**No forced backlinks.** If the connection between two pages doesn't arise naturally in a
sentence, don't force a link.

**A "Relationship to Other Concepts" section is allowed** — as long as it's full sentences
with inline wikilinks, not a list of links. This section synthesizes relationships between
concepts, unlike a See Also list which just enumerates links with no context:

✅ Correct (synthesized relationship):
> ## Relationship to Other Concepts
> The kubelet is the node-level executor that translates desired state into running containers.

❌ Wrong (link list with no context):
> ## Relationship to Other Concepts
> - [[Pod]]
> - [[API Server]]

For wikilinks to numbered files: always use the **full filename including the number
prefix** for unambiguous resolution:
- `[[03 API Server]]` not `[[API Server]]`
- In display text it can still be shortened with a pipe: `[[03 API Server|API Server]]`

This rule avoids ambiguity when similarly-named files exist in different subdirectories.

---

## Page Types

Recorded in the `type` frontmatter field. Doesn't affect where the file is stored.

| type | Content structure |
|---|---|
| `concept` | Short definition → principles/components → practical implications |
| `technique` | What it is → when to use it → how to do it → example → pitfalls |
| `entity` | Background → key contributions → works/references |
| `synthesis` | Free-form structure — connects multiple topics |
| `comparison` | Structured comparison between two or more things |
| `query-answer` | A saved answer to a user question |

---

## Lens System

A lens is a named perspective that controls how sources get processed. It lets a single
wiki span multiple domains without separate instances.

Lens file: `.obs-wiki/lenses/<lens-name>.md`

```yaml
---
title: Lens Name
type: lens
domain: Short domain description
created: YYYY-MM-DD
status: draft | active | archived
---

## What It Pays Attention To
(aspects of a source prioritized during ingest — e.g. architectural decisions,
operational patterns, historical context)

## How To Categorize

### Additional Page Types
(lens-specific types in addition to the base types.
A new type doesn't get its own subdirectory — it still goes into the most
relevant numbered topic subdirectory. The type difference is recorded only in the
`type` frontmatter field.
Example: a `component` type still goes into `02 Architecture/` if that's the right topic.)

### Tags & Taxonomy
(the tag vocabulary used for this lens)

## Quality Standards
(extra required fields or sections, on top of the base standard)
```

Rules:
- **Additive only** — a lens adds types and tightens standards, never removes them
- The `lens` frontmatter field records which lens produced the page
- Cross-lens linking is encouraged — the wiki is one knowledge graph
- One source = one lens per ingest

---

## Operations

### `/obs-wiki:ingest` — Add a New Source

#### Phase 1: Read & Understand

- Verify the source exists and is readable — the path can be anywhere in the vault
- Read the whole source; for large files (>100KB or >1000 lines) read in logical chunks
- Read `wiki/00 MOC.md` to identify overlap with existing content
- Note: what entities, concepts, and techniques this source introduces
- **For a code-project source, also read the guidance below**

**Code-project sources** (a directory containing source code, `pom.xml`/`build.gradle`, etc.):
- Read the project structure: entry point, layers (REST → service → domain), key dependencies
- Trace at least one end-to-end flow from entry point to output
- Note: how data flows between components, the dependency-injection chain, the
  architectural patterns used
- Identify the "contracts" between components — variable names that must stay consistent,
  interfaces being bridged, annotations that connect things

#### Phase 2: Discuss

- Present 3-7 key takeaways, ordered by significance
- Flag connections to existing wiki content:
  - "Reinforces X" — deepens an existing page
  - "Contradicts Y" — note the conflict, which source is more trustworthy
  - "New angle on Z" — broadens the scope
- **Detect a lens:** read `.obs-wiki/lenses/` for active lenses
  - If one fits → AskUserQuestion to pick a lens (best match listed first)
  - If none exist and the source is outside the base domain → AskUserQuestion offering to
    create a new lens
  - If the source fits the base domain → proceed without asking about a lens
- AskUserQuestion: "Proceed as presented / Adjust direction?"
- **Don't move to Phase 3 before confirmation**

#### Phase 3: Plan

Propose the change as a full file tree:

```
wiki/
├── 01 Introduction/             ← new directory
│   ├── 01 What Is X.md          ← new (concept) — definition, key features, context
│   └── 02 History of X.md       ← new (entity) — origin, timeline, contributions to X
├── 02 Core Concepts/            ← new directory
│   └── 01 Declarative Model.md  ← new (concept) — desired state vs observed state
└── 00 MOC.md                    ← update — add new entries
```

For each new file: type, one sentence of the main content it will cover.
For each updated file: what changes.
For new inline links being added to existing pages.

**Migration case:** if a file already exists and is only being renamed/relocated (e.g. from
`concepts/pod.md` to `02 Architecture/02 Pod.md`), the proposal must include the old→new mapping:

```
concepts/pod.md             → 02 Architecture/02 Pod.md
concepts/declarative-model.md → 02 Architecture/01 Declarative Model.md
```

Also include conversion rules (wikilink mapping, format changes) in the proposal.

AskUserQuestion: "Approve the plan / Adjust?"
If changes are needed → revise the proposal, present again, ask for approval again.
**Don't write anything before approval.**

#### Phase 4: Write

##### General Principles (all sources)

- Create files per the proposal, in a natural order (foundations first)
- Content = a synthesis of the source, not a copy-paste; distill and rewrite
- Inline wikilinks in body text, on the first mention of a concept
- **No See Also section or link list**
- If a lens is active: add the `lens` field to frontmatter and follow the lens's quality standards

##### Rules Specific to Code-Project Sources

When the source is a code project (not a text document), the wiki content MUST be a
flowing narrative — a programmer who has never seen the project should be able to
understand "what happens, why, and how" by reading start to finish.

**1. Narrative, not a catalog.** Each page tells one aspect of the workflow end-to-end.
Don't create "Entity", "Service", "Controller" sections as disconnected blocks — show how
they connect in actual execution.

**2. Explain "why", not just "what".** Every code snippet must be followed by an
explanation of why it's written that way: why does this attribute exist and what's its
runtime effect? Why is this annotation needed and what happens without it? Why this
pattern instead of an alternative?

**3. Selective snippets, not a dump.** Show only the lines relevant to the story. Don't
paste an entire file. Full code only for key definitions (entity, BPMN) — and even then
with inline comments explaining each field's role.

**4. Show cross-file connections.** This is the most important part. Whenever one file
references another (variable name, annotation value, method call), show the connection:
"The `amount` variable set in `buildProcessVariables()` → used in BPMN as
`${amount >= 10000000}` → read again in the delegate via `execution.getVariable("amount")`".
Use a visual marker like ⚡ or → to highlight critical connections.

**5. A concrete scenario at the end.** Every synthesis/case-study page MUST have at least
one end-to-end timeline:
```
TIME | ACTION | WHAT HAPPENS
```
This validates that every part described is genuinely connected in one flow.

**6. Key patterns as the takeaway.** End with 3-7 patterns a programmer could apply to
their own project. Each pattern: one sentence of principle + one sentence of why.

**7. One voice, one flow.** Don't jump back and forth between "here's the entity", "here's
the service", "here's the controller". Order the content along the runtime execution flow —
from entry point to output — so the reader can follow it like tracing code.

#### Phase 5: Archive & Report

- Update `wiki/00 MOC.md`: add the new entries under the right category with a one-line description
- Update or create `wiki/00 Overview.md`: reflect what was just added, update the gaps,
  add any new research questions to the **Open Items** section
- Append to `wiki/00 Log.md`:
  ```
  ## [YYYY-MM-DD] ingest (lens-name) | Source Title

  Source: [[Source File Name]]
  Lens: lens-name (or "base" if none)

  **New pages:** (list with a one-line description each)
  **Updated pages:** (list with what changed)
  **Inline links added:** (count or short list)
  ```
- Add `synthesized: true` to the source file's frontmatter:
  - If the source already has frontmatter → add the `synthesized: true` field to it
  - If the source has no frontmatter yet → create a `---` block as the first line of the
    file, with at minimum `synthesized: true`
- Report a summary of the changes to the user

---

### `/obs-wiki:query` — Ask the Wiki

Two modes — auto-detected from the shape of the input:

**Synthesis** (open-ended question, "explain", "how does"):
- Read the relevant pages
- Answer in prose with inline wikilinks as citations
- A substantial answer can be saved as a `query-answer` file:
  - Pick the most relevant topic subdirectory
  - File number = the next number in that subdirectory
  - If no subdirectory fits → create a new `0X Questions & Answers/` with the next number

**Navigation** (keyword search, "where is X", "page about Y"):
- Grep the wiki for the keyword
- Present a list of results with relevant excerpts
- No need for a long synthesis

---

### `/obs-wiki:lint` — Health Check

Check and report, categorized by severity:

| Severity | Check |
|---|---|
| Error | Broken wikilinks (link to a file that doesn't exist) |
| Error | Incomplete frontmatter (missing `title`, `type`, `sources`, or `created` field) |
| Warning | Orphan page (no other page links to it inline) |
| Warning | `00 MOC.md` doesn't list every wiki page |
| Warning | A source file that's been ingested before but isn't marked `synthesized: true` |
| Info | `stub` pages (under 100 words) that haven't been developed yet |

Offer an automatic fix for issues that don't require a user decision (simple frontmatter,
missing MOC entries). For issues that need judgment → just report them.

---

### `/obs-wiki:extract` — Extract Knowledge

Read the relevant wiki pages, produce structured output:
- JSON / YAML — for downstream processing
- Checklist / decision tree — self-contained, no wikilinks
- Compact knowledge pack — dense distillation for use in another context
- Comparison table — a markdown comparison table

Output is saved outside `wiki/` (in an `extracts/` folder). The wiki itself isn't modified.

---

## Auto-bootstrap

When `/obs-wiki:ingest` is called for the first time and `wiki/` doesn't exist yet:
1. **Determine the wiki's location from the current working directory.**
   - If the user has already `cd`'d into a specific directory (e.g. `technology/quarkus/`),
     `wiki/` is created there.
   - If the user is at the vault root, `wiki/` is created at the root.
   - **Don't assume vault root** — check the active working directory.
2. Create `wiki/` and `.obs-wiki/lenses/` in the determined directory.
3. Create `wiki/00 MOC.md` and `wiki/00 Log.md` with an empty template.
4. Tell the user the wiki's location (path relative to vault root), then continue without interruption.

---

## Important Rules

- **Plan first** — don't write a file before the user approves Phase 3
- **Inline links only** — no See Also section; a connection that doesn't arise naturally in
  a sentence doesn't need to be made
- **Match the vault's primary language** — all content except technical terms
- **Sources must be filled in** — vault file → `["[[File Name]]"]`, external URL →
  `["https://..."]`, no source → `[]`. Don't fill it with a wikilink to the wiki's own pages
  — that creates a fake relationship; wikilinks are only allowed inline in body text.
- **Sources are flexible** — they don't need to live in one folder; paths can be anywhere
  relative to vault root
- **Numbered = append** — new files get the next number; old files are never renumbered
- **MOC at the root** — `00 MOC.md` always lives at the root of `wiki/`, never in a subdirectory
- **Wiki location follows the working directory** — `wiki/` is created in the active
  working directory, not always at vault root. If the user `cd`s into
  `technology/quarkus/` and then runs ingest, the wiki is created at
  `technology/quarkus/wiki/`. Never assume vault root without checking the working directory.
- **Synthesized marking** — once an ingest is done, add `synthesized: true` to the source's frontmatter
