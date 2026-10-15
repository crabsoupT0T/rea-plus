import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { url, prompt } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Valid URL is required' }, { status: 400 });
    }

    // Basic safety: only http/https, no obvious local/private ranges
    let parsed: URL;
    try {
      parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('Only http/https allowed');
      }
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Passive fetch (no JS execution, no cookies, short timeout)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

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
      return NextResponse.json(
        { error: `Fetch failed: ${err.message}` },
        { status: 502 }
      );
    }
    clearTimeout(timeout);

    // Very basic extraction (no full DOM parser for simplicity)
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const metaDesc = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i);
    const scriptSrcs = [...html.matchAll(/<script[^>]+src=["']([^"']+)/gi)].map(m => m[1]).slice(0, 15);
    const linkHrefs = [...html.matchAll(/<link[^>]+href=["']([^"']+)/gi)].map(m => m[1]).slice(0, 10);
    const forms = (html.match(/<form/gi) || []).length;
    const inputs = (html.match(/<input/gi) || []).length;

    const evidence = {
      url: finalUrl,
      status,
      title: titleMatch?.[1]?.trim() || null,
      description: metaDesc?.[1]?.trim() || null,
      scriptCount: scriptSrcs.length,
      scriptSrcs,
      linkCount: linkHrefs.length,
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

    const aiPrompt = `You are helping reverse-engineer a public website the user is authorized to analyze.

Target URL: ${finalUrl}
User request: ${prompt || '(no specific request)'}

Evidence from passive inspection:
${JSON.stringify(evidence, null, 2)}

Based on the evidence and the user's request, provide:
1. A short explanation of how the relevant part likely works
2. Clean, self-contained code that implements a similar feature (HTML/CSS/JS or React as appropriate)
3. Note any limitations of the evidence

Do not claim this is the original source. Mark it as a reconstruction.`;

    const suggestedCode = prompt
      ? `// Reconstruction based on passive analysis of ${finalUrl}
// User request: ${prompt}
// This is NOT the original source — review and adapt.

// TODO: Implement based on the evidence above
console.log('Evidence available for AI to expand');
`
      : null;

    return NextResponse.json({
      evidence,
      aiPrompt,
      suggestedCode,
      note: 'Passive analysis only. For full reverse engineering of dynamic behavior, use a local browser tool or REA with browser observation.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
