# PARA Classify

Reclassify folders that don't yet have a PARA state, or are still `unknown`.

> For new folders: classification is already integrated into `obs-ctx init`, not here.
> This workflow is for: old folders not yet migrated, or reclassifying an existing one.

## Flow

### 1. Scan

Run a scan to get the list of `unclassified` folders:

```
node .claude/scripts/vault.js scan
```

Filter the JSON output: take entries whose `anomalies` contains `"unclassified"`.

### 2. Show the List

```
Unclassified folders (N):

1. technology/ai-setup/
2. learning/some-course/
3. work/google-workspace/

Process all? (y / pick numbers / space-separated)
```

### 3. Per Folder — Suggest + Confirm

For each selected folder:
1. Read the entry's details from the index:
   ```
   node .claude/scripts/vault.js para get <folder>
   ```
2. Read the CLAUDE.md **content** (notes, folder description) — direct read for content analysis
3. Read `references/criteria.md` → apply the criteria → determine a suggestion + short reason
   If the signal isn't clear enough → read `references/para-method.md` for deeper context before deciding
4. Display inline:

```
📌 technology/ai-setup/
   Suggest : resource
   Reason  : a collection of setup notes and technical references, no deadline
   Confirm? (y / project / area / archive / unknown)
```

5. Wait for user input per folder — never batch without confirmation

### 4. Execute

Once all folders are confirmed, update via script:

```
node .claude/scripts/vault.js para set "<folder>" <state>
```

The script handles all cases: update an existing `para:`, add to existing frontmatter, or create new frontmatter.

Show a summary:
```
✅ Classified: 3 folders
   technology/ai-setup/         → resource
   learning/some-course/        → area
   work/google-workspace/       → area
```

## Rules

- Never update without per-folder user confirmation
- Never change CLAUDE.md content other than the `para` frontmatter field
- If user input is invalid → ask again, don't skip
