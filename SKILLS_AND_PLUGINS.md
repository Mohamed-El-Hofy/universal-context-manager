# Skills and plugins registry

This registry records the Windows Codex installation inspected on **2026-11-26**. Paths use `%USERPROFILE%` to keep them portable. Plugin versions are cache directory labels tied to a verified `.codex-plugin/plugin.json`. Skill paths point to verified `SKILL.md` files. A cache entry alone does not confirm account installation, enablement, or an authenticated connection.

## Plugins

For OpenAI marketplace entries, use the desktop **Plugins** tab or run `codex` and then `/plugins`. Select the matching plugin if the marketplace offers it. Bundled and runtime plugins are supplied by the host. A standalone install command was not verified for those entries. The [OpenAI plugin directory and install guide](https://learn.chatgpt.com/docs/plugins#use-and-install-plugins) is the official installation reference where a public package source is unavailable.

**Enabled** means the local Codex configuration explicitly enables the ID and its package is present. **Available in session** means the current Codex session exposed tools or skills for that package and its cache was present. **Cache only** means current enablement was not established. No account connection was tested.

| Codex plugin ID | Version | Local evidence | Verified package path | Official source or install reference |
| --- | --- | --- | --- | --- |
| `context-mode@context-mode` | `2.2.2` | Available in session | `%USERPROFILE%/.codex/plugins/cache/context-mode/context-mode/2.2.2` | [Context Mode](https://github.com/mksglu/context-mode) |
| `browser@openai-bundled` | `26.1120.50957` | Enabled | `%USERPROFILE%/.codex/plugins/cache/openai-bundled/browser/26.1120.50957` | [OpenAI plugin directory and install guide](https://learn.chatgpt.com/docs/plugins#use-and-install-plugins) |
| `chrome@openai-bundled` | `26.1120.50957` | Enabled | `%USERPROFILE%/.codex/plugins/cache/openai-bundled/chrome/26.1120.50957` | [OpenAI plugin directory and install guide](https://learn.chatgpt.com/docs/plugins#use-and-install-plugins) |
| `codex-app-tools@openai-bundled` | `26.1120.50957` | Enabled | `%USERPROFILE%/.codex/plugins/cache/openai-bundled/codex-app-tools/26.1120.50957` | [OpenAI plugin directory and install guide](https://learn.chatgpt.com/docs/plugins#use-and-install-plugins) |
| `computer-use@openai-bundled` | `26.1120.50957` | Enabled | `%USERPROFILE%/.codex/plugins/cache/openai-bundled/computer-use/26.1120.50957` | [OpenAI plugin directory and install guide](https://learn.chatgpt.com/docs/plugins#use-and-install-plugins) |
| `unified-computer-use@openai-bundled` | `26.1120.50957` | Enabled | `%USERPROFILE%/.codex/plugins/cache/openai-bundled/unified-computer-use/26.1120.50957` | [OpenAI plugin directory and install guide](https://learn.chatgpt.com/docs/plugins#use-and-install-plugins) |
| `visualize@openai-bundled` | `1.0.114` | Enabled | `%USERPROFILE%/.codex/plugins/cache/openai-bundled/visualize/1.0.114` | [OpenAI plugin directory and install guide](https://learn.chatgpt.com/docs/plugins#use-and-install-plugins) |
| `github@openai-curated-remote` | `0.1.13-77c10e110b37` | Available in session | `%USERPROFILE%/.codex/plugins/cache/openai-curated-remote/github/0.1.13-77c10e110b37` | [OpenAI plugin directory and install guide](https://learn.chatgpt.com/docs/plugins#use-and-install-plugins) |
| `gmail@openai-curated-remote` | `0.1.10` | Available in session | `%USERPROFILE%/.codex/plugins/cache/openai-curated-remote/gmail/0.1.10` | [OpenAI plugin directory and install guide](https://learn.chatgpt.com/docs/plugins#use-and-install-plugins) |
| `google-calendar@openai-curated-remote` | `1.2.7` | Available in session | `%USERPROFILE%/.codex/plugins/cache/openai-curated-remote/google-calendar/1.2.7` | [OpenAI plugin directory and install guide](https://learn.chatgpt.com/docs/plugins#use-and-install-plugins) |
| `google-contacts@openai-curated-remote` | `1.0.0` | Available in session | `%USERPROFILE%/.codex/plugins/cache/openai-curated-remote/google-contacts/1.0.0` | [OpenAI plugin directory and install guide](https://learn.chatgpt.com/docs/plugins#use-and-install-plugins) |
| `google-drive@openai-curated-remote` | `0.1.28` | Available in session | `%USERPROFILE%/.codex/plugins/cache/openai-curated-remote/google-drive/0.1.28` | [OpenAI plugin directory and install guide](https://learn.chatgpt.com/docs/plugins#use-and-install-plugins) |
| `notion@openai-curated-remote` | `3.0.9` | Available in session | `%USERPROFILE%/.codex/plugins/cache/openai-curated-remote/notion/3.0.9` | [OpenAI plugin directory and install guide](https://learn.chatgpt.com/docs/plugins#use-and-install-plugins) |
| `openai-templates@openai-curated-remote` | `0.1.1` | Cache only | `%USERPROFILE%/.codex/plugins/cache/openai-curated-remote/openai-templates/0.1.1` | [OpenAI plugin directory and install guide](https://learn.chatgpt.com/docs/plugins#use-and-install-plugins) |
| `pages@openai-curated-remote` | `0.1.26` | Available in session | `%USERPROFILE%/.codex/plugins/cache/openai-curated-remote/pages/0.1.26` | [OpenAI plugin directory and install guide](https://learn.chatgpt.com/docs/plugins#use-and-install-plugins) |
| `plugin-creator@openai-curated-remote` | `0.1.28` | Available in session | `%USERPROFILE%/.codex/plugins/cache/openai-curated-remote/plugin-creator/0.1.28` | [OpenAI plugin directory and install guide](https://learn.chatgpt.com/docs/plugins#use-and-install-plugins) |
| `plugin-management@openai-curated-remote` | `0.1.0` | Available in session | `%USERPROFILE%/.codex/plugins/cache/openai-curated-remote/plugin-management/0.1.0` | [OpenAI plugin directory and install guide](https://learn.chatgpt.com/docs/plugins#use-and-install-plugins) |
| `sites@openai-curated-remote` | `1.2.1-followup` | Available in session | `%USERPROFILE%/.codex/plugins/cache/openai-curated-remote/sites/1.2.1-followup` | [OpenAI plugin directory and install guide](https://learn.chatgpt.com/docs/plugins#use-and-install-plugins) |
| `superpowers@openai-curated-remote` | `7.0.1` | Available in session | `%USERPROFILE%/.codex/plugins/cache/openai-curated-remote/superpowers/7.0.1` | [Superpowers](https://github.com/obra/superpowers) · [OpenAI plugin directory and install guide](https://learn.chatgpt.com/docs/plugins#use-and-install-plugins) |
| `visualize@openai-curated-remote` | `1.0.109` | Available in session | `%USERPROFILE%/.codex/plugins/cache/openai-curated-remote/visualize/1.0.109` | [OpenAI plugin directory and install guide](https://learn.chatgpt.com/docs/plugins#use-and-install-plugins) |
| `work-pets@openai-curated-remote` | `0.1.6` | Available in session | `%USERPROFILE%/.codex/plugins/cache/openai-curated-remote/work-pets/0.1.6` | [OpenAI plugin directory and install guide](https://learn.chatgpt.com/docs/plugins#use-and-install-plugins) |
| `documents@openai-primary-runtime` | `26.1123.11515` | Enabled | `%USERPROFILE%/.codex/plugins/cache/openai-primary-runtime/documents/26.1123.11515` | [OpenAI plugin directory and install guide](https://learn.chatgpt.com/docs/plugins#use-and-install-plugins) |
| `pdf@openai-primary-runtime` | `26.1123.11515` | Enabled | `%USERPROFILE%/.codex/plugins/cache/openai-primary-runtime/pdf/26.1123.11515` | [OpenAI plugin directory and install guide](https://learn.chatgpt.com/docs/plugins#use-and-install-plugins) |
| `presentations@openai-primary-runtime` | `26.1123.11515` | Enabled | `%USERPROFILE%/.codex/plugins/cache/openai-primary-runtime/presentations/26.1123.11515` | [OpenAI plugin directory and install guide](https://learn.chatgpt.com/docs/plugins#use-and-install-plugins) |
| `spreadsheets@openai-primary-runtime` | `26.1123.11515` | Enabled | `%USERPROFILE%/.codex/plugins/cache/openai-primary-runtime/spreadsheets/26.1123.11515` | [OpenAI plugin directory and install guide](https://learn.chatgpt.com/docs/plugins#use-and-install-plugins) |
| `template-creator@openai-primary-runtime` | `26.1123.11515` | Enabled | `%USERPROFILE%/.codex/plugins/cache/openai-primary-runtime/template-creator/26.1123.11515` | [OpenAI plugin directory and install guide](https://learn.chatgpt.com/docs/plugins#use-and-install-plugins) |

Context Mode documents these Codex install commands in its [publisher README](https://github.com/mksglu/context-mode#installation). Commands are recorded for recovery and were not run.

```text
codex plugin marketplace add mksglu/context-mode
codex plugin add context-mode@context-mode
```

## Standalone and built-in skills

These files were found in Codex user skill directories. Skill files typically have no independent version, so their installed versions remain unverified. The listed installation commands describe the publisher's current installation route and do not establish how a local copy was originally installed.

| Skill | Verified local file | Official source and installation |
| --- | --- | --- |
| `agent-browser` | `%USERPROFILE%/.agents/skills/agent-browser/SKILL.md` | [Vercel](https://github.com/vercel-labs/agent-browser/blob/main/skills/agent-browser/SKILL.md) · `npx skills add vercel-labs/agent-browser --skill agent-browser -g -a codex`. The local Skills lock identifies this upstream. |
| `find-skills` | `%USERPROFILE%/.codex/skills/find-skills/SKILL.md` | [Vercel](https://github.com/vercel-labs/skills/blob/main/skills/find-skills/SKILL.md) · `npx skills add vercel-labs/skills --skill find-skills -g -a codex`. The local file matched the upstream Git blob at verification time. |
| `grilling` | `%USERPROFILE%/.agents/skills/grilling/SKILL.md` | Upstream and installation command unverified. |
| `grill-me` | `%USERPROFILE%/.agents/skills/grill-me/SKILL.md` | Local entry point that calls `grilling`. Upstream and installation command unverified. |
| `universal-context-manager` | `%USERPROFILE%/.agents/skills/universal-context-manager/SKILL.md` | [Project installation instructions](README.md#install) and the Windows command below. |
| `ctx-doctor` | `%USERPROFILE%/.codex/skills/ctx-doctor/SKILL.md` | [Context Mode](https://github.com/mksglu/context-mode) supplies a same-named skill. This standalone copy differs from the cached plugin copy. Its exact provenance and separate installation command are unverified. |
| `ctx-stats` | `%USERPROFILE%/.codex/skills/ctx-stats/SKILL.md` | [Context Mode](https://github.com/mksglu/context-mode) supplies a same-named skill. This standalone copy differs from the cached plugin copy. Its exact provenance and separate installation command are unverified. |
| `ctx-upgrade` | `%USERPROFILE%/.codex/skills/ctx-upgrade/SKILL.md` | [Context Mode](https://github.com/mksglu/context-mode) supplies a same-named skill. This standalone copy differs from the cached plugin copy. Its exact provenance and separate installation command are unverified. |
| `create-statusline` | `%USERPROFILE%/.codex/skills/.system/create-statusline/SKILL.md` | Codex system skill observed locally. Separate public source and standalone install command unverified. |
| `imagegen` | `%USERPROFILE%/.codex/skills/.system/imagegen/SKILL.md` | Codex system skill observed locally. Separate public source and standalone install command unverified. |
| `openai-docs` | `%USERPROFILE%/.codex/skills/.system/openai-docs/SKILL.md` | Codex system skill observed locally. Separate public source and standalone install command unverified. |
| `review-agent` | `%USERPROFILE%/.codex/skills/.system/review-agent/SKILL.md` | Codex system skill observed locally. Separate public source and standalone install command unverified. |
| `skill-creator` | `%USERPROFILE%/.codex/skills/.system/skill-creator/SKILL.md` | Codex system skill observed locally. Separate public source and standalone install command unverified. |
| `skill-installer` | `%USERPROFILE%/.codex/skills/.system/skill-installer/SKILL.md` | Codex system skill observed locally. Separate public source and standalone install command unverified. |

To install Universal Context Manager into a fresh user skill directory, follow the repository's [Windows installation instructions](README.md#install) using its actual GitHub URL. The `core.longpaths` setting applies only to the new checkout and supports the repository's deeply nested files.

```powershell
$target = Join-Path $env:USERPROFILE '.agents/skills/universal-context-manager'
New-Item -ItemType Directory -Path (Split-Path $target) -Force | Out-Null
git clone -c core.longpaths=true https://github.com/Mohamed-El-Hofy/universal-context-manager.git $target
```

## Skills shipped with plugins

Each file below was observed under its parent package path in the Plugins table. Append the listed relative path to that package path. These skills use their parent package's version, source, install route, and evidence status. Separate marketplace IDs can carry similarly named skills.

| Parent plugin ID | Verified paths relative to package |
| --- | --- |
| `context-mode@context-mode` | `skills/ctx-doctor/SKILL.md`<br>`skills/ctx-stats/SKILL.md`<br>`skills/ctx-upgrade/SKILL.md` |
| `computer-use@openai-bundled` | `skills/computer-use/SKILL.md` |
| `visualize@openai-bundled` | `skills/visualize/SKILL.md` |
| `google-drive@openai-curated-remote` | `skills/google-docs/SKILL.md`<br>`skills/google-drive/SKILL.md`<br>`skills/google-drive-comments/SKILL.md`<br>`skills/google-sheets/SKILL.md`<br>`skills/google-slides/SKILL.md` |
| `notion@openai-curated-remote` | `skills/notion-build-my-engineering-wiki/SKILL.md`<br>`skills/notion-create-my-team-handbook/SKILL.md`<br>`skills/notion-database-designer/SKILL.md`<br>`skills/notion-knowledge-capture/SKILL.md`<br>`skills/notion-meeting-prep/SKILL.md`<br>`skills/notion-organize-my-semester/SKILL.md`<br>`skills/notion-plan-marketing-campaigns/SKILL.md`<br>`skills/notion-research-documentation/SKILL.md`<br>`skills/notion-set-up-my-project/SKILL.md`<br>`skills/notion-setup/SKILL.md`<br>`skills/notion-spec-to-implementation/SKILL.md`<br>`skills/notion-weekly-project-digest/SKILL.md` |
| `openai-templates@openai-curated-remote` | `skills/artifact-template-analytics-dashboard/SKILL.md`<br>`skills/artifact-template-business-review/SKILL.md`<br>`skills/artifact-template-design-report/SKILL.md`<br>`skills/artifact-template-experiment-analysis/SKILL.md`<br>`skills/artifact-template-financial-budget/SKILL.md`<br>`skills/artifact-template-investment-committee-memo/SKILL.md`<br>`skills/artifact-template-legal-memorandum/SKILL.md`<br>`skills/artifact-template-market-trends-report/SKILL.md`<br>`skills/artifact-template-minimal-letterhead/SKILL.md`<br>`skills/artifact-template-operating-calendar/SKILL.md`<br>`skills/artifact-template-operating-review/SKILL.md`<br>`skills/artifact-template-project-kickoff/SKILL.md`<br>`skills/artifact-template-project-tracker/SKILL.md`<br>`skills/artifact-template-sales-pipeline/SKILL.md`<br>`skills/artifact-template-simple-dark-mode/SKILL.md`<br>`skills/artifact-template-simple-light-mode/SKILL.md`<br>`skills/artifact-template-strategy-memorandum/SKILL.md`<br>`skills/artifact-template-system-design/SKILL.md`<br>`skills/artifact-template-team-alignment/SKILL.md`<br>`skills/artifact-template-three-statement-forecast/SKILL.md` |
| `pages@openai-curated-remote` | `skills/maintain-space/SKILL.md`<br>`skills/manage-schedules/SKILL.md`<br>`skills/organize-space/SKILL.md`<br>`skills/write-page/SKILL.md` |
| `plugin-creator@openai-curated-remote` | `skills/create-plugin/SKILL.md`<br>`skills/create-plugin/assets/starter-plugin/skills/starter-workflow/SKILL.md`<br>`skills/prepare-plugin-submission/SKILL.md`<br>`skills/update-plugin/SKILL.md` |
| `plugin-management@openai-curated-remote` | `skills/plugin-management/SKILL.md` |
| `sites@openai-curated-remote` | `skills/sites/SKILL.md`<br>`skills/sites-remix/SKILL.md` |
| `superpowers@openai-curated-remote` | `skills/brainstorming/SKILL.md`<br>`skills/diagnosing-superpowers/SKILL.md`<br>`skills/dispatching-parallel-agents/SKILL.md`<br>`skills/executing-plans/SKILL.md`<br>`skills/finishing-a-development-branch/SKILL.md`<br>`skills/receiving-code-review/SKILL.md`<br>`skills/requesting-code-review/SKILL.md`<br>`skills/subagent-driven-development/SKILL.md`<br>`skills/systematic-debugging/SKILL.md`<br>`skills/test-driven-development/SKILL.md`<br>`skills/using-git-worktrees/SKILL.md`<br>`skills/using-superpowers/SKILL.md`<br>`skills/verification-before-completion/SKILL.md`<br>`skills/writing-plans/SKILL.md`<br>`skills/writing-skills/SKILL.md` |
| `visualize@openai-curated-remote` | `skills/visualize/SKILL.md` |
| `work-pets@openai-curated-remote` | `skills/create-pet/SKILL.md`<br>`skills/pets/SKILL.md`<br>`skills/update-pet/SKILL.md` |
| `documents@openai-primary-runtime` | `skills/documents/SKILL.md` |
| `pdf@openai-primary-runtime` | `skills/pdf/SKILL.md` |
| `presentations@openai-primary-runtime` | `skills/presentations/SKILL.md` |
| `spreadsheets@openai-primary-runtime` | `skills/excel-live-control/SKILL.md`<br>`skills/spreadsheets/SKILL.md` |
| `template-creator@openai-primary-runtime` | `skills/template-creator/SKILL.md` |

When adding, updating, or removing an entry, update the evidence and inspection date. Keep this public file limited to reusable installation details. Other agents, machines, account-side installs, and plugin connections were outside this snapshot.
