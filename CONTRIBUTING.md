# Contributing

Thanks for helping improve Universal Context Manager. Keep changes focused on the single skill package and preserve the original notices under `references/sources/`.

## Before opening a change

1. Read `SKILL.md` and the matching module in `references/catalog.md`.
2. Keep the root skill name and folder name `universal-context-manager` aligned.
3. When changing the catalog, confirm every linked module exists and update the package check if its expected structure changes.
4. For checkpoint CLI changes, run the Node.js checks in the README and describe what they verified. Do not include real credentials, transcripts, or project checkpoint data in test fixtures or reports.
5. Keep host adapters optional. Do not add automatic global settings changes or hook installation.

## License and source notices

The repository has no project-wide license yet. Review [LICENSES.md](LICENSES.md) and retain all existing third-party notices. Do not add or change a repository-level license on behalf of the project owner.

## Reporting a problem

Include the host and version, the exact command or prompt, expected behavior, actual behavior, and a redacted error message. Do not attach `.ucm` checkpoints or logs containing credentials or private project details.
