# Compatibility and verification record

Status reflects this workspace run, 2026-11-04.

| Environment | Integration | Evidence here | Limit |
|---|---|---|---|
| Freebuff CLI | Root `AGENTS.md` and shared checkpoint CLI | Public Freebuff CLI README/FAQ says it loads project `AGENTS.md`; `freebuff` executable was not found locally | No Freebuff-specific hook was identified; no live agent run |
| Codex | Project skill under `.agents/skills/`, local plugin marketplace, and optional plugin `SessionStart` / `PreCompact` callbacks | Project skill and marketplace/config files parse; hook command was run with representative JSON input; persisted marker was checked | Project marketplace is not installed from the desktop Plugins Directory and hooks are not trusted; live app callback not verified. Start a new project session to load local skills |
| Claude Code | Optional `SessionEnd` command hook | Hook command was run with representative JSON input; callback output and persisted marker were checked | Example config was not registered in Claude Code; live callback not verified |
| Gemini CLI | Optional `AfterAgent` command hook | Hook command was run with representative JSON input; callback output and persisted marker were checked | Example config was not registered in Gemini CLI; live callback not verified |
| Context Mode | Optional MCP companion documented under `adapters/context-mode/` | Context Mode tools were available during this Codex session; UCM itself has no runtime dependency on them | The UCM package does not install or start Context Mode, and its local index is not treated as a portable checkpoint |

All hooks discard stdin except for a fixed allowlist of non-secret metadata (`hook_event_name`, `session_id`; `cwd` is not persisted). They never open `transcript_path`. The shared helper's integration test tests the command behavior, not the host's hook dispatcher. Codex plugin installation and hook trust require a desktop review; the repo-local configuration does not grant that trust automatically.

## Source and license review

- `mattpocock/skills` is MIT-licensed. The selected `handoff` skill lives in its productivity skills tree and writes to the OS temporary directory.
- The local `softaworks/agent-toolkit` folder has an MIT license. Its `session-handoff` skill includes a scaffold, template, resume checklist, staleness checker, and secret/completeness validator.
- `mksglu/context-mode` declares Elastic License 2.0. The ELv2 is source-available with restrictions, so this project does not vendor its implementation or prose.
- Freebuff CLI public repo is Apache-2.0. Its current project docs state that root `AGENTS.md` is loaded; this is used as instruction discovery, not as a hook claim.

References:

- https://github.com/mattpocock/skills/blob/main/LICENSE
- https://github.com/mattpocock/skills/tree/main/skills/productivity/handoff
- https://github.com/softaworks/agent-toolkit/blob/main/LICENSE
- https://github.com/softaworks/agent-toolkit/tree/main/skills/session-handoff
- https://github.com/mksglu/context-mode/blob/main/LICENSE
- https://www.elastic.co/licensing/elastic-license
- https://developers.openai.com/plugins/build/plugins
- https://code.claude.com/docs/en/hooks
- https://github.com/google-gemini/gemini-cli/blob/main/docs/hooks/reference.md
- https://github.com/CodebuffAI/freebuff
- https://freebuff.com/perspectives/faq/free-coding-agents-for-daily-development-not-limited-trials

The three local source folders did not contain `.git` metadata, so their exact upstream commits could not be pinned. Upstream links identify the projects, not the exact downloaded revisions.
