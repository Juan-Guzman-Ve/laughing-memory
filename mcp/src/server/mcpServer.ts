import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import {
  loadBacklog,
  formatBacklogList,
  getWorkItemById as getWorkItemHelper,
} from "./backlogHelper.js";
import { KnowledgeGraph } from "./graphHelper.js";

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

interface GetWorkItemArgs {
  workItemId: number;
}

interface QueryGraphArgs {
  queryType: string;
  workItemId?: number;
  area?: string;
  assignee?: string;
  tag?: string;
  type?: string;
  state?: string;
}

export class MCPServer {
  private server: Server;
  private config: MCPServerConfig;
  private knowledgeGraph: KnowledgeGraph;

  constructor(config: MCPServerConfig) {
    this.config = config;
    this.knowledgeGraph = new KnowledgeGraph();
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

  private getListCurrentIterationItemsToolDefinition() {
    return {
      name: "list_current_iteration_items",
      description: "List all work items in the current sprint iteration with their owner, state, and type",
      inputSchema: {
        type: "object",
        properties: {},
      },
    };
  }

  private getWorkItemByIdToolDefinition() {
    return {
      name: "get_work_item_by_id",
      description: "Get detailed information about a specific work item by ID, including acceptance criteria, child items, and linked PRs",
      inputSchema: {
        type: "object",
        properties: {
          workItemId: {
            type: "number",
            description: "The ID of the work item to retrieve",
          },
        },
        required: ["workItemId"],
      },
    };
  }

  private getQueryGraphToolDefinition() {
    return {
      name: "query_graph",
      description: "Query the knowledge graph for structural relationships between work items. Use this for parent-child queries, filtering by area/assignee/tag/type/state.",
      inputSchema: {
        type: "object",
        properties: {
          queryType: {
            type: "string",
            enum: ["children", "parent", "by-area", "by-assignee", "by-tag", "by-type", "by-state"],
            description: "Type of graph query to perform",
          },
          workItemId: {
            type: "number",
            description: "Work item ID (required for 'children' and 'parent' queries)",
          },
          area: {
            type: "string",
            description: "Area path (required for 'by-area' query)",
          },
          assignee: {
            type: "string",
            description: "Assignee name (required for 'by-assignee' query)",
          },
          tag: {
            type: "string",
            description: "Tag name (required for 'by-tag' query)",
          },
          type: {
            type: "string",
            description: "Work item type (required for 'by-type' query)",
          },
          state: {
            type: "string",
            description: "Work item state (required for 'by-state' query)",
          },
        },
        required: ["queryType"],
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

  // #region Backlog Tools

  private async executeListCurrentIterationItems() {
    const backlog = await loadBacklog();
    const formattedList = formatBacklogList(backlog);
    return this.createSuccessResponse({ items: formattedList });
  }

  private async executeGetWorkItemById(args: GetWorkItemArgs) {
    const { workItemId } = args;
    const workItemDetails = await getWorkItemHelper(workItemId);
    return this.createSuccessResponse({ workItem: workItemDetails });
  }

  // #endregion

  // #region Knowledge Graph Tool

  private async executeQueryGraph(args: QueryGraphArgs) {
    const { queryType, workItemId, area, assignee, tag, type, state } = args;
    
    if (!this.knowledgeGraph.isInitialized()) {
      throw new Error("Knowledge Graph not initialized");
    }

    let results;
    switch (queryType) {
      case "children":
        if (workItemId === undefined) throw new Error("workItemId is required for 'children' query");
        results = this.knowledgeGraph.getChildren(workItemId);
        break;
      case "parent":
        if (workItemId === undefined) throw new Error("workItemId is required for 'parent' query");
        results = this.knowledgeGraph.getParent(workItemId);
        break;
      case "by-area":
        if (!area) throw new Error("area is required for 'by-area' query");
        results = this.knowledgeGraph.getByArea(area);
        break;
      case "by-assignee":
        if (!assignee) throw new Error("assignee is required for 'by-assignee' query");
        results = this.knowledgeGraph.getByAssignee(assignee);
        break;
      case "by-tag":
        if (!tag) throw new Error("tag is required for 'by-tag' query");
        results = this.knowledgeGraph.getByTag(tag);
        break;
      case "by-type":
        if (!type) throw new Error("type is required for 'by-type' query");
        results = this.knowledgeGraph.getByType(type);
        break;
      case "by-state":
        if (!state) throw new Error("state is required for 'by-state' query");
        results = this.knowledgeGraph.getByState(state);
        break;
      default:
        throw new Error(`Unknown query type: ${queryType}`);
    }

    return this.createSuccessResponse({ 
      queryType,
      resultCount: Array.isArray(results) ? results.length : (results ? 1 : 0),
      results 
    });
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
          this.getListCurrentIterationItemsToolDefinition(),
          this.getWorkItemByIdToolDefinition(),
          this.getQueryGraphToolDefinition(),
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
          case "list_current_iteration_items":
            return await this.executeListCurrentIterationItems();
          case "get_work_item_by_id":
            return await this.executeGetWorkItemById(args as unknown as GetWorkItemArgs);
          case "query_graph":
            return await this.executeQueryGraph(args as unknown as QueryGraphArgs);
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
    // Initialize Knowledge Graph
    console.error('Initializing Knowledge Graph...');
    try {
      const backlogData = await loadBacklog();
      this.knowledgeGraph.initialize(backlogData);
      console.error('✓ Knowledge Graph initialized');
    } catch (error) {
      console.error('⚠ Warning: Failed to initialize KG:', error);
    }

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
