# GitHub release checklist

## Completed in the local package

- [x] Single root skill entry point named `universal-context-manager`.
- [x] User-facing installation, invocation, checkpoint CLI, feature, and limitation documentation in the root README.
- [x] Root `.gitignore` for local checkpoints, Node artifacts, and OS files.
- [x] Upstream ignore files archived so their rules cannot hide vendored source files during Git staging.
- [x] Source license inventory added; upstream license files remain with their respective source trees.
- [x] Maintainer and historical review documents moved out of the end-user workflow path.

## Owner decisions before a public release

- [ ] Choose a repository owner/name and decide whether the GitHub repository is public or private.
- [ ] Confirm rights to publish the integrated UCM code and choose a project-wide license, or deliberately publish without one.
- [ ] Review the license inventory and upstream notices; retain any additional notices required by source files.
- [ ] Review the complete Git staging list, especially hidden files, source copies, and test fixtures.
- [ ] Run the documented checks on the release candidate and attach the actual results to the release review.
- [ ] Publish only after reviewing the diff and the selected repository visibility.

No repository has been created, no GitHub remote has been configured, and nothing has been pushed by this packaging work.
