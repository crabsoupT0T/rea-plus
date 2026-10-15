# REA-Plus Web

Web interface for pasting a website URL + describing what you need, then getting passive analysis evidence and an AI-ready prompt / starting code.

## Run locally

```bash
cd web
npm install
npm run dev
```

Open http://localhost:3000

## What it does

- Accepts a public URL and a natural-language request
- Performs a passive HTTP fetch (no JS execution, no cookies)
- Extracts basic signals (title, scripts, forms, etc.)
- Returns structured evidence + a ready-to-copy AI prompt that asks for reconstructed code

## Limitations

- Passive only — does not execute JavaScript or capture dynamic network calls
- Not a full reverse-engineering engine (for that, use the main CLI/MCP tools or local browser observation)
- Only for authorized targets

## Responsible use

Only analyze websites you own or have explicit permission to examine. Do not use this to bypass authentication, CAPTCHAs, rate limits, or to copy protected proprietary code.
