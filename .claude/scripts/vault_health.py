#!/usr/bin/env python3
"""
vault_health.py — vault health check used by the obs-audit skill.
Scans every file in a single pass, outputs JSON — Claude only reads the output.
"""

import os
import re
import json
import sys
from datetime import datetime, timedelta
from pathlib import Path

# Two levels up from .claude/scripts/vault_health.py — same convention as vault.js
VAULT = Path(__file__).resolve().parent.parent.parent

SKIP_DIRS = {
    '.claude', '.agents', '.obsidian', '.git',
    'attachment', 'pixel-banner-images', 'Excalidraw',
}

ROOT_ALLOWLIST = {
    'CLAUDE.md', 'GEMINI.md', 'AGENTS.md', 'README.md',
}

# Notes that are reasonably expected to have no incoming links
ORPHAN_EXCLUDE_DIRS = {'Daily', 'Template', 'Clippings', '_brain', '_scripts'}
ORPHAN_EXCLUDE_FILES = {'CLAUDE.md', 'GEMINI.md', 'AGENTS.md', 'README.md'}

STALE_DAYS = 30


def is_skipped(path: Path) -> bool:
    parts = path.relative_to(VAULT).parts
    return any(p in SKIP_DIRS for p in parts)


def build_file_index() -> dict:
    """Filename stem → list of relative paths."""
    index = {}
    for path in VAULT.rglob('*.md'):
        if is_skipped(path):
            continue
        name = path.stem
        rel = str(path.relative_to(VAULT))
        index.setdefault(name, []).append(rel)
    return index


def extract_wikilinks(content: str) -> list:
    """Extract [[Target]] targets, strip display text and anchors."""
    return re.findall(r'\[\[([^\]|#\n]+)', content)


def check_broken_links(file_index: dict) -> list:
    broken = []
    for path in VAULT.rglob('*.md'):
        if is_skipped(path):
            continue
        try:
            content = path.read_text(encoding='utf-8')
        except Exception:
            continue
        rel = str(path.relative_to(VAULT))
        for link in extract_wikilinks(content):
            link = link.strip()
            if not link or link.startswith('http'):
                continue
            # Obsidian resolves by stem name (last part of path)
            stem = Path(link).stem
            if stem not in file_index:
                lower = stem.lower()
                if not any(k.lower() == lower for k in file_index):
                    broken.append({'file': rel, 'link': link})
    return broken


def check_orphan_notes(file_index: dict) -> list:
    """Notes that no other note ever links to."""
    referenced = set()
    for path in VAULT.rglob('*.md'):
        if is_skipped(path):
            continue
        try:
            content = path.read_text(encoding='utf-8')
        except Exception:
            continue
        for link in extract_wikilinks(content):
            link = link.strip()
            referenced.add(link)
            referenced.add(Path(link).stem)

    orphans = []
    for path in VAULT.rglob('*.md'):
        if is_skipped(path):
            continue
        parts = path.relative_to(VAULT).parts
        if parts[0] in ORPHAN_EXCLUDE_DIRS:
            continue
        if path.name in ORPHAN_EXCLUDE_FILES:
            continue
        if 'Template' in parts:
            continue
        name = path.stem
        if name not in referenced:
            orphans.append(str(path.relative_to(VAULT)))
    return orphans


def check_stale_context() -> list:
    cutoff = datetime.now().timestamp() - (STALE_DAYS * 86400)
    stale = []
    for path in VAULT.rglob('context.md'):
        if is_skipped(path):
            continue
        mtime = path.stat().st_mtime
        if mtime < cutoff:
            days_ago = int((datetime.now().timestamp() - mtime) / 86400)
            stale.append({
                'file': str(path.relative_to(VAULT)),
                'last_modified_days': days_ago,
            })
    return sorted(stale, key=lambda x: x['last_modified_days'], reverse=True)


def check_root_clutter() -> list:
    clutter = []
    for path in VAULT.glob('*.md'):
        if path.name not in ROOT_ALLOWLIST:
            clutter.append(path.name)
    for path in VAULT.glob('*.py'):
        clutter.append(path.name)
    for path in VAULT.glob('*.txt'):
        clutter.append(path.name)
    for path in VAULT.glob('*.deb'):
        clutter.append(path.name)
    return clutter


def check_brain_freshness() -> dict:
    brain_dir = VAULT / '_brain'
    if not brain_dir.exists():
        return {'exists': False, 'issues': ['_brain/ folder does not exist']}

    issues = []
    for filename in ['North Star.md', 'Gotchas.md', 'Patterns.md', 'Key Decisions.md']:
        fpath = brain_dir / filename
        if not fpath.exists():
            issues.append(f'{filename}: file not found')
            continue
        content = fpath.read_text(encoding='utf-8')
        lines = [l.strip() for l in content.splitlines()]

        if filename == 'North Star.md':
            # Current Focus is empty if it only has "- " or "-" after the header
            in_focus = False
            focus_empty = True
            for line in lines:
                if line == '## Current Focus':
                    in_focus = True
                    continue
                if in_focus and line.startswith('##'):
                    break
                if in_focus and line and not line.startswith('_') and line != '-':
                    focus_empty = False
                    break
            if focus_empty:
                issues.append('North Star.md: Current Focus is still empty')
        else:
            # Check whether there's any bullet entry that isn't a template placeholder
            has_content = any(
                l.startswith('-') and len(l) > 2 and l != '- '
                for l in lines
            )
            if not has_content:
                issues.append(f'{filename}: no entries yet (still template)')

    return {'exists': True, 'issues': issues}


def check_daily_gaps(days: int = 30) -> list:
    daily_dir = VAULT / 'Daily'
    if not daily_dir.exists():
        return []
    existing = {p.stem for p in daily_dir.glob('????-??-??.md')}
    gaps = []
    today = datetime.now().date()
    for i in range(1, days + 1):
        day = today - timedelta(days=i)
        if day.weekday() < 5:  # Monday-Friday
            ds = day.strftime('%Y-%m-%d')
            if ds not in existing:
                gaps.append(ds)
    return gaps[:10]


def main():
    # Progress goes to stderr so it doesn't mix with the JSON output
    def log(msg):
        print(msg, file=sys.stderr, flush=True)

    log('Building file index...')
    file_index = build_file_index()

    log('Checking broken links...')
    broken = check_broken_links(file_index)

    log('Checking orphan notes...')
    orphans = check_orphan_notes(file_index)

    log('Checking stale context.md...')
    stale = check_stale_context()

    log('Checking root clutter...')
    clutter = check_root_clutter()

    log('Checking _brain/ freshness...')
    brain = check_brain_freshness()

    log('Checking daily note gaps...')
    gaps = check_daily_gaps()

    result = {
        'generated_at': datetime.now().strftime('%Y-%m-%d %H:%M'),
        'summary': {
            'total_files': sum(len(v) for v in file_index.values()),
            'broken_links': len(broken),
            'orphan_notes': len(orphans),
            'stale_context': len(stale),
            'root_clutter': len(clutter),
            'brain_issues': len(brain.get('issues', [])),
            'daily_gaps': len(gaps),
        },
        'broken_links': broken[:50],
        'orphan_notes': orphans[:30],
        'stale_context': stale,
        'root_clutter': clutter,
        'brain': brain,
        'daily_gaps': gaps,
    }

    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == '__main__':
    main()
