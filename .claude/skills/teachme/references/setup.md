# Setup — Delegating to obs-ctx + Research Flow

Read ONLY when the topic project doesn't exist / isn't complete yet (SKILL.md §0). **teachme creates no state structure of its own** — the topic folder (CLAUDE.md + context.md) is created by **obs-ctx**; setup here only makes sure that exists + fills in the teachme-specific bits.

---

## 1. Ensure the obs-ctx Project Exists

- Check `_index.yml` — is the topic already registered as a PARA project?
- **No** → delegate to obs-ctx: `obs-ctx init` (or `node .claude/scripts/vault.js`) for the topic folder. If the user points at a `.md` source file → the project root = that file's parent folder; if they point at a folder of chapters → that folder itself.
- **Source already has a folder + CLAUDE.md** (child context) → just register it in the index.
- Don't create ad-hoc folders/state outside the obs-ctx mechanism.

## 2. Fill Sources (`resources:` CLAUDE.md frontmatter)

**Preload available** → seed `resources:` from the preload table.

**No preload** → run the **Research Flow** (below) to fill `resources:`.

## 3. Check the Toolchain

**Preload exists** → follow the preload's toolchain instructions. **None** → ask the user for the toolchain + whether it's installed.

Run the version-check command. Fails → **ask permission before installing** (this changes the system, not just the vault); re-verify after installing. User declines to install → **theory mode** (explain + quiz + read-only review). Note `<toolchain>_installed: false` in CLAUDE.md.

## 4. Mission → CLAUDE.md body

Ask why the user is learning this topic now + a small **anchor project** idea that embodies it. Write it to the **CLAUDE.md** body (not a separate MISSION file). Without a mission, topic and exercise selection is aimless — don't just plow ahead.

## 5. Sandbox & Wiki → CLAUDE.md frontmatter

- **`playground_root`** — folder for the anchor project + drills, **outside the vault**. The vault is markdown-only and often lives in a cloud-synced folder (OneDrive, Dropbox, iCloud, …) — don't put binaries/build config there.
- **`wiki_root`** — the wiki location (default `<project>/wiki/`; or point at an existing topic wiki to enrich).

Write both to CLAUDE.md frontmatter so the next session doesn't ask again.

---

## Research Flow (for a topic with no preload)

Fill `resources:` with authoritative sources **before** teaching — the user shouldn't have to hunt them down, and the skill has a validation baseline.

1. **Confirm the topic.** "Topic: [name] — correct?" Don't assume from a single ambiguous word (Rust the language vs the game).
2. **Research 4–8 sources**, in priority: official documentation → standard books (O'Reilly/Manning/No Starch) → the maintainer's official tutorial → API reference/spec → core-team blog → community wisdom (if the above are thin).
3. **Show a table** of results, ask "use all or pick?":
   ```
   📚 Research results for [topic]:
   | # | Source | URL | Why it's good |
   ```
4. **Write to `resources:` CLAUDE.md frontmatter** the ones the user approves.
5. Continue normal setup.

**Thin results (<3 quality sources)** → say so, continue anyway; `resources:` gets enriched over sessions (new sources are appended automatically).

---

## Setup Troubleshooting

**Ambiguous topic** → "Did you mean [X] or [Y]?", don't assume.

**Source folder inside a cloud-synced folder** → it can be a material source, but the **sandbox (`playground_root`) still stays outside the synced vault**. Confirm.

**User already has progress on this topic** → that means the obs-ctx project already exists → skip setup, `/cs <topic>` directly.

**Very few authoritative sources** → say so, continue; `resources:` grows over sessions.
