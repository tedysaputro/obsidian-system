# Onboarding Templates — obs-init

Loaded on demand when the user opts in to onboarding docs in Step 4b. Generate each file
below into `Getting Started/` at the vault root, filling `{...}` placeholders from the
choices already collected during Step 2 (name, folders, daily-notes config) and from this
repo's own skill set. Don't invent skills that aren't in `.claude/skills/`; if a skill listed
below wasn't ported into this copy of the framework, drop its section instead of describing
something that won't run.

Write these as living docs, not screenshots of a fixed session — second-person, imperative,
short examples the user can literally type next.

**Language:** the prose below is English for editing convenience, but it's a structural
reference, not literal output. Generate the actual files in whatever language the user
picked when asked in Step 4b — translate headings, prose, and table contents, but keep
skill names, trigger phrases, commands, and file paths unchanged (e.g. `obs-ctx switch`,
`_brain/North Star.md` stay as-is regardless of language).

---

## File 1: `Getting Started/00 Overview.md`

```markdown
---
tags:
  - getting-started
---

# Getting Started with Obsidian System

This vault uses the Obsidian System framework — skills that turn Claude Code into a project
tracker, memory layer, and goal-alignment tool on top of plain Markdown.

## Read These in Order

1. [[01 Creating a New Project]] — register a folder as a tracked project
2. [[02 Switching Context]] — move your focus between projects
3. [[03 Daily Session]] — morning briefing and end-of-day wrap-up
4. [[04 Goal Tracking]] — North Star, goals, alignment review, action plans

## Skill Cheat Sheet

| Want to... | Say this | Skill |
|---|---|---|
| Start working on a project | "obs-ctx switch" or "/cs" | `obs-ctx` |
| Register a new project folder | "obs-ctx init" | `obs-ctx` |
| Get a morning briefing | "good morning" | `obs-session` |
| Close out your session | "wrap up" | `obs-session` |
| Log a task | "create a task to..." | `obs-task` |
| Check goal alignment | "review goals" / "obs-compass" | `obs-compass` |
| Draft an action plan for a goal | "make a plan for [goal]" | `obs-compass` |
| Classify or archive a folder | "/para" | `para` |
| Check vault health | "audit the vault" | `obs-audit` |
| Build/grow the wiki | "obs-wiki" | `obs-wiki` |

Full reference for each skill: `.claude/skills/<name>/SKILL.md`.
```

---

## File 2: `Getting Started/01 Creating a New Project.md`

```markdown
---
tags:
  - getting-started
---

# Creating a New Project

A "project" in this framework is just a folder with a `CLAUDE.md` in it, registered in
`_index.yml`. Registration is what makes it show up in `obs-ctx switch` and `para` commands.

## Steps

1. **Create the folder** wherever it belongs in your vault topology, e.g.
   `{example topical folder from this vault}/My New Project/`.
2. **Trigger registration:**
   ```
   obs-ctx init
   ```
3. obs-ctx scans for folders with a `CLAUDE.md` that aren't registered yet — your new folder
   shows up in the list. Pick it.
4. **If the folder has no `CLAUDE.md` yet**, you'll be asked for:
   - A short description of what the project is about
   - Tech stack / domain (used to suggest `resources:` later)
   - Any conventions specific to this project
   - PARA state — almost always `project` for something new and active
5. Confirm, and obs-ctx writes the `CLAUDE.md`, creates `context.md`, and adds the folder to
   `_index.yml`.

That's it — the project now shows up in `obs-ctx switch`.

## When NOT to Create a New Project

If what you're tracking has no real end state — an ongoing responsibility rather than a
goal with a deadline — it's an **Area**, not a Project. Same registration flow, just answer
`area` instead of `project` for PARA state. See `.claude/skills/para/references/para-method.md`
for the full Project vs. Area distinction.
```

---

## File 3: `Getting Started/02 Switching Context.md`

