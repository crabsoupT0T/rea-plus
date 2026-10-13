#!/usr/bin/env node
/**
 * REA-Plus CLI entry point.
 * Provides the same analysis capabilities as the MCP server.
 */

import { Command } from 'commander';
import { runProvider } from './providers/index.js';
import { startMcpServer } from './mcp/server.js';

const program = new Command();

program
  .name('rea-plus')
  .description('More powerful agent-driven reverse engineering toolkit')
  .version('0.1.0');

program
  .command('analyze')
  .description('Analyze a target (JS/Electron, .NET, binary, etc.)')
  .argument('<path>', 'Path to the target')
  .option('--provider <name>', 'Provider (auto, javascript, dotnet, ghidra)', 'auto')
  .action(async (targetPath: string, options: { provider: string }) => {
    try {
      console.error(`Analyzing ${targetPath} with provider=${options.provider}...`);
      const result = await runProvider(options.provider as any, targetPath);
      console.log(JSON.stringify(result, null, 2));
    } catch (err: any) {
      console.error('Error:', err.message);
      process.exit(1);
    }
  });

program
  .command('mcp')
  .description('Start the MCP server for coding agents')
  .action(async () => {
    await startMcpServer();
  });

program.parse();
