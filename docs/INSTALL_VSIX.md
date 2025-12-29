# Installing ChalCP VS Code Extension

## Prerequisites

- VS Code 1.85.0 or higher
- Built VSIX file (see [BUILD.md](BUILD.md))

## Installation

```powershell
code --install-extension c:\git\chalCP\artifacts\chalcp-0.1.0.vsix
```

## Verification

1. Open VS Code
2. Press `Ctrl+Shift+P`
3. Type "MCP" - you should see:
   - MCP: Start Server
   - MCP: Stop Server
   - MCP: Restart Server
   - MCP: Test Calculator Tool
   - MCP: Test Time Tool

## Usage

### Start Server
Press `Ctrl+Shift+P` → **MCP: Start Server**

### Test Tools

**Calculator:**
```
Ctrl+Shift+P → MCP: Test Calculator Tool
```

**Time:**
```
Ctrl+Shift+P → MCP: Test Time Tool
```

### View Logs
Open Output panel → Select "MCP Server" from dropdown

## Configuration

Add to VS Code settings (`settings.json`):

```json
{
  "mcpServer.autoStart": true,
  "mcpServer.logLevel": "info"
}
```

## Uninstall

```powershell
code --uninstall-extension chalcp.chalcp
```

## Distribution to Team

1. Share `chalcp-0.1.0.vsix` file
2. Team members run: `code --install-extension path/to/chalcp-0.1.0.vsix`
