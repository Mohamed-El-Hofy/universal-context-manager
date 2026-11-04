# Maintainer notes

These files support packaging and review; end users do not need them to install or use the skill.

- `RELEASE-CHECKLIST.md` tracks the remaining decisions before a GitHub release.
- `FINAL-RESULTS-2026-11-04.md` records the original integration checks and their limits.
- `OPENCODE-TEST-PROMPT.md` is a manual smoke-test prompt for OpenCode.
- `source-history/` contains historical UCM review and source documentation.
- `upstream-ignore-files/` preserves the source collections' `.gitignore` contents without applying them to the vendored package. Their old rules hid some copied files from Git staging.
