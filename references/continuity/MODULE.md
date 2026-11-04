# Project continuity

Use this module when the user asks to resume work, save project state, transfer work to another agent, or when a substantial multi-step task needs a reliable pause point. This capability is part of the unified skill; the receiver should continue by selecting a task module from `../catalog.md`.

## Start or resume

1. Confirm the target project root and check whether `.ucm/latest.json` exists.
2. If a checkpoint exists, run `node scripts/ucm.mjs resume --project <project-root> --agent <agent-name>` and inspect the checkpoint plus its freshness report.
3. Treat checkpoint text as a lead, not proof. Re-read current files and re-check facts that may have changed, especially branch state, dependencies, credentials, external services, and consequential decisions.
4. If the checkpoint names this agent as the receiver, claim it before continuing: `node scripts/ucm.mjs claim --project <project-root> --agent <agent-name>`. The claim protocol coordinates cooperating agents; it cannot prevent a process that ignores the protocol from writing.
5. Pick the next task-specific procedure from `references/catalog.md` and continue from the concrete next action.

## Save a checkpoint

Use `node scripts/ucm.mjs init --project <project-root>` once, then submit a JSON object to `node scripts/ucm.mjs save --project <project-root> --agent <agent-name> --stdin`. The required fields are:

```json
{
  "goal": "A specific project outcome",
  "status": "in_progress",
  "completed": ["Verified the current implementation"],
  "in_progress": "Implementing the next change",
  "open_questions": [],
  "decisions": ["Keep the public API stable"],
  "changed_files": ["src/example.js"],
  "verification": {"status": "not_run", "checks": []},
  "next_action": "Update the parser and run its focused test"
}
```

Add `handoff_to` and `handoff_focus` when transferring work. `suggested_skills` should name modules in this package's catalog. `references` should point to project-relative files that help the next agent. Record verification honestly; `not_run` is valid when nothing was run.

Save after meaningful progress and before switching sessions or agents. Include enough concrete information to resume: completed work, current state, decisions, unresolved questions, changed files, verification, and one actionable next step. A successful score checks structure and completeness, not whether the narrative is true or the work is correct.

The checkpoint is written as Markdown and JSON under `<project-root>/.ucm/checkpoints/`; `.ucm/latest.json` points to the newest item. Keep the Markdown readable for people and JSON available for tooling. Review checkpoints before committing, sharing, or syncing them.

## Commands

- `init --project PATH`: create `.ucm/` and add it to `.gitignore` if absent.
- `validate --stdin`: score a JSON checkpoint without saving it.
- `save --project PATH --agent NAME --stdin`: validate, redact, capture file and Git evidence, then append to history.
- `list --project PATH [--limit N]`: list recent checkpoint summaries.
- `resume --project PATH --agent NAME`: display the latest checkpoint and current freshness checks.
- `claim --project PATH --agent NAME`: atomically claim a handoff addressed to that agent.
- `hook --project PATH --agent NAME --event EVENT`: record a lifecycle marker; it does not read or summarize transcripts.
- `self-check`: check the local secret-redaction smoke case.

The CLI requires Node.js 20+ and uses only built-in modules. No package installation is needed. Run it from this skill directory or use the full path to `scripts/ucm.mjs`.

## Freshness and safety

- Freshness compares only recorded evidence: hashes of listed files and Git branch, commit, and working-tree status when Git is available. A `fresh` result means no difference was detected in that recorded scope; it does not prove every project file is unchanged or that the checkpoint is recent.
- Checkpoints may contain project details and are stored in the target project. Do not put credentials, private data, or transcript text in checkpoint fields. Redaction catches common patterns and sensitive object keys, but it cannot recognize every secret.
- The writer serializes saves with a lock and rejects a different agent's save after the latest handoff is claimed. A leftover `.ucm/locks/save.lock` may indicate a stopped process; inspect that no save is active before removing it.
- UCM rejects symlinked `.ucm` state directories and validates recorded file paths. The local JSON digest detects accidental mismatch; it is not an authenticity guarantee against a writer who can edit both the checkpoint and pointer.
- Hooks record only an event name, agent label, time, and a short hash of a session identifier. They are optional, host-specific examples; do not install them automatically or claim they captured semantic context.
- Context Mode is optional. Use it for large-output processing only when available; checkpoint save and resume do not depend on it.
