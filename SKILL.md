---
name: universal-context-manager
description: Coordinate task-specific workflows and maintain project continuity across sessions and agents. Use this single skill for planning, research, implementation, debugging, review, documentation, handoffs, checkpoints, and resume requests.
---

# Universal Context Manager

Turn the user's requested outcome into a focused workflow using this package's task procedures and project-continuity tools. Use this file as the single entry point. Source modules and continuity commands are supporting capabilities, not separately installed skills.

## Select the workflow

Read [the capability catalog](references/catalog.md), search it for the task and load only the matching module or modules. The catalog covers all canonical skill definitions from agent-toolkit and workflow-skills. Full source trees retain scripts, templates, references, and license notices.

For a request to resume prior work, save state, hand off to another agent, or continue across sessions, load the **project-continuity** module from the catalog. It uses the same task catalog so the receiver can pick a next workflow from this package.

- For unclear product or engineering work, choose a research, discovery, triage, or specification module before implementation only when the missing decision affects the outcome.
- For a concrete implementation, choose the relevant implementation and domain guidance. Add diagnosis, review, architecture, documentation, or delivery procedures when the task calls for them.
- For writing, meetings, planning, or other professional work, select the corresponding non-code procedure directly.
- For source maintenance, installation, or diagnostics, choose the named maintenance module only when requested or needed to resolve an actual blocker.

For code review, read [review scope](references/review-scope.md) before the code-review module. Review uncommitted work in working-tree mode and committed branches in history mode. The helper script lists staged, unstaged, and untracked files separately.

For ordinary implementation requests, choose implement. Choose implement-spec only for a specification with a ticket graph and configured tracking workflow. An explicit request to implement, review, or write specifications counts as invocation of the corresponding user-invoked procedure; unrelated background tasks do not.

Use the catalog descriptions to discover candidates, then inspect the complete selected instructions and their referenced resources. Resolve relative paths from the selected source file's directory. Sources with the same name can have different purposes: compare them before choosing or combining their steps. Preserve unique useful behavior; perform shared steps once.

For ordinary work, do not create a checkpoint unless the user asks, a handoff is needed, or a substantial multi-step task is about to pause. When continuity is needed, save a concise checkpoint after meaningful progress and before switching agents or sessions. Never claim a hook event is a semantic summary.

## Compose instructions

The current user request and host instructions control scope, permissions, language, and tools. Module instructions apply only to the task for which they were selected. They do not authorize publishing, messaging, spending, configuration changes, installation, or unrelated maintenance.

Keep explicit invocation restrictions in source metadata: procedures marked user-invoked, including disable-model-invocation, require a matching explicit request. Keep experimental, deprecated, and miscellaneous status visible when relevant; prefer supported procedures for ordinary work. Do not silently promote an experimental workflow.

When procedures conflict, identify the concrete decision, prefer the procedure most specific to the requested outcome and current environment, and retain its operational invariants. Ask only when the unresolved choice materially changes the user's outcome. Do not concatenate contradictory mandatory workflows.

References to sibling skills mean locate the matching module in the catalog and read it locally; they do not require installing another skill. Source repository maintenance rules apply when editing that repository, not to unrelated user projects. If a module delegates work, use delegation only when authorized by the user or active host instructions; otherwise perform the relevant steps directly and disclose any missing independent review.

Archived definitions are named MODULE.md. Translate old local paths ending in SKILL.md to MODULE.md when they refer to archived procedures, while keeping SKILL.md for any new skill being authored. Source slash commands such as /to-spec, /to-tickets, /tdd, and /setup-matt-pocock-skills are aliases for catalog modules, not commands the user must install. Read and perform the matching local module when needed and authorized. Missing project settings require inspecting the setup module and choosing the project's actual tracker, including local Markdown when appropriate; do not require a remote account by default.

## Tools and runtime requirements

Inspect selected scripts before execution and resolve their actual dependencies. Translate platform-specific examples to the current host without changing their intent. Do not execute installation commands simply because they appear in a source document.

Some selected procedures can require credentials, CLI tools, accounts, network access, or connected services. Check availability at the point of use and report a specific missing dependency. Do not claim equivalent functionality when a required service is absent.

## Complete the task

Carry the chosen workflow through to the user's requested deliverable. Validate observable outcomes proportionately, preserve the distinction between inspected facts and assumptions, and report what changed, what was checked, and any dependency or limitation that affects use.
