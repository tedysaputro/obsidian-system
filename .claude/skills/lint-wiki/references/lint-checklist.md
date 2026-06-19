# Lint Checklist — Wiki Audit

Quick reference for Lint operations based on Karpathy's llm-wiki paradigm.

---

## A. Missing Inline Wikilinks

**How to detect:**
- Read each note, record the main concepts each note covers
- For each note: check whether words/phrases mentioning concepts from other notes are already linked
- Compare: note X mentions "knowledge graph" → is it already `[[02 Knowledge Graph|knowledge graph]]`?

**Valid criteria for linking:**
- [ ] The word/phrase actually exists in the sentence (not inferred)
- [ ] Another note specifically covers that concept
- [ ] A link doesn't already exist in that sentence

**Inline wikilink format:**
```
[[File Name|displayed text]]
```

---

## B. Broken Links

**How to detect:**
- Collect all `[[...]]` across the entire wiki
- Check whether the target file exists in the vault (case-insensitive, without `.md` extension)

**Action:**
- [ ] Report to user: link location, target filename not found
- [ ] Ask: create a new (stub) file or remove the link?
- **Do not auto-delete**

---

## C. Orphan Notes

**How to detect:**
- Note with no **incoming** links (no other note links to it)
- AND no **outgoing** links (this note links to no other note)

A note with only one of these conditions is not a true orphan — note it as "isolated."

**Action:**
- [ ] Identify other notes covering similar topics → suggest as candidates that could link to the orphan
- [ ] Wait for confirmation before editing

---

## D. Terminology Consistency

**How to detect:**
- Look for spelling variations of the same concept:
  - Mixed capitalization: "Claude Code" vs "claude code"
  - Hyphenation: "cross-reference" vs "cross reference"
  - Synonyms: "knowledge graph" vs "KG" vs "knowledge-graph"

**Action:**
- [ ] Suggest one canonical term (usually the most frequently used or clearest)
- [ ] Show all locations that need updating
- [ ] Wait for confirmation before replacing

---

## E. Contradictions

**How to detect (heuristic):**
- Claims about the same thing using opposite words: "always" vs "never", "faster" vs "slower"
- Different numbers or facts for the same entity
- Conflicting recommendations for the same situation

**Action:**
- [ ] Report contradiction candidates: note A line X vs note B line Y
- [ ] Do not edit — editorial decisions belong to the user

---

## Recommended Audit Priority

For a full audit, the recommended order:

1. **Broken links** — most critical issue, breaks navigation
2. **Inline wikilinks** — improves graph connectivity
3. **Orphans** — surfaces isolated knowledge
4. **Terminology** — maintains language consistency
5. **Contradictions** — content quality check (requires the most judgment)
