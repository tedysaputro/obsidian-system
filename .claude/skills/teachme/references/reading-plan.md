# Reading Plan — Build a Curriculum from Scratch

Read when the user wants to learn something but **hasn't pointed at any textbook/material** (SKILL.md §0). Output: a phased curriculum that becomes the **syllabus in §Curriculum in CLAUDE.md** (its progress in context.md) + fills the **`resources:` CLAUDE.md frontmatter**. No separate `PLAN.md` file — everything goes into the obs-ctx structure.

**Distinguish from `project-phases.md`:** a reading plan = *what* is learned & *in what order* (topic sequence → §Curriculum in CLAUDE.md). Project phases = *how* the anchor project grows (→ phase progress in context.md). Orthogonal.

## Procedure

1. **Starting point & goal.** Probe: the user's current level, target competency, timeline (combine with probing the Mission — don't ask twice; Mission → CLAUDE.md body).
2. **Research sources** — Research Flow (`setup.md`) if there's no preload; gather authoritative sources per stage.
3. **Map the path** into 3 phases:

| Phase | Goal | Contents |
|---|---|---|
| 1. Foundation | Understand the basics, can read the topic's code | Core concepts, syntax, mental model |
| 2. Deepening | Can apply to real problems | Patterns, idioms, error handling, tooling |
| 3. Application | Can evaluate & build independently | Advanced features, trade-offs, a real project |

4. **Alternatives:** Fast-track (limited time → a subset) & Deep-dive (want depth → extras).
5. **Success indicators** — a "can do X" checklist per phase (not "have read X").

## Output & wiring (into obs-ctx, not its own file)

- **Syllabus (topic order phases 1→3 + milestones)** → **CLAUDE.md body §Curriculum** — the stable "what is learned" structure, not status. Phase milestones go here too.
- **Progress** (topics done/in progress) → **context.md** open items — one checkbox per topic, ticked over sessions.
- **Sources** → **`resources:` CLAUDE.md frontmatter**.
- **Goal & alternative paths** → **CLAUDE.md** body (brief).
- **Anchor project** (probed at setup) stays separate — the curriculum gives the *topic order*, the anchor project gives the *place to apply it* (in the sandbox).

Once saved through `obs-ctx` (init/save), continue with §1 as usual — the first topic of phase 1 becomes the first structured session. When the user **changes the plan** (jumps/changes direction) → update **§Curriculum in CLAUDE.md** (a structural change); when the user **advances** by finishing a topic → tick progress in context.md.

The §Curriculum skeleton written to the CLAUDE.md body (example) — syllabus, no checkboxes:
```
## Curriculum
### Phase 1 — Foundation
1. <topic 1> — <source> — milestone: <how you know you're ready for phase 2>
2. <topic 2> — <source>
### Phase 2 — Deepening
3. <topic 3> — <source>
### Phase 3 — Application
4. <topic 4> — <source>
```
Progress → **context.md** open items: one `- [ ] <topic>` checkbox per topic, ticked over sessions (checkbox = progress, not syllabus).
