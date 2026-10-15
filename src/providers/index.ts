/**
 * Provider registry. New analysis backends are registered here.
 */

import { analyzeJavaScriptApplication } from './javascript.js';
import { analyzeDotNet } from './dotnet.js';

export type ProviderName = 'javascript' | 'dotnet' | 'ghidra' | 'auto';

export async function runProvider(
  provider: ProviderName,
  targetPath: string
): Promise<any> {
  switch (provider) {
    case 'javascript':
      return analyzeJavaScriptApplication(targetPath);
    case 'dotnet':
      return analyzeDotNet(targetPath);
    case 'auto':
      // Prefer JS if directory looks like a Node/Electron project, otherwise try .NET
      try {
        const fs = await import('fs/promises');
        const pkg = await fs.readFile(targetPath + '/package.json', 'utf8').catch(() => null);
        if (pkg) return analyzeJavaScriptApplication(targetPath);
      } catch { /* ignore */ }
      return analyzeDotNet(targetPath);
    case 'ghidra':
      return {
        target: targetPath,
        targetType: 'native',
        findings: [],
        unresolved: ['Ghidra provider requires external installation and is not yet bridged'],
        warnings: ['Stub only — install Ghidra and implement headless bridge'],
      };
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}
