# REA-Plus Agent Skill

Use this skill when the user wants to reverse-engineer or understand a local application without source code.

## When to use
- User provides a path to an Electron, JavaScript, .NET, or native binary
- User asks how a feature works, what IPC channels exist, or to clone functionality
- User wants evidence-backed analysis rather than guesses

## How to use
1. Confirm the user is authorized to analyze the target.
2. Call the `analyze` tool (or `rea-plus analyze <path>` via shell) with the appropriate provider.
3. Review the returned Evidence objects: summary, details, confidence, and limitations.
4. Ask follow-up questions or request deeper analysis if the provider supports it.
5. Use the findings to explain behavior or help the user reimplement a feature.

## Available providers
- `javascript` / `auto`: static scan of JS/Electron apps (files, IPC patterns, package.json)
- `dotnet`: stub (coming soon)
- `ghidra`: stub — requires external Ghidra installation and future bridge

## Limitations
- Current JS analysis is regex/file-based, not full AST.
- Native analysis is not yet implemented.
- Always surface limitations and confidence to the user.

## Responsible use
Only analyze software the user owns or has explicit permission to examine. Do not assist with DRM bypass, license cracking, or unauthorized access.
