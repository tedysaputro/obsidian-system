# Explanation Modes

Loaded on-demand during a discussion when the reader needs a concept explained.

**Two rules override everything below:**
1. **Source transparency (from SKILL.md §2):** anything beyond the raw file is marked *(external)* / *(not from this chapter)*. An analogy or worked example you invent is your own analysis (no mark needed); an outside fact is external (mark it).
2. **Still classify + confirm (SKILL.md §3):** after explaining, decide whether the insight is a *missing detail* (→ sublist in the summary) or *analysis/external* (→ `>[!Discussion]` callout), then confirm before writing. Explaining in chat is free; writing to the file is not.

## Mode Selection

| Reader is stuck on… | Mode | Core move |
|---|---|---|
| A term / jargon | **Terms** | plain definition → when it's used → example → analogy |
| A formula / math step | **Math** | intuition before formalism → translate the notation → one worked example |
| An abstract idea | **Analogy** | map the concept onto one concrete, familiar scenario |
| Wants to reason it out themselves | **Socratic** | guide with questions, don't lecture |

Keep it to the reader's level and to what the source needs — one term, one formula, one analogy at a time. Concrete before abstract.

## Terms

For unfamiliar vocabulary in the source.
- **Definition** — plain language, no jargon inside the definition.
- **In context** — how the source/author uses it (quote the line if present).
- **Example** — one concrete illustration.
- **Analogy** — connect to something the reader already knows.
- **Relationships** — how it sits against neighboring terms in the source (parent/child, or X vs Y contrast).

Only pull terms the reader actually tripped on — don't glossary the whole source unprompted.

## Math

For formulas, derivations, or quantitative claims.
1. **Intuition first** — a visual/verbal picture before any symbol.
2. **Translate the notation** — say the formula in words, then name each symbol.
3. **One worked example** — narrate each step, not just the result.
4. **Common mistake** — the one error this concept invites, and the fix.

Use `$$…$$` for display math so Obsidian renders it. Skip a full practice-problem battery — a discussion explains, it doesn't drill.

## Analogy

For abstract ideas that resist a direct definition.
- Map the concept onto **one** concrete, familiar scenario — a short scene, not a full story arc.
- State the mapping explicitly: *element in the analogy → element in the concept*.
- Name where the analogy **breaks** — every analogy leaks; flag it so the reader doesn't over-extend it.

A sharp analogy is often the single most callout-worthy output of a discussion → offer it as `>[!Discussion]`.

## Socratic

When the reader is close and would learn more by getting there themselves.
- **Ask, don't tell.** Genuine questions, built on the reader's own words.
- Probe in this order: *definition* ("what do you mean by X?") → *assumption* ("what are you taking for granted?") → *implication* ("if that's true, what follows?") → *counter-example* ("what about the case where…?").
- When their view shifts, **name the synthesis** and confirm it landed.

Use sparingly — this is a mode the reader opts into, not the default for every point. If they just want the answer, switch to Terms/Math/Analogy.
