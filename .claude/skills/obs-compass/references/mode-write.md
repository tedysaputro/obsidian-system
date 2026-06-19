# Mode: Write (Update North Star or Goals) — obs-compass

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

If yes → continue to **Mode: Plan** (`references/mode-plan.md`) with this goal as the target.
