# Task Sync (after Review) — obs-compass

Read from **Mode: Review** (Weekly/Monthly/Quarterly) before reporting results, and referenced from **Mode: Plan** Step 7 when offering to create tasks.

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
