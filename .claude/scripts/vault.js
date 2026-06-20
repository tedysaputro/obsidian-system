#!/usr/bin/env node
'use strict';

// vault.js — Obsidian System vault management CLI
// All vault file I/O (index, context.md, para frontmatter, anomaly diagnostics) lives here.
// Skills call this script — they do not write vault files directly.
//
// Usage:
//   node .claude/scripts/vault.js index init
//   node .claude/scripts/vault.js index list [--names]
//   node .claude/scripts/vault.js index get <name-or-folder>
//   node .claude/scripts/vault.js index add <name> <folder> [--para <state>] [--description <text>] [--parent <name>]
//   node .claude/scripts/vault.js index remove <name>
//   node .claude/scripts/vault.js ctx init <name-or-folder>
//   node .claude/scripts/vault.js ctx read <name-or-folder> [--recent N|all] [--open-limit N]
//   node .claude/scripts/vault.js ctx status <name-or-folder> --text <text>
//   node .claude/scripts/vault.js ctx session <name-or-folder> --date <date> --title <title> --summary <text> [--discussion <path>]
//   node .claude/scripts/vault.js para get <name-or-folder>
//   node .claude/scripts/vault.js para set <name-or-folder> <state>
//   node .claude/scripts/vault.js scan
//   node .claude/scripts/vault.js diagnose <name-or-folder>

const fs   = require('fs');
const path = require('path');

// VAULT_ROOT = two levels above this script (.claude/scripts/ → .claude/ → vault root)
const VAULT_ROOT = path.resolve(__dirname, '../..');
const INDEX_PATH = path.join(VAULT_ROOT, '_index.yml');

const VALID_PARA = ['project', 'area', 'resource', 'archive', 'unknown'];

// Section names used in context.md — edit here if your vault uses a different language
const SECTIONS = {
  status: '## Status',
  activeResources: '## Active Resources',
  openItems: '## Open Items',
  lastSession: '## Last Session',
};

const CTX_TEMPLATE = [
  SECTIONS.status,
  '',
  SECTIONS.activeResources,
  '',
  SECTIONS.openItems,
  '',
  SECTIONS.lastSession,
  '',
].join('\n');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function die(msg) { process.stderr.write(msg + '\n'); process.exit(1); }

function getArg(args, flag) {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : null;
}

function normFolder(f) {
  return f ? f.replace(/\/$/, '') + '/' : f;
}

// ─── Index parser ─────────────────────────────────────────────────────────────
// Format: flat YAML list. Each entry starts with "- name: X".
// childs: is a list of name strings, not nested objects.

function parseIndex(content) {
  const entries = [];
  let cur = null;
  let inChilds = false;

  for (const raw of content.split('\n')) {
    const line = raw.trimEnd();
    if (line.trim() === '' || line.trim().startsWith('#')) continue;

    const indent = line.match(/^(\s*)/)[1].length;
    const trimmed = line.trim();

    if (line.startsWith('- name:')) {
      if (cur) entries.push(cur);
      cur = { name: line.replace(/^- name:\s*/, '').trim(), folder: null, para: 'unknown', description: null, childs: [] };
      inChilds = false;
    } else if (indent === 2 && cur) {
      if (trimmed === 'childs:') {
        inChilds = true;
      } else {
        inChilds = false;
        const m = trimmed.match(/^([\w-]+):\s*(.*)$/);
        // Accept legacy "dir:" as an alias for "folder:" so older index files keep working.
        if (m) cur[m[1] === 'dir' ? 'folder' : m[1]] = m[2].trim() || null;
      }
    } else if (indent === 4 && inChilds && cur) {
      const m = trimmed.match(/^-\s+(.+)$/);
      if (m) cur.childs.push(m[1].trim());
    }
  }
  if (cur) entries.push(cur);

  return entries.map(e => ({ ...e, folder: normFolder(e.folder) }));
}

// ─── Index serializer ───────────────────────────────────────────────────────────

