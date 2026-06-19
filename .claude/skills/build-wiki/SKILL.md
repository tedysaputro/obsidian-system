---
name: build-wiki
description: >
  Use this skill to read articles/clippings, synthesize their content, and
  build a structured wiki inside an Obsidian vault. The skill analyzes sources,
  proposes a numbered directory structure, waits for confirmation, then generates
  clean wiki files with frontmatter, wikilinks, and a MOC.

  Trigger when the user mentions: "build wiki", "create wiki", "synthesize to wiki",
  "generate wiki from clippings", "convert article to wiki", or names a topic
  followed by "wiki" (e.g., "kubernetes wiki", "wiki from ai articles").

  Mode: Claude Code only — reads source files, writes wiki to vault.
---

# Build Wiki — Synthesizer & Organizer

> Note template → `references/note-template.md`
> Structure guide → `references/structure-guide.md`

---

## Flow

### Step 1: Determine Source & Topic

Ask the user if not already clear:

```
📂 Article sources:
- Which directory? (default: Clippings/)
- Filter by tag? (e.g., #ai, #kubernetes)
- Or specific files?

📁 Save wiki to which directory?
> (e.g., technology/generative-ai/)
```

If the user has already provided this inline → skip answered questions.

---

### Step 2: Read & Analyze Sources

Read all source files. For each file:
- Note the main topic and subtopics
- Identify concepts overlapping across files
- Determine content depth (intro / intermediate / reference)

Do not write anything yet — continue to Step 3.

---

### Step 3: Propose Structure

**Always propose before writing anything.**

Present the full plan:

```
📋 Wiki structure proposal:

Target directory: technology/kubernetes/

Files to create:
├── 00 MOC.md                          ← Master of Contents
├── 01 Introduction/
│   └── 01 What is Kubernetes.md       ← Definition, architecture, use cases
├── 02 Core Concepts/
│   ├── 01 Pods and Workloads.md       ← Pod, Deployment, StatefulSet
│   └── 02 Services and Networking.md  ← ClusterIP, NodePort, Ingress
└── 03 Operations/
    └── 01 kubectl Cheatsheet.md       ← Command reference

Files to update:
- technology/00 Index.md               ← Add Kubernetes entry

Proceed? (y/n / or request changes)
```

Wait for confirmation. If the user requests changes → revise proposal and display again.

---

### Step 4: Create Wiki Files

After confirmation, create files one by one following the proposal.

Follow `references/note-template.md` for each file:
- Complete frontmatter (title, tags, created)
- Content synthesized from sources — **not copy-paste**, but distillation
- Use tables, bullet points, code blocks as appropriate
- Wikilinks to other notes placed INLINE on the word/phrase mentioning that concept — not as a "See Also" section at the end

Follow `references/structure-guide.md` for directory and file naming.

**Source attribution in every wiki note must use wikilinks to the original clipping file:**

```markdown
> Source: [[Clipping File Name 1]], [[Clipping File Name 2]]
```

Use the full filename without the `.md` extension. Do not write author names or article titles as plain text — always use wikilinks so Obsidian backlinks form automatically.

---

### Step 5: Create MOC

Create `00 MOC.md` at the root of the wiki directory. The MOC must:
- Be the entry point — link to all notes in the wiki
- Be grouped by subdirectory/topic
- Contain a one-to-two sentence description per note

See format in `references/note-template.md` → MOC section.

---

### Step 6: Update Index

Find and update the relevant index file (usually `00 Index.md` in the parent directory).

Add a new entry for the newly created wiki. Do not delete or modify existing entries.

---

### Step 6b: Mark Source Clippings

After all wiki notes are complete, add `synthesized: true` to the frontmatter of **all clipping files** used as sources.

```yaml
---
title: "..."
tags:
  - clippings
synthesized: true   ← add here, after tags
---
```

**Marking rules:**
- Use frontmatter field `synthesized: true` — **not a tag**
- Place after the `tags:` block, before the closing `---`
- Do for all source files, whether all or only part of their content was used
- Apply these changes in parallel (batch edit all files at once)

---

### Step 7: Final Confirmation

```
✅ Wiki created successfully:

📁 technology/kubernetes/
   ├── 00 MOC.md
   ├── 01 Introduction/01 What is Kubernetes.md
   ├── 02 Core Concepts/01 Pods and Workloads.md
   ├── 02 Core Concepts/02 Services and Networking.md
   └── 03 Operations/01 kubectl Cheatsheet.md

📝 Updated: technology/00 Index.md
```

---

## Important Rules

- **Propose first, write later** — do not generate files before the user confirms the structure
- **Synthesize, don't copy-paste** — extract the essence, rewrite in your own words
- **Wikilinks inline** — place `[[File Name|text]]` on the word/phrase mentioning the concept within the sentence; do not create a "See Also" section or separate cross-reference list that is not verified from the text
- **Number prefix** — applies to both directories AND files (e.g., `01 Introduction/`, `01 What is X.md`)
- **MOC at root** — `00 MOC.md` always at the wiki directory root, not in a subdirectory
- **Do not modify existing content** — when updating an index, only append/add new entries
- **Sources use wikilinks** — the `> Source:` line in wiki notes must contain `[[Clipping File Name]]`, not plain text
- **Mark clippings with frontmatter** — use `synthesized: true` as a frontmatter field, **not a tag**, after all wiki notes are created
