import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

export interface MCPServerConfig {
  name: string;
  version: string;
  logLevel?: "debug" | "info" | "warn" | "error";
}

export class MCPServer {
  private server: Server;
  private config: MCPServerConfig;

  constructor(config: MCPServerConfig) {
    this.config = config;
    this.server = new Server(
      {
        name: config.name,
        version: config.version,
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "get_workspace_info",
            description: "Get information about the current VS Code workspace",
            inputSchema: {
              type: "object",
              properties: {
                includeFiles: {
                  type: "boolean",
                  description: "Whether to include file list",
                  default: false,
                },
              },
            },
          },
          {
            name: "execute_command",
            description: "Execute a VS Code command",
            inputSchema: {
              type: "object",
              properties: {
                command: {
                  type: "string",
                  description: "The VS Code command to execute",
                },
                args: {
                  type: "array",
                  description: "Arguments for the command",
                  items: {
                    type: "string",
                  },
                },
              },
              required: ["command"],
            },
          },
          {
            name: "create_file",
            description: "Create a new file in the workspace",
            inputSchema: {
              type: "object",
              properties: {
                path: {
                  type: "string",
                  description: "Relative path for the new file",
                },
                content: {
                  type: "string",
                  description: "Content of the file",
                },
              },
              required: ["path", "content"],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "get_workspace_info":
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    message: "Workspace info retrieved",
                    includeFiles: args?.includeFiles || false,
                  },
                  null,
                  2
                ),
              },
            ],
          };

        case "execute_command":
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  message: `Command ${args?.command} would be executed`,
                  command: args?.command,
                  args: args?.args || [],
                }),
              },
            ],
          };

        case "create_file":
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  message: "File created successfully",
                  path: args?.path,
                }),
              },
            ],
          };

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });

    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: "vscode://workspace/settings",
            name: "Workspace Settings",
            description: "Current VS Code workspace settings",
            mimeType: "application/json",
          },
          {
            uri: "vscode://workspace/extensions",
            name: "Installed Extensions",
            description: "List of installed VS Code extensions",
            mimeType: "application/json",
          },
        ],
      };
    });

    // Read resource content
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      if (uri === "vscode://workspace/settings") {
        return {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: JSON.stringify({ settings: "placeholder" }, null, 2),
            },
          ],
        };
      }

      if (uri === "vscode://workspace/extensions") {
        return {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: JSON.stringify({ extensions: [] }, null, 2),
            },
          ],
        };
      }

      throw new Error(`Resource not found: ${uri}`);
    });

    // List available prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: [
          {
            name: "code_review",
            description: "Generate a code review prompt",
            arguments: [
              {
                name: "language",
                description: "Programming language",
                required: true,
              },
            ],
          },
        ],
      };
    });

    // Get prompt content
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (name === "code_review") {
        return {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `Please review this ${args?.language || "code"} for best practices, potential bugs, and improvements.`,
              },
            },
          ],
        };
      }

      throw new Error(`Unknown prompt: ${name}`);
    });
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error(`MCP Server "${this.config.name}" started`);
  }

  async stop(): Promise<void> {
    await this.server.close();
    console.error(`MCP Server "${this.config.name}" stopped`);
  }
}
