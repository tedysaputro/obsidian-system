# Note Template — Wiki Note

Format guide for every wiki file created by the `build-wiki` skill.

---

## Template: Regular Wiki Note

```markdown
---
title: {Technology} — {Topic}
tags:
  - {primary-tag}
  - {subtopic-tag}
created: YYYY-MM-DD
---

# {Technology} — {Topic}

> Source: *{Book/Article Title}* ({Author}) — {Chapter if applicable}

## {Main Heading 1}

{Synthesized content. Rewrite in your own words, not copy-paste.}

### {Subheading if needed}

{Further detail.}

---

## {Main Heading 2}

{Use a table when comparing multiple things:}

| Aspect | Option A | Option B |
|---|---|---|
| ... | ... | ... |

---

## {Main Heading 3}

{Use bullet points for lists:}
- Item 1
- Item 2

{Use code blocks for code examples or commands:}

```bash
kubectl get pods
```

```

---

## Template: MOC (Master of Contents)

```markdown
---
title: {Technology} — MOC
tags:
  - moc
  - {primary-tag}
updated: YYYY-MM-DD
---

# {Technology} — MOC

{One short paragraph describing what this wiki contains.}

## {Topic Group 1}

- [[01 Note Name]] — one-sentence description
- [[02 Note Name]] — one-sentence description

## {Topic Group 2}

- [[01 Note Name]] — one-sentence description

```

---

## Content Guidelines

### What to write in a wiki note

| Element | Guideline |
|---|---|
| **Definition** | Explain the concept briefly and clearly at the start of the section |
| **Comparison** | Use tables to compare options, trade-offs, or configurations |
| **Real examples** | Include use cases or concrete examples, not just theory |
| **Code/Commands** | Use code blocks, provide context for their purpose |
| **Text diagrams** | Use ASCII/text diagrams for architecture or flow |
| **Cross-references** | Link to other notes with `[[Note Name\|phrase mentioning concept]]` — **inline** in the sentence, not as a separate section |

### What NOT to write

- Do not copy-paste long paragraphs from sources
- Do not write things that are already obvious from the concept name
- Do not duplicate content already in another note — link to it instead
- Do not add disclaimers or meta-commentary about the note itself
- Do not create "See Also" or "Related Concepts" sections — wikilinks only inside sentences

### Ideal length

- **Concept note:** 200–600 words — enough to understand, not excessive
- **Reference/cheatsheet note:** can be longer, focused on tables/lists
- **MOC:** as short as possible — only links and brief descriptions

---

## Tag Conventions

| Domain | Tags |
|---|---|
| AI / LLM | `ai`, `ai/agents`, `llm`, `rag`, `mcp` |
| Java | `java`, `spring-boot`, `quarkus`, `jpa` |
| Infrastructure | `kubernetes`, `docker`, `kafka` |
| Cloud | `aws`, `gcp`, `azure` |
| Architecture | `system-design`, `architecture` |
| Languages | `go`, `python`, `rust`, `typescript` |
| Meta | `moc`, `index` |
