/**
 * REA-Plus MCP server.
 * Exposes reverse-engineering tools to coding agents.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

export async function startMcpServer() {
  const server = new Server(
    {
      name: 'rea-plus',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // TODO: register tools (analyze_javascript, decompile_function, search_strings, etc.)

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('REA-Plus MCP server running on stdio');
}
