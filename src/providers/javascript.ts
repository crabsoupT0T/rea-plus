/**
 * Static analysis for JavaScript and Electron applications.
 * Scans directories for modules, IPC, preload, contextBridge, and key patterns.
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
      warnings.push('Target is not a directory. ASAR extraction not yet supported.');
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
      details: { count: files.length, sample: files.slice(0, 15).map(f => path.relative(targetPath, f)) },
      provenance: {
        tool: 'rea-plus',
        provider: 'javascript',
        location: targetPath,
        timestamp: new Date().toISOString(),
      },
      confidence: 'high',
      limitations: ['Shallow scan; does not parse full AST'],
    });

    // IPC patterns
    findings.push(...await findPatterns(targetPath, files, {
      idPrefix: 'ipc',
      type: 'ipc',
      regex: /(ipcMain|ipcRenderer)\.(on|handle|send|invoke|removeListener)/g,
      summary: (rel) => `IPC usage detected in ${rel}`,
      limit: 40,
    }));

    // contextBridge / preload patterns
    findings.push(...await findPatterns(targetPath, files, {
      idPrefix: 'context-bridge',
      type: 'preload',
      regex: /contextBridge\.exposeInMainWorld|preload:\s*['"`]/g,
      summary: (rel) => `contextBridge or preload reference in ${rel}`,
      limit: 30,
    }));

    // Electron app / BrowserWindow patterns
    findings.push(...await findPatterns(targetPath, files, {
      idPrefix: 'electron-app',
      type: 'electron',
      regex: /(new BrowserWindow|app\.(whenReady|on|quit)|Menu\.buildFromTemplate)/g,
      summary: (rel) => `Electron main-process pattern in ${rel}`,
      limit: 30,
    }));

    // package.json
    const pkg = await findPackageJson(targetPath);
    if (pkg) {
      findings.push({
        id: 'package-json',
        type: 'metadata',
        summary: 'Detected package.json',
        details: {
          name: pkg.name,
          version: pkg.version,
          main: pkg.main,
          dependencies: Object.keys(pkg.dependencies || {}).slice(0, 20),
          electron: pkg.devDependencies?.electron || pkg.dependencies?.electron,
        },
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
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== 'dist') {
      await scanJsFiles(full, files);
    } else if (entry.isFile() && /\.(js|mjs|cjs|ts|jsx|tsx)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

async function findPatterns(
  root: string,
  files: string[],
  opts: {
    idPrefix: string;
    type: string;
    regex: RegExp;
    summary: (rel: string) => string;
    limit: number;
  }
): Promise<Evidence[]> {
  const results: Evidence[] = [];
  for (const file of files.slice(0, opts.limit)) {
    try {
      const content = await fs.readFile(file, 'utf8');
      const matches = content.match(opts.regex);
      if (matches && matches.length > 0) {
        const rel = path.relative(root, file);
        results.push({
          id: `${opts.idPrefix}-${path.basename(file)}-${results.length}`,
          type: opts.type,
          summary: opts.summary(rel),
          details: { matches: matches.slice(0, 6), file: rel },
          provenance: {
            tool: 'rea-plus',
            provider: 'javascript',
            location: file,
            timestamp: new Date().toISOString(),
          },
          confidence: 'medium',
          limitations: ['Regex-based; may miss dynamic or heavily minified calls'],
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
