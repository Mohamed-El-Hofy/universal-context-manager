# Review scope

Use working-tree mode for uncommitted, staged, unstaged, or current local edits. Use history mode when a branch, PR, or commit range is requested. Ask about scope only when the request and repository state do not settle it.

Run scripts/get-review-scope.ps1 from this skill with -Repository set to the project and -Mode WorkingTree or -Mode History -BaseRef <verified-ref>. It only reads Git state and returns JSON. PowerShell 7 or newer and Git are required for this helper; when unavailable, run equivalent read-only Git commands using the host shell. Git warnings remain separate from filename and patch output.

WorkingTree returns StagedFiles, UnstagedFiles, and UntrackedFiles, plus the respective tracked patches. Review both patches, including staged changes later reverted in the working tree, and read the untracked files directly. Do not execute untracked files to inspect them. Git may quote unusual filenames in patch text; the returned filename arrays use NUL-separated Git output and preserve spaces and Unicode.

History returns files and a patch between the merge base and HEAD. BaseRef must resolve to a commit. A missing ref fails without falling back to working-tree scope. Empty scope is a valid result, not a review failure. Working-tree mode also supports repositories with no commits.

Do not claim to review ignored files, binary contents, submodule internals, or unavailable large-file contents from patch text alone. Inspect what the requested review actually requires and state any material gap. Preserve the standards/spec axes of the source procedure once the correct scope is selected.
