# Morning Mode — Morning Briefing

Your job is to give an actionable morning briefing: not just a report, but enough
context for the user to know where to start today.

Read the steps in order. Don't skip a step — the data in each step complements the others.

---

## Step 1: Determine the Time Range

Take today's and yesterday's date from system context (format `YYYY-MM-DD`).

Run these two commands:

**1. Commit log with full message (subject + body):**
```bash
git log --since="3 days ago" --pretty=format:"===COMMIT===%nHash: %h%nDate: %ad%nSubject: %s%nBody: %b%n" --date=short
```

**2. Per-commit file change stats:**
```bash
git log --since="3 days ago" --pretty=format:"===COMMIT=== %h | %s" --date=short --stat
```

Use both together: the commit message body gives the *why*, the stat gives the *what
changed*. If the body is empty, rely on subject + stat alone.

**3. Recent uncommitted changes — mandatory, don't skip:**

`git log` only sees commits. A lot of real work in a vault (especially output from skills
that write directly to the vault without committing) can sit **uncommitted for days**.
Without this check, significant activity disappears from the recap entirely even though it
genuinely happened.

```bash
TS=$(date -d "2 days ago" +%Y-%m-%dT%H:%M:%S)
git status --porcelain | cut -c4- | tr -d '"' | while IFS= read -r f; do
  [ -e "$f" ] && find "$f" -newermt "$TS" -maxdepth 0 2>/dev/null
done
```

`find` on some systems resolves to `bfs`, which doesn't accept relative formats like
`"2 days ago"` in `-newermt` — it fails with `Invalid timestamp`, and if the error is
suppressed the result silently looks empty (reads as "no activity" when the check actually
failed outright). Always compute an explicit ISO timestamp via `date -d` first; never pass
a relative string straight into `-newermt`.

This filters the uncommitted list (`git status`) down to files genuinely touched recently
(mtime < 2 days) — so old, irrelevant uncommitted backlog doesn't bury today's signal. For
each file that shows up: read its content if you need context (especially output folders
like review notes, walkthroughs, reports), and treat it as "yesterday" activity on equal
footing with a commit — not a secondary source.

If there's a commit OR uncommitted activity from yesterday/today → focus on that.
If it's empty (e.g. after a weekend) → fall back to the last 3 days as context.
If there's truly nothing → go straight to Step 3.

---

## Step 2: Identify Touched Projects

From the files changed in the git log, match them against registered projects:

```bash
node .claude/scripts/vault.js index list
```

Match each changed file's path against the `folder` prefix of each registered entry. For
every project that matches, read its `context.md` to understand current status. Read only
what's relevant — don't read everything.

---

## Step 3: Read the Daily Note

Read yesterday's and today's daily note (if it exists):
```
Daily/YYYY-MM-DD.md
```

From the daily note, extract:
- Meetings that happened (from meeting blocks, e.g. `[meeting-type::]` style markers)
- Action items or TODOs explicitly mentioned
- Things that look unfinished (open questions, unresolved items)
- Which projects were discussed

---

## Step 3c: Read TaskNotes (if the plugin is in use)

