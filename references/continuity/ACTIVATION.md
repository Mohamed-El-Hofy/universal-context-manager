# Install the single skill

Install or copy the complete `Universal Context Manager` directory using the skill discovery mechanism supported by your agent. Keep its internal directory tree intact. The root `SKILL.md` is the only entry point; do not install the archived source procedures as separate skills.

The checkpoint CLI can be run directly from this directory:

```powershell
node scripts/ucm.mjs init --project C:\path\to\project
```

Optional lifecycle adapter files live under `adapters/`. They are examples, not automatic setup. The Codex template uses a plugin-root variable and requires packaging or path adjustment for the target installation; Claude and Gemini examples contain placeholder paths. Configure and trust hooks explicitly in the target host, then verify a live callback there. The CLI and skill work without hooks.

No global agent settings, marketplaces, or host plugins are modified by this package.
