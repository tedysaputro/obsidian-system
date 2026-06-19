# Mode: Review (Alignment Check) — obs-compass

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

Before reporting the review results, read `references/task-sync.md` and run the Sync Check there.

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
