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

## Mode Detection

| Trigger | Mode | Read reference |
|---|---|---|
| `_brain/North Star.md` is still the template (Current Focus empty) — default no matter what triggered it | **Recommend** | `references/mode-recommend.md` |
| "update", "add a goal", "write", "update north star" | **Write** | `references/mode-write.md` |
| "make a plan for goal X", "career plan", "action plan", "gap analysis", or offered automatically after a new goal is created | **Plan** | `references/mode-plan.md` |
| weekly/monthly/quarterly cron, "review goals", "check alignment" | **Review** | `references/mode-review.md` |

Detect mode from context: if the North Star is empty → default to Recommend, regardless of
which trigger phrase was used. Read only the reference file for the detected mode — don't
load all of them at once.

`references/task-sync.md` is used across modes: read from Mode Review before reporting
results, and from Mode Plan Step 7 when offering to create tasks.

---

## Rules

- **Never write anything without explicit confirmation** — every change to the North Star
  and Goal files must be approved by the user
- **Review is informational** — report and recommend, but the user decides
- **Use actual data** (git, TaskNotes) rather than assumptions during review
- **Log every North Star change to the Shifts Log** — this is an important audit trail
- **If TaskNotes isn't in use** — use git log and daily notes as a proxy for activity
- **Never use the built-in TaskCreate tool for this** — it's session-only, not persisted to the vault
