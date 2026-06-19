# Cross-platform agent symlink setup for Windows PowerShell.
# Safe to run repeatedly — no-op if links already exist.
#
# What this does:
#   1. Creates a memory junction so Claude Code project memory syncs via
#      cloud storage across machines.
#   2. Creates .agent/ symlinks so skills and config are accessible to
#      non-Claude agent runners that follow the .agent/ convention.
#
# Usage:
#   .\setup-junction.ps1
#
# Typically triggered automatically via a UserPromptSubmit hook.

$vaultRoot = Split-Path $PSScriptRoot

# ── Helper ────────────────────────────────────────────────────────────────────

function Ensure-Link($src, $dest, $type) {
    if (-not (Test-Path $src)) { return }
    if (Test-Path $dest) { return }
    $parent = Split-Path $dest
    if (-not (Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
    if ($type -eq 'dir') {
        # Junction: works without admin or Developer Mode
        New-Item -ItemType Junction -Path $dest -Target $src | Out-Null
    } else {
        try {
            # SymbolicLink: requires Developer Mode or admin
            New-Item -ItemType SymbolicLink -Path $dest -Target $src | Out-Null
        } catch {
            # Hard link fallback: no admin needed, same drive only
            New-Item -ItemType HardLink -Path $dest -Target $src | Out-Null
        }
    }
}

# ── 1. Memory junction (Claude Code project memory) ──────────────────────────

$vaultMemoryPath = Join-Path $vaultRoot ".claude\memory"
$encoded = $vaultRoot -replace ':', '-' -replace '\\', '-'
$junctionPath = Join-Path $env:USERPROFILE ".claude\projects\$encoded\memory"

Ensure-Link $vaultMemoryPath $junctionPath 'dir'

# ── 2. Agent framework symlinks (.agent/) ─────────────────────────────────────
# To add mappings for other agent frameworks, append Ensure-Link calls here.

$a = Join-Path $vaultRoot ".agent"

Ensure-Link (Join-Path $vaultRoot ".claude\skills")        (Join-Path $a "skills")           'dir'
Ensure-Link (Join-Path $vaultRoot "CLAUDE.md")             (Join-Path $vaultRoot "AGENT.md") 'file'
Ensure-Link (Join-Path $vaultRoot ".mcp.json")             (Join-Path $a "mcp.json")         'file'
Ensure-Link (Join-Path $vaultRoot ".claude\settings.json") (Join-Path $a "settings.json")    'file'