function serializeIndex(entries) {
  const lines = ['# Vault PARA Index', '# Managed by vault.js — avoid editing by hand unless necessary.', ''];
  for (const e of entries) {
    lines.push('- name: ' + e.name);
    if (e.folder)      lines.push('  folder: ' + e.folder);
    lines.push('  para: ' + (e.para || 'unknown'));
    if (e.description) lines.push('  description: ' + e.description);
    if (e.childs && e.childs.length > 0) {
      lines.push('  childs:');
      for (const c of e.childs) lines.push('    - ' + c);
    }
    lines.push('');
  }
  return lines.join('\n');
}

function readIndex() {
  if (!fs.existsSync(INDEX_PATH)) die('_index.yml not found at vault root. Run: vault.js index init');
  return parseIndex(fs.readFileSync(INDEX_PATH, 'utf8'));
}
function writeIndex(entries)   { fs.writeFileSync(INDEX_PATH, serializeIndex(entries)); }

// ─── Index helpers ────────────────────────────────────────────────────────────

// Normalize name for LIKE lookup: case-insensitive, treats space/dash/underscore
// as equivalent so `obsidian-system` lines up with `Obsidian System`.
function normName(s) {
  return String(s).toLowerCase().replace(/[-_\s]+/g, '-');
}

// Resolve by NAME only. Four outcomes:
//   1. exact name match       → entry
//   2. exactly 1 prefix (LIKE 'q%') hit → entry   ("obsidian-system" → "Obsidian System")
//   3. multiple prefix hits   → die with candidate list  ("obsidian" → error, never a guess)
//   4. 0 hits                 → null  (caller may fall back to findByFolder).
// Ambiguity is an ERROR, not a silent miss — prevents wrong selection across
// all commands (index get, ctx, para, writes all route through resolve()/resolveFolder).
function findByName(entries, query) {
  if (!query) return null;
  const exact = entries.find(e => e.name === query);
  if (exact) return exact;
  const q = normName(query);
  const hits = entries.filter(e => normName(e.name).startsWith(q));
  if (hits.length === 1) return hits[0];
  if (hits.length > 1) die('Ambiguous name "' + query + '" matches: ' + hits.map(h => h.name).join(', '));
  return null;
}

function findByFolder(entries, folder) {
  const f = normFolder(folder);
  return entries.find(e => e.folder === f) || null;
}

function findParent(entries, name) {
  return entries.find(e => (e.childs || []).includes(name)) || null;
}

// Resolve: accept either a name or a folder path
function resolve(entries, nameOrFolder) {
  return findByName(entries, nameOrFolder) || findByFolder(entries, nameOrFolder);
}

// ─── Index commands ───────────────────────────────────────────────────────────

function indexInit() {
  if (fs.existsSync(INDEX_PATH)) die('_index.yml already exists at vault root');
  fs.writeFileSync(INDEX_PATH, ['# Vault PARA Index', '# Managed by vault.js — avoid editing by hand unless necessary.', ''].join('\n'));
  console.log('✅ Created: _index.yml');
}

function indexGet(nameOrFolder) {
  if (!nameOrFolder) die('Usage: vault.js index get <name-or-folder>');
  const entries = readIndex();
  const entry   = resolve(entries, nameOrFolder);
  if (!entry) die('Entry "' + nameOrFolder + '" not found');
  const parent  = (findParent(entries, entry.name) || {}).name || null;
  console.log(JSON.stringify({ ...entry, parent }, null, 2));
}

function indexList(args) {
  args = args || [];
  const entries = readIndex();
  // Enrich each entry with parent name
  const result = entries.map(e => ({
    ...e,
    parent: (findParent(entries, e.name) || {}).name || null,
  }));
  if (args.indexOf('--names') >= 0) {
    // Compact mode: name | para | folder | parent only — for switch menus.
    // Trades full descriptions/childs for ~5x smaller output.
    for (const e of result) {
      console.log(e.para.padEnd(8) + ' ' + (e.parent || '-').padEnd(20) + ' ' + e.name + '  →  ' + e.folder);
    }
    return;
  }
  console.log(JSON.stringify(result, null, 2));
}

