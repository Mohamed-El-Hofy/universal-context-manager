# Universal Context Manager

**One agent skill for choosing a workflow and carrying project work across sessions.** It combines 82 task procedures with a checkpoint and handoff CLI, so an agent can route a request to the right instructions and save a concrete resume point when needed.

This is a skill package, not a hosted app or an autonomous background service. A compatible agent loads `SKILL.md`; the checkpoint commands run locally through Node.js.

## What it helps with

- **Find the right procedure:** the skill routes work through a catalog of 82 focused procedures for engineering, research, writing, planning, reviews, and other tasks.
- **Load only relevant guidance:** the root skill reads the catalog and selected module instead of loading every procedure into each request.
- **Resume work reliably:** save a structured checkpoint containing the goal, completed work, decisions, unresolved questions, changed files, verification, and next action.
- **Hand work to another agent:** address a checkpoint to a named recipient, let that agent claim it, then continue using the same workflow catalog.
- **Check recorded freshness:** compare listed file hashes and Git branch, commit, and working-tree status with the saved checkpoint.
- **Keep host integration optional:** example lifecycle adapters are included for Codex, Claude Code, and Gemini CLI. They are not installed or enabled automatically.

## Compatibility

| Host | Skill location | Explicit use |
|---|---|---|
| Codex | `<repo>/.agents/skills/universal-context-manager/` or `%USERPROFILE%\.agents\skills\universal-context-manager\` | `$universal-context-manager` or ask Codex to use `universal-context-manager` |
| OpenCode | `<repo>/.opencode/skills/universal-context-manager/` or `%USERPROFILE%\.agents\skills\universal-context-manager\` | Ask OpenCode to use `universal-context-manager`; it loads the skill through its native skill tool |
| ChatGPT desktop | Use the Skills feature where it is available for your account/workspace | `@universal-context-manager` |

In every case, keep the package directory named **`universal-context-manager`**. That matches `name: universal-context-manager` in the frontmatter. Codex discovers repository skills from `.agents/skills`; OpenCode supports both `.opencode/skills` and the compatible `.agents/skills` locations. See the [Codex skill guide](https://learn.chatgpt.com/docs/build-skills), [OpenCode skills guide](https://opencode.ai/docs/skills), and [ChatGPT skills and plugins guide](https://learn.chatgpt.com/docs/skills-and-plugins) for their current discovery and invocation behavior.

## Install

### Install for your user account

After this repository has been published, clone it into the shared user skill directory. Replace `OWNER/REPO` with the actual GitHub repository:

```powershell
$target = Join-Path $env:USERPROFILE '.agents\skills\universal-context-manager'
New-Item -ItemType Directory -Path (Split-Path $target) -Force | Out-Null
git clone https://github.com/OWNER/REPO.git $target
```

This location is discovered by Codex and is also supported by OpenCode. Start a new session in the agent. If the skill is not listed, check that the folder is named `universal-context-manager` and that the agent can read `SKILL.md`.

### Install in one repository

Copy or extract the repository contents into one of these paths inside the project:

```text
.agents/skills/universal-context-manager/       # Codex; also discovered by OpenCode
.opencode/skills/universal-context-manager/     # OpenCode-specific
```

Do not put another `Universal Context Manager` folder between the skill directory and `SKILL.md`. For a project-local install, copy the release files rather than cloning a second Git repository inside your project.

### Install from a local copy on Windows

Run this from the parent directory that contains `Universal Context Manager`:

```powershell
$source = (Resolve-Path '.\Universal Context Manager').Path
$target = Join-Path $env:USERPROFILE '.agents\skills\universal-context-manager'
New-Item -ItemType Directory -Path $target -Force | Out-Null
Get-ChildItem -LiteralPath $source -Force | Copy-Item -Destination $target -Recurse -Force
```

This copies the whole package, including hidden files and its supporting references and scripts. For OpenCode-only global installation, use `%USERPROFILE%\.config\opencode\skills\universal-context-manager` as the target.

## Use the workflow skill

Ask the agent to use the skill directly, or describe a task that matches its scope. Examples:

```text
Use universal-context-manager to review my uncommitted changes. Read the review scope first and do not modify files.
```

```text
Use universal-context-manager to plan and implement this feature. Choose the relevant modules and verify the result.
```

```text
Use universal-context-manager to save a checkpoint for this project and hand it to Claude Code.
```

The skill loads the matching task module from `references/catalog.md`. The 82 original task procedures are under `references/sources/`; the continuity procedure is `references/continuity/MODULE.md`.

## Save and resume a project checkpoint

The CLI needs **Node.js 20 or later**. It uses Node's built-in modules; no `npm install` is required. Git is optional. When Git is available, checkpoints also record repository state.

From this package directory, initialize checkpoint storage in the project you are working on:

```powershell
node scripts/ucm.mjs init --project C:\path\to\your\project
```

`init` creates `.ucm/` in the target project and adds `.ucm/` to that project's `.gitignore` when it is not already present.

Create a checkpoint draft and validate it before saving:

```powershell
$project = 'C:\path\to\your\project'
$checkpoint = @'
{
  "goal": "Add CSV export to the inventory report",
  "status": "in_progress",
  "completed": ["Located the report generation code"],
  "in_progress": "Implementing CSV serialization",
  "open_questions": [],
  "decisions": ["Keep the existing report API stable"],
  "changed_files": ["src/report.py"],
  "verification": {"status": "not_run", "checks": []},
  "next_action": "Finish CSV serialization and run the report tests"
}
'@

