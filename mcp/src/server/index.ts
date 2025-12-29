#!/usr/bin/env node

import { MCPServer } from "./mcpServer.js";

// Entry point for standalone MCP server execution
const server = new MCPServer({
  name: "chalcp-mcp-server",
  version: "0.1.0",
  logLevel: (process.env.MCP_LOG_LEVEL as any) || "info",
});

server.start().catch((error) => {
  console.error("Failed to start MCP server:", error);
  process.exit(1);
});

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.error("Received SIGINT, shutting down gracefully...");
  await server.stop();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.error("Received SIGTERM, shutting down gracefully...");
  await server.stop();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await server.stop();
  process.exit(0);
});
