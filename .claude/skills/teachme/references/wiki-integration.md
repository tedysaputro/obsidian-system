# Wiki Integration — Learning → Durable Knowledge

teachme writes the knowledge it teaches into the vault's **living wiki** (obs-wiki format). The wiki = the single durable store; state/session stays in obs-ctx (context.md, `_discussion/`), code in the sandbox (outside the vault).

**Format authority = `obs-wiki` (`.claude/skills/obs-wiki/SKILL.md`).** This file does NOT repeat the format spec — it's only the teachme→wiki glue. Frontmatter, inline wikilinks, numbering (append never renumber), page types, MOC/Log/Overview upkeep → follow obs-wiki. Heavy operations (lint, query, restructure, extract) → **delegate** to obs-wiki (`/obs-wiki:lint`, `/obs-wiki:query`).

## What Goes Into the Wiki (and What Does NOT)

| Into `wiki/` (durable, neutral) | NOT wiki |
|---|---|
| Concepts taught (`concept`/`technique`) | Topic status/progress → **context.md** |
| Glossary = term definitions (`concept`) | Session ledger & narrative → **context.md** + **`_discussion/`** |
| Insights/gotchas distilled neutrally (pitfalls/clarifications) | Personal framing ("I got it wrong at first…") → `_discussion/` |
| Hands-on walkthrough records (reproducible steps) | Execution code → sandbox (`playground_root`, outside the vault) |

Key: the wiki stores the **knowledge**, not the learning chronology. An old "learning record" → its neutral knowledge goes to the wiki, its session events to `_discussion/`.

## Two Modes (distinguished by `wiki_root`)

`wiki_root` is stored in **CLAUDE.md** frontmatter (default `<project>/wiki/`).
- **Create a new wiki** — `wiki_root` doesn't exist yet → bootstrap `wiki/` (00 MOC/Log/Overview) per obs-wiki, then write pages.
- **Enrich an existing wiki** — `wiki_root` points at an existing `wiki/` (e.g. a topic wiki built by obs-wiki, `Topic/.../wiki/`) → append new pages/concepts (numbered, respecting the structure), add inline wikilinks to existing pages where a new concept touches them.

## When to Emit — batched, not per-concept

Collect the session's knowledge, emit **once at a session/phase boundary** (hooked to `obs-ctx save` Step 3); don't write to the wiki mid-teaching (it stalls). Triggers: the user asks ("ingest into the wiki"/"enrich the wiki"), the topic is solid at end of session, or an anchor-project phase checkpoint.

## Mapping teachme Content → obs-wiki Page Types

| What's taught | Type |
|---|---|
| Concept (Problem→Solution→Mechanics→Usage→When), focus on *understanding* | `concept` — definition → principles/components → implications |
| Concept focused on *how to do it* | `technique` — what → when → how → example → **pitfalls** |
| Comparison (e.g. goroutine vs virtual thread) | `comparison` |
| Dense term glossary | seed a few `concept` stubs, or inline-link terms |
| Hands-on record / anchor project | `technique`/`synthesis`, in obs-wiki's **"Source Code Project" style** (see below) |
| Substantial free-discussion answer | `query-answer` (via obs-wiki) |
| Bloom-graded quiz (understanding check) | wiki page (assessment output) + key (`study-artifacts.md`) |

Mapping teaching steps → a `technique` page: Problem/Solution → "what & when", Mechanics → "how", Usage → "example", When-not-to (+ general gotchas) → "pitfalls".

## Hands-on Walkthrough Record = Wiki Page

A hands-on journey (building the anchor project) splits in two:
1. **Code** → sandbox (`playground_root`, outside the vault). Not in the wiki.
2. **Record** → a `wiki/` page in obs-wiki's "Source Code Project" style: an end-to-end flowing narrative, "why, not just what", cross-file connections (⚡/→), a concrete timeline, key patterns as takeaways.

**Keep the `walkthrough` discipline:** the main flow = **the steps that worked** (clean path, someone can follow from scratch); errors/failed-then-fixed → a **pitfalls/obstacles** section, don't put them in the clean path.

## Sources (`sources:` frontmatter)

- Textbook/vault file → wikilink: `["[[Source File Name]]"]`
- External source (official docs, from `resources:` CLAUDE.md) → URL string: `["https://..."]`
- **Sandbox code outside the vault** → can't be a `[[wikilink]]`; note it in `00 Log.md` only (obs-wiki's external-repo rule), not `sources:`.
- **Don't** fill `sources:` with wikilinks to other wiki pages (false linkage).

Content is still validated against docs (Principle 1) — the wiki isn't a place to dump raw memory.

## Emission Flow (brief)

1. Pick a page type from the mapping.
2. Light confirmation: "write [type] '[title]' to `wiki_root`? (y)". Many pages → follow obs-wiki's plan-approval (propose a file tree first).
3. Write per obs-wiki convention: full frontmatter, **synthesis not copy-paste**, inline wikilink on first mention, next number.
4. Update `00 MOC.md` + `00 Log.md` + `00 Overview.md` (obs-wiki Phase 5).
5. Note in **context.md** (§Last Session / notes column) that this concept is now in the wiki — via `obs-ctx save`.
