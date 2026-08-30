# Templates — teachme

A layer **on top of** the obs-ctx templates (`obs-ctx/references/templates.md`). teachme only **adds** fields/sections; the base structure of CLAUDE.md + context.md belongs to obs-ctx. Single placement rule: **static config → CLAUDE.md; dynamic state → context.md.** At init, copy this skeleton — don't improvise sections.

---

## CLAUDE.md — teachme additions

Frontmatter (merged with obs-ctx's `para`/`area`/`resources` — all STATIC):

```yaml
resources:
  - <learning source: docs/URL/book/vault file>   # validation INPUT (from preload / Research Flow)
playground_root: '<sandbox path OUTSIDE the vault>'  # anchor project + drills
wiki_root: <project>/wiki/                            # knowledge OUTPUT (obs-wiki)
teachme_topics: [<Topic>]
<toolchain>_installed: true                           # false → theory mode
```

Body (after the obs-ctx description, before `## Notes`):

```markdown
## Mission (TeachMe)

{why learn this now + anchor project + end-to-end target}

- **Calibration:** {user's level → what to focus on / what to skip}
- **Anchor project** (sandbox `<playground_root>`): {folder that grows in phases}
- **Toolchain:** {version + packages}
- **Primary validation sources:** {authoritative docs}

## Curriculum

Stable syllabus. Progress (topics done/in progress, current position) is tracked in `context.md`, not here.

### Phase 0 — {Name}
| # | Topic | Core |
|---|---|---|
| 0.1 | ... | ... |

**Milestone P0:** {observable deliverable}
```

---

## context.md — teachme layout

Created by obs-ctx (`vault.js ctx init` → empty template), then teachme adds §Curriculum Progress + §To Review. **Everything here is DYNAMIC — no config.**

```markdown
## Status

TeachMe init done (YYYY-MM-DD). Topic: **{Topic}**. Curriculum & mission in CLAUDE.md. Current position: {Phase X · Y}.

## Curriculum Progress

- **Phase 0 — {Name}:** ⬜ not started · next up → `0.1 ...`
- **Phase 1 — {Name}:** ⬜ queued

## To Review

_(empty — nothing taught yet)_

## Active Resources

_(empty — ONLY references active in the running session: dataset/checkpoint/endpoint currently in use. Static config — sources, sandbox, wiki, toolchain, docs — lives in CLAUDE.md; do NOT copy it here.)_

## Open Items

- [ ] Session 1: {concrete first step}

## Last Session
```

> `## Active Resources` is the obs-ctx template's own section — its name is misleading (looks like `resources:` but plays the opposite role). It is NOT a learning-source list; leave it empty at init.
