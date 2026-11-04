# Compatibility

## Core skill and checkpoint CLI

- The single skill entrypoint is `SKILL.md`; its task procedures are discovered through `references/catalog.md`.
- The checkpoint CLI requires Node.js 20+ and built-in Node modules. It is host-independent and does not require an MCP server.
- Checkpoints use project-relative paths and JSON/Markdown files under the target project's `.ucm/` directory.
- The documented command examples use PowerShell. The CLI itself uses Node.js and should also work in other shells when paths and stdin are quoted for that shell.

## Optional lifecycle adapters

The Codex, Claude Code, and Gemini CLI files under `adapters/` are host configuration examples. Their presence does not prove that a host has loaded or trusted them. Codex's example expects a plugin root containing `scripts/ucm.mjs`; Claude and Gemini examples contain placeholder paths that must be updated. Validate configuration with the target host and verify an actual callback before relying on it. These hooks record a small lifecycle marker only; they do not summarize a transcript or create a semantic checkpoint.

Context Mode instructions are optional and do not install or bundle its runtime. The checkpoint workflow works without Context Mode.

## Source records

Historical source compatibility notes and the original UCM audit are archived under [`docs/maintainers/source-history/`](../../docs/maintainers/source-history/). They describe the input workspace and do not prove those source-workspace integrations are active in this package.
