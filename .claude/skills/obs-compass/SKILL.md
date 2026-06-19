---
name: obs-compass
type: skill
description: >
  Review whether actual activity is aligned with Goals and the North Star. Can
  write/update the North Star and Goal files based on a request or a
  recommendation derived from memory. Can also generate a structured action
  plan (gap analysis, milestones, accountability) for an existing goal —
  no separate skill needed.

  Trigger: "obs-compass", "review goals", "check alignment", "update north
  star", "add a goal", "am I on track", "how's progress going", "make a plan
  for this goal", "career plan", "action plan", "gap analysis", or via a
  weekly/monthly/quarterly cron.

  Cron mode: "weekly review", "monthly review", "quarterly review".
---

# obs-compass — North Star & Alignment Review

Four modes based on trigger:

- **Write** — write/update the North Star and Goal files
- **Review** — check whether actual activity is aligned with Goals
- **Recommend** — draft the North Star and Goals from memory if not yet filled in
- **Plan** — generate a structured action plan (gap analysis, milestones, accountability) for one goal

Detect mode from context: if the North Star is empty → default to Recommend. If the
message contains "update", "add", "write" → Write. If from cron or "check alignment" → Review.
If the message contains "plan", "career plan", "gap analysis", "milestones" for a specific
goal → Plan.

---

## Mode: Recommend (North Star Empty)

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

If yes → continue to **Mode: Plan** below with this goal as the target.

---

## Mode: Write (Update North Star or Goals)

Run this when the user explicitly asks for an update.

### Step 1: Read Current State

Read `_brain/North Star.md` and every file in `_brain/Goals/`.

### Step 2: Ask What's Changing

Ask specifically:
- Update Current Focus?
- Add a new goal?
- Close out a finished goal?
- Shift the North Star statement?

### Step 3: Draft the Change

Show a diff — what will change. Don't write before confirmation.

### Step 4: Write and Log to the Shifts Log

If the user is OK with it:
1. Write the change to the relevant file
2. Append to the `## Shifts Log` table in the North Star:

```
| {date} | {what changed} | {reason} |
```

### Step 5: Offer an Action Plan

After a new goal file is created, ask:
> "Want me to draft an action plan for this goal (gap analysis, milestones, accountability)?"

If yes → continue to **Mode: Plan** below with this goal as the target.

---

## Mode: Plan (Goal Action Plan)

Run when:
- The user explicitly asks: "make a plan for goal X", "career plan", "action plan", "gap analysis"
- Offered automatically after a new goal is created in Mode: Recommend (Step 5) or Mode: Write (Step 5)

Generates a structured plan — gap analysis, quarterly milestones, action items, accountability
— and saves it to the goal file's `## Plan` section. No separate skill needed; all the context
(North Star, Owner Context, goal file) is already read by obs-compass.

### Step 1: Read Goal Context

Read:
```bash
cat "_brain/North Star.md" 2>/dev/null
cat "_brain/Goals/{goal-slug}.md" 2>/dev/null
```

- Use the North Star statement as **Why This Goal**
- Use the Owner Context section of the vault root `CLAUDE.md` (role, expertise) as **Current State**
- If the target goal isn't clear from the trigger → list active goals from `_brain/Goals/` and ask: "Which goal do you want a plan for?"
- If the goal file already has a `## Plan` section → offer to update the existing plan instead of generating from scratch

### Step 2: Gather Missing Context

Ask only what isn't already answered by the goal file or CLAUDE.md:

**Current State** (skip if already in CLAUDE.md Owner Context):
- Current role/level
- Main strengths
- Relevant experience

