# PARA Archive

Transition a folder from an active state to `archive`.

## Flow

### 1. Determine the Target

Input can be:
- Explicit folder path: `para archive work/projects/my-project/`
- Project name: `para archive my-project`
- Current obs-ctx context: `archive this project` (use the currently active project)

If the input is ambiguous → show the list of active projects/areas, ask the user to pick.

### 2. Validate

Read state from the index:
```
node .claude/scripts/vault.js para get <folder>
```
Output is JSON — read the `para` field.
- If `para: archive` → inform the user, nothing to do
- If `para: unknown` → warn, suggest classifying first
- If `para: project` or `para: area` → continue to preview

### 3. Preview

```
📦 Archive: work/projects/my-project/

Will change:
- CLAUDE.md frontmatter: para: project → archive

Will NOT change:
- CLAUDE.md content
- context.md
- Sub-folders (each manages its own state)

Confirm? (y/n)
```

### 4. Execute

If `y`:
1. Update state via script:
   ```
   node .claude/scripts/vault.js para set <folder> archive
   ```
2. Confirm:

```
✅ Archived: my-project → para: archive
```

3. Check obs-ctx context — if this folder is the currently active project:

```
⚠️  my-project is the active context — obs-ctx switch to a different project?
```

If the user says `y` → trigger the obs-ctx switch flow.
If `n` → done.

## Rules

- No cascade to sub-folders — each folder manages its own state
- Never delete or move any files — only updates frontmatter
- Always show a preview before executing
- Don't archive a folder with `para: unknown` — ask to classify first
