import { MCPServer } from "./mcpServer";

// Entry point for standalone server execution
const server = new MCPServer({
  name: "vscode-mcp-server",
  version: "0.0.1",
  logLevel: "info",
});

server.start().catch((error) => {
  console.error("Failed to start MCP server:", error);
  process.exit(1);
});

// Handle graceful shutdown
process.on("SIGINT", async () => {
  await server.stop();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await server.stop();
  process.exit(0);
});