$checkpoint | node scripts/ucm.mjs validate --stdin
$checkpoint | node scripts/ucm.mjs save --project $project --agent Codex --stdin
```

The required fields are `goal`, `status`, `completed`, `decisions`, `open_questions`, `changed_files`, `verification`, and `next_action`. Use project-relative paths in `changed_files`. Verification status can be `passed`, `failed`, `partial`, or `not_run`.

Resume or inspect history:

```powershell
node scripts/ucm.mjs resume --project $project --agent Codex
node scripts/ucm.mjs list --project $project --limit 20
```

For a handoff, include `handoff_to` and `handoff_focus` in the JSON. The receiving agent can inspect and claim it:

```powershell
node scripts/ucm.mjs claim --project $project --agent 'Claude Code'
```

Run `node scripts/ucm.mjs --help` for the command list. The `hook` command and files under `adapters/` are optional host examples; hooks record lifecycle markers only and do not create semantic summaries.

## What a checkpoint does—and does not do

- Saves human-readable Markdown and machine-readable JSON under `<project>/.ucm/checkpoints/`, linked as a history chain.
- Checks checkpoint structure and completeness before saving. The minimum score is 70/100; this score does not verify that the saved narrative is true.
- Redacts common secret formats and values under sensitive object keys. **Redaction cannot identify every secret.** Do not put credentials, raw transcripts, or private data into a checkpoint.
- Reports changes only within recorded evidence: listed file hashes and Git branch, commit, and working-tree status. `fresh` does not mean every file or external fact is current.
- Uses a local save lock and a claim receipt to coordinate agents following the protocol. A process that ignores the protocol can still write.
- Does not read conversation transcripts, automatically summarize model context, monitor quota, run a background service, or require Context Mode.

Review checkpoint contents before sharing or committing them. `.ucm/` is ignored by the target project's Git configuration by default after `init`.

## Verify the package

From this package directory:

```powershell
node --check scripts/ucm.mjs
node --test tests/ucm.test.mjs
powershell -NoProfile -File tests/package-check.ps1
```

The package check validates the single skill entry point and the catalog's local module links. The UCM tests use temporary project fixtures and Node's built-in test runner.

## Repository layout

| Path | Purpose |
|---|---|
| `SKILL.md` | The single skill entry point |
| `references/catalog.md` | Index of task procedures |
| `references/sources/` | Source modules, templates, references, scripts, and upstream notices |
| `references/continuity/` | Checkpoint and handoff workflow documentation |
| `scripts/ucm.mjs` | Local checkpoint CLI |
| `adapters/` | Optional host-specific lifecycle examples |
| `tests/` | UCM tests and package structure check |
| `docs/maintainers/` | Packaging notes, test records, and historical source records |
| `LICENSES.md` | License inventory and project-level license status |

## License status

This repository does not yet declare one license for the complete combined project. The two vendored workflow collections retain their individual MIT license files; the integrated UCM source did not include a root license in the supplied project. See [LICENSES.md](LICENSES.md). Do not assume either upstream MIT license covers the whole combined package; the project owner must choose and confirm a repository-level license before presenting the entire repository as open source. GitHub's [license guidance](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/adding-a-license-to-a-repository) explains how licenses appear on repository pages.