**Target State** (skip if already in the goal file's `## Target` section):
- Specific success criteria
- Timeline
- Constraints

### Step 3: Gap Analysis

```markdown
## Gap Analysis: [Current] → [Target]

### Current State
- **Level:** [current level]
- **Strengths:** [key strengths]
- **Experience:** [relevant experience]

### Target State
- **Goal:** [specific target]
- **Timeline:** [target date]
- **Success Criteria:** [how you'll know you've arrived]

### Gap Assessment

| Dimension | Current | Target | Gap Priority |
| --------- | ------- | ------ | ------------ |
| [Skill/area 1] | [level] | [level] | High/Medium/Low |
| [Skill/area 2] | [level] | [level] | High/Medium/Low |
| [Experience] | [current] | [needed] | High/Medium/Low |
```

### Step 4: Generate the Plan

```markdown
## Plan

### Goal Statement
[Specific, measurable goal with timeline]

### Why This Goal
[Connection to the North Star / long-term vision]

### Success Criteria
- [ ] [Measurable outcome 1]
- [ ] [Measurable outcome 2]
- [ ] [Measurable outcome 3]

### Timeline
**Start:** [date]
**Target Completion:** [date]
**Duration:** [X months]

### Quarterly Milestones

**Q1: [Focus Area]**
- [ ] [Specific milestone]
- Checkpoint: [how to assess progress]

**Q2: [Focus Area]**
- [ ] [Specific milestone]
- Checkpoint: [how to assess progress]

**Q3: [Focus Area]**
- [ ] [Specific milestone]
- Checkpoint: [how to assess progress]

**Q4: [Focus Area]**
- [ ] [Specific milestone]
- Checkpoint: [how to assess progress]

### Action Plan

**High Priority Actions:**
1. **[Action]** — By [date]
   - Why: [connection to goal]
   - Resources: [what's needed]

**Supporting Actions:**
- [Action] — [Timeframe]

### Quick Wins (Start This Week)
- [ ] [Something achievable immediately]

### Resources Needed
- **Learning:** [courses, books, mentors]
- **Experiences:** [projects, stretch assignments]
- **Support:** [manager, mentor, sponsor]
- **Time:** [hours/week commitment]

### Accountability

**Share With:**
- Manager: [conversation to have]
- Mentor: [support to request]
- Peer: [accountability partner]

**Check-in Cadence:**
- Weekly: [self-review activity]
- Monthly: [review meeting with...]
- Quarterly: [milestone assessment]

### Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
| ---- | ---------- | ------ | ---------- |
| [Risk 1] | H/M/L | H/M/L | [Plan] |

### Adjustment Triggers

Reassess this plan if:
- [ ] Major change in role or company
- [ ] Significant feedback changes direction
- [ ] A new opportunity or obstacle emerges
- [ ] Progress is significantly ahead of or behind schedule
```

### Step 5: Preview and Confirm

Show the full Gap Analysis + Plan draft. Ask:
> "Here's a draft plan for [goal]. Want to edit it first, or save as-is?"

Don't write anything before the user signs off.

### Step 6: Save to the Goal File

If the user is OK with it:
1. If the goal file already exists at `_brain/Goals/{goal}.md` → append/update its `## Plan` section (the Gap Analysis can go in as a sub-section of `## Plan` or as its own section right before it)
2. If the goal file doesn't exist yet → create it first via **Mode: Recommend** or **Mode: Write**, then save the plan

Don't create a new file outside `_brain/Goals/` — every plan lives in its goal file so
obs-compass (Mode: Review) can read the quarterly milestones during alignment checks.

### Step 7: Offer to Create Tasks

A freshly saved plan has actionable items that are still just text, not real tasks. Extract
candidates from the plan:
- Every item under **Quick Wins (Start This Week)**
- Every item under **High Priority Actions** (with its "By [date]" if present)

Show them and ask:
```
📋 This plan has a few action items. Want me to create tasks for any of them?

Quick Wins:
  1. [item]
  2. [item]

High Priority Actions:
  3. [item] — by [date]
  4. [item] — by [date]

Pick (number/space-separated/'all'/'skip'):
```

For each item picked → run the `obs-task` skill with context already gathered:
- `title` = the item's text
- `goal` = this goal (already known, skip obs-task's goal question)
- `due` = the item's date, if any
- `priority` = `high` for High Priority Actions, `normal` for Quick Wins

obs-task still runs its normal flow (preview + confirmation per task) — obs-compass only
triggers it, it doesn't write the task file directly. obs-task remains the only skill
allowed to write to `TaskNotes/Tasks/` (see `## Task Sync` below).

If the user says `skip` → no tasks created; the plan stays as text in the goal file to be
converted manually later.

---

## Mode: Review (Alignment Check)

Run from cron or a manual trigger. Three variants:

### Weekly Review

**Data to read:**
```bash
# Git activity from the last 7 days
git log --since="7 days ago" --pretty=format:"%ad | %s" --date=short --stat

# TaskNotes completed this week
grep -rl "status: done" "TaskNotes/Tasks/" 2>/dev/null | xargs grep -l "$(date -d '7 days ago' +%Y-%m-%d)\|$(date +%Y-%m-%d)" 2>/dev/null

# TaskNotes still open
grep -rl "status: open\|status: in-progress" "TaskNotes/Tasks/" 2>/dev/null
```

> The TaskNotes commands assume the TaskNotes plugin. If this vault doesn't use it, skip
> those two and rely on git log + daily notes instead.

**Mandatory step before analysis — read all Goal files:**

Read the full contents of `_brain/Goals/*.md` — especially the `## Target`, `## Sub-goals`,
and `## Plan` sections. This builds a **coverage map** for each goal: what activities or
areas fall within that goal's scope.

Example: a goal "Engineering Leadership" might cover "stay active as a hands-on mentor" —
so mentoring-related activity is automatically aligned to this goal even if its tasks have
no explicit `[[Engineering Leadership]]` link.

**Per-goal analysis:**
- How many tasks were completed this week for this goal (via task linkage OR via the
  coverage map)?
- How many tasks are still pending?
- Is there relevant git activity based on path or commit name?
- Was this goal touched at all this week?

**Classifying "Unaligned Activity" — both conditions must hold:**
1. The activity has no explicit task linkage to any goal, **AND**
2. The activity doesn't fall within the scope described in any goal's Target/Sub-goals/Plan

If only condition 1 holds (no linkage, but it's within a goal's scope) → not unaligned,
note it instead as **"implicitly linked to [goal]"** and recommend linking it explicitly.

**Check quarterly milestones** (if a goal file has a `## Plan` section):
- Read the current quarter's milestones from `_brain/Goals/{goal}.md`
- Mark: ✅ done / 🔄 in progress / ⏳ not started / 🔴 overdue
- If a milestone is overdue → add it to Recommendations

**Output format:**
```
🧭 Compass Weekly Review — {date}

North Star: {short statement}

Goal Alignment This Week:
  ✅ {Goal A} — {N} tasks done, on track
  ⚠️  {Goal B} — no activity this week
  🔴 {Goal C} — deadline in {X} days, no progress yet

Unaligned Activity:
  - {N} tasks worked on this week with no goal
  - Git commits in an area not connected to any goal: {path}

Recommendations:
  - {concrete suggestion 1}
  - {concrete suggestion 2}
```

After the report, add a **Proposed Updates** section based on evidence found in the review
data (git, tasks, daily notes):

```
📝 Proposed Updates to Goal Files:
  - {Goal A} Progress: add "{YYYY-MM-DD}: {activity} — evidence: {source}"
  - {Goal B} Sub-goal "{X}": [ ] → [x] — because {evidence}
  - {Goal C} Milestone "{Y}": [ ] → [x] — because {evidence}

Apply all of these? (y/edit/skip)
```

Wait for confirmation before writing anything:
- `y` → execute all at once
- `edit` → ask which item to change or drop from the list
- `skip` → no changes to goal files

After execution, a short report:
```
✅ Goal files updated:
  - {Goal A}: progress added
  - {Goal B}: sub-goal "{X}" checked off
```

Then ask:
> "Want to adjust any goals or priorities? Or is there anything worth logging to the Shifts Log?"

### Monthly Review

Same as Weekly, but a 30-day range. Additionally:

- Is there a goal that should be closed (done, or no longer relevant)?
- Is there a new goal that should be added?
- Is Current Focus still accurate?

### Quarterly Review

90-day range. Focus on:

- Is the North Star statement still relevant?
- Which goals are done, which need to carry over?
- Has there been a major shift in priorities?

Quarterly always ends with an offer to update the North Star if there's been a shift.

---

## Task Sync (after Review)

### Division of responsibility

| Tool | Responsibility |
|---|---|
| **obs-compass** | Updates progress and status in Goal files only |
| **obs-task** | The only tool allowed to create tasks in TaskNotes |
| **TaskCreate** (built-in task tool) | **Forbidden here** — session-only, disappears when the session ends |

### Correct hierarchy

```
Goal  ←  Task (TaskNotes/Tasks/)  ←  Sub-task (daily note or context.md)
```

- A Goal **cannot** be linked directly to a sub-task
- A sub-task always has a **parent task** first
- The task file stores sub-tasks in its body + a `Reference:` line to where they're also tracked

### Where sub-tasks live

A sub-task is written in **one** place:
- **Daily note** — for near-term operational sub-tasks
- **Project's context.md** — for sub-tasks that are part of an ongoing project's scope

Format in the daily note:
```
- [ ] {sub-task} — [[{zettel-id} {parent task title}]]
```

Format in context.md (Open Items):
```
- [ ] **{sub-task}** — task: [[{zettel-id} {parent task title}]]
```

The task file body also stores the same sub-task list, plus a line:
```
Reference: [[path/to/context.md or Daily/YYYY-MM-DD]]
```

### Sub-task Sync Check

Before reporting the review results, run the `obs-sync` skill.

Any inconsistency found gets folded into the review's Recommendations.

### Identifying follow-up items after Review

For each open checklist item in the daily note, or surfaced from the review analysis:

1. **Check whether a parent task already exists in TaskNotes** (read `TaskNotes/Tasks/`)
   - Yes → no new task needed, just make sure the sub-task is linked to the parent
   - No → continue to step 2

2. **Classify the item:**
   - *Sub-task* — a specific action that's part of larger work
   - *Standalone task* — rare; an action that genuinely stands on its own with no larger context

3. **For a sub-task with no parent task:**
   - Infer the most logical parent task from context (project, area, goal)
   - Offer it to the user: *"Item X looks like part of work Y under goal Z — want me to
     create the parent task first?"*
   - Once confirmed → run `obs-task` to create the parent task first
   - Then attach the sub-task to it

4. **Every task needs a goal** — no task without `projects`. If the goal isn't clear, ask
   the user before creating the task.

5. **Never create a task without user confirmation** — offer first, wait for approval.

---

## Rules

- **Never write anything without explicit confirmation** — every change to the North Star
  and Goal files must be approved by the user
- **Review is informational** — report and recommend, but the user decides
- **Use actual data** (git, TaskNotes) rather than assumptions during review
- **Log every North Star change to the Shifts Log** — this is an important audit trail
- **If TaskNotes isn't in use** — use git log and daily notes as a proxy for activity
- **Never use the built-in TaskCreate tool for this** — it's session-only, not persisted to the vault
