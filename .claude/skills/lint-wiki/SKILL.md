---
name: lint-wiki
description: >
  Use this skill to audit and repair an existing wiki inside an Obsidian vault.
  Based on the Lint operation from Karpathy's llm-wiki paradigm: finds missing
  inline wikilinks, broken links, orphan notes, terminology inconsistencies,
  and contradictions. Reports findings before making any changes.

  Trigger when the user mentions: "lint wiki", "audit wiki", "check wiki links",
  "fix broken links", "find orphan notes", or "wiki consistency check".

  Mode: Claude Code only — reads vault files, writes only after confirmation.
---

# Lint Wiki — Auditor & Connector

> Audit checklist → `references/lint-checklist.md`

---

## Flow

### Step 1: Determine Target

Ask the user if not already clear:

```
📁 Wiki to audit:
- Which directory? (e.g., technology/kubernetes/)
- Full audit or focus on a specific aspect?
  1. All (default)
  2. Inline wikilinks only
  3. Broken links & orphans only
  4. Terminology consistency only
```

If the user has already stated their focus inline → skip questions already answered.

---

### Step 2: Scan & Catalog

Read all wiki files in the target directory. Build an internal map:
- List of all notes and the main concepts each one covers
- List of all existing wikilinks (outgoing per note)
- List of all files present (for broken link detection)

Do not write anything yet — continue to Step 3.

---

### Step 3: Identify Issues

Check each category according to the requested scope:

#### A. Missing Inline Wikilinks
For each note: find words or phrases that mention a concept covered by another note in the same wiki, but are not yet linked.

**Verification rules:**
- A link may only be added if the concept is **explicitly mentioned** in that sentence
- Do not link based on "might be relevant" — there must be a word/phrase that proves it
- Format: `[[File Name|displayed text]]`

#### B. Broken Links
Find wikilinks that reference a file that does not exist in the vault.

#### C. Orphan Notes
Find notes with no incoming links (no other note links to it) AND no outgoing links.

#### D. Terminology Consistency
Find the same concept written different ways across notes (e.g., "knowledge graph" vs "knowledge-graph" vs "KG").

#### E. Contradictions
Find conflicting claims between notes. This is heuristic — report as candidates, not facts.

---

### Step 4: Present Findings

**Always present findings first — do not fix immediately.**

Report format:

```
🔍 Audit Results: technology/kubernetes/

A. Missing Inline Wikilinks (N found)
   - 01 Introduction.md, line 15: "control plane" → [[02 Control Plane]]
   - 03 Networking.md, line 8: "Ingress" → [[02 Services and Networking]]

B. Broken Links (N found)
   - 02 Core Concepts/03 Storage.md → [[Persistent Volume]] (file not found)

C. Orphan Notes (N found)
   - 05 Reference/Glossary.md — no notes link to this

D. Terminology Consistency (N candidates)
   - "control plane" (02 Core Concepts.md) vs "Control Plane" (01 Introduction.md)

E. Contradictions (N candidates)
   - [description of conflicting claims]

Fix all? (y/n) or select category: A / B / C / D / E
```

Wait for confirmation before making any changes.

---

### Step 5: Apply Fixes

After confirmation, apply changes according to user's selection:

- **A (Inline links):** Edit files, add wikilinks inline on the identified words/phrases
- **B (Broken links):** Report to user — **do not auto-delete**; ask whether the target file should be created or the link removed
- **C (Orphans):** Suggest which notes could link to the orphan based on content; wait for confirmation before editing
- **D (Terminology):** Suggest a canonical term, show all locations to update; wait for confirmation before replacing
- **E (Contradictions):** Report only — editorial decisions belong to the user

---

### Step 6: Final Confirmation

```
✅ Audit complete:

📁 technology/kubernetes/
   ✓ 12 inline wikilinks added across 8 notes
   ⚠ 2 broken links reported (not yet fixed — awaiting user decision)
   ✓ 1 orphan note connected to 2 other notes
   ✓ Terminology "control plane" standardized across 3 notes
   — 1 contradiction candidate reported
```

---

## Important Rules

- **Report first, fix later** — never apply changes before user confirms
- **Inline links must be verified** — only link words/phrases that genuinely mention the concept; do not guess
- **Broken links: no auto-delete** — always ask whether the target file should be created or the link removed
- **Contradictions: report only** — do not edit content; editorial decisions belong to the user
- **No "See Also" sections** — all wikilinks must be inline in sentences, not a separate list
- **Scope limited to target wiki** — do not go outside the specified directory
