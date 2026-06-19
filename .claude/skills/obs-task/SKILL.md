---
name: obs-task
type: skill
description: >
  Create a new task linked to a Goal. Goal-first flow: pick a goal from
  `_brain/Goals/`, fill in task details, write the file to `TaskNotes/Tasks/`.
  Works via the filesystem — doesn't require Obsidian to be running.

  This skill assumes the [TaskNotes](https://github.com/callumalpass/tasknotes)
  community plugin's file conventions. If this vault doesn't use TaskNotes, this
  skill doesn't apply.

  Trigger: "create a task", "add a task", "new task", "obs-task", "log a task",
  or the user mentions a concrete task with context (e.g. "create a task to
  review the PR, due tomorrow, high priority").
---

# obs-task — Create a TaskNotes Task

Create a new task linked to a Goal that's immediately compatible with the TaskNotes plugin.

---

## Step 1: Check Available Goals

Read the list of goals:

```bash
ls "_brain/Goals/" 2>/dev/null
```

**If the folder is empty or missing** → show:
> "No Goals defined yet. If this vault has a goal-setting skill, run that first to derive
> Goals from `_brain/North Star.md`. Otherwise, tell me the goal name and I'll create a
> `_brain/Goals/{goal}.md` file for it."
> Only proceed without a goal if the user explicitly asks for a task with no goal.

**If goals exist** → show them as a numbered list:
```
Available goals:
1. [Goal A]
2. [Goal B]
3. [Goal C]
(or type a new goal name / skip for a task with no goal)
```

---

## Step 2: Parse User Input

Try to extract these inline from the user's message — don't re-ask what's already stated:

| Field | How to parse |
|---|---|
| `title` | The main task sentence |
| `goal` | Goal named by the user, or picked from Step 1 |
| `due` | "tomorrow" → tomorrow, "Friday" → nearest Friday, "Jun 15" → 2026-06-15 |
| `priority` | "urgent/high/normal/low" — default: `normal` |
| `contexts` | "@office", "@laptop", "@meeting" |
| `scheduled` | If stated, otherwise default: today |

Only ask for fields that aren't already known. The bare minimum needed: **title**.

**If the user skips the goal** → don't proceed. Ask which goal it belongs to:
> "This task needs to link to a goal. Which one does it belong to?"
> If genuinely nothing fits → offer to create a new goal file first.

---

## Step 3: Show a Preview

Before writing, show a full preview:

```
📝 Task preview:

Title    : {title}
Goal     : {goal or "—"}
Priority : {priority}
Scheduled: {scheduled}
Due      : {due or "—"}
Contexts : {contexts or "—"}

File     : TaskNotes/Tasks/{timestamp} {title}.md

Proceed? (y/edit/cancel)
```

Wait for confirmation. If "edit" → ask which field to change.

---

## Step 4: Write the TaskNotes File

Generate a zettel-format filename:
```
{YYYYMMDDHHmm} {title}.md
```
Example: `202606081430 Review PR.md`

Write to `TaskNotes/Tasks/`:

```yaml
---
title: {title}
tags:
  - task
status: open
priority: {priority}
scheduled: {YYYY-MM-DD}
due: {YYYY-MM-DD or omitted}
projects:
  - "[[{goal}]]"
contexts:
  - {contexts or omitted}
dateCreated: {YYYY-MM-DD}
---

Reference: [[path/to/context.md or Daily/YYYY-MM-DD]]

- [ ] {sub-task 1}
- [ ] {sub-task 2}
```

If there's no due date → omit the `due` field entirely (don't leave it blank).
If there are no contexts → omit the `contexts` field.

### Sub-tasks

Sub-tasks are written in the task file body AND in whichever of these locations is most
relevant:

- **The project's `context.md`** — if the sub-task is part of an ongoing project's scope.
  Add a link back to the parent task:
  ```
  - [ ] **{sub-task}** — task: [[{zettel-id} {task title}]]
  ```
- **Today's daily note** — if the sub-task is near-term operational work:
  ```
  - [ ] {sub-task} — [[{zettel-id} {task title}]]
  ```

The `Reference:` line in the task file points to where the sub-task is also recorded.

---

## Step 5: Sync Check

Run the `obs-sync` skill after writing the task file to confirm sub-tasks are recorded at
the Reference location — it will add anything missing automatically.

---

## Step 6: Confirm

After the file is written (and sub-tasks synced, if applicable):
```
✅ Task created: TaskNotes/Tasks/{filename}
   Sub-tasks recorded at: {Reference location}
```

If a goal was selected, check whether its goal file exists in `_brain/Goals/`:
- Exists → done
- Doesn't exist → offer to create it:
  > "Goal file `_brain/Goals/{goal}.md` doesn't exist yet. Want me to create it?"

---

## Rules

- **Never write without a preview + confirmation**
- **Title is required** — every other field is optional except goal
- **Goal is required** — no task without `projects`. If there's no goal yet, guide the user
  to define one (via a goal-setting skill if this vault has one, or manually) before continuing
- **Use the zettel filename** — matches the TaskNotes plugin's `taskFilenameFormat: "zettel"` config
- **Omit empty fields** — don't write `due: ` with no value, the plugin will choke on it
- **One task per file** — don't combine multiple tasks in a single file
- **Keep sub-tasks in sync** — after writing the task file, make sure sub-tasks are also
  recorded in `context.md` or the daily note with a link back to the task