```markdown
---
tags:
  - getting-started
---

# Switching Context

Switching context = telling Claude which project you're focused on right now, so it loads
the right `CLAUDE.md` chain and `context.md` before you start working.

## Steps

```
obs-ctx switch
```
or the shortcut:
```
/cs
```

1. You'll see the list of registered projects (from `_index.yml`) — pick one.
2. obs-ctx loads:
   - `context.md` — status, open items, last session
   - The full `CLAUDE.md` chain from this project up to the vault root — so any
     vault-wide or area-wide conventions apply automatically
   - `resources:` — folders flagged as the first place to look for domain reference
     material, if any are set
3. You get a confirmation block showing PARA state, the chain, and (if found) any
   inconsistencies between CLAUDE.md and context.md — with an offer to fix them
   (`obs-ctx fix`).

From here, anything you discuss is understood in this project's context until you switch
again or end the session.

## Saving Progress

At the end of a working session on this project:
```
obs-ctx save
```
Updates `context.md` with what happened, and writes a discussion summary to
`{project}/_discussion/YYYY-MM-DD/{slug}.md`. This is usually triggered automatically as
part of `obs-session` wrap-up — see [[03 Daily Session]].
```

---

## File 4: `Getting Started/03 Daily Session.md`

```markdown
---
tags:
  - getting-started
---

# Daily Session

`obs-session` has two modes: a morning briefing and an end-of-day wrap-up.

## Morning

Trigger: "good morning", "morning recap", "start my day" — or automatically, if a startup
hook signals this is your first session of the day.

What it reads: recent git activity, today's daily note, and open tasks (if TaskNotes is in
use). What you get back: an actionable rundown of what's in flight and what's worth picking
up first — not just a status dump.

## Wrap-up

Trigger: "wrap up", "end session", "close out for today".

A fuller review than a simple save:
- Checks whether anything from this session should go to `_brain/` (a gotcha, a pattern, a
  decision) but wasn't captured
- Saves context for the active project (`obs-ctx save`)
- Checks for orphaned links and `CLAUDE.md` drift
- A quick "ways of working" reflection — did anything about how you collaborated with
  Claude today need to change?
- A goal pulse — anything worth flagging to `obs-compass`

Run this before closing the session, not instead of `obs-ctx save` — wrap-up calls it as
one of its checks.
```

---

## File 5: `Getting Started/04 Goal Tracking.md`

```markdown
---
tags:
  - getting-started
---

# Goal Tracking

`obs-compass` keeps `_brain/North Star.md` and `_brain/Goals/*.md` aligned with what you're
actually doing. Four modes, auto-detected from how you trigger it.

## First Time — Recommend Mode

If `_brain/North Star.md` is still the empty template, **any** obs-compass trigger defaults
to Recommend mode:

1. Reads what it can about you (memory, `CLAUDE.md` Owner Context)
2. Drafts a North Star statement (one sentence, 3-5 year horizon) and 3-5 goals derived
   from it
3. Shows you the full draft — nothing is written until you confirm
4. On confirmation, writes `_brain/North Star.md` and one `_brain/Goals/{goal}.md` per goal
5. Offers to generate an action plan for each new goal (see Plan mode below)

## Updating Goals — Write Mode

Trigger: "update north star", "add a goal", "obs-compass update".

Walks you through what's changing (Current Focus, a new goal, closing a finished one, a
North Star shift), shows a diff, and logs every North Star change to the Shifts Log table
for an audit trail.

## Checking Alignment — Review Mode

Trigger: "review goals", "check alignment" — or weekly/monthly/quarterly via cron.

Reads recent git activity and tasks, cross-references against each goal's scope (not just
explicit task links — a goal's `## Target`/`## Plan` description counts too), and reports:
what's on track, what's gone quiet, what's unaligned. Proposes concrete updates to goal
files before writing anything.

## Action Plans — Plan Mode

Trigger: "make a plan for [goal]", "career plan", "action plan", "gap analysis".

Generates a structured plan for one goal — current-state vs. target-state gap analysis,
quarterly milestones, prioritized actions, accountability check-ins, risks — and saves it
into that goal's `## Plan` section. No separate skill needed; this is part of obs-compass.
```
