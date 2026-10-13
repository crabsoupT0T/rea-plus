# REA-Plus Roadmap

## Phase 1 — Core scaffolding
- [x] Repository + package structure
- [x] Basic MCP server with tool registration
- [x] CLI (analyze + mcp)
- [x] Evidence model

## Phase 2 — High-value static targets
- [x] JavaScript / Electron static analysis (files, IPC patterns, package.json)
- [ ] .NET assembly inspection (metadata, CIL)
- [ ] Simple string / symbol search
- [ ] Deeper AST-based analysis for JS

## Phase 3 — Native providers
- [ ] Ghidra headless bridge (decompile, xrefs, functions)
- [ ] Optional Hopper support
- [x] Provider abstraction so new engines are easy to add

## Phase 4 — Agent experience
- [x] Agent skill / workflow instructions
- [ ] Multi-step investigation templates
- [ ] Richer evidence (call graphs, data flow hints)
- [ ] Comparison and reconstruction helpers

## Phase 5 — Broader coverage
- [ ] Android APK (JADX)
- [ ] Browser / network observation
- [ ] Firmware and other specialized targets
- [ ] Better Windows / Linux / macOS parity

## Differentiating ideas (more powerful than REA)
- Stronger typed evidence schema with explicit confidence and limitations
- Built-in multi-provider fallback and comparison
- Agent-guided reconstruction testing (generate + verify)
- Plugin system for custom analyzers
- Local caching of analysis results for faster follow-ups
