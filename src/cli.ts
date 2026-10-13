#!/usr/bin/env node
/**
 * REA-Plus CLI entry point.
 * Provides the same analysis capabilities as the MCP server.
 */

import { Command } from 'commander';

const program = new Command();

program
  .name('rea-plus')
  .description('More powerful agent-driven reverse engineering toolkit')
  .version('0.1.0');

program
  .command('analyze')
  .description('Analyze a target (JS/Electron, .NET, binary, etc.)')
  .argument('<path>', 'Path to the target')
  .option('--type <type>', 'Target type (auto, electron, net, binary)', 'auto')
  .action(async (path: string, options: { type: string }) => {
    console.log(`Analyzing ${path} as ${options.type}...`);
    // TODO: dispatch to providers
    console.log('Analysis not yet implemented. See roadmap.');
  });

program
  .command('mcp')
  .description('Start the MCP server for coding agents')
  .action(async () => {
    console.log('Starting MCP server...');
    // TODO: launch MCP server
  });

program.parse();
