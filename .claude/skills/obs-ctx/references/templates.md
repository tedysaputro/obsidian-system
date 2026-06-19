# Templates — obs-ctx

## CLAUDE.md Parent Context

```markdown
---
para: {project | area | resource}
area: {path to the parent context above this one, if any}
resources:
  - {path to a relevant reference folder — optional}
---

# {Area / Domain Name}

{Short description — what this domain is about}

## Child Contexts
| Child | Path | PARA |
|---|---|---|
| `[[Child Name]]` | path/to/folder/ | project |

## Conventions
{Conventions specific to this area — or "Follows root context conventions." if there's no difference}

## Memory
Vault-wide memory rules apply here — see root context `## Memory System`.
Summary: durable knowledge → `_brain/` notes. Don't create new files in `.claude/memory/`.
```

**Notes:**
- `## Child Contexts` is required — without it the chain is broken
- The `area:` field is optional if this parent context sits directly under the root context

---

## CLAUDE.md Child Context (Leaf)

```markdown
---
para: project
area: {path to parent context, e.g. work/}
resources:
  - {path to a relevant resource folder}
---

# {Folder / Topic Name}

{Short description — what this folder is about, its context}

## Notes
| Note | Summary |
|---|---|
| `[[Note Name]]` | description |

## Organization
{How notes in this folder are organized — by theme, chronology, subtopic}

## Conventions
{Writing style, tags used, frontmatter format}

## Memory
Vault-wide memory rules apply here — see root context `## Memory System`.
Summary: durable knowledge → `_brain/` notes. Don't create new files in `.claude/memory/`.
```

**Notes:**
- `resources:` is optional but recommended for projects and areas — fill it with the path of the
  folder that should be the first reference when working in this context (e.g. a tech stack
  folder, a literature folder, a domain reference). Claude will mention this resource at switch
  time and consult it before answering from training data.
- `area:` is optional for `para: resource`
- Update whenever a significant new note is added or organization shifts

---

## context.md Project

```markdown
## Status
{current state — what's being worked on, what's blocked}

## Active Resources
{links, credentials, endpoints, or references currently in use}

## Open Items
- [ ] {incomplete item}

## Last Session
- YYYY-MM-DD — {Title}: {brief summary}
  - _discussion/YYYY-MM-DD/{slug}.md
```

---

## Discussion File

Path: `{project-folder}/_discussion/YYYY-MM-DD/{title-slug}.md`

```markdown
---
title: {Descriptive Title}
date: YYYY-MM-DD
project: {Project Name}
tags:
  - {project-tag}
  - discussion
---

# {Descriptive Title}

> Claude Code session summary — YYYY-MM-DD

## Context
{session background}

## Discussed / Decided
{key points}

## Technical Decisions
{if any ADR, design, or important decision was made}

## Open Items
- [ ] {incomplete item}
```

> Save as a **structured summary**, not a verbatim transcript.
