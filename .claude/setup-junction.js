#!/usr/bin/env node
// Cross-platform setup: Windows (junction/mklink) + macOS/Linux (symlink)
// Safe to run repeatedly — no-op if links already exist.
//
// What this does:
//   1. Creates a memory junction so Claude Code project memory syncs via
//      cloud storage across machines.
//   2. Creates .agent/ symlinks so skills and config are accessible to
//      non-Claude agent runners that follow the .agent/ convention.
//
// Usage:
//   node .claude/setup-junction.js
//
// Typically triggered automatically via a UserPromptSubmit hook.

const path = require('path');
const fs = require('fs');
const os = require('os');
const { execSync } = require('child_process');

const vaultRoot = path.dirname(__dirname); // __dirname = .claude/
const vaultMemory = path.join(vaultRoot, '.claude', 'memory');

if (!fs.existsSync(vaultMemory)) process.exit(0);

// ── Helper ────────────────────────────────────────────────────────────────────

function link(src, dest, type) {
  if (!fs.existsSync(src)) return;
  try { fs.lstatSync(dest); return; } catch {} // already exists — skip

  fs.mkdirSync(path.dirname(dest), { recursive: true });

  try {
    if (process.platform === 'win32') {
      if (type === 'dir') {
        // Junction: works without admin or Developer Mode
        execSync(`mklink /J "${dest}" "${src}"`, { shell: 'cmd.exe', stdio: 'ignore' });
      } else {
        // Symlink: requires Developer Mode or admin privileges
        try {
          execSync(`mklink "${dest}" "${src}"`, { shell: 'cmd.exe', stdio: 'ignore' });
        } catch {
          // Hard link fallback: no admin needed, but same drive only
          execSync(`mklink /H "${dest}" "${src}"`, { shell: 'cmd.exe', stdio: 'ignore' });
        }
      }
    } else {
      fs.symlinkSync(src, dest);
    }
  } catch (e) {
    process.stderr.write(`[warn] ${path.relative(vaultRoot, dest)}: ${e.message}\n`);
  }
}

// ── 1. Memory junction (Claude Code project memory) ──────────────────────────
// Encodes vault path the way Claude Code does (: / \ → -)

let encoded = vaultRoot.replace(/:/g, '-').replace(/[\\/]/g, '-');
if (encoded.startsWith('-')) encoded = encoded.slice(1);

link(
  vaultMemory,
  path.join(os.homedir(), '.claude', 'projects', encoded, 'memory'),
  'dir'
);

// ── 2. Agent framework symlinks (.agent/) ─────────────────────────────────────
// Exposes Claude artifacts to non-Claude agent runners that follow the
// .agent/ directory convention (e.g. AGENT.md + .agent/skills/).
//
// To add mappings for other agent frameworks, append entries here.

const c = vaultRoot;
const a = path.join(vaultRoot, '.agent');

[
  [path.join(c, '.claude', 'skills'),        path.join(a, 'skills'),        'dir' ],
  [path.join(c, 'CLAUDE.md'),                path.join(c, 'AGENT.md'),      'file'],
  [path.join(c, '.mcp.json'),                path.join(a, 'mcp.json'),      'file'],
  [path.join(c, '.claude', 'settings.json'), path.join(a, 'settings.json'), 'file'],
].forEach(([src, dest, type]) => link(src, dest, type));
