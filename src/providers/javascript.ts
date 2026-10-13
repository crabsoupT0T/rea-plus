/**
 * Static analysis for JavaScript and Electron applications.
 * Scans directories or ASAR-like structures for modules, IPC, and key patterns.
 */

import fs from 'fs/promises';
import path from 'path';
import { Evidence, AnalysisResult } from '../evidence.js';

export async function analyzeJavaScriptApplication(targetPath: string): Promise<AnalysisResult> {
  const findings: Evidence[] = [];
  const unresolved: string[] = [];
  const warnings: string[] = [];

  try {
    const stats = await fs.stat(targetPath);
    if (!stats.isDirectory()) {
      warnings.push('Target is not a directory. Treating as single file or ASAR not yet supported.');
      return {
        target: targetPath,
        targetType: 'javascript',
        findings,
        unresolved: ['Directory scan required for full analysis'],
        warnings,
      };
    }

    const files = await scanJsFiles(targetPath);
    findings.push({
      id: 'js-file-count',
      type: 'inventory',
      summary: `Found ${files.length} JavaScript-related files`,
      details: { count: files.length, sample: files.slice(0, 10) },
      provenance: {
        tool: 'rea-plus',
        provider: 'javascript',
        location: targetPath,
        timestamp: new Date().toISOString(),
      },
      confidence: 'high',
      limitations: ['Shallow scan; does not parse full AST yet'],
    });

    // Look for common Electron / IPC patterns
    const ipcFindings = await findIpcPatterns(targetPath, files);
    findings.push(...ipcFindings);

    // Look for package.json / electron metadata
    const pkg = await findPackageJson(targetPath);
    if (pkg) {
      findings.push({
        id: 'package-json',
        type: 'metadata',
        summary: 'Detected package.json',
        details: pkg,
        provenance: {
          tool: 'rea-plus',
          provider: 'javascript',
          location: path.join(targetPath, 'package.json'),
          timestamp: new Date().toISOString(),
        },
        confidence: 'high',
        limitations: [],
      });
    }
  } catch (err: any) {
    warnings.push(`Analysis error: ${err.message}`);
    unresolved.push('Full scan failed');
  }

  return {
    target: targetPath,
    targetType: 'javascript',
    findings,
    unresolved,
    warnings,
  };
}

async function scanJsFiles(dir: string, files: string[] = []): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      await scanJsFiles(full, files);
    } else if (entry.isFile() && /\.(js|mjs|cjs|ts|jsx|tsx)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

async function findIpcPatterns(root: string, files: string[]): Promise<Evidence[]> {
  const results: Evidence[] = [];
  const ipcRegex = /(ipcMain|ipcRenderer)\.(on|handle|send|invoke)/g;
  for (const file of files.slice(0, 50)) { // limit for performance
    try {
      const content = await fs.readFile(file, 'utf8');
      const matches = content.match(ipcRegex);
      if (matches && matches.length > 0) {
        results.push({
          id: `ipc-${path.basename(file)}`,
          type: 'ipc',
          summary: `IPC usage detected in ${path.relative(root, file)}`,
          details: { matches: matches.slice(0, 5), file: path.relative(root, file) },
          provenance: {
            tool: 'rea-plus',
            provider: 'javascript',
            location: file,
            timestamp: new Date().toISOString(),
          },
          confidence: 'medium',
          limitations: ['Regex-based; may miss dynamic or minified calls'],
        });
      }
    } catch {
      // skip unreadable
    }
  }
  return results;
}

async function findPackageJson(dir: string): Promise<any | null> {
  try {
    const content = await fs.readFile(path.join(dir, 'package.json'), 'utf8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}
