# REA-Plus Web

Web interface: paste a website URL + describe what you need → AI generates reconstructed code.

## Run locally

```bash
cd web
npm install
cp .env.example .env.local
# Edit .env.local and add your OPENAI_API_KEY (or AI_API_KEY)
npm run dev
```

Open http://localhost:3000

## AI setup

The backend calls an OpenAI-compatible chat completions endpoint.

- Set `OPENAI_API_KEY` (or `AI_API_KEY`)
- Optional: `AI_API_BASE` (default `https://api.openai.com/v1`)
- Optional: `AI_MODEL` (default `gpt-4o-mini`)

Works with OpenAI, xAI Grok, OpenRouter, local proxies, etc.

## What it does

1. Passive HTTP fetch of the URL
2. Extracts basic evidence (title, scripts, forms, etc.)
3. Sends evidence + your request to the AI
4. Returns the generated reconstruction code + evidence

## Limitations

- Passive only (no JS execution or dynamic network capture)
- Requires your own AI API key
- Only for authorized targets

## Responsible use

Only analyze websites you own or have explicit permission to examine. Do not use this to bypass authentication, CAPTCHAs, rate limits, or to copy protected proprietary code.
