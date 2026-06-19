---
name: para
disable-model-invocation: true
type: skill
description: >
  PARA Method Organizer for Obsidian vaults. Manages folder lifecycle state via
  the `para` frontmatter field. A PARA unit is a folder registered in the vault index.

  Trigger when the user mentions: "/para", "para classify", "para review", "para archive",
  "classify folder", "reclassify", "audit para", "weekly para review",
  "archive project", "project done", "unknown folder".
trigger:
  - '/para'
  - 'para classify'
  - 'para review'
  - 'para archive'
  - 'classify folder'
  - 'reclassify'
  - 'audit para'
  - 'weekly para review'
  - 'archive project'
  - 'project done'
  - 'unknown folder'
---

# PARA — Method Organizer

PARA organizes folders by **actionability** — not topic. The question isn't "what is this
about?" but "when will I use this?"

PARA manages folder lifecycle state. State is stored in the vault index (source of truth) and
synced to CLAUDE.md frontmatter where one exists.

## Principles

- **PARA unit = entry in the vault index** — a folder must be registered before it can be classified
- A folder doesn't need a CLAUDE.md — state can still be stored in the index
- PARA is a lifecycle state, orthogonal to the tagging system
- Tags = cross-reference concepts. PARA = actionability state
- All state reads/writes go through `vault.js` — don't edit the index or CLAUDE.md frontmatter directly

## PARA Values

| Value | Timeframe | Description |
|---|---|---|
| `project` | Days–weeks | Active work with a specific goal and deadline — can be "done" and archived |
| `area` | Ongoing | Responsibility with no end date — never "done", the source new projects are born from |
| `resource` | Someday | Reference material and topics of interest — no commitment to act |
| `archive` | Historical | Inactive — cold storage, searchable but not shown in active views |
| `unknown` | — | Not yet classified (default when a new entry is created) |

## Integration with obs-ctx

PARA and obs-ctx trigger each other — the integration runs both ways:

| obs-ctx event | PARA action triggered |
|---|---|
| `obs-ctx switch` — context is `para: unknown` | Suggest classify — user can run `/para classify` directly |
| `obs-ctx save` — all open items are `[x]` | Suggest archive — user can run `/para archive` directly |
| `obs-ctx fix` — `para` field missing or `unknown` | Delegate to `/para classify` for the folder being fixed |
| `obs-ctx audit` — validates `para` field in the chain | Check: field present, value valid, not `unknown` |

**Reverse direction — PARA affects obs-ctx:**
- A context with `para: archive` can still be switched to, but obs-ctx shows a warning
- `para review` → `inactive` or `all_done` anomaly → can trigger an obs-ctx switch to a different context

**Cadence:** `para review` should ideally run weekly or after several active work sessions.

## References

- `references/para-method.md` — PARA methodology: the actionability principle, each category's
  characteristics and language signals, lifecycle, common mistakes. **Read this when classification
  signals are ambiguous.**
- `references/criteria.md` — vault-specific decision tree: signals from folder names and CLAUDE.md
  content. **Read this when running classify.**

Load the reference you need — not all of them at once.

---

## Routing

Read user intent, route to the appropriate workflow:

| Intent | Workflow |
|---|---|
| "classify", "unknown", "reclassify" | Read `classify.md` |
| "review", "audit", "check all", "weekly review" | Read `review.md` |
| "archive", "done", "close project" | Read `archive.md` |

If intent is unclear → ask:
```
PARA skill ready. Choose:
1. classify — process folders not yet classified
2. review   — audit all PARA states
3. archive  — mark a folder as complete
```

Once routing is clear → read the appropriate workflow file and execute.