This step assumes the [TaskNotes](https://github.com/callumalpass/tasknotes) community
plugin's filesystem conventions. If the vault doesn't use TaskNotes, skip this step entirely.

Check whether the TaskNotes folder exists:
```bash
ls "TaskNotes/Tasks/" 2>/dev/null | head -1
```

If it doesn't exist or is empty → skip, move to Step 3b.

If it exists, gather all open tasks:
```bash
grep -rl "status: open\|status: in.progress" "TaskNotes/Tasks/" 2>/dev/null
```

For each file found, read the frontmatter and extract: `title`, `status`, `priority`,
`projects`, `scheduled`, `due`.

Ignore tasks with `status: done`, `completed`, or `cancelled`.

Bucket them by today's date:

| Bucket | Condition |
|---|---|
| **overdue** | `due` is set and `due` < TODAY and status isn't done |
| **due-today** | `due` = TODAY |
| **scheduled-today** | `scheduled` = TODAY (and not overdue/due-today) |
| **upcoming** | `due` is set and `due` ≤ TODAY + 7 days |
| **backlog** | everything else — including tasks with no `due` whose `scheduled` date has
  passed (in-progress with no deadline isn't "late") |

`scheduled` means when work starts, not the deadline. Don't treat `scheduled < TODAY` as an
overdue signal — a task whose start date has passed and is still `in-progress` is normal,
not late. Overdue is strictly about `due` having passed.

---

## Step 3d: Sub-task Sync Check

Run the `obs-sync` skill to check sub-task consistency between the task file, the daily
note, and `context.md`. Show the result if there's an inconsistency. Skip this step if
this vault doesn't use TaskNotes.

---

## Step 3b: Check Yesterday's EOD

Check whether yesterday's daily note already has an `# End of Day` section.

**If EOD already exists** → move to Step 4.

**If EOD is missing:**

1. Combine two sources of yesterday's activity:
   - `git log --since="yesterday 00:00" --until="today 00:00" --stat --pretty=format:"===COMMIT=== %h | %s"`
   - Recent uncommitted changes (mtime < 2 days) — same command as Step 1 point 3. **Don't
     just list filenames** — read the content of relevant files (review notes, walkthroughs,
     reports) so the EOD draft has substance, not just bare filenames.

2. Bucket into two groups (adjust the path prefixes below to match this vault's actual
   project areas):
   - **Work:** project/work-area folders
   - **Personal learning:** resource/learning folders

3. Draft the EOD:
```markdown
# End of Day
[time:: 17:00]
#daily/eod

## Work
{bullet per project: what's done, what's still open}

## Learning
{bullet per topic}

## Carry-over to {next working day}
- [ ] {item still open}
```

4. Show a preview and ask: "Yesterday's daily note has no EOD section. Want me to add this?"

5. If confirmed → append to yesterday's `Daily/YYYY-MM-DD.md`, stage the uncommitted files,
   show the list of files to be committed, ask for confirmation, then commit + ask about
   pushing.

---

## Step 4: Synthesize and Show the Recap

```markdown
## ☀️ Morning — {Day, Today's Date}

### Yesterday
{For each project: 1-2 bullets on what was done. Natural language — not raw commits.}

### Yesterday's meetings
{1 line per meeting: "- [Type] [Project]: [core topic]" — skip if none}

### Today's Agenda
{From Step 3c. Skip this section if there are no tasks.
Order: overdue → due-today → scheduled-today → upcoming → backlog.
Within a bucket, order: urgent → high → normal → low.

Format:
  ⏰ [overdue]  {title} (scheduled: DD Mon) — {goal}
  🔴 [urgent]   {title} — {goal}
  🟡 [high]     {title} — {goal}
  ⚪            {title} — {goal}
  📋 [backlog]  {title} — {goal}}

### Carry-over to check
{Unfinished items from the daily note or context.md.
DON'T duplicate TaskNotes items already shown in Agenda.}
```

If there's no data at all → show the Morning section with a short message and ask where to
start.

---

## Step 5: Create Today's Daily Note + Inject Carry-over

**Mandatory — don't skip even if the flow above ran long.**

Check whether today's `Daily/YYYY-MM-DD.md` already exists.

Collect carry-over from: the `## Carry-over to ...` section in yesterday's EOD + unchecked
open items + anything from Step 4 that looks unfinished. Don't duplicate overdue TaskNotes
items.

**If it doesn't exist:** offer to create it with a preview of the frontmatter + carry-over list.
**If it exists but has no carry-over yet:** offer to inject it.

After confirmation → write, then ask about commit + push. End with:
> "Where do you want to start today? Or is there a carry-over item above you want to jump into?"

---

## Notes

- Don't show raw commit hashes — translate to natural language
- Group and summarize commits like "fix typo", "update frontmatter"
- Prioritize relevance over completeness
- Git with no daily note → use git as the primary source, and vice versa
