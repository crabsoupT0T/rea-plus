/**
 * Provider registry. New analysis backends are registered here.
 */

import { analyzeJavaScriptApplication } from './javascript.js';

export type ProviderName = 'javascript' | 'dotnet' | 'ghidra' | 'auto';

export async function runProvider(
  provider: ProviderName,
  targetPath: string
): Promise<any> {
  switch (provider) {
    case 'javascript':
    case 'auto':
      return analyzeJavaScriptApplication(targetPath);
    case 'dotnet':
      return {
        target: targetPath,
        targetType: 'dotnet',
        findings: [],
        unresolved: [' .NET provider not yet implemented'],
        warnings: ['Stub only'],
      };
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
