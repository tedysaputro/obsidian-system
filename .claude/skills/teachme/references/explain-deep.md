# Deep Explanation — Mathematical & Narrative

Two **alternative** explanation patterns to the Concept Introduction Pattern (`teaching-patterns.md`: Problem → Solution → Mechanics → Usage → When). Use when the default pattern doesn't fit — chosen from **pacing signals**: a topic genuinely rests on math → the mathematical pattern from the start; the user still confused after 2 direct explanations → try the narrative one.

---

## Mathematical Explanation (for math-heavy topics)

Topics with real math: algorithmic complexity, machine learning, cryptography, graphics/geometry, theory. Build **intuition before formalism** — don't open with notation.

**Order:**
1. **Why this matters** — a real motivation / connection to something the user cares about.
2. **Prerequisites** — a quick check: "you should already know X" (if not → back up first).
3. **Intuition first** — visual/concrete/narrative, no symbols.
4. **Formalism** — only now the notation. Translate each symbol into plain language (`$\sum$` = "sum all…", each variable's meaning explained).
5. **Worked example, tiered** — at least 2: basic → intermediate. Each step narrated (action + reason), not just formula lines.
6. **Common mistakes** — a table: Mistake · Why it happens · How to do it right.
7. **Tiered exercises** — easy → intermediate → challenge.

Validate formulas against docs/sources (Principle 1) — don't rely on memory for a formula. If a worked example can connect to the anchor project, use that context.

---

## Narrative Explanation (for stubborn abstract concepts)

Concepts that resist direct explanation — closures, async/event-loop, distributed consensus, pointers/ownership, monads. Teach through a story: the abstract becomes concrete & memorable.

**Order:**
1. **Setup** — a relatable character in one situation.
2. **Problem** — the character hits the concept as a challenge/question.
3. **Discovery** — the character finds the principle through experience (use dialogue, concrete detail).
4. **Resolution** — the character applies the understanding.
5. **Lesson** — the character's explicit reflection.

Then **bridge back to the technical** — a mapping table is mandatory, don't leave the story hanging:

| Story element | Concept it represents |
|---|---|
| <character/event> | <the technical part it represents> |
| <challenge> | <what it illustrates> |

Close with 1–2 discussion questions that go deeper.

**Use sparingly.** Narrative is a tool for when direct explanation is stuck — not the default. After the story, always confirm the user can map back to the real technical thing; if they can't, the story failed to teach → redo it another way.
