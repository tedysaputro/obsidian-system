# New Topic Preload Template

Copy this file, rename it `<topic>.md`, fill it in for the topic.

---

# Preload: [Topic Name]

## Toolchain

- **Check:** `<command> --version` or similar
- **Install:**
  - Windows: `<install method>`
  - Mac: `<install method>`
  - Linux: `<install method>`
- **Compile/Run:** `<build/run/test command>`
- **Playground:** standard project structure

## Documentation Sources

| Source | URL | Used for |
|---|---|---|
| ... | ... | ... |

Validation order: [most accurate source] → [supplementary source] → [community, optional].

## Calibration — Assumes: [Audience]

Target: [the user's level + background]. **Can skip:** [basics the user already knows].

| What confuses [audience] | Why |
|---|---|
| ... | ... |

**Effective framing:** "[an ecosystem/production context the user is familiar with]"

## Seed `resources:` CLAUDE.md frontmatter

At setup, fill the `resources:` field in the topic project's CLAUDE.md frontmatter (obs-ctx). New sources each session → appended to the same list.

```yaml
resources:
  - https://...   # <source 1> — <relevant for>
  - https://...   # <source 2> — <relevant for>
```
