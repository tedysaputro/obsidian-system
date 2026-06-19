# Mode: Plan (Goal Action Plan) — obs-compass

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
allowed to write to `TaskNotes/Tasks/` (see `references/task-sync.md`).

If the user says `skip` → no tasks created; the plan stays as text in the goal file to be
converted manually later.
