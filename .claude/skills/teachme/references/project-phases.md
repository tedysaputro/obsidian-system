# Project Phases — Anchor Project & Drills

Guidance for designing coding exercises in the playground. Read when preparing exercises for a learning session.

## Why an Anchor Project

Loose snippets ("write a function that reverses a string") are forgotten quickly because they connect to nothing. One real project that grows — aligned with the user's Mission in **CLAUDE.md** — gives context: every new concept has a concrete place to be used, and the user sees cumulative progress rather than just a list of finished exercises. The code lives in the sandbox (`playground_root`, outside the vault).

The anchor project doesn't have to be built to formal "completion" — it's a learning medium, not a deliverable. If the mission shifts mid-way and the old anchor project is no longer relevant, that's fine — update the Mission in CLAUDE.md, record the shift (session narrative → `_discussion/`, durable knowledge → `wiki/`), start a new anchor.

## Anchor Project Phases

Adapted from the "progressive complexity" pattern — each phase adds one layer, never flooding the user with the whole scope at once:

| Phase | Scope | Explanation focus |
|---|---|---|
| **Bare Bones** | Minimum functionality that runs — could be just `main.go` with one hardcoded function | Fundamentals: syntax, project structure, how to compile & run |
| **Core** | Main features added one at a time, showing how the parts connect | Patterns: structs & methods, error handling, package organization |
| **Polish** | Proper error handling, edge cases, starting to be idiomatic (not just "runs") | Best practice: error wrapping, defer for cleanup, table-driven tests |
| **Enhancement** | Advanced features: concurrency, generics, optimization | Architecture-level trade-offs: goroutine leaks, race conditions, when generics are worth it |

Anchor-project phase progress is recorded in **context.md** (via `obs-ctx save`). Not every topic in the source has to push the project up a phase — if a concept is small, a small refactor within the same phase is enough.

## Progressive Enhancement (for one small feature/concept)

If the anchor project isn't ready to host a concept yet, but the concept is also too big for a one-shot drill, build the same feature repeatedly with rising complexity within one session:

1. **Hardcoded version** — the simplest proof of concept
2. **+ variable/config** — start being flexible
3. **+ function/struct** — structured, reusable
4. **+ idiomatic pattern** — the version that truly applies the new concept (interface, error wrapping, goroutine, etc.)

Each version teaches one new layer while still building on the previous one — don't jump straight to version 4.

## Anchor Project vs Small Drill

Choose an **anchor project** (default) when the concept naturally fits into the feature being built — this is the most common case, matching the "learn by building" philosophy.

Choose a **separate small drill** (`playground_root/<project-slug>/drills/` or `playground_root/_drills/` if unrelated to any project) when:
- The concept doesn't naturally fit the current project (e.g. the project is a REST API but the topic is generics for a data structure)
- You're doing a **spaced review** — revisiting an older concept that hasn't been touched in a while, no need to disturb the main project
- You're **interleaving** — deliberately mixing a different topic into one session so you're not "grinding" one topic non-stop

## Playground Folder Structure

```
<playground_root>/
  <project-slug>/        -- anchor project, has its own go.mod
    go.mod
    main.go / cmd/ / internal/ ...
    drills/               -- drills related to this project
  _drills/                -- loose drills, not tied to any project
```

`playground_root` is stored in **CLAUDE.md** frontmatter so the next session doesn't ask for its location again (the anchor project = a slug subfolder inside it).
