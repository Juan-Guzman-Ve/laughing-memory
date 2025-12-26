# MCP VS Code Extension - POC Setup Guide

## Overview

Simple guide to create an MCP server as a VS Code extension using TypeScript.

---

## Step 1: Local Machine Setup

### Required Software

Install these on your machine:

#### 1. Node.js (18.x or higher)
- Download: https://nodejs.org/
- Verify installation:
  ```bash
  node --version
  # Should show v18.x or higher
  ```

#### 2. VS Code (1.85.0 or higher)
- Download: https://code.visualstudio.com/
- Verify: Help → About (should show 1.85.0+)

#### 3. VS Code Extension Manager (vsce)
```bash
npm install -g @vscode/vsce
```

### Verify Your Setup
```bash
node --version    # v18.x or higher
npm --version     # 9.x or higher
code --version    # 1.85.0 or higher
vsce --version    # Should show version number
```

---

## Step 2: Install Project Dependencies

Navigate to the project folder and install:

```bash
cd mcp-vscode-extension
npm install
```

This installs:
- `@modelcontextprotocol/sdk` - MCP protocol implementation
- `typescript` - TypeScript compiler
- `@types/vscode` - VS Code API types
- ESLint and other dev tools

---

## Step 3: Build the Extension

Compile TypeScript to JavaScript:

```bash
npm run compile
```

This creates the `dist/` folder with compiled JavaScript.

**For development with auto-rebuild:**
```bash
npm run watch
```

---

## Step 4: Test the Extension

### Option A: Quick Test (F5 - Recommended)

1. Open the project in VS Code: `code .`
2. Press **F5** (or Run → Start Debugging)
3. New VS Code window opens with extension loaded
4. Press **Ctrl+Shift+P** → Type "MCP: Start Server"
5. View logs: Output panel → Select "MCP Server"

### Option B: Install as Extension

```bash
# Package as VSIX
npm run package

# Install
code --install-extension mcp-vscode-extension-0.0.1.vsix

# Reload VS Code window
```

---

## Project Structure (Simple)

```
mcp-vscode-extension/
├── src/
│   ├── extension.ts          # Extension entry point
│   ├── serverManager.ts      # Manages MCP server process
│   └── server/
│       ├── mcpServer.ts      # MCP server implementation
│       └── index.ts          # Server entry point
├── dist/                     # Compiled output (created by npm run compile)
└── package.json              # Extension manifest
```

**Key Files:**
- **extension.ts** - VS Code extension activation, commands
- **serverManager.ts** - Spawns and manages the MCP server as a child process
- **mcpServer.ts** - Implements MCP protocol (tools, resources, prompts)

---

## Available Commands

Once installed, use Command Palette (**Ctrl+Shift+P**):

- **MCP: Start Server** - Start the MCP server
- **MCP: Stop Server** - Stop the server
- **MCP: Restart Server** - Restart the server

Check status in the status bar (bottom right).

---

## Configuration

Settings → Search "MCP Server":

```json
{
  "mcpServer.autoStart": true,        // Auto-start on VS Code launch
  "mcpServer.logLevel": "info"        // Log level: debug, info, warn, error
}
```

---

## Example MCP Tools Included

This POC includes these example tools:

1. **get_workspace_info** - Get workspace details
2. **execute_command** - Run VS Code commands  
3. **create_file** - Create new files

You can extend these in `src/server/mcpServer.ts`.

---

## Troubleshooting

**Server won't start?**
- Check Output panel → "MCP Server" for error messages
- Verify `dist/` folder exists (run `npm run compile`)
- Ensure Node.js is installed and in PATH

**Extension not loading?**
- Check VS Code version (Help → About) is 1.85.0+
- Reload window: Ctrl+Shift+P → "Reload Window"
- Check Developer Tools for errors: Help → Toggle Developer Tools

**Build errors?**
```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run compile
```

---

## Quick Reference

### Essential Commands
```bash
npm install          # Install dependencies (first time)
npm run compile      # Build the extension
npm run watch        # Build + watch for changes
npm run package      # Create VSIX for distribution
```

### Development Workflow
1. Make changes to TypeScript files
2. If using watch mode, changes compile automatically
3. Press F5 to test in Extension Development Host
4. Check Output panel for MCP Server logs

---

## Next Steps

1. ✅ Setup complete - You're ready to develop!
2. Modify `src/server/mcpServer.ts` to add your own MCP tools
3. Test with **F5** after each change
4. Package with `npm run package` when ready to share

---

## Resources

- [MCP SDK Docs](https://modelcontextprotocol.io/)
- [VS Code Extension API](https://code.visualstudio.com/api)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
