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

## Current Status

Working (v0.1.0):
- MCP server with `analyze` tool
- CLI `analyze` and `mcp` commands
- JavaScript / Electron static analysis provider (file inventory, IPC pattern detection, package.json)
- Typed evidence model with confidence and limitations
- Agent skill / workflow instructions (`skills/rea-plus/SKILL.md`)
- Basic test

Coming next: .NET provider, Ghidra headless bridge, richer AST analysis, caching, multi-provider comparison.

## Quick Start

```bash
# Clone and install
git clone https://github.com/crabsoupT0T/rea-plus.git
cd rea-plus
npm install
npm run build

# Analyze a local JS/Electron app
node dist/cli.js analyze /path/to/app --provider javascript

# Or run MCP server for agents
node dist/cli.js mcp
```

## Architecture

- **MCP server** (`src/mcp/server.ts`): Tools agents call
- **Providers** (`src/providers/`): Pluggable backends (javascript implemented; ghidra/dotnet stubs)
- **Evidence model** (`src/evidence.ts`): Structured findings with provenance
- **CLI** (`src/cli.ts`): Same capabilities without an agent
- **Agent skills**: `skills/rea-plus/SKILL.md`

## Responsible Use

Only analyze software you own or are explicitly authorized to examine. This project does not support DRM circumvention, license bypasses, unauthorized access, or copying protected code/assets. See DISCLAIMER.md.

## License

MIT

## Contributing

Contributions welcome. See ROADMAP.md. PRs for new providers, better evidence, or agent workflows are especially useful.
