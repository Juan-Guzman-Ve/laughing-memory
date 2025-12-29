# MCP Development Guide: Adding Features

## What is MCP?

**Model Context Protocol (MCP)** allows AI assistants to interact with external systems through a standardized protocol. Your VS Code extension acts as an MCP server that exposes:

1. **Tools** - Functions AI can call (like calculating, creating files, etc.)
2. **Resources** - Data AI can read (like settings, file contents)
3. **Prompts** - Templates for AI conversations

---

## MCP Architecture in Your Extension

```
┌─────────────────────────────────────┐
│     AI Client (ChatGPT, Claude)     │
│                                     │
│  "Calculate 15 + 7"                 │
└─────────────┬───────────────────────┘
              │ MCP Protocol
              ↓
┌─────────────────────────────────────┐
│    Your VS Code Extension           │
│  ┌───────────────────────────────┐  │
│  │  MCP Server (mcpServer.ts)    │  │
│  │                               │  │
│  │  Tools:                       │  │
│  │  - calculate                  │  │
│  │  - get_current_time           │  │
│  │  - get_workspace_info         │  │
│  │  - execute_command            │  │
│  │  - create_file                │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## How to Add a New MCP Tool

### Step 1: Define the Tool

In [src/server/mcpServer.ts](../src/server/mcpServer.ts), add to the `ListToolsRequestSchema` handler:

```typescript
{
  name: "your_tool_name",
  description: "What your tool does",
  inputSchema: {
    type: "object",
    properties: {
      param1: {
        type: "string",
        description: "First parameter",
      },
      param2: {
        type: "number",
        description: "Second parameter",
      },
    },
    required: ["param1"],  // Required parameters
  },
}
```

### Step 2: Implement the Tool Logic

In the `CallToolRequestSchema` handler, add a case:

```typescript
case "your_tool_name":
  const { param1, param2 } = args as { param1: string; param2?: number };
  
  // Your logic here
  const result = doSomething(param1, param2);
  
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({ result }),
      },
    ],
  };
```

### Step 3: Rebuild and Test

```powershell
# Compile TypeScript
npm run compile

# Create VSIX
npm run package

# Install
code --install-extension mcp-vscode-extension-*.vsix
```

---

## New Features Added: Calculator & Time

### 1. Calculator Tool

**What it does:** Performs basic arithmetic operations.

**Definition:**
```typescript
{
  name: "calculate",
  description: "Perform a simple calculation (add, subtract, multiply, divide)",
  inputSchema: {
    type: "object",
    properties: {
      operation: {
        type: "string",
        enum: ["add", "subtract", "multiply", "divide"],
      },
      a: { type: "number" },
      b: { type: "number" },
    },
    required: ["operation", "a", "b"],
  },
}
```

**Implementation highlights:**
- Handles all 4 basic operations
- Error handling for division by zero
- Returns formatted result with expression

**AI can call it like:**
```
"Use the calculate tool to add 15 and 7"
→ Returns: {"result": 22, "expression": "15 + 7 = 22"}
```

### 2. Time Tool

**What it does:** Returns current date/time.

**Definition:**
```typescript
{
  name: "get_current_time",
  description: "Get the current date and time",
  inputSchema: {
    type: "object",
    properties: {
      format: {
        type: "string",
        enum: ["short", "full"],
        default: "short",
      },
    },
  },
}
```

**AI can call it like:**
```
"What time is it?"
→ Returns: {"timestamp": "2025-12-26T...", "formatted": "10:30:45 AM"}
```

---

## Testing Your MCP Tools

### Method 1: VS Code Commands (Quick Test)

1. Press `Ctrl+Shift+P`
2. Run these commands:
   - **MCP: Test Calculator Tool** - Verifies calculator is ready
   - **MCP: Test Time Tool** - Verifies time tool is ready
3. Check **Output** panel → "MCP Server"

### Method 2: Check Server Logs

1. Open Output panel: `View → Output`
2. Select "MCP Server" from dropdown
3. Start the server: `Ctrl+Shift+P` → "MCP: Start Server"
4. Look for:
   ```
   MCP Server "mcp-vscode-extension" started
   Server is running on stdio transport
   ```

### Method 3: With an AI Client

To fully test, you need an MCP-compatible AI client:

1. **Claude Desktop** (official MCP support)
2. **Custom MCP client** using @modelcontextprotocol/sdk

Configure the client to connect to your extension's stdio transport.

---

## Build & Install Process

### Quick Build

```powershell
# Navigate to extension directory
cd c:\git\chalCP\mcp-vscode-extension

