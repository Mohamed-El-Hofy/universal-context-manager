# Optional Context Mode companion

Universal Context Manager and Context Mode solve related but distinct problems:

- UCM stores durable project checkpoints, links handoffs, records the intended receiver, and verifies current project files/Git state on resume.
- Context Mode provides MCP tools for processing large tool outputs outside the model's working context and searching indexed material.

When Context Mode tools are already available in the agent session, use them for large logs, command output, datasets, and broad source inspection. Save only the conclusions, source paths, and next actions needed for continuation in a UCM checkpoint. Do not assume Context Mode's database or current-session index travels to another agent or machine.

This adapter is instruction-only. It does not install, launch, or bundle Context Mode, and it does not copy its code or skill text. The local Context Mode package identifies itself as version 1.0.169 under Elastic License 2.0; review that license and preserve its notices before any redistribution or source reuse.

## Suggested combined workflow

1. Use Context Mode to process a large output and retrieve only relevant snippets.
2. Verify those findings against the project's files.
3. Save the durable decision, relevant paths, verification evidence, and next action with `ucm save`.
4. On resume, use the UCM freshness report first; use Context Mode search only if the same indexed material remains available.
