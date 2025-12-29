import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

export interface MCPServerConfig {
  name: string;
  version: string;
  logLevel?: "debug" | "info" | "warn" | "error";
}

interface CalculateArgs {
  operation: string;
  a: number;
  b: number;
}

interface TimeArgs {
  format?: string;
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
        },
      }
    );

    this.setupHandlers();
  }

  // #region Tool Definitions

  private getCalculateToolDefinition() {
    return {
      name: "calculate",
      description: "Perform a simple calculation (add, subtract, multiply, divide)",
      inputSchema: {
        type: "object",
        properties: {
          operation: {
            type: "string",
            description: "The operation to perform",
            enum: ["add", "subtract", "multiply", "divide"],
          },
          a: {
            type: "number",
            description: "First number",
          },
          b: {
            type: "number",
            description: "Second number",
          },
        },
        required: ["operation", "a", "b"],
      },
    };
  }

  private getTimeToolDefinition() {
    return {
      name: "get_current_time",
      description: "Get the current date and time",
      inputSchema: {
        type: "object",
        properties: {
          format: {
            type: "string",
            description: "Time format: 'short' or 'full'",
            enum: ["short", "full"],
            default: "short",
          },
        },
      },
    };
  }

  // #endregion

  // #region Calculate Tool

  private performCalculation(operation: string, a: number, b: number): number {
    switch (operation) {
      case "add":
        return a + b;
      case "subtract":
        return a - b;
      case "multiply":
        return a * b;
      case "divide":
        if (b === 0) {
          throw new Error("Division by zero is not allowed");
        }
        return a / b;
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  private getOperationSymbol(operation: string): string {
    const symbols: Record<string, string> = {
      add: "+",
      subtract: "-",
      multiply: "×",
      divide: "÷",
    };
    return symbols[operation] || operation;
  }

  private formatCalculationResult(operation: string, a: number, b: number, result: number) {
    const symbol = this.getOperationSymbol(operation);
    return {
      operation,
      operands: { a, b },
      result,
      expression: `this response is comming from chaltito: ${a} ${symbol} ${b} = ${result}`,
    };
  }

  private async executeCalculate(args: CalculateArgs) {
    const { operation, a, b } = args;
    const result = this.performCalculation(operation, a, b);
    const formattedResult = this.formatCalculationResult(operation, a, b, result);
    return this.createSuccessResponse(formattedResult);
  }

  // #endregion

  // #region Time Tool

  private formatTimeString(format: string): string {
    const now = new Date();
    return format === "full" ? now.toLocaleString() : now.toLocaleTimeString();
  }

  private formatTimeResult(format: string) {
    const now = new Date();
    return {
      timestamp: now.toISOString(),
      formatted: this.formatTimeString(format),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }

  private async executeGetCurrentTime(args: TimeArgs) {
    const format = args?.format || "short";
    const result = this.formatTimeResult(format);
    return this.createSuccessResponse(result);
  }

  // #endregion

  // #region Response Helpers

  private createSuccessResponse(data: unknown) {
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  private createErrorResponse(error: unknown) {
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            error: error instanceof Error ? error.message : "Unknown error",
          }),
        },
      ],
      isError: true,
    };
  }

  // #endregion

  // #region Request Handlers

  private setupHandlers(): void {
    this.setupListToolsHandler();
    this.setupCallToolHandler();
  }

  private setupListToolsHandler(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          this.getCalculateToolDefinition(),
          this.getTimeToolDefinition(),
        ],
      };
    });
  }

  private setupCallToolHandler(): void {
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "calculate":
            return await this.executeCalculate(args as unknown as CalculateArgs);
          case "get_current_time":
            return await this.executeGetCurrentTime(args as unknown as TimeArgs);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return this.createErrorResponse(error);
      }
    });
  }

  // #endregion

  // #region Lifecycle

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error(`MCP Server "${this.config.name}" started`);
  }

  async stop(): Promise<void> {
    await this.server.close();
    console.error(`MCP Server "${this.config.name}" stopped`);
  }

  // #endregion
}
