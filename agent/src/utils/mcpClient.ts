import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
import path from 'path';

/**
 * MCP Client wrapper for connecting to MCP server
 */
export class MCPClientWrapper {
  private client: Client | null = null;
  private transport: StdioClientTransport | null = null;

  /**
   * Connect to MCP server via stdio
   */
  async connect(): Promise<void> {
    // Get MCP server path - from agent root, go up to workspace root, then to mcp server
    const mcpServerPath = path.resolve(process.cwd(), '..', 'mcp', 'dist', 'server', 'index.js');
    
    console.log('🔌 Connecting to MCP server at:', mcpServerPath);
    
    // Create transport to MCP server
    this.transport = new StdioClientTransport({
      command: 'node',
      args: [mcpServerPath],
    });

    // Create MCP client
    this.client = new Client(
      {
        name: 'azure-devops-agent',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );

    // Connect to server
    await this.client.connect(this.transport);
    console.log('✅ Connected to MCP server');
  }

  /**
   * Discover tools from MCP server and convert to LangChain tools
   */
  async getTools(): Promise<Tool[]> {
    if (!this.client) {
      throw new Error('MCP client not connected. Call connect() first.');
    }

    // List available tools from MCP server
    const { tools } = await this.client.listTools();
    console.log(`📋 Discovered ${tools.length} MCP tools:`, tools.map(t => t.name));

    // Convert MCP tools to LangChain tools
    const langchainTools: Tool[] = tools.map((mcpTool) => {
      return {
        name: mcpTool.name,
        description: mcpTool.description || '',
        schema: this.convertMCPSchemaToZod(mcpTool.inputSchema),
        call: async (input: any) => {
          if (!this.client) {
            throw new Error('MCP client disconnected');
          }

          // Call MCP tool
          const result = await this.client.callTool({
            name: mcpTool.name,
            arguments: input,
          });

          // Extract text content from MCP response
          const resultContent = result.content as any;
          if (resultContent && Array.isArray(resultContent) && resultContent.length > 0) {
            const textContent = resultContent.find((c: any) => c.type === 'text');
            if (textContent) {
              return textContent.text;
            }
          }

          return JSON.stringify(result);
        },
      } as any;
    });

    return langchainTools;
  }

  /**
   * Convert MCP input schema to Zod schema for LangChain
   */
  private convertMCPSchemaToZod(inputSchema: any): z.ZodType<any> {
    if (!inputSchema || !inputSchema.properties) {
      return z.object({});
    }

    const shape: Record<string, z.ZodType<any>> = {};

    for (const [key, prop] of Object.entries(inputSchema.properties)) {
      const propDef = prop as any;
      
      if (propDef.type === 'string') {
        shape[key] = z.string().describe(propDef.description || '');
      } else if (propDef.type === 'number') {
        shape[key] = z.number().describe(propDef.description || '');
      } else if (propDef.type === 'boolean') {
        shape[key] = z.boolean().describe(propDef.description || '');
      } else {
        shape[key] = z.any().describe(propDef.description || '');
      }

      // Make optional if not in required array
      if (!inputSchema.required || !inputSchema.required.includes(key)) {
        shape[key] = shape[key].optional();
      }
    }

    return z.object(shape);
  }

  /**
   * Disconnect from MCP server
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      console.log('🔌 Disconnected from MCP server');
    }
  }
}
