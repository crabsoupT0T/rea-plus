import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { url, prompt } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Valid URL is required' }, { status: 400 });
    }

    let parsed: URL;
    try {
      parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('Only http/https allowed');
      }
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let html = '';
    let status = 0;
    let finalUrl = url;
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'REA-Plus-Web/0.1 (passive analysis; authorized use only)',
          Accept: 'text/html,application/xhtml+xml',
        },
        redirect: 'follow',
      });
      status = res.status;
      finalUrl = res.url;
      html = await res.text();
    } catch (err: any) {
      clearTimeout(timeout);
      return NextResponse.json({ error: `Fetch failed: ${err.message}` }, { status: 502 });
    }
    clearTimeout(timeout);

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const metaDesc = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i);
    const scriptSrcs = [...html.matchAll(/<script[^>]+src=["']([^"']+)/gi)].map(m => m[1]).slice(0, 15);
    const forms = (html.match(/<form/gi) || []).length;
    const inputs = (html.match(/<input/gi) || []).length;

    const evidence = {
      url: finalUrl,
      status,
      title: titleMatch?.[1]?.trim() || null,
      description: metaDesc?.[1]?.trim() || null,
      scriptCount: scriptSrcs.length,
      scriptSrcs,
      formCount: forms,
      inputCount: inputs,
      htmlLength: html.length,
      limitations: [
        'Passive fetch only — no JavaScript execution',
        'No authentication or cookie handling',
        'Regex-based extraction; incomplete for complex pages',
        'Does not capture dynamic network calls',
      ],
    };

    const systemPrompt = `You are an expert reverse engineer helping the user reconstruct functionality from a public website they are authorized to analyze.
Always mark output as a reconstruction, not original source. Be concise.`;

    const userMessage = `Target URL: ${finalUrl}
User request: ${prompt || 'Provide a useful reconstruction of the main interactive parts.'}

Evidence from passive inspection:
${JSON.stringify(evidence, null, 2)}

Provide:
1. A short explanation of how the relevant part likely works
2. Clean, self-contained code (prefer a single HTML file with embedded CSS/JS, or React if it clearly fits)
3. Note limitations of the evidence

Do not claim this is the original source.`;

    let generatedCode: string | null = null;
    let aiError: string | null = null;

    const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
    const apiBase = process.env.AI_API_BASE || 'https://api.openai.com/v1';
    const model = process.env.AI_MODEL || 'gpt-4o-mini';

    if (apiKey) {
      try {
        const aiRes = await fetch(`${apiBase}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMessage },
            ],
            temperature: 0.4,
            max_tokens: 2000,
          }),
        });

        if (!aiRes.ok) {
          const errText = await aiRes.text();
          aiError = `AI API error: ${aiRes.status} ${errText.slice(0, 200)}`;
        } else {
          const aiData = await aiRes.json();
          generatedCode = aiData.choices?.[0]?.message?.content || null;
        }
      } catch (err: any) {
        aiError = `AI call failed: ${err.message}`;
      }
    } else {
      aiError = 'No AI API key configured. Set OPENAI_API_KEY (or AI_API_KEY) in environment.';
    }

    return NextResponse.json({
      evidence,
      generatedCode,
      aiError,
      aiConfigured: !!apiKey,
      note: 'Passive analysis only. For dynamic sites use local browser tools.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