# Option 1: Use automated script
..\build\Build-VSIX.ps1 -SkipVersionIncrement

# Option 2: Manual
npm run compile
npm run package
```

### Install the VSIX

```powershell
# Get the VSIX filename (check current version)
$vsix = Get-ChildItem *.vsix | Select-Object -First 1

# Install
code --install-extension $vsix.Name

# Reload VS Code
# Ctrl+Shift+P → "Developer: Reload Window"
```

### Verify Installation

1. Open Extensions panel (`Ctrl+Shift+X`)
2. Search for "MCP Server Extension"
3. Should show as installed
4. Check status bar (bottom right) - should show MCP indicator

---

## Common Development Patterns

### Pattern 1: Simple Data Transformation

```typescript
case "reverse_string":
  const input = args?.text as string;
  const reversed = input.split('').reverse().join('');
  return {
    content: [{ type: "text", text: reversed }],
  };
```

### Pattern 2: File System Operations

```typescript
case "read_file":
  const fs = require('fs');
  const content = fs.readFileSync(args?.path, 'utf8');
  return {
    content: [{ type: "text", text: content }],
  };
```

### Pattern 3: VS Code API Integration

```typescript
case "get_open_files":
  // Access VS Code through IPC or shared context
  const files = vscode.workspace.textDocuments.map(d => d.fileName);
  return {
    content: [{ 
      type: "text", 
      text: JSON.stringify(files, null, 2) 
    }],
  };
```

### Pattern 4: External API Calls

```typescript
case "fetch_data":
  const response = await fetch(args?.url);
  const data = await response.json();
  return {
    content: [{ 
      type: "text", 
      text: JSON.stringify(data, null, 2) 
    }],
  };
```

---

## Debugging Tips

### Enable Debug Logging

In VS Code settings:
```json
{
  "mcpServer.logLevel": "debug"
}
```

### Check Compilation Errors

```powershell
npm run compile
# Watch for TypeScript errors
```

### Test Without Installing

```powershell
# Press F5 in VS Code
# Opens Extension Development Host
# Test your changes immediately
```

### Common Issues

**Issue:** "Tool not found"
- Check tool name matches exactly in both definition and handler
- Verify server restarted after changes

**Issue:** "Server not starting"
- Check Output panel for errors
- Verify `dist/server/index.js` exists
- Check Node.js is available

**Issue:** "Changes not reflected"
- Run `npm run compile` again
- Reload VS Code window
- Check correct VSIX version installed

---

## Example: Adding a "Generate UUID" Tool

Let's walk through adding a complete new tool:

### 1. Add to Tool List

```typescript
{
  name: "generate_uuid",
  description: "Generate a random UUID v4",
  inputSchema: {
    type: "object",
    properties: {
      count: {
        type: "number",
        description: "Number of UUIDs to generate",
        default: 1,
      },
    },
  },
}
```

### 2. Implement Handler

```typescript
case "generate_uuid":
  const count = (args?.count as number) || 1;
  const uuids: string[] = [];
  
  for (let i = 0; i < count; i++) {
    uuids.push(crypto.randomUUID());
  }
  
  return {
    content: [{
      type: "text",
      text: JSON.stringify({ uuids }, null, 2),
    }],
  };
```

### 3. Test It

```powershell
npm run compile
npm run package
code --install-extension mcp-vscode-extension-*.vsix
# Ctrl+Shift+P → "Developer: Reload Window"
# Ctrl+Shift+P → "MCP: Start Server"
```

---

## Next Steps

1. **Add more tools** based on your needs:
   - File operations (search, replace)
   - Git operations (status, commit)
   - Project analysis (count lines, find TODO)
   - External API integrations

2. **Add resources** for AI to read:
   - Project structure
   - Git history
   - Configuration files

3. **Add prompts** for common tasks:
   - Code review template
   - Bug report template
   - Documentation generator

4. **Test with real AI clients:**
   - Claude Desktop
   - Custom integrations

---

## Resources

- [MCP SDK Documentation](https://modelcontextprotocol.io/)
- [VS Code Extension API](https://code.visualstudio.com/api)
- [Your Extension Source](../src/)

---

*Happy MCP Development!*
