---
name: obs-discuss
type: skill
description: >
  Discuss a book chapter, a vault note, or an article clipping with the user —
  the discussion member of the obs-* (Obsidian System) family. It reads the
  source (and its summary note, if the source is a book chapter split into a
  raw/ file plus a summary), holds a critical, exploratory discussion, and writes
  insights back into the target note as >[!Discussion] callouts, keeping the
  source's context.md in sync when it lives in a tracked project.

  Trigger: "/obs-discuss" (or the alias "/book-discussion"), "discuss the
  chapter", "discuss this note", "discuss the clipping", "let's discuss", or
  questions about something the user is reading. Use this — not a summarizer —
  when the user wants to explore, question, or analyze content.

  Mode: Claude Code only — reads the vault, writes callouts + context.md.
---

# obs-discuss — Discussion

The discussion member of the **obs-* (Obsidian System)** family. It facilitates an open, enriching discussion of a **book chapter**, a **vault note**, or an **article clipping**. It reads the source (and its summary note, if the source is a book chapter with a `raw/`+summary split), then discusses deeply with the user. Insights from the discussion are written back into the target note as `>[!Discussion]` callouts.

> **Alias:** `/book-discussion` is recognized as an alternate trigger — identical behavior to `/obs-discuss`.

## Target Types

| Target | Source | Where insight is written (callouts & details) |
|---|---|---|
| **Book chapter** | a file in `raw/` | the separate **summary note** (parent of `raw/`) |
| **Standalone note** | the note itself | the **note itself** |
| **Article clipping** | the clipping note itself | the **clipping note itself** |

The only real difference: **a book has two files** (raw ≠ summary), **a note/clipping has one** (source = target). The discussion logic, source transparency, and explanation modes are identical for all three.

## Workflow

### 1. Load Context
Identify the target and its type:
- **Book chapter** — a `raw/` file plus a separate summary note in the parent folder. Read both. If no summary exists yet, offer to draft one first, but proceed with the raw file alone if the user prefers.
- **Standalone note / clipping** — a single note (an ordinary vault note, or a saved web-article clipping). The note is both source and write target; read it.

### 2. Discuss
- Engage the user in discussion based on the source content.
- **Be concise and critical:** Say what matters, cut the rest. No filler phrases, no over-explanation. When proposing additions, show the exact bullet point text — short, direct, ready to paste.
- **Be a critical thinking partner:** Challenge assumptions, surface tensions in the text, connect concepts across sources. Don't just restate what the text says — add analytical value.
- **Source transparency rules:**
  - If your insight or fact comes **directly from the source** → state it naturally.
  - If your insight comes from **outside the source** → mark it briefly, e.g.: *"(external)"* or *"(not from this reading)"*. No long disclaimers.
- Never mix source-based facts with external knowledge without clear separation.
- **Explaining a concept:** When the reader needs a term, formula, or abstract idea explained during the discussion, load `references/explanation-modes.md` and use the matching mode (Terms / Math / Analogy / Socratic). Explanations still obey the source-transparency rule above and the classify-before-write rule in §3.

### 3. Classify and Inject Automatically

After each discussion point, **you must classify it yourself** — do not ask the user to decide.

**Is the content explicitly stated in the source?**
- YES →
  - **Two-file target (book):** is it already in the summary note?
    - YES → No action needed.
    - NO → It's a **missing detail**. Add it directly to the summary as a sublist under the relevant sub-chapter. No callout needed. Tell the user: *"This is a detail from the raw that isn't in the summary yet — I'll add it directly."*
  - **Single-note target (note/clipping):** the note IS the source, so there is no "missing detail" case — if it's already in the note, no action needed.
    - **Sublist formatting rule (two-file only):** Always use a single tab (`\t`) for each level of indentation. Never use spaces. Example:
      ```
      - Parent item
      	- Child item (1 tab indent)
      		- Grandchild item (2 tab indent)
      ```
- NO → It's **analysis or external knowledge**. Inject as `>[!Discussion]` under the relevant section.
  - **Book** → in the summary note, under the relevant sub-chapter.
  - **Note / clipping** → in the note itself: inline right after the relevant passage, or in a `## Discussion` section at the end when there is no clear anchor.
  - If the insight came from outside the source, add inside the callout: `*(Source: external knowledge, not from this reading)*`
  - If it's your own analysis based on the source, no source note needed.

Always classify first, then **show your decision to the user and wait for confirmation before writing to the file**. Format:
- "I'm classifying this as **[missing detail / discussion / external knowledge]** — I'll [add it to the summary as a sublist / inject it as a `>[!Discussion]`]. OK?"
Only write to the file after the user confirms.

### 3b. Update context.md (when present)

After every write, update the source's `context.md` to track the discussion — **only if the target lives in a tracked project that has a `context.md`** (books usually do; a loose clipping may not). No `context.md` → skip this step.

**How to find context.md:** Look for `context.md` in the target's project root (for a book: the parent of `raw/`; for a note/clipping: the nearest folder with a `CLAUDE.md`/`context.md`).

**What to write:** Update or create the `## Last Session` section with a one-line entry:

```
## Last Session
- YYYY-MM-DD — [Discussion Title]: [short summary of the topic and the insight saved]
```

If `## Last Session` already has an entry for today with the same discussion, **append** the new point instead of duplicating. If the section doesn't exist, create it at the end.

This happens automatically after each confirmed write — no need to ask again.

### 4. End of Session
- When the user says "done", "that's enough", "close the discussion", or similar → recap the key discussion points, then confirm which `>[!Discussion]` blocks were added and where.
- **Final context.md update (if applicable):** consolidate the session's callouts into one entry under today's date.

## Callout Format Examples

**From the source:**
```
>[!Discussion]
>Forming the Moby project was a strategic move for Docker to...
```

**From external knowledge:**
```
>[!Discussion]
>*(Source: external knowledge, not from this reading)*
>From a broader industry perspective, Docker donating containerd to the CNCF...
```
