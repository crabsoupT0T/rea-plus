# REA-Plus

**More powerful agent-driven reverse engineering toolkit.**

Inspired by [REA (Reverse Engineer Anything)](https://github.com/morluto/rea), but designed to go further: richer evidence models, better multi-provider orchestration, stronger agent workflows, and broader target coverage.

## Goals

- Clean MCP server + CLI that coding agents (Claude Code, Codex, Cursor, Grok Build, Gemini CLI, etc.) can call
- Evidence-first results (what was found, where, confidence, limitations)
- Support for native binaries (via Ghidra/Hopper/IDA), JavaScript/Electron, .NET, Android APKs, websites, firmware, and more
- Local analysis only — no cloud upload of targets
- Extensible provider system so new engines can be plugged in
- Better agent skills and multi-step investigation flows

## Status

Early scaffold. Core architecture and MCP interface are being built out.

## Quick Start (planned)

```bash
npx rea-plus setup
# or
npm install -g rea-plus
rea-plus --help
```

## Architecture (high level)

- **MCP server**: Tools that agents call (analyze, decompile, xrefs, search, etc.)
- **Providers**: Pluggable backends (Ghidra, Hopper, static JS parser, JADX, etc.)
- **Evidence model**: Structured findings with provenance and limitations
- **CLI**: Same capabilities without an agent
- **Agent skills**: Workflow instructions that guide multi-step investigations

## Responsible Use

Only analyze software you own or are explicitly authorized to examine. This project does not support DRM circumvention, license bypasses, unauthorized access, or copying protected code/assets.

## License

MIT

## Contributing

Contributions welcome. Start with issues or PRs for new providers, better evidence schemas, or agent workflow improvements.
