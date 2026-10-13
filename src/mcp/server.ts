/**
 * REA-Plus MCP server.
 * Exposes reverse-engineering tools to coding agents.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { runProvider } from '../providers/index.js';

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

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'analyze',
        description: 'Analyze a local application or binary target and return evidence-backed findings',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Absolute path to the target (directory or file)' },
            provider: {
              type: 'string',
              enum: ['auto', 'javascript', 'dotnet', 'ghidra'],
              description: 'Analysis provider to use',
              default: 'auto',
            },
          },
          required: ['path'],
        },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === 'analyze') {
      const { path, provider = 'auto' } = request.params.arguments as {
        path: string;
        provider?: string;
      };
      try {
        const result = await runProvider(provider as any, path);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err: any) {
        return {
          content: [{ type: 'text', text: `Error: ${err.message}` }],
          isError: true,
        };
      }
    }
    throw new Error(`Unknown tool: ${request.params.name}`);
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('REA-Plus MCP server running on stdio');
}

// Allow running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startMcpServer().catch(console.error);
}
