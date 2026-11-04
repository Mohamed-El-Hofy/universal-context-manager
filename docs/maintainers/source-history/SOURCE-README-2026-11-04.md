# Universal Context Manager

> Historical README from the standalone input project. For the merged skill, use the root `README.md` and [project-continuity module](MODULE.md).

A small, local-first skill and Node.js standard-library helper for durable project checkpoints, safe handoffs, and verified resume across coding agents.

## What it does

- Saves immutable Markdown and JSON checkpoints under `.ucm/checkpoints/` in the project being worked on, linked as a history chain.
- Scores checkpoint completeness before saving and blocks low-quality drafts or unresolved placeholders.
- Scans checkpoint text for common credentials and redacts detected values before writing.
- Records only lifecycle metadata from supported hooks. Hooks do not read transcripts or claim to summarize hidden model context.
- Checks file hashes and, when the project is a Git repository, reports branch, commit, and tracked-worktree changes on resume.
- Lists saved checkpoints and provides an exclusive one-writer claim for a handoff.
- Records a handoff focus, references, suggested next skills, and an explicit verification status.
- Documents optional use of Context Mode MCP tools for large outputs without depending on or bundling its engine.
- Works from the same checkpoint format in Freebuff, Codex, Claude Code, and Gemini CLI. Freebuff can read the root `AGENTS.md`; a Freebuff-specific hook was not found or tested.

Requires Node.js 20+ and uses only built-in modules.

## Quick start

From this directory, run:

```powershell
node scripts/ucm.mjs init --project C:\path\to\your\project
node scripts/ucm.mjs save --project C:\path\to\your\project --agent Codex --stdin
```

For `save --stdin`, provide one JSON object on standard input. Example:

```json
{
  "goal": "Add CSV export to the inventory report",
  "status": "in_progress",
  "completed": ["Located report generation code"],
  "in_progress": "Implementing export formatting",
  "open_questions": [],
  "decisions": ["Keep the current report API stable"],
  "changed_files": ["src/report.py"],
  "verification": {"status": "passed", "checks": ["Report tests passed"]},
  "next_action": "Finish CSV serialization and run the report tests",
  "handoff_to": "Claude Code",
  "handoff_focus": "Finish CSV serialization and confirm the report output",
  "suggested_skills": ["universal-context-manager"],
  "references": ["docs/report-format.md"]
}
```

PowerShell example:

```powershell
$draft = '{"goal":"Demo handoff","status":"in_progress","completed":["Created sample parser"],"decisions":[],"open_questions":[],"changed_files":[],"verification":{"status":"not_run","checks":[]},"next_action":"Add parser validation and verify the sample output","handoff_to":"Claude Code","handoff_focus":"Finish parser validation"}'
$draft | node scripts/ucm.mjs validate --stdin
$draft | node scripts/ucm.mjs save --project C:\path\to\your\project --agent Freebuff --stdin
node scripts/ucm.mjs list --project C:\path\to\your\project
node scripts/ucm.mjs resume --project C:\path\to\your\project --agent 'Claude Code'
node scripts/ucm.mjs claim --project C:\path\to\your\project --agent 'Claude Code'
```

The receiving agent must inspect the checkpoint and relevant files before changing code. `claim` succeeds for one receiver only; it does not make both agents coordinate automatically, so the previous agent must stop writing after handoff.

## Commands

- `init --project PATH`: create the checkpoint directory and a minimal `.gitignore` entry if none exists.
- `validate --stdin`: report a 0–100 completeness score, warnings, and secret-like values that would be redacted.
- `save --project PATH --agent NAME --stdin`: require a passing checkpoint (70 points), redact credentials, snapshot the project file and Git state, and append to checkpoint history.
- `list --project PATH [--limit N]`: list recent checkpoints and their parent links.
- `resume --project PATH --agent NAME`: show the latest checkpoint and report missing, changed, or newly created files plus Git freshness.
- `claim --project PATH --agent NAME`: atomically claim the latest checkpoint if the handoff is addressed to this agent.
- `hook --agent NAME --event EVENT`: append a credential-free lifecycle marker to `.ucm/events.jsonl`; reads JSON from stdin.

Hook markers are evidence that a lifecycle callback ran. They are not semantic checkpoints and cannot determine quota exhaustion or future context compaction.

## Agent setup

- **Freebuff:** copy or reference `AGENTS.md` in the target project; Freebuff's public CLI documentation says it reads root `AGENTS.md`. The CLI was not installed in this workspace, so live discovery is unverified.
- **Codex:** `adapters/codex/` contains an optional plugin hook package. Install and trust it through Codex's supported plugin flow before expecting callbacks. The local hook command was exercised with representative input; app registration and live callback delivery were not available to verify here.
- **Claude Code:** `adapters/claude/settings.json.example` documents a `SessionEnd` command hook.
- **Gemini CLI:** `adapters/gemini/settings.json.example` documents an `AfterAgent` command hook.

Hook examples must be merged into the relevant agent's configuration; none of the user's global or Android-project settings were edited. The adapter receives lifecycle metadata only and intentionally ignores transcript paths and transcript content.

## Verification

Run from this directory:

```powershell
node --test tests/*.test.mjs
node scripts/ucm.mjs self-check
```

The integration test creates a disposable project, saves a checkpoint as one agent, resumes and verifies it as another, and proves that a second writer cannot claim the same handoff.

## Design and source review

This implementation is independently written. It uses general workflow ideas, not copied code or text, from:

- [Matt Pocock's `handoff` skill](https://github.com/mattpocock/skills/tree/main/skills/productivity/handoff), repository MIT license.
- [`session-handoff` in `softaworks/agent-toolkit`](https://github.com/softaworks/agent-toolkit/tree/main/skills/session-handoff), repository MIT license.
- [Context Mode](https://github.com/mksglu/context-mode), licensed Elastic License 2.0 (source-available); no code or prose from it is included.

Lifecycle adapter formats are based on the vendors' current hook documentation: [Codex](https://developers.openai.com/plugins/build/plugins), [Claude Code](https://code.claude.com/docs/en/hooks), and [Gemini CLI](https://github.com/google-gemini/gemini-cli/blob/main/docs/hooks/reference.md). See `docs/COMPATIBILITY.md` for verified scope and limits.

The three local source folders did not include Git metadata, so their exact upstream commits could not be pinned. The repository links above identify the projects; review and pin a specific upstream revision before copying any source code.

## Privacy and limits

Checkpoints persist in the target project and may be committed or synchronized with it. Review them before sharing. The scanner covers common key/token/password formats but cannot guarantee recognition of every secret. It never reads conversation transcripts. No background quota monitor, timer, or universal automatic semantic summary is provided. Use `SKILL.md` to have an agent save a checkpoint after a meaningful milestone or before switching sessions.
