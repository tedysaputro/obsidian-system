---
name: obs-session
type: skill
description: >
  Session lifecycle skill — two modes: Morning and Wrapup.

  Morning mode: an actionable morning briefing based on git history, the daily
  note, and TaskNotes (if the plugin is in use). Trigger: "good morning",
  "morning recap", "start my day", "/obs-session morning", or a startup hook
  signaling the first session of the day. Don't wait for an explicit command if
  a hook has already signaled the first session today.

  Wrapup mode: a full session review — brain capture check, context save,
  orphan link check, CLAUDE.md consistency, ways-of-working reflection, goal
  pulse. Trigger: "wrap up", "end session", "close out for today",
  "/obs-session wrapup".
trigger:
  - '/obs-session'
  - 'good morning'
  - 'morning recap'
  - 'start my day'
  - 'obs-session morning'
  - 'wrap up'
  - 'end session'
  - 'obs-session wrapup'
---

# obs-session — Session Lifecycle

## Mode Detection

| Trigger | Mode | Read reference |
|---|---|---|
| "good morning", "morning recap", "start my day", startup hook | **Morning** | `references/mode-morning.md` |
| "wrap up", "end session", "close out for today" | **Wrapup** | `references/mode-wrapup.md` |

---

## Shared Rule

**Offer, don't just execute** — every write action (daily note, commit, push, brain capture,
context save) needs user confirmation first. The one exception is a startup hook that has
already given an explicit signal to proceed.