function indexAdd(name, folder, args) {
  if (!name || !folder) die('Usage: vault.js index add <name> <folder> [--para <state>] [--description <text>] [--parent <name>]');
  const para        = getArg(args, '--para') || 'unknown';
  const description = getArg(args, '--description') || null;
  const parent      = getArg(args, '--parent') || null;

  if (!VALID_PARA.includes(para)) die('Invalid para: ' + para + '. Valid: ' + VALID_PARA.join(', '));

  const entries = readIndex();
  if (findByName(entries, name)) die('Entry "' + name + '" already exists');

  entries.push({ name, folder: normFolder(folder), para, description, childs: [] });

  if (parent) {
    const p = findByName(entries, parent);
    if (!p) die('Parent "' + parent + '" not found');
    if (!p.childs.includes(name)) p.childs.push(name);
  }

  writeIndex(entries);
  console.log('✅ Added: ' + name + ' → ' + normFolder(folder) + (parent ? ' (child of ' + parent + ')' : ''));
}

function indexRemove(name) {
  if (!name) die('Usage: vault.js index remove <name>');
  const entries = readIndex();
  const idx = entries.findIndex(e => e.name === name);
  if (idx < 0) die('Entry "' + name + '" not found');

  entries.splice(idx, 1);
  // Remove from any childs list
  for (const e of entries) {
    e.childs = (e.childs || []).filter(c => c !== name);
  }

  writeIndex(entries);
  console.log('✅ Removed: ' + name);
}

// ─── Context ──────────────────────────────────────────────────────────────────

function resolveFolder(nameOrFolder) {
  // If it looks like a path (contains /) use as-is, else look up in index
  if (nameOrFolder.includes('/')) return normFolder(nameOrFolder);
  const entries = readIndex();
  const e = findByName(entries, nameOrFolder);
  if (!e || !e.folder) die('Entry "' + nameOrFolder + '" not found in index');
  return e.folder;
}

function parseSections(content) {
  const sections = {};
  let cur = null;
  const buf = [];
  for (const line of content.split('\n')) {
    if (line.startsWith('## ')) {
      if (cur) sections[cur] = buf.join('\n').trim();
      cur = line.trim(); buf.length = 0;
    } else if (cur) buf.push(line);
  }
  if (cur) sections[cur] = buf.join('\n').trim();
  return sections;
}

function ctxInit(nameOrFolder) {
  if (!nameOrFolder) die('Usage: vault.js ctx init <name-or-folder>');
  const folder    = resolveFolder(nameOrFolder);
  const absFolder = path.join(VAULT_ROOT, folder);
  const ctxPath   = path.join(absFolder, 'context.md');
  if (fs.existsSync(ctxPath)) die('context.md already exists at ' + folder);
  if (!fs.existsSync(absFolder)) fs.mkdirSync(absFolder, { recursive: true });
  fs.writeFileSync(ctxPath, CTX_TEMPLATE);
  console.log('✅ Created: ' + folder + 'context.md');
}

