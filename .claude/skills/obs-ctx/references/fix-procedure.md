# Fix Procedure — obs-ctx

Run after the user confirms `y` from the diagnosis prompt.
Order: **Phase 1 (project level)** first, then **Phase 2 (chain alignment)**.

> Show the diff before writing. Don't write without per-item confirmation.

## Phase 1 — Project Level

1. **Move static content from context.md → CLAUDE.md**
   Remove from context.md, add to the appropriate section in CLAUDE.md.

2. **Move dynamic state from CLAUDE.md → context.md**
   Remove from CLAUDE.md, add to context.md.

3. **Remove duplication**
   Keep it in CLAUDE.md, remove from context.md.

4. **Complete an empty CLAUDE.md**
   Ask the user: Stack, Folder Structure, Conventions. Generate from the template (`references/templates.md`).

5. **Create missing files**
   - context.md:
     ```
     node .claude/scripts/vault.js ctx init "<folder>"
     ```
   - CLAUDE.md → generate from user input using the template

6. **Migrate PARA state** — if `para: unknown`:
   Delegate to `/para classify` for this folder.

7. **Add missing `resources:`** — if `para: project` or `para: area` and `resources:` is empty/absent:
   1. Read this context's CLAUDE.md — understand the tech stack, domain, and main topics
   2. Run a scan to get the list of contexts with `para: resource`:
      ```
      node .claude/scripts/vault.js index list
      ```
      Filter: take entries with `para: resource`.
   3. Cross-match: pick resources relevant to the context's domain/tech stack
   4. Show the suggestion to the user:
      ```
      💡 Resources for [Context]:
         Suggested based on tech stack and domain:
         1. technology/spring/      (Spring Boot)
         2. technology/quarkus/     (Quarkus)
         3. literature/kubernetes/  (Kubernetes)

         Pick the relevant ones (number/space-separated/'all'/'skip'):
      ```
   5. Wait for user confirmation — don't write without approval
   6. Write to the `resources:` frontmatter field in CLAUDE.md via Edit

## Phase 2 — Chain Alignment (OOP)

7. **Register the child in the parent** — if it isn't already in the parent's index entry:
   ```
   node .claude/scripts/vault.js index add <name> <folder> --parent <parent-name>
   ```
   The topology section in the parent's CLAUDE.md → edit directly (descriptive content, not structured data).

8. **Fix a missing or invalid `area:`**
   Set `area:` to the path of the nearest parent that has a CLAUDE.md.

9. **Fulfill `@Abstract`** — the parent has an `@Abstract` section not yet implemented:
   Add a stub section to the project's CLAUDE.md with placeholder content + a reference to the parent.

10. **Remove an `@Final` override** — the child duplicates an `@Final` section from the parent:
    - Content is identical → remove from the child (the parent is sufficient)
    - Content differs → flag to the user: revert to parent or promote to `@Abstract`?

11. **Align conventions** — the parent defines conventions the child doesn't mention:
    - Add `## Conventions` to the child context: "Follows the parent context's conventions."
    - Or, if there's a real difference → document the override
