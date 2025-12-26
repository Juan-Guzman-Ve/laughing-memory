import * as vscode from "vscode";
import { ChildProcess, spawn } from "child_process";
import * as path from "path";

export class MCPServerManager {
  private serverProcess: ChildProcess | null = null;
  private outputChannel: vscode.OutputChannel;
  private statusBarItem: vscode.StatusBarItem;

  constructor(
    private context: vscode.ExtensionContext,
    outputChannel: vscode.OutputChannel
  ) {
    this.outputChannel = outputChannel;
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    this.statusBarItem.command = "mcp-extension.restart";
    this.updateStatusBar("stopped");
  }

  private updateStatusBar(status: "running" | "stopped" | "error"): void {
    switch (status) {
      case "running":
        this.statusBarItem.text = "$(check) MCP Server";
        this.statusBarItem.tooltip = "MCP Server is running (click to restart)";
        this.statusBarItem.backgroundColor = undefined;
        break;
      case "stopped":
        this.statusBarItem.text = "$(circle-slash) MCP Server";
        this.statusBarItem.tooltip = "MCP Server is stopped (click to start)";
        this.statusBarItem.backgroundColor = new vscode.ThemeColor(
          "statusBarItem.warningBackground"
        );
        break;
      case "error":
        this.statusBarItem.text = "$(error) MCP Server";
        this.statusBarItem.tooltip = "MCP Server error (click to restart)";
        this.statusBarItem.backgroundColor = new vscode.ThemeColor(
          "statusBarItem.errorBackground"
        );
        break;
    }
    this.statusBarItem.show();
  }

  async start(): Promise<void> {
    if (this.serverProcess) {
      this.outputChannel.appendLine("MCP Server is already running");
      return;
    }

    try {
      const config = vscode.workspace.getConfiguration("mcpServer");
      const logLevel = config.get<string>("logLevel", "info");

      this.outputChannel.appendLine("Starting MCP Server...");

      // Path to the compiled server entry point
      const serverPath = path.join(
        this.context.extensionPath,
        "dist",
        "server",
        "index.js"
      );

      this.outputChannel.appendLine(`Server path: ${serverPath}`);

      // Spawn the MCP server as a child process
      this.serverProcess = spawn("node", [serverPath], {
        env: {
          ...process.env,
          MCP_LOG_LEVEL: logLevel,
        },
        stdio: ["pipe", "pipe", "pipe"],
      });

      this.serverProcess.stdout?.on("data", (data) => {
        this.outputChannel.appendLine(`[Server STDOUT]: ${data.toString()}`);
      });

      this.serverProcess.stderr?.on("data", (data) => {
        this.outputChannel.appendLine(`[Server STDERR]: ${data.toString()}`);
      });

      this.serverProcess.on("error", (error) => {
        this.outputChannel.appendLine(`[Server ERROR]: ${error.message}`);
        this.updateStatusBar("error");
        vscode.window.showErrorMessage(
          `MCP Server error: ${error.message}`
        );
      });

      this.serverProcess.on("exit", (code, signal) => {
        this.outputChannel.appendLine(
          `[Server EXIT]: code=${code}, signal=${signal}`
        );
        this.serverProcess = null;
        this.updateStatusBar("stopped");

        if (code !== 0 && code !== null) {
          vscode.window.showErrorMessage(
            `MCP Server exited with code ${code}`
          );
        }
      });

      this.updateStatusBar("running");
      this.outputChannel.appendLine("MCP Server started successfully");
      vscode.window.showInformationMessage("MCP Server started");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      this.outputChannel.appendLine(`Failed to start MCP Server: ${message}`);
      this.updateStatusBar("error");
      vscode.window.showErrorMessage(`Failed to start MCP Server: ${message}`);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.serverProcess) {
      this.outputChannel.appendLine("MCP Server is not running");
      return;
    }

    return new Promise((resolve) => {
      this.outputChannel.appendLine("Stopping MCP Server...");

      const process = this.serverProcess!;
      const timeout = setTimeout(() => {
        this.outputChannel.appendLine("Force killing MCP Server...");
        process.kill("SIGKILL");
      }, 5000);

      process.once("exit", () => {
        clearTimeout(timeout);
        this.serverProcess = null;
        this.updateStatusBar("stopped");
        this.outputChannel.appendLine("MCP Server stopped");
        vscode.window.showInformationMessage("MCP Server stopped");
        resolve();
      });

      process.kill("SIGTERM");
    });
  }

  async restart(): Promise<void> {
    this.outputChannel.appendLine("Restarting MCP Server...");
    await this.stop();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await this.start();
  }

  isRunning(): boolean {
    return this.serverProcess !== null;
  }

  dispose(): void {
    if (this.serverProcess) {
      this.serverProcess.kill();
      this.serverProcess = null;
    }
    this.statusBarItem.dispose();
  }
}
