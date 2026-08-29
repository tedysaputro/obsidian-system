# Study Artifacts — Flashcards & Graded Quizzes

Two understanding-check artifacts with **different OUTPUT homes**: **flashcards → `extracts/`** (self-contained derivatives, obs-wiki convention), **graded quizzes → `wiki/` pages** (output). Called from SKILL.md §1.3, or when the user asks ("make flashcards/a quiz for [topic]").

> **Glossary isn't here** — term definitions = durable knowledge → `wiki/` as `concept` pages (see `wiki-integration.md`).

**Three rules apply:**
1. **Content source = study material (`resources:` from init) + docs, not memory.** Cards/quizzes are derived from the studied material & validated against `resources:` CLAUDE.md. Wiki/extracts are the OUTPUT destination, not the source.
2. **Serve storage strength.** Material for spacing/interleaving that deliberately revisits old concepts (Principle 2).
3. **Register the review need** in **context.md §To Review** (topic · last reviewed · weak areas) so the next session knows what to review.

---

## Review Cards (Flashcards)

**When:** after a topic is solid, while filling §To Review, or on request. One set per topic. Don't make one for every small concept.

**Card rules:**
- **One fact per card.** A specific question ("What does `defer` guarantee in Go?") not a vague one ("Explain defer").
- **Short answer** — ideally <20 words. Long lists → split.
- Include context if needed for disambiguation.

**File format** `extracts/flashcards-<topic>.md`:
```markdown
---
topic: <topic>
source: wiki
created: YYYY-MM-DD
count: <n>
---
# Review Cards — <topic>

### Card 1
- **Category:** <tag>
- **Front:** <question>
- **Back:** <short answer>
- **Mnemonic:** <optional>

### Card 2 (Cloze)
- **Front:** `defer` runs a function when the {{c1::enclosing function}} finishes, in {{c2::LIFO}} order.
- **Back:** c1 = enclosing function · c2 = LIFO
```

**Anki export** (if the user uses it) — a CSV block at the end of the file, delimiter `;`:
```csv
Front;Back;Tags
"What does defer guarantee?";"Cleanup runs when the function exits through any path";"go::defer"
```

**Wiring:** after a set is built, add it to **context.md §To Review**: `- <topic> — last YYYY-MM-DD · cards: extracts/flashcards-<topic>.md` (via `obs-ctx save`).

---

## Graded Quiz (Structured Quiz)

**When:** a review/interleaving session, an end-of-phase checkpoint, or the user asks "quiz me on [topic]". **Different from the inline quiz** in §1.3.3 (a quick 1–2 question check) — this one is stored, has many questions, and is Bloom-tiered.

**Structure** — three parts by Bloom's taxonomy:

| Part | Bloom level | Question form |
|---|---|---|
| 1. Foundation | Remember, Understand | Multiple choice, true/false, fill-in |
| 2. Intermediate | Apply, Analyze | Scenarios, "why", compare |
| 3. Advanced | Evaluate, Create | Open-ended, synthesis, design — use a rubric |

**Format rule** (`teaching-patterns.md` §Quiz Format): all multiple-choice options made the same length — the correct answer must not "look different".

Answers hidden in `<details>` so the user works first:
```markdown
**Q1.** <question>
- A) <option>  B) <option>  C) <option>  D) <option>

<details><summary>Answer</summary>
**C** — <why it's right, why the others are wrong>
</details>
```
Open-ended questions (Part 3) include a **rubric** (full vs partial credit). **Output as a `wiki/` page** (location & frontmatter per obs-wiki — see `wiki-integration.md`), ending with a key table (Q · answer · Bloom level).

**After the user answers** (closing the loop): correct per question → identify weak concepts → **record in context.md §To Review** (with the weak area); a genuinely new gotcha → distill neutrally into pitfalls on a `wiki/` page. A quiz isn't just a score, it's input to the next spacing round.
