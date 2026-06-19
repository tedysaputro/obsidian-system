#!/usr/bin/env node
'use strict';

// vault.js — Obsidian System vault management CLI
// All vault file I/O (index, context.md, para frontmatter, anomaly scan) lives here.
// Skills call this script — they do not write vault files directly.
//
// See docs/vault-cli.md for the complete reference.
//
// Usage:
//   node .claude/scripts/vault.js index init
//   node .claude/scripts/vault.js index list
//   node .claude/scripts/vault.js index get <name-or-folder>
//   node .claude/scripts/vault.js index add <name> <folder> [--para <state>] [--description <text>] [--parent <name>]
//   node .claude/scripts/vault.js index remove <name>
//   node .claude/scripts/vault.js ctx init <name-or-folder>
//   node .claude/scripts/vault.js ctx read <name-or-folder>
//   node .claude/scripts/vault.js ctx status <name-or-folder> --text <text>
//   node .claude/scripts/vault.js ctx session <name-or-folder> --date <date> --title <title> --summary <text> [--discussion <path>]
//   node .claude/scripts/vault.js para get <name-or-folder>
//   node .claude/scripts/vault.js para set <name-or-folder> <state>
//   node .claude/scripts/vault.js scan

const fs = require('fs');
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function die(msg) {
  process.stderr.write(msg + '\n');
  process.exit(1);
}

function getArg(args, flag) {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : null;
}

function normFolder(f) {
  return f ? f.replace(/\/$/, '') + '/' : f;
}

// ─── Index parser ───────────────────────────────────────────────────────────
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
        if (m) cur[m[1] === 'folder' || m[1] === 'dir' ? 'folder' : m[1]] = m[2].trim() || null;
      }
    } else if (indent === 4 && inChilds && cur) {
      const m = trimmed.match(/^-\s+(.+)$/);
      if (m) cur.childs.push(m[1].trim());
    }
  }
  if (cur) entries.push(cur);

  return entries.map(e => ({ ...e, folder: normFolder(e.folder) }));
}

// ─── Index serializer ────────────────────────────────────────────────────────

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
function writeIndex(entries) { fs.writeFileSync(INDEX_PATH, serializeIndex(entries)); }

// ─── Index helpers ───────────────────────────────────────────────────────────

function findByName(entries, name) {
  return entries.find(e => e.name === name) || null;
}

function findByFolder(entries, folder) {
  const f = normFolder(folder);
  return entries.find(e => e.folder === f) || null;
}

function findParent(entries, name) {
  return entries.find(e => (e.childs || []).includes(name)) || null;
}

// Accept either a registered name or a folder path
function resolve(entries, nameOrFolder) {
  return findByName(entries, nameOrFolder) || findByFolder(entries, nameOrFolder);
}

// ─── Index commands ──────────────────────────────────────────────────────────

function indexInit() {
  if (fs.existsSync(INDEX_PATH)) die('_index.yml already exists at vault root');
  fs.writeFileSync(INDEX_PATH, ['# Vault PARA Index', '# Managed by vault.js — avoid editing by hand unless necessary.', ''].join('\n'));
  console.log('✅ Created: _index.yml');
}

function indexGet(nameOrFolder) {
  if (!nameOrFolder) die('Usage: vault.js index get <name-or-folder>');
  const entries = readIndex();
  const entry = resolve(entries, nameOrFolder);
  if (!entry) die('Entry "' + nameOrFolder + '" not found');
  const parent = (findParent(entries, entry.name) || {}).name || null;
  console.log(JSON.stringify({ ...entry, parent }, null, 2));
}

function indexList() {
  const entries = readIndex();
  const result = entries.map(e => ({
    ...e,
    parent: (findParent(entries, e.name) || {}).name || null,
  }));
  console.log(JSON.stringify(result, null, 2));
}

