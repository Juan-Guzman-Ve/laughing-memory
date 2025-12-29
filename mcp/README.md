# ChalCP MCP Server

A Model Context Protocol (MCP) server providing calculator and time tools.

**Dual-Mode Operation:**
- **VS Code Extension** - Commands and tools integrated in VS Code
- **Standalone Server** - Use with Claude Desktop, Continue.dev, or any MCP client

## Tools

- **calculate** - Basic arithmetic (add, subtract, multiply, divide)
- **get_current_time** - Current date/time with timezone

## Quick Start

### For VS Code Users

1. Get the VSIX: [Build Instructions](../docs/BUILD.md)
2. Install: [Installation Guide](../docs/INSTALL_VSIX.md)
3. Use commands: `Ctrl+Shift+P` → Type "MCP"

### For AI Client Users (Claude, Continue.dev)

1. Get the package: [Build Instructions](../docs/BUILD.md)
2. Install: [Installation Guide](../docs/INSTALL_STANDALONE.md)
3. Configure your AI client with `chalcp-mcp` command

## Documentation

- **[Build Packages](../docs/BUILD.md)** - How to build VSIX and npm packages
- **[Install VSIX](../docs/INSTALL_VSIX.md)** - VS Code extension installation
- **[Install Standalone](../docs/INSTALL_STANDALONE.md)** - Standalone server setup
- **[MCP Development](../docs/MCP_DEVELOPMENT_GUIDE.md)** - Add custom tools

## Development

```bash
# Install dependencies
npm install

# Compile
npm run compile

# Watch mode
npm run watch

# Test in VS Code
# Press F5 in VS Code to launch Extension Development Host
```

## License

UNLICENSED - For internal use only

  "mcpServer.port": 3000,
  "mcpServer.logLevel": "info"
}
```

### Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `mcpServer.autoStart` | boolean | `true` | Auto-start server with VS Code |
| `mcpServer.port` | number | `3000` | Server port (reserved for future) |
| `mcpServer.logLevel` | string | `"info"` | Log level: debug, info, warn, error |

## MCP Tools Provided

### get_workspace_info
Get information about the current VS Code workspace.

**Parameters:**
- `includeFiles` (boolean, optional): Include file list

### execute_command
Execute a VS Code command.

**Parameters:**
- `command` (string, required): VS Code command ID
- `args` (array, optional): Command arguments

### create_file
Create a new file in the workspace.

**Parameters:**
- `path` (string, required): Relative file path
- `content` (string, required): File content

## MCP Resources Provided

- `vscode://workspace/settings` - Current workspace settings
- `vscode://workspace/extensions` - Installed extensions list

## Project Structure

```
mcp/
├── src/
│   ├── extension.ts          # Extension entry point
│   ├── serverManager.ts      # Server lifecycle management
│   └── server/
│       ├── index.ts          # Server standalone entry
│       └── mcpServer.ts      # MCP implementation
├── dist/                     # Compiled output
├── package.json              # Extension manifest
└── tsconfig.json             # TypeScript config
```

## Development Scripts

```bash
# Compile TypeScript
npm run compile

# Watch mode for development
npm run watch

# Lint code
npm run lint

# Package extension as VSIX
npm run package

# Build (alias for compile)
npm run build
```

## Debugging

### Extension Debugging

1. Open project in VS Code
2. Press `F5` or select "Run Extension" from Debug panel
3. New VS Code window opens with extension loaded
4. Set breakpoints in TypeScript files
5. View logs in Output panel → "MCP Server"

### Server Debugging

1. Select "Run MCP Server Standalone" from Debug panel
2. Server runs directly without extension wrapper
3. Interact via stdin/stdout with MCP protocol messages

## Technical Requirements

- **Node.js**: 18.x or higher
- **VS Code**: 1.85.0 or higher
- **TypeScript**: 5.3.0 or higher
- **Dependencies**: @modelcontextprotocol/sdk

## Building from Source

```bash
# Clone repository
git clone <your-repo-url>
cd mcp

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Test in development
# Press F5 in VS Code

# Package for distribution
npm run package
```

## Installing the Extension

### From VSIX File

```bash
code --install-extension chalcp-0.0.1.vsix
```

### From Source (Development)

1. Copy folder to VS Code extensions directory:
   - **Windows**: `%USERPROFILE%\.vscode\extensions\`
   - **macOS/Linux**: `~/.vscode/extensions/`

2. Reload VS Code

## Extending the Server

### Adding New Tools

Edit [src/server/mcpServer.ts](src/server/mcpServer.ts):

```typescript
// In ListToolsRequestSchema handler, add:
{
  name: "my_new_tool",
  description: "Description of what it does",
  inputSchema: {
    type: "object",
    properties: {
      param1: {
        type: "string",
        description: "Parameter description"
      }
    },
    required: ["param1"]
  }
}

// In CallToolRequestSchema handler, add:
case "my_new_tool":
  return {
    content: [{
      type: "text",
      text: `Executed with ${args?.param1}`
    }]
  };
```

### Adding New Resources

```typescript
// In ListResourcesRequestSchema handler, add:
{
  uri: "custom://my-resource",
  name: "My Resource",
  description: "Resource description",
  mimeType: "application/json"
}

// In ReadResourceRequestSchema handler, add:
if (uri === "custom://my-resource") {
  return {
    contents: [{
      uri,
      mimeType: "application/json",
      text: JSON.stringify({ data: "value" })
    }]
  };
}
```

## Requirements

- **Node.js**: 18.x or higher
- **VS Code**: 1.85.0 or higher
- **TypeScript**: 5.3.0 or higher

## Dependencies

- `@modelcontextprotocol/sdk` - MCP protocol implementation
- `@types/vscode` - VS Code API types
- `typescript` - TypeScript compiler

## Troubleshooting

### Server Not Starting

1. Check Output panel (View → Output → "MCP Server")
2. Verify `dist/` folder exists and contains compiled files
3. Run `npm run compile` to rebuild
4. Check that Node.js is installed and in PATH

### Extension Not Loading

1. Check VS Code version (Help → About)
2. Verify in Extensions panel that extension is enabled
3. Look for errors in Developer Tools (Help → Toggle Developer Tools)
4. Try reloading VS Code window

### Build Errors

```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run compile
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

[Specify your license]

## Support

- File issues on GitHub
- Review Output panel logs for debugging
- Use Command Palette → "MCP: Start Server" to test

## Roadmap

- [ ] Add more VS Code integration tools
- [ ] Implement resource caching
- [ ] Add unit tests
- [ ] Publish to VS Code Marketplace
- [ ] Add configuration UI
- [ ] Support for multiple MCP server instances

---

**Note**: This is a basic implementation showcasing how to package an MCP server as a VS Code extension. Extend it based on your specific requirements.
