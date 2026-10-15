import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'REA-Plus Web — Website Analyzer',
  description: 'Paste a URL and describe what you need. Get reverse-engineering evidence and AI-ready code context.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0, background: '#0f1115', color: '#e8e8e8' }}>
        {children}
      </body>
    </html>
  );
}