function ctxRead(nameOrFolder, args) {
  if (!nameOrFolder) die('Usage: vault.js ctx read <name-or-folder> [--recent N|all] [--open-limit N]');
  const folder  = resolveFolder(nameOrFolder);
  const ctxPath = path.join(VAULT_ROOT, folder, 'context.md');
  if (!fs.existsSync(ctxPath)) { console.log(JSON.stringify({ error: 'not_found', folder })); return; }
  const sec      = parseSections(fs.readFileSync(ctxPath, 'utf8'));
  const items    = (sec[SECTIONS.openItems] || '').split('\n').filter(l => l.trim().match(/^- \[/));
  const sessions = (sec[SECTIONS.lastSession] || '').split('\n').filter(l => l.trim().startsWith('- '));
  // Default: 3 most recent sessions. lastSession is cumulative — full history gets
  // more expensive to load as a project accumulates sessions over time.
  // Override: --recent all (everything) or --recent N (N most recent, 0 = no sessions).
  const recentArg = getArg(args || [], '--recent');
  let lastSession;
  if (recentArg === 'all') lastSession = sessions;
  else lastSession = sessions.slice(0, recentArg ? parseInt(recentArg, 10) : 3);
  // Open items: split open vs done, default cap 5 open. Override: --open-limit N (0 = all).
  const open    = items.filter(i => !i.trim().match(/^- \[x\]/));
  const done    = items.filter(i =>  i.trim().match(/^- \[x\]/));
  const limitArg = getArg(args || [], '--open-limit');
  const limit    = limitArg ? parseInt(limitArg, 10) : 5;
  const capped   = limit > 0 ? open.slice(0, limit) : open;
  console.log(JSON.stringify({
    folder, status: sec[SECTIONS.status] || '',
    activeResources: sec[SECTIONS.activeResources] || '',
    openItems: capped, lastSession,
    openItemsCount: open.length,
    openItemsCapped: limit > 0 && capped.length < open.length,
    doneItemsCount: done.length,
    sessionCount: sessions.length,
    sessionCapped: lastSession.length < sessions.length,
    allDone: items.length > 0 && items.every(i => i.trim().startsWith('- [x]')),
  }, null, 2));
}

function ctxStatus(nameOrFolder, text) {
  if (!nameOrFolder || !text) die('Usage: vault.js ctx status <name-or-folder> --text <text>');
  const folder  = resolveFolder(nameOrFolder);
  const ctxPath = path.join(VAULT_ROOT, folder, 'context.md');
  if (!fs.existsSync(ctxPath)) die('context.md not found at ' + folder);
  let content = fs.readFileSync(ctxPath, 'utf8');
  const header = SECTIONS.status + '\n';
  if (content.includes(header)) {
    content = content.replace(new RegExp('(' + header.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')[\\s\\S]*?(?=\\n## |\\n*$)'), '$1' + text + '\n');
  } else {
    content = header + text + '\n\n' + content;
  }
  fs.writeFileSync(ctxPath, content);
  console.log('✅ Status updated: ' + folder + 'context.md');
}

function ctxSession(nameOrFolder, args) {
  if (!nameOrFolder) die('Usage: vault.js ctx session <name-or-folder> --date <d> --title <t> --summary <s> [--discussion <p>]');
  const folder     = resolveFolder(nameOrFolder);
  const date       = getArg(args, '--date');
  const title      = getArg(args, '--title');
  const summary    = getArg(args, '--summary');
  const discussion = getArg(args, '--discussion');
  if (!date || !title || !summary) die('--date, --title, --summary are required');

  const ctxPath = path.join(VAULT_ROOT, folder, 'context.md');
  if (!fs.existsSync(ctxPath)) die('context.md not found at ' + folder);

  let content = fs.readFileSync(ctxPath, 'utf8');
  const entry = '- ' + date + ' — ' + title + ': ' + summary + (discussion ? '\n  - ' + discussion : '');
  const header = SECTIONS.lastSession + '\n';
  if (content.includes(header)) {
    content = content.replace(header, header + entry + '\n');
  } else {
    content = content.trimEnd() + '\n\n' + header + entry + '\n';
  }
  fs.writeFileSync(ctxPath, content);
  console.log('✅ Session prepended: ' + folder + 'context.md');
}

// ─── Para ─────────────────────────────────────────────────────────────────────

function parseFrontmatter(content) {
  if (!content.startsWith('---')) return {};
  const end = content.indexOf('\n---', 3);
  if (end < 0) return {};
  const result = {};
  let listKey = null;
  for (const line of content.slice(4, end).split('\n')) {
    const listItem = line.match(/^\s{2}-\s+(.+)$/);
    if (listItem && listKey) { result[listKey].push(listItem[1].trim()); continue; }
    listKey = null;
    const scalar = line.match(/^([\w-]+):\s+(.+)$/);
    if (scalar) { result[scalar[1]] = scalar[2].trim(); continue; }
    const listStart = line.match(/^([\w-]+):\s*$/);
    if (listStart) { result[listStart[1]] = []; listKey = listStart[1]; }
  }
  return result;
}

function paraGet(nameOrFolder) {
  if (!nameOrFolder) die('Usage: vault.js para get <name-or-folder>');
  const folder      = resolveFolder(nameOrFolder);
  const claudePath  = path.join(VAULT_ROOT, folder, 'CLAUDE.md');
  if (!fs.existsSync(claudePath)) { console.log(JSON.stringify({ error: 'no_claude_md', folder })); return; }
  const fm = parseFrontmatter(fs.readFileSync(claudePath, 'utf8'));
  console.log(JSON.stringify({ folder, para: fm.para || null, area: fm.area || null }));
}

function paraSet(nameOrFolder, state) {
  if (!nameOrFolder || !state) die('Usage: vault.js para set <name-or-folder> <state>');
  if (!VALID_PARA.includes(state)) die('Invalid para: ' + state);

  const entries = readIndex();
  const entry   = resolve(entries, nameOrFolder);
  if (!entry) die('Entry "' + nameOrFolder + '" not found in index');

  // Update _index.yml
  entry.para = state;
  writeIndex(entries);

  // Update CLAUDE.md if it exists
  const claudePath = path.join(VAULT_ROOT, entry.folder, 'CLAUDE.md');
  if (fs.existsSync(claudePath)) {
    let content = fs.readFileSync(claudePath, 'utf8');
    if (content.startsWith('---')) {
      content = /^para:\s*.+$/m.test(content)
        ? content.replace(/^para:\s*.+$/m, 'para: ' + state)
        : content.replace(/^---\n/, '---\npara: ' + state + '\n');
    } else {
      content = '---\npara: ' + state + '\n---\n\n' + content;
    }
    fs.writeFileSync(claudePath, content);
    console.log('✅ para: ' + state + ' → ' + entry.name + ' (index + CLAUDE.md)');
  } else {
    console.log('✅ para: ' + state + ' → ' + entry.name + ' (index only — no CLAUDE.md)');
  }
}

// ─── Diagnose ─────────────────────────────────────────────────────────────────
// Read-only mechanical triage per entry + its CLAUDE.md chain.
// Mechanical = field/section existence + registration checks. No content analysis.
// Returns JSON: { name, folder, para, parent, chain, anomalies: [{code, fix}] }
//
// Anomaly codes:
//   broken_entry          — folder doesn't exist or has no CLAUDE.md
//   missing_context       — no context.md
//   para_unknown          — para: unknown
//   para_drift            — index.para !== CLAUDE.md frontmatter.para
//   missing_area          — frontmatter has no field 'area'
//   invalid_area          — area path has no CLAUDE.md (broken chain link)
//   missing_resources     — para is project|area but no 'resources:' in frontmatter
//   missing_memory_section — CLAUDE.md has no '## Memory' section
//   missing_child_contexts_section — entry has childs but parent CLAUDE.md lacks '## Child Contexts'
//   final_override_present — child has section with same name as ancestor @Final section
//   abstract_unimplemented — ancestor @Abstract section, no child in chain implements it

function walkChain(entries, entry) {
  const chain = [];
  let cur = entry;
  while (cur) {
    chain.unshift(cur.name);
    cur = findParent(entries, cur.name);
  }
  chain.unshift('root');
  return chain;
}

// Parse sections from full chain CLAUDE.md files, collecting annotated sections
// (@Final / @Abstract). Section names are compared case-insensitively between
// ancestor and descendant to detect overrides / missing implementations.
function parseAnnotation(headers) {
  const regex = /^## (.+?) (`@Final`|`@Abstract`)$/;
  const m = headers.match(regex);
  if (!m) return null;
  return { name: m[1].trim(), kind: m[2] === '`@Final`' ? 'Final' : 'Abstract' };
}

// Section-name-only comparison: strip annotation markers from headers.
function sectionName(h) {
  const m = h.match(/^## (.+?)(?: `@Final`| `@Abstract`)?$/);
  return m ? m[1].trim().toLowerCase() : h.toLowerCase();
}

function diagnose(nameOrFolder) {
  if (!nameOrFolder) die('Usage: vault.js diagnose <name-or-folder>');
  const entries = readIndex();
  const entry   = resolve(entries, nameOrFolder);
  if (!entry) die('Entry "' + nameOrFolder + '" not found');

  const chain    = walkChain(entries, entry);
  const parent   = chain[chain.length - 2]; // second-to-last in ["root", ..., entry.name]
  const anomalies = [];

  const absFolder  = path.join(VAULT_ROOT, entry.folder);
  const claudePath = path.join(absFolder, 'CLAUDE.md');
  const ctxPath    = path.join(absFolder, 'context.md');

  // ── Entry-level checks ──────────────────────────────────────────────────

  if (!fs.existsSync(absFolder)) {
    anomalies.push({ code: 'broken_entry_folder_missing', fix: 'obs-ctx fix' });
    // No point checking further
    const result = { name: entry.name, folder: entry.folder, para: entry.para,
                     parent: findParent(entries, entry.name)?.name || null,
                     chain, anomalies };
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (!fs.existsSync(claudePath)) {
    anomalies.push({ code: 'broken_entry', fix: 'obs-ctx fix (create CLAUDE.md or remove the entry)' });
    const result = { name: entry.name, folder: entry.folder, para: entry.para,
                     parent: findParent(entries, entry.name)?.name || null,
                     chain, anomalies };
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  const claudeContent = fs.readFileSync(claudePath, 'utf8');
  const fm            = parseFrontmatter(claudeContent);
  const sections      = parseSections(claudeContent);

  // para_unknown
  if (entry.para === 'unknown') {
    anomalies.push({ code: 'para_unknown', fix: '/para classify' });
  }

  // para_drift: index vs CLAUDE.md
  if (fm.para && fm.para !== entry.para) {
    anomalies.push({ code: 'para_drift', fix: 'vault.js para set ' + fm.para });
  }

  // missing_area
  if (!fm.area) {
    anomalies.push({ code: 'missing_area', fix: 'obs-ctx fix (set during init)' });
  } else {
    // invalid_area: area path must have its own CLAUDE.md
    const areaPath = path.join(VAULT_ROOT, normFolder(fm.area), 'CLAUDE.md');
    if (!fs.existsSync(areaPath)) {
      anomalies.push({ code: 'invalid_area', fix: 'obs-ctx fix (area path has no CLAUDE.md)' });
    }
  }

  // missing_resources
  if (['project', 'area'].includes(entry.para)) {
    const res = fm.resources;
    if (!res || (Array.isArray(res) && res.length === 0)) {
      anomalies.push({ code: 'missing_resources', fix: 'obs-ctx fix (resource suggestion flow)' });
    }
  }

  // missing_memory_section
  if (!sections['## Memory']) {
    anomalies.push({ code: 'missing_memory_section', fix: 'obs-ctx fix (add a ## Memory pointer)' });
  }

  // missing_child_contexts
  if (entry.childs && entry.childs.length > 0) {
    const hasChildSection = Object.keys(sections).some(h => h.startsWith('## Child Context'));
    if (!hasChildSection) {
      anomalies.push({ code: 'missing_child_contexts_section', fix: 'obs-ctx fix (add ## Child Contexts)' });
    }
  }

  // missing_context
  if (!fs.existsSync(ctxPath)) {
    anomalies.push({ code: 'missing_context', fix: 'vault.js ctx init' });
  }

  // ── Chain-level checks (@Final / @Abstract) ─────────────────────────────

  // Walk from entry up to root: collect @Final annotations from ancestors.
  // Check if any child duplicates the section name (flag final_override_present).
  // Check if any @Abstract from ancestors has no implementation in the chain.

  const chainFiles = []; // [{ claudePath, absFolder, name, fm }]
  // root
  chainFiles.push({ claudePath: path.join(VAULT_ROOT, 'CLAUDE.md'), absFolder: VAULT_ROOT, name: 'root' });
  // entries in chain (skip root)
  const chainNames = chain.slice(1); // e.g. ["work", "my-project"]
  for (const cn of chainNames) {
    const ce = findByName(entries, cn);
    if (!ce) continue;
    const cdAbs = path.join(VAULT_ROOT, ce.folder);
    chainFiles.push({ claudePath: path.join(cdAbs, 'CLAUDE.md'), absFolder: cdAbs, name: cn });
  }

  // Collect @Final sections from ancestors (everything except the entry itself)
  const finalSections  = []; // [{ name, kind, declaredBy }]
  const abstractOnly   = []; // [{ name, kind, declaredBy }]

  for (const cf of chainFiles) {
    if (!fs.existsSync(cf.claudePath)) continue;
    const content  = fs.readFileSync(cf.claudePath, 'utf8');
    const headers  = content.split('\n').filter(l => /^## /.test(l.trim()));
    const isEntry = cf.name === entry.name;
    for (const h of headers) {
      const ann = parseAnnotation(h.trim());
      if (!ann) continue;
      if (ann.kind === 'Final') {
        finalSections.push({ ...ann, declaredBy: cf.name });
      } else if (ann.kind === 'Abstract') {
        abstractOnly.push({ ...ann, declaredBy: cf.name });
      }
    }

    // Check final_override: the entry has a section with the SAME name as an
    // ancestor @Final section. Only ancestors (not the entry itself) are checked.
    if (!isEntry) {
      const entrySections = parseSections(content);
      for (const fs of finalSections) {
        // Check if this ancestor file has a non-annotated section matching the @Final name
        for (const sh of Object.keys(entrySections)) {
          if (sectionName(sh) === fs.name.toLowerCase()) {
            // This file has the section — check if it's annotated (identical)
            // or just a regular section with same name (different content).
            // Either way, it's worth flagging for human to judge.
            // Only flag if the matching section is in the TARGET entry, not this intermediate ancestor.
          }
        }
      }
    }
  }

  // final_override_present: does the target entry (child) have a section
  // whose normalized name matches any ancestor @Final section?
  if (fs.existsSync(claudePath)) {
    const entrySections = Object.keys(parseSections(fs.readFileSync(claudePath, 'utf8')));
    const ancestorsWithFinal = finalSections.filter(fs => fs.declaredBy !== entry.name);
    for (const af of ancestorsWithFinal) {
      for (const es of entrySections) {
        if (sectionName(es) === af.name.toLowerCase()) {
          anomalies.push({
            code: 'final_override_present',
            detail: 'Section "' + es + '" matches ancestor @Final "' + af.name + '" from ' + af.declaredBy,
            fix: 'obs-ctx fix (judge identical-vs-different)',
          });
          break;
        }
      }
    }
  }

  // abstract_unimplemented: ancestor @Abstract section, does any descendant
  // in the chain (including entry) implement it?
  for (const ao of abstractOnly) {
    if (ao.declaredBy === entry.name) continue; // only check ancestors
    let implemented = false;
    // Check all chain files from the abstract's position downward
    const abstractIdx = chainFiles.findIndex(cf => cf.name === ao.declaredBy);
    for (let i = abstractIdx + 1; i < chainFiles.length; i++) {
      const cf = chainFiles[i];
      if (!fs.existsSync(cf.claudePath)) continue;
      const cfSections = parseSections(fs.readFileSync(cf.claudePath, 'utf8'));
      for (const sh of Object.keys(cfSections)) {
        if (sectionName(sh) === ao.name.toLowerCase()) {
          implemented = true;
          break;
        }
      }
      if (implemented) break;
    }
    if (!implemented) {
      // Check if the abstract section also appears in the target (partial override)
      const entrySections = parseSections(fs.existsSync(claudePath) ? fs.readFileSync(claudePath, 'utf8') : '');
      const hasMatch = Object.keys(entrySections).some(sh => sectionName(sh) === ao.name.toLowerCase());
      anomalies.push({
        code: 'abstract_unimplemented',
        detail: 'Ancestor "' + ao.declaredBy + '" has @Abstract "' + ao.name + '" — no descendant implements it',
        partial: hasMatch,
        fix: 'obs-ctx fix (add a stub/override in the chain)',
      });
    }
  }

  // Deduplicate anomalies by code
  const seen = new Set();
  const unique = [];
  for (const a of anomalies) {
    const key = a.code + (a.detail || '');
    if (!seen.has(key)) { seen.add(key); unique.push(a); }
  }

  const result = {
    name: entry.name,
    folder: entry.folder,
    para: entry.para,
    parent: findParent(entries, entry.name)?.name || null,
    chain,
    anomalies: unique,
  };
  console.log(JSON.stringify(result, null, 2));
}

// ─── Scan ─────────────────────────────────────────────────────────────────────

const DEADLINE_RE = /deadline|target date|due:|sprint \d|milestone/i;

function scan() {
  const entries = readIndex();
  const now     = new Date();
  const results = [];

  for (const e of entries) {
    const absFolder = path.join(VAULT_ROOT, e.folder);
    const result    = {
      name: e.name, folder: e.folder, para: e.para,
      parent: (findParent(entries, e.name) || {}).name || null,
      anomalies: [],
    };

    if (!fs.existsSync(absFolder))                      { result.anomalies.push('residual');     results.push(result); continue; }

    const claudePath = path.join(absFolder, 'CLAUDE.md');
    if (!fs.existsSync(claudePath))                     { result.anomalies.push('broken_entry'); results.push(result); continue; }

    const claudeContent = fs.readFileSync(claudePath, 'utf8');
    const fm = parseFrontmatter(claudeContent);

    // para drift: index says X but CLAUDE.md says Y
    if (fm.para && fm.para !== e.para) result.anomalies.push('para_drift');

    if (e.para === 'unknown') result.anomalies.push('unclassified');

    if (e.para === 'area' && DEADLINE_RE.test(claudeContent)) result.anomalies.push('might_be_project');

    if (['project', 'area'].includes(e.para)) {
      const res = fm.resources;
      if (!res || (Array.isArray(res) && res.length === 0)) result.anomalies.push('missing_resources');
    }

    const ctxPath = path.join(absFolder, 'context.md');
    if (!fs.existsSync(ctxPath))                        { result.anomalies.push('missing_context'); results.push(result); continue; }

    const sec      = parseSections(fs.readFileSync(ctxPath, 'utf8'));
    const items    = (sec[SECTIONS.openItems] || '').split('\n').filter(l => l.trim().match(/^- \[/));
    const sessions = (sec[SECTIONS.lastSession] || '').split('\n').filter(l => l.trim().match(/^- \d{4}-\d{2}-\d{2}/));

    if (items.length > 0 && items.every(i => i.trim().startsWith('- [x]'))) result.anomalies.push('all_done');

    if (sessions.length > 0) {
      const m = sessions[0].match(/^-\s+(\d{4}-\d{2}-\d{2})/);
      if (m) {
        const days = Math.floor((now - new Date(m[1])) / 86400000);
        if (days > 30) { result.anomalies.push('inactive'); result.lastActivity = m[1]; result.inactiveDays = days; }
      }
    } else if (e.para === 'project') {
      result.anomalies.push('inactive'); result.lastActivity = null; result.inactiveDays = null;
    }

    results.push(result);
  }

  console.log(JSON.stringify(results, null, 2));
}

// ─── Router ───────────────────────────────────────────────────────────────────

const [,, cmd, sub, ...rest] = process.argv;

switch (cmd) {
  case 'index':
    if      (sub === 'init')   indexInit();
    else if (sub === 'list')   indexList(rest);
    else if (sub === 'get')    indexGet(rest[0]);
    else if (sub === 'add')    indexAdd(rest[0], rest[1], rest.slice(2));
    else if (sub === 'remove') indexRemove(rest[0]);
    else die('Usage: vault.js index <init|list|get|add|remove> [args]');
    break;
  case 'ctx': {
    const target = rest[0];
    if      (sub === 'init')    ctxInit(target);
    else if (sub === 'read')    ctxRead(target, rest.slice(1));
    else if (sub === 'status')  ctxStatus(target, getArg(rest.slice(1), '--text'));
    else if (sub === 'session') ctxSession(target, rest.slice(1));
    else die('Usage: vault.js ctx <init|read|status|session> <name-or-folder> [options]');
    break;
  }
  case 'para':
    if      (sub === 'get') paraGet(rest[0]);
    else if (sub === 'set') paraSet(rest[0], rest[1]);
    else die('Usage: vault.js para <get|set> <name-or-folder> [state]');
    break;
  case 'scan':
    scan();
    break;
  case 'diagnose':
    diagnose(sub);
    break;
  default:
    die('Commands: index, ctx, para, scan, diagnose');
}
