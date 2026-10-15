'use client';

import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>REA-Plus Web</h1>
      <p style={{ color: '#aaa', marginBottom: 24 }}>
        Paste a public website URL and describe what you need. Get structured evidence + AI-ready context.
        <br />
        <strong>Only analyze sites you own or are authorized to examine.</strong>
      </p>

      <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          style={inputStyle}
        />
        <textarea
          placeholder="What do you need? e.g. How does the search work? Extract the main form logic. Reimplement the hero section."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          style={inputStyle}
        />
        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? 'Analyzing…' : 'Analyze & Prepare Code Context'}
        </button>
      </form>

      {error && <p style={{ color: '#ff6b6b', marginTop: 16 }}>{error}</p>}

      {result && (
        <section style={{ marginTop: 32 }}>
          <h2>Analysis Evidence</h2>
          <pre style={preStyle}>{JSON.stringify(result.evidence, null, 2)}</pre>

          <h2 style={{ marginTop: 24 }}>AI Prompt (copy this)</h2>
          <pre style={preStyle}>{result.aiPrompt}</pre>

          {result.suggestedCode && (
            <>
              <h2 style={{ marginTop: 24 }}>Suggested Starting Code</h2>
              <pre style={preStyle}>{result.suggestedCode}</pre>
            </>
          )}
        </section>
      )}
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '12px 14px',
  borderRadius: 8,
  border: '1px solid #333',
  background: '#1a1d24',
  color: '#eee',
  fontSize: 15,
};

const buttonStyle: React.CSSProperties = {
  padding: '12px 20px',
  borderRadius: 8,
  border: 'none',
  background: '#3b82f6',
  color: 'white',
  fontSize: 15,
  cursor: 'pointer',
};

const preStyle: React.CSSProperties = {
  background: '#1a1d24',
  padding: 16,
  borderRadius: 8,
  overflow: 'auto',
  fontSize: 13,
  whiteSpace: 'pre-wrap',
};