function indexAdd(name, folder, args) {
  if (!name || !folder) die('Usage: vault.js index add <name> <folder> [--para <state>] [--description <text>] [--parent <name>]');
  const para        = getArg(args, '--para') || 'unknown';
  const description = getArg(args, '--description') || null;
  const parent       = getArg(args, '--parent') || null;

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
  for (const e of entries) {
    e.childs = (e.childs || []).filter(c => c !== name);
  }

  writeIndex(entries);
  console.log('✅ Removed: ' + name);
}

// ─── Context ─────────────────────────────────────────────────────────────────

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
  let current = null;
  const buf = [];
  for (const line of content.split('\n')) {
    if (line.startsWith('## ')) {
      if (current) sections[current] = buf.join('\n').trim();
      current = line.trim();
      buf.length = 0;
    } else if (current) {
      buf.push(line);
    }
  }
  if (current) sections[current] = buf.join('\n').trim();
  return sections;
}

function ctxInit(nameOrFolder) {
  if (!nameOrFolder) die('Usage: vault.js ctx init <name-or-folder>');
  const folder = resolveFolder(nameOrFolder);
  const absFolder = path.join(VAULT_ROOT, folder);
  const ctxPath = path.join(absFolder, 'context.md');
  if (fs.existsSync(ctxPath)) die('context.md already exists at ' + folder);
  if (!fs.existsSync(absFolder)) fs.mkdirSync(absFolder, { recursive: true });
  fs.writeFileSync(ctxPath, CTX_TEMPLATE);
  console.log('✅ Created: ' + folder + 'context.md');
}

