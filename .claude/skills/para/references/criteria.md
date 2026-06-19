# PARA Classification Criteria

Apply in order. Stop at the first criterion that's met.

## Decision Tree

```
1. A specific goal that can be finished + a deadline?      → project
2. An ongoing responsibility, continuing indefinitely?      → area
3. Knowledge/reference, no commitment to act?                → resource
4. Inactive / already finished?                              → archive
5. Can't be determined from available info?                  → unknown
```

## Signals from Folder Name

| Pattern                                                                          | Suggest    |
| --------------------------------------------------------------------------------- | ---------- |
| Active verb + deliverable: "Learn X", "Migrate Y", "Set up Z", "Implement A"      | `project`  |
| Static role/domain name: "Infrastructure", "Google Workspace", "Teaching", "Ops"  | `area`     |
| Reference collection: "Books", "Literature", "Technology", "Learning", "Java"     | `resource` |
| Contains an old date, "archived", "done", "old"                                   | `archive`  |

## Signals from CLAUDE.md Content

| Content | Suggest |
|---|---|
| Active open items / tasks in context.md | `project` |
| Active tech stack, sprint, deadline mentioned | `project` |
| Description like "maintains", "keeps", "ensures" with no end point | `area` |
| Description like "reference", "notes", "learning", "exploration" | `resource` |
| Last session > 90 days ago, all items closed | `archive` |

## Concrete Examples

| Folder | Signal | Suggest |
|---|---|---|
| `work/projects/migration/` | Specific deliverable, active sprint | `project` |
| `work/` | Organizational domain, ongoing | `area` |
| `literature/books/` | Reference book collection | `resource` |
| `technology/java/` | Technical reference | `resource` |
| `personal/teaching/` | Ongoing teaching responsibility | `area` |
| `.trash/learn-quarkus` | Inactive, in trash | `archive` |
