# Structure Guide — Wiki Organization

Guide for naming and organizing directories and files in a wiki.

---

## Core Principles

1. **Number prefix** applies to both directories AND files
2. **MOC always at root** of the wiki directory as `00 MOC.md`
3. **Maximum depth** of one subdirectory level (flat is sufficient for most wikis)
4. **Descriptive names** for directories and files

---

## Naming Patterns

### Directories

```
NN Category Name/
```

- `NN` = two-digit number: `01`, `02`, `03`, ...
- Category name: descriptive, Title Case
- Examples: `01 Introduction/`, `02 Core Concepts/`, `03 Operations/`

### Files

```
NN Note Title.md
```

- `NN` = two-digit number within its directory
- Title: descriptive, Title Case
- Examples: `01 What is Kubernetes.md`, `02 Cluster Architecture.md`

### MOC

Always named `00 MOC.md`, placed at the wiki directory root (not in a subdirectory).

---

## Structure Examples

### Simple Wiki (1 topic, few files)

```
technology/kubernetes/
├── 00 MOC.md
├── 01 Architecture and Concepts.md
├── 02 Workloads and Pods.md
├── 03 Networking.md
└── 04 kubectl Reference.md
```

→ Flat structure is fine when fewer than 7 files.

### Medium Wiki (several topic groups)

```
technology/generative-ai/
├── 00 MOC.md
├── 01 History and Landscape/
│   └── 01 Landscape and Evolution.md
├── 02 Core Concepts/
│   ├── 01 Text Processing and LLMs.md
│   └── 02 Adapting LLMs.md
└── 03 AI Agents/
    ├── 01 Introduction to AI Agents.md
    ├── 02 Agent System Components.md
    ├── 03 Designing Agent Systems.md
    └── 04 Agent Frameworks.md
```

→ Use subdirectories when there are 3+ clearly distinct topic groups.

### Large Wiki (many complex topics)

```
technology/spring-framework/
├── 00 MOC.md
├── 01 Core/
│   ├── 01 IoC and DI.md
│   ├── 02 Bean Lifecycle.md
│   └── 03 AOP.md
├── 02 Web/
│   ├── 01 Spring MVC.md
│   └── 02 REST API.md
├── 03 Data/
│   ├── 01 Spring Data JPA.md
│   └── 02 Transaction Management.md
└── 04 Security/
    └── 01 Spring Security.md
```

---

## Topic Grouping Guide

Divide content into subdirectories based on the natural **understanding progression**:

| Grouping Pattern | When to Use |
|---|---|
| Introduction → Concepts → Practice | New framework or technology |
| History → Concepts → Implementation | Technology with important historical context |
| Basics → Advanced → Reference | Tutorial or course material |
| Architecture → Components → Operations | Infrastructure/platform tools |
| Theory → Patterns → Tools | AI, ML, software architecture |

---

## Wikilinks

Obsidian resolves `[[File Name]]` based on the **base filename**, not the full path. This means:
- `[[01 Architecture and Concepts]]` resolves to `01 Architecture and Concepts.md` wherever it is
- No need to write the full path as long as the filename is unique across the vault
- If duplicate names exist in the vault, write the relative path: `[[Folder/File Name]]`

---

## When to Create a New File vs Add a Section

| Situation | Decision |
|---|---|
| Topic can stand alone, has 3+ headings | Create new file |
| Topic is a detail of a parent topic | Add section to existing file |
| Topic is frequently referenced from other notes | Create its own file for easy linking |
| Content < 150 words | Merge with related note |

---

## Update Index After Creating Wiki

After the wiki is done, update the `00 Index.md` file in the parent directory.

New entry format:

```markdown
## {Technology Name}

- `{wiki-directory}/` — {one-sentence description}
  - [[00 MOC]] — hub for all {technology} topics
```

Or for a technology already in the index, add wikilinks to new notes under the existing entry.
