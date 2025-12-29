# Installing ChalCP Standalone Server

## Prerequisites

- Node.js 18.x or higher
- AI client (Claude Desktop, Continue.dev, etc.)
- Built TGZ file (see [BUILD.md](BUILD.md))

## Option 1: Global Installation (Recommended)

```powershell
npm install -g c:\git\chalCP\artifacts\chalcp-0.1.0.tgz
```

Verify:
```powershell
chalcp-mcp --version
```

## Option 2: Local Installation

```powershell
# Extract package
tar -xzf c:\git\chalCP\artifacts\chalcp-0.1.0.tgz

# Install dependencies
cd package
npm install
```

## Configure AI Client

### Claude Desktop

Edit `%APPDATA%\Claude\claude_desktop_config.json`:

**Global installation:**
```json
{
  "mcpServers": {
    "chalcp": {
      "command": "chalcp-mcp"
    }
  }
}
```

**Local installation:**
```json
{
  "mcpServers": {
    "chalcp": {
      "command": "node",
      "args": ["c:\\full\\path\\to\\package\\dist\\server\\index.js"]
    }
  }
}
```

### Continue.dev

Edit `~/.continue/config.json`:

**Global installation:**
```json
{
  "mcpServers": [
    {
      "name": "chalcp",
      "command": "chalcp-mcp"
    }
  ]
}
```

**Local installation:**
```json
{
  "mcpServers": [
    {
      "name": "chalcp",
      "command": "node",
      "args": ["c:\\full\\path\\to\\package\\dist\\server\\index.js"]
    }
  ]
}
```

## Verify Installation

1. Restart AI client
2. Test calculator:
   - Ask: "Calculate 25 × 4"
3. Test time:
   - Ask: "What's the current time?"

## Available Tools

- **calculate** - Add, subtract, multiply, divide
- **get_current_time** - Get current date/time with timezone

## Troubleshooting

**Command not found:**
```powershell
# Check npm global path
npm config get prefix

# Add to PATH if needed
```

**Connection issues:**
- Check AI client logs
- Verify Node.js version: `node --version`
- Test server directly: `chalcp-mcp` (should start and wait for MCP protocol messages)

## Distribution to Team

1. Share `chalcp-0.1.0.tgz` file
2. Team members run global or local installation
3. Share AI client configuration snippet
