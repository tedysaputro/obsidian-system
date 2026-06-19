# Mode: Recommend (North Star Empty) — obs-compass

Run this if `_brain/North Star.md` is still the template (Current Focus empty).

### Step 1: Read User Context

Read two sources:
1. Memory files in `~/.claude/projects/.../memory/` — roles, patterns, feedback
2. The Owner Context section of the vault root `CLAUDE.md`, if it has one

### Step 2: Draft the North Star

From what's known, draft:

**North Star statement** — one qualitative sentence, 3-5 year horizon:
```
"Become [X] who [Y] in [Z]."
```

**Current Focus** — the most critical thing(s) being worked on right now (1-2 items).

**Active Goals** — 3-5 goals with an end date, each derived from the North Star:
```
Goal: [title] — deadline: [Q/month year]
Success measure: [concrete and measurable]
Connected to North Star because: [short reason]
```

### Step 3: Show the Draft and Wait for Confirmation

Show the full draft. Ask:
> "Here's a draft North Star based on what I know about you. Want to edit it first, or save as-is?"

Wait for confirmation or revision. Don't write anything before the user signs off.

### Step 4: Write to File

If the user is OK with it:
1. Update `_brain/North Star.md`
2. For each Goal → create `_brain/Goals/{goal-slug}.md`

Goal file format:
```markdown
---
title: {goal title}
area: {related area/role}
deadline: {YYYY-MM-DD or Q/year}
status: active
linked_to: "[[North Star]]"
---

# {Goal Title}

## Target
{the concrete success measure}

## Progress
_No updates yet._

## Tasks
```dataview
LIST FROM "TaskNotes/Tasks"
WHERE contains(projects, "[[{goal title}]]")
AND status != "done"
```
```

> The `## Tasks` Dataview block assumes the TaskNotes plugin's frontmatter conventions. If
> this vault doesn't use TaskNotes, drop that block or replace it with whatever this vault
> uses to track tasks.

### Step 5: Offer an Action Plan

For each newly created goal, ask:
> "Want me to draft an action plan for this goal (gap analysis, milestones, accountability)?"

If yes → continue to **Mode: Plan** (`references/mode-plan.md`) with this goal as the target.
