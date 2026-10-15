/**
 * Basic static inspection for .NET assemblies.
 * Looks for .dll/.exe files and extracts simple metadata (name, size, PE signature).
 * Full CIL disassembly requires additional tooling.
 */

import fs from 'fs/promises';
import path from 'path';
import { Evidence, AnalysisResult } from '../evidence.js';

export async function analyzeDotNet(targetPath: string): Promise<AnalysisResult> {
  const findings: Evidence[] = [];
  const unresolved: string[] = [];
  const warnings: string[] = [];

  try {
    const stats = await fs.stat(targetPath);
    const candidates: string[] = [];

    if (stats.isDirectory()) {
      const entries = await fs.readdir(targetPath, { withFileTypes: true });
      for (const e of entries) {
        if (e.isFile() && /\.(dll|exe)$/i.test(e.name)) {
          candidates.push(path.join(targetPath, e.name));
        }
      }
    } else if (/\.(dll|exe)$/i.test(targetPath)) {
      candidates.push(targetPath);
    }

    if (candidates.length === 0) {
      warnings.push('No .dll or .exe files found');
      unresolved.push('No candidate .NET assemblies');
    }

    for (const file of candidates.slice(0, 20)) {
      const st = await fs.stat(file);
      const buf = await fs.readFile(file);
      const isPe = buf.length > 2 && buf[0] === 0x4d && buf[1] === 0x5a; // MZ

      findings.push({
        id: `dotnet-${path.basename(file)}`,
        type: 'assembly',
        summary: `${path.basename(file)} (${st.size} bytes)${isPe ? ' — PE/MZ header detected' : ''}`,
        details: {
          path: path.relative(path.dirname(targetPath), file),
          size: st.size,
          isPe,
          hasClrHint: buf.includes(Buffer.from('CLR')),
        },
        provenance: {
          tool: 'rea-plus',
          provider: 'dotnet',
          location: file,
          timestamp: new Date().toISOString(),
        },
        confidence: isPe ? 'medium' : 'low',
        limitations: [
          'Header-only inspection; no full metadata or CIL disassembly',
          'CLR presence is a heuristic',
        ],
      });
    }
  } catch (err: any) {
    warnings.push(`Error: ${err.message}`);
    unresolved.push('Inspection failed');
  }

  return {
    target: targetPath,
    targetType: 'dotnet',
    findings,
    unresolved,
    warnings,
  };
}
