# Teaching Patterns

The teaching patterns `teachme` uses. Supporting reading for SKILL.md — read when explaining a new concept or when an exercise fails to compile.

## Concept Introduction Pattern

The order for explaining a new concept — don't jump to syntax before the problem is clear:

1. **Problem** — first show the real problem that makes this feature necessary. To explain `defer` in Go, start from "a resource that must be closed even if the function exits through many paths (early return, error, panic)" — not "here's the `defer` syntax".
2. **Solution** — a minimal example that solves that problem.
3. **Mechanics** — how it works internally (language/runtime/framework level).
4. **Usage** — an example closer to the anchor project or a production situation (not just a toy example).
5. **When (not) to use** — the anti-pattern, when experienced practitioners do NOT use this feature, trade-offs vs alternatives.

**Calibrating depth** — every topic has a different audience:

- If a topic preload exists → use the calibration table from the preload. It answers: what the user already knows (skip), what's genuinely new/confusing (focus), which ecosystem's analogies fit best.
- If no preload → probe at setup (§0): "Which similar concepts/ecosystems are you familiar with?" Use that as a baseline. **Err on the side of asking** — better to ask "are you already familiar with X?" than to explain something the user already knows.
- Safe default: when in doubt, explain in two layers — a 1-sentence summary first ("in Go, defer guarantees cleanup at the end of the function"), then detail if the user asks or looks confused.

## Debugging as Teaching

Every time the toolchain fails while checking the user's exercise, that's the best teaching moment — don't rush to hand over the fix:

1. **Show the real error** — paste the compiler/interpreter output as-is, don't paraphrase.
2. **Explain why** — in terms specific to the topic. "Cannot use x (type int) as type string" in Go isn't just a type mismatch — it's because Go has no implicit type conversion like Java/C.
3. **Guide the fix, don't hand over the answer.** Ask a leading question first: "the compiler says `x` is unused — on which line was `x` supposed to be used?" Only give the full answer after the user has tried a few times and is still stuck.
4. **Generalize into a lesson.** Ask yourself: is this error a pattern the user will hit again? If yes: the knowledge (neutral, "Go has no implicit conversion") → **pitfalls on a `wiki/` page**; the error→fix → **`_discussion/`** (troubleshooting walkthrough record) via `obs-ctx save`. A cross-project gotcha (tooling/OS) → `_brain/Gotchas.md`. Not just "fixed, forget it".

## Socratic Method & Explain-Back

Two techniques to verify the user truly understands, not just mimics:

- **Leading questions** instead of direct statements: "What do you think happens if this slice is `append`ed past its capacity?" instead of "When capacity is full, Go allocates a new array."
- **Ask them to explain back** — occasionally ask the user to explain the just-learned concept in their own words (the Feynman technique). If the explanation is messy or wrong in a specific spot, that's a signal the concept isn't solid — redo that part, don't move on yet.

## Pacing Signals

Read signals from the user's responses in real time; don't rigidly follow the plan when the signal clearly differs:

**Slow down if:**
- Asking basic things that should already have been explained
- Confused about a concept from the previous session
- Asking for the same explanation repeatedly

**Speed up / go deeper if:**
- Understands quickly, applies immediately
- Asks about advanced features not yet taught
- Tries their own extensions beyond what was asked

## Quiz Format

When giving answer choices, make all options similar in word/character length — don't let the correct answer "look different" (longer/more detailed) than the distractors. Small but important: a quiz whose answer can be guessed from formatting isn't measuring understanding.

## Calibration Framework (for preload authors)

When writing a new topic preload, fill the calibration table by answering three questions:

1. **Who's the audience?** Level + background + familiar ecosystem (Java/Spring? Python/Django? JavaScript/Node? Infra/K8s?)
2. **What can be skipped?** Basics this audience definitely already knows — don't waste time re-explaining.
3. **What's genuinely new?** The 5–8 concepts most confusing for the transition from the old ecosystem to this topic — this is the main teaching focus.

The preload table should take the form: `What confuses [audience] | Why` — short, actionable, used directly while teaching (see `preloads/go.md` as an example).