function ctxRead(nameOrFolder) {
  if (!nameOrFolder) die('Usage: vault.js ctx read <name-or-folder>');
  const folder = resolveFolder(nameOrFolder);
  const ctxPath = path.join(VAULT_ROOT, folder, 'context.md');
  if (!fs.existsSync(ctxPath)) {
    console.log(JSON.stringify({ error: 'not_found', folder }));
    return;
  }
  const content = fs.readFileSync(ctxPath, 'utf8');
  const sec = parseSections(content);
  const openItems = (sec[SECTIONS.openItems] || '').split('\n').filter(l => l.trim().match(/^- \[/));
  const lastSession = (sec[SECTIONS.lastSession] || '').split('\n').filter(l => l.trim().startsWith('- '));
  console.log(JSON.stringify({
    folder,
    status: sec[SECTIONS.status] || '',
    activeResources: sec[SECTIONS.activeResources] || '',
    openItems,
    lastSession,
    allDone: openItems.length > 0 && openItems.every(i => i.trim().startsWith('- [x]')),
  }, null, 2));
}

function ctxStatus(nameOrFolder, text) {
  if (!nameOrFolder || text == null) die('Usage: vault.js ctx status <name-or-folder> --text <text>');
  const folder = resolveFolder(nameOrFolder);
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
  if (!nameOrFolder) die('Usage: vault.js ctx session <name-or-folder> --date <date> --title <title> --summary <text> [--discussion <path>]');
  const folder = resolveFolder(nameOrFolder);
  const date = getArg(args, '--date');
  const title = getArg(args, '--title');
  const summary = getArg(args, '--summary');
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

// ─── Para ────────────────────────────────────────────────────────────────────
// para is stored in the index (source of truth) and mirrored to CLAUDE.md
// frontmatter when a CLAUDE.md exists, so `para set` writes both.

function parseFrontmatter(content) {
  if (!content.startsWith('---')) return {};
  const end = content.indexOf('\n---', 3);
  if (end === -1) return {};
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
  const folder = resolveFolder(nameOrFolder);
  const claudePath = path.join(VAULT_ROOT, folder, 'CLAUDE.md');
  if (!fs.existsSync(claudePath)) {
    console.log(JSON.stringify({ error: 'no_claude_md', folder }));
    return;
  }
  const fm = parseFrontmatter(fs.readFileSync(claudePath, 'utf8'));
  console.log(JSON.stringify({ folder, para: fm.para || null, area: fm.area || null }));
}

function paraSet(nameOrFolder, state) {
  if (!nameOrFolder || !state) die('Usage: vault.js para set <name-or-folder> <state>');
  if (!VALID_PARA.includes(state)) die('Invalid state: ' + state + '. Valid: ' + VALID_PARA.join(', '));

  const entries = readIndex();
  const entry = resolve(entries, nameOrFolder);
  if (!entry) die('Entry "' + nameOrFolder + '" not found in index');

  // Update _index.yml (source of truth)
  entry.para = state;
  writeIndex(entries);

  // Mirror to CLAUDE.md if it exists
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

// ─── Scan ────────────────────────────────────────────────────────────────────

const DEADLINE_RE = /deadline|target date|due:|sprint \d|milestone/i;

function scan() {
  const entries = readIndex();
  const now = new Date();
  const results = [];

  for (const e of entries) {
    const absFolder = path.join(VAULT_ROOT, e.folder);
    const result = {
      name: e.name, folder: e.folder, para: e.para, area: null,
      parent: (findParent(entries, e.name) || {}).name || null,
      anomalies: [],
    };

    if (!fs.existsSync(absFolder)) { result.anomalies.push('residual'); results.push(result); continue; }

    const claudePath = path.join(absFolder, 'CLAUDE.md');
    if (!fs.existsSync(claudePath)) { result.anomalies.push('broken_entry'); results.push(result); continue; }

    const claudeContent = fs.readFileSync(claudePath, 'utf8');
    const fm = parseFrontmatter(claudeContent);
    result.area = fm.area || null;

    // para drift: index says X but CLAUDE.md frontmatter says Y
    if (fm.para && fm.para !== e.para) result.anomalies.push('para_drift');

    if (e.para === 'unknown') result.anomalies.push('unclassified');

    if (e.para === 'area' && DEADLINE_RE.test(claudeContent)) result.anomalies.push('might_be_project');

    if (['project', 'area'].includes(e.para)) {
      const res = fm.resources;
      if (!res || (Array.isArray(res) && res.length === 0)) result.anomalies.push('missing_resources');
    }

    const ctxPath = path.join(absFolder, 'context.md');
    if (!fs.existsSync(ctxPath)) { result.anomalies.push('missing_context'); results.push(result); continue; }

    const sec = parseSections(fs.readFileSync(ctxPath, 'utf8'));
    const openItems = (sec[SECTIONS.openItems] || '').split('\n').filter(l => l.trim().match(/^- \[/));
    const lastSessionLines = (sec[SECTIONS.lastSession] || '').split('\n').filter(l => l.trim().match(/^- \d{4}-\d{2}-\d{2}/));

    if (openItems.length > 0 && openItems.every(i => i.trim().startsWith('- [x]'))) {
      result.anomalies.push('all_done');
    }

    if (lastSessionLines.length > 0) {
      const m = lastSessionLines[0].match(/^-\s+(\d{4}-\d{2}-\d{2})/);
      if (m) {
        const days = Math.floor((now - new Date(m[1])) / 86400000);
        if (days > 30) {
          result.anomalies.push('inactive');
          result.lastActivity = m[1];
          result.inactiveDays = days;
        }
      }
    } else if (e.para === 'project') {
      result.anomalies.push('inactive');
      result.lastActivity = null;
      result.inactiveDays = null;
    }

    results.push(result);
  }

  console.log(JSON.stringify(results, null, 2));
}

// ─── Router ──────────────────────────────────────────────────────────────────

const [,, cmd, sub, ...rest] = process.argv;

switch (cmd) {
  case 'index':
    if      (sub === 'init')   indexInit();
    else if (sub === 'list')   indexList();
    else if (sub === 'get')    indexGet(rest[0]);
    else if (sub === 'add')    indexAdd(rest[0], rest[1], rest.slice(2));
    else if (sub === 'remove') indexRemove(rest[0]);
    else die('Usage: vault.js index <init|list|get|add|remove> [args]');
    break;
  case 'ctx': {
    const target = rest[0];
    if      (sub === 'init')    ctxInit(target);
    else if (sub === 'read')    ctxRead(target);
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
  default:
    die('Commands: index, ctx, para, scan\nSee docs/vault-cli.md for full reference.');
}
