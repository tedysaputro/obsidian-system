# Inconsistency Detection — obs-ctx

Run automatically during `obs-ctx switch` and `obs-ctx save`. Called explicitly via `obs-ctx fix`.

> `@Final` and `@Abstract` definitions → `references/oop-hierarchy.md`

## Project Level

Check the file itself — whether CLAUDE.md and context.md each contain the right kind of content.

| Issue | Indicator |
|---|---|
| Note list in context.md | Note/file table is in context.md, should be in CLAUDE.md |
| Last Session in CLAUDE.md | `## Last Session` section or open items present in CLAUDE.md |
| CLAUDE.md doesn't reflect existing notes | Notes exist in the folder but aren't listed in CLAUDE.md |
| Duplication | Same or near-identical text appears in both files |
| CLAUDE.md empty/minimal | Only headers, no note list or organization |
| context.md missing | Project is registered but context.md hasn't been created |
| CLAUDE.md missing | Project is registered but CLAUDE.md hasn't been created |
| CLAUDE.md missing `## Memory` | Memory pointer section absent — vault-wide rules not bound |
| CLAUDE.md missing `para` field | Frontmatter not yet migrated to the PARA schema |
| CLAUDE.md missing `area` field | Parent context not declared |
| Parent context missing `## Child Contexts` | Context has children in the index but no `## Child Contexts` section in its CLAUDE.md |
| Project/area missing `resources:` | PARA state is `project` or `area`, but the `resources:` frontmatter field is empty or absent |

## Chain Level (OOP Alignment)

Check the project's relationship with its parent in the CLAUDE.md hierarchy.

| Issue | Indicator |
|---|---|
| Parent context doesn't register child context | Child context isn't listed in the parent context's `## Child Contexts` |
| `area:` invalid | Path in the `area:` field has no CLAUDE.md — parent chain broken |
| Child context overrides `@Final` | Section with the same name exists in the parent (marked `@Final`) and in the child — duplication, not override |
| `@Abstract` not overridden | Parent context has an `@Abstract` section, no child context in the chain implements it |
| Convention drift | Parent context defines conventions but the child context doesn't mention them |

## Example Diagnosis Output

```
⚠️  obs-ctx fix needed for [Project]:

Project level:
1. context.md contains static description (lines 1-5) — should be in CLAUDE.md
2. CLAUDE.md missing a Stack section
3. Duplication: "backend API service" appears in both files

Chain alignment:
4. work/CLAUDE.md doesn't register "my-project"
5. @Abstract "## Conventions" in root not yet implemented

Fix now? (y/skip)
```
