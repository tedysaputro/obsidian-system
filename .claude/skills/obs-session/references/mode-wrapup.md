# Wrapup Mode — Session Wrap-Up

A full session review before closing out. Actively scan and verify — not just a text reminder.

---

## Step 1 — Scan the Session

From the conversation history, identify:

- **Files created** (new notes, scripts, skills, etc.)
- **Files modified** (edited notes, context.md, CLAUDE.md, etc.)
- **Projects touched** → match against vault root CLAUDE.md
- **Explicit decisions** made in conversation (architecture, workflow, tech stack)
- **Problems / errors** found and resolved (gotcha, incident)
- **Patterns** that emerged — something done repeatedly, or an insight about how to work

Don't re-read every file — rely on conversation history. Cross-check via:
```bash
git status --short
```

Output of this step: a structured list that feeds every step below.

---

## Step 2 — Brain Capture Check

For each item from Step 1, check whether it's already in `_brain/`:

| Item type | Target brain note |
|---|---|
| Architecture / tech stack / workflow decision | `_brain/Key Decisions.md` |
| Recurring pattern / discovered way of working | `_brain/Patterns.md` |
| Error, pitfall, something that went wrong before | `_brain/Gotchas.md` |
| New skill / slash command / workflow | `_brain/Skills.md` |

Read the relevant brain note → check whether the item is already there.

**If not yet captured:**
1. Show a draft of the entry you'd add
2. Ask: "Want me to add this to [brain note]?"
3. Wait for confirmation before writing

Only flag items worth keeping — don't trigger this for trivial or ephemeral things.

---

## Step 3 — Context Check

For each project touched this session:

1. Has `obs-ctx save` (or equivalent) already run this session?
2. Does the project's `context.md` already have a `## Last Session` entry for today?

How to check: read the project's `context.md` → look at the date of the last entry.

**If not yet saved:**
> "Project [X] hasn't been saved. Want me to run the save flow now?"

If only one project was touched and `context.md` is already up to date for today → ✅ skip.

---

## Step 4 — Link Check (Orphan Notes)

For each **new note** created this session:

1. Does the note have at least one `[[wikilink]]` to another note? (outbound link)
2. Is there another note that should logically link to this new note? (inbound link)

**Flag:** a note with no outbound wikilink = orphan = a bug.

If an orphan is found:
1. Name the orphaned note
2. Suggest which note should link to it
3. Ask: "Want me to add a wikilink to [note]?"

> Scope is limited to new notes from this session only — a full vault scan belongs to a
> dedicated vault-audit skill, not this one.

---

## Step 5 — CLAUDE.md Consistency Check

For each project that got a **significant new note** this session:

Does the project's `CLAUDE.md` already list the new note in its notes table?

If not:
1. Show the diff entry you'd add
2. Ask: "Want me to update [project]'s CLAUDE.md?"

**Skip for:** files in `_discussion/`, temporary files, files already listed in CLAUDE.md.

---

## Step 6 — Ways of Working Review

Actively reflect on the session — look for friction and improvement opportunities:

- Was there **friction** in the workflow? (slow, repetitive, awkward)
- Was anything **done manually** that could be automated? (hook candidate, new script)
- Did a **pattern** show up more than once → candidate for a new skill?
- Does anything need updating in the **vault CLAUDE.md**?

Output: concrete suggestions. Examples:
- "You copy-pasted the same template 3 times — consider a skill for this"
- "Step X always happens right after Y — could be a PostToolUse hook"
- "Convention Z isn't documented in CLAUDE.md yet"

If a suggestion needs immediate action → offer to execute it with confirmation.

---

## Step 7 — Goal Pulse

1. Read `_brain/North Star.md`
2. Compare against what was done this session
3. State the connection — one or two sentences

If there's significant progress toward a goal:
> "There's significant progress toward goal [X]. Want me to update it?"

If there's no clear connection → skip this section, don't force it.

---

## Step 8 — Report

```
## Wrap-up — YYYY-MM-DD

### ✅ Done
- [new file] — [short description]
- [modified file] — [what changed]

### 🧠 Brain Capture
- ✅ [item] → already in [brain note]
- ⚠️  [item] → not yet captured (draft above)

### 💾 Context
- ✅ Save flow already run for [project]
- ⚠️  [project] not yet saved

### 🔗 Link Check
- ✅ All new notes are linked
- ⚠️  [[Note Name]] is orphaned — suggestion: link to [[Other Note]]

### 📄 CLAUDE.md
- ✅ Up to date
- ⚠️  [new note] not yet listed in [project]'s CLAUDE.md

### 💡 Suggestions (Ways of Working)
- [friction or automation opportunity found]

### 🎯 Goal Relevance
- [connection to North Star — or skip if none]
```

---

## Rules

- **Skip empty sections** — if there's no orphan, there's no Link Check section in the report
- **Only flag what's worth keeping** — don't add noise with trivial items
- **Limited scope** — link check and CLAUDE.md check only cover this session's notes, not
  the full vault
