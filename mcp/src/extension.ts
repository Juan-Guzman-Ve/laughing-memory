import * as vscode from "vscode";
import { MCPServerManager } from "./serverManager";

let serverManager: MCPServerManager | undefined;
let outputChannel: vscode.OutputChannel;

export async function activate(context: vscode.ExtensionContext) {
  console.log('MCP Extension is now active');

  // Create output channel for logs
  outputChannel = vscode.window.createOutputChannel("MCP Server");
  context.subscriptions.push(outputChannel);

  outputChannel.appendLine("MCP Extension activated");

  // Initialize server manager
  serverManager = new MCPServerManager(context, outputChannel);
  context.subscriptions.push({
    dispose: () => serverManager?.dispose(),
  });

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand("mcp-extension.start", async () => {
      try {
        outputChannel.show();
        await serverManager?.start();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        outputChannel.appendLine(`Start command failed: ${message}`);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("mcp-extension.stop", async () => {
      try {
        outputChannel.show();
        await serverManager?.stop();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        outputChannel.appendLine(`Stop command failed: ${message}`);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("mcp-extension.restart", async () => {
      try {
        outputChannel.show();
        await serverManager?.restart();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        outputChannel.appendLine(`Restart command failed: ${message}`);
      }
    })
  );

  // Auto-start if configured
  const config = vscode.workspace.getConfiguration("mcpServer");
  const autoStart = config.get<boolean>("autoStart", true);

  if (autoStart) {
    outputChannel.appendLine("Auto-starting MCP Server...");
    try {
      await serverManager.start();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      outputChannel.appendLine(`Auto-start failed: ${message}`);
    }
  }

  outputChannel.appendLine("MCP Extension initialization complete");
}

export function deactivate() {
  if (serverManager) {
    serverManager.dispose();
  }
  outputChannel?.appendLine("MCP Extension deactivated");
}
