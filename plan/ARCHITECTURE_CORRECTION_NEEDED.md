# Architecture Correction Required - Status Document

**Date:** December 29, 2025  
**Issue:** Agent directly accesses backlog.json instead of using MCP server tools

---

## Problem Statement

The current implementation violates the intended MCP architecture:

### ❌ Current (Incorrect) Architecture
```
Agent → backlogTools.ts → backlog.json (direct file access)
```

### ✅ Required (Correct) Architecture
```
Agent (MCP Client) → MCP Protocol → MCP Server → backlog.json
```

---

## What's Wrong

### 1. Agent Directly Accesses Mock Data
**File**: `agent/src/tools/backlogTools.ts`

```typescript
// WRONG: Agent directly reads file
export async function loadBacklog(): Promise<BacklogData> {
  const dataPath = path.join(__dirname, '../../../data/backlog.json');
  const content = await fs.readFile(dataPath, 'utf-8');
  return JSON.parse(content);
}
```

**Why it's wrong:**
- Violates separation of concerns
- Agent can bypass MCP abstraction layer
- Not following Model Context Protocol standards
- `backlog.json` is meant to mock an external API (Azure DevOps), not be accessed directly

### 2. Missing MCP Server Backlog Tools
**File**: `mcp/src/server/mcpServer.ts`

Currently only has:
- `calculate`
- `get_current_time`

**Missing:**
- `list_current_iteration_items`
- `get_work_item_by_id`

These should be in the MCP server, not in agent local code.

### 3. Agent Not Acting as MCP Client
**File**: `agent/src/agent.ts`

Agent uses LangChain with local tool definitions, not MCP client connection.

---

## What Needs to Change

### Change 1: Move Backlog Logic to MCP Server

**Add to** `mcp/src/server/mcpServer.ts`:

```typescript
// Tool definition
{
  name: "list_current_iteration_items",
  description: "List all work items in the current iteration with owner and state",
  inputSchema: {
    type: "object",
    properties: {},
  },
}

{
  name: "get_work_item_by_id",
  description: "Get detailed information about a specific work item by ID",
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
}

// Tool implementation
case "list_current_iteration_items":
  const backlog = await loadBacklogFromFile();
  return createSuccessResponse(formatBacklogList(backlog));

case "get_work_item_by_id":
  const { workItemId } = args as { workItemId: number };
  const item = await getWorkItemFromBacklog(workItemId);
  return createSuccessResponse(item);
```

### Change 2: Configure Agent as MCP Client

**Update** `agent/src/agent.ts`:

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// Connect to MCP server
const transport = new StdioClientTransport({
  command: 'node',
  args: ['../mcp/dist/server/index.js'], // Path to MCP server
});

const mcpClient = new Client({
  name: 'azure-devops-agent',
  version: '1.0.0',
}, {
  capabilities: {},
});

await mcpClient.connect(transport);

// Discover MCP tools
const { tools } = await mcpClient.listTools();

// Use tools with LangChain (convert MCP tools to LangChain tools)
```

### Change 3: Remove Direct File Access from Agent

**Delete or deprecate**:
- `agent/src/tools/backlogTools.ts` (move logic to MCP server)
- Any direct file system access in agent code

**Keep**:
- Agent only connects to MCP server
- Agent only knows about MCP protocol, not implementation details

---

## Benefits of Correct Architecture

1. **Security**: Agent cannot bypass MCP to access files directly
2. **Modularity**: Adding new tools to MCP server automatically makes them available
3. **Scalability**: MCP server can later connect to real Azure DevOps API without agent changes
4. **Standards Compliance**: Follows Model Context Protocol specifications
5. **Testability**: Can test agent and MCP server independently

---

## Implementation Priority

### 🔴 HIGH PRIORITY (Must fix for Day 1 completion)
1. Add `list_current_iteration_items` and `get_work_item_by_id` to MCP server
2. Configure agent as MCP client (stdio connection)
3. Remove direct file access from agent

### 🟡 MEDIUM PRIORITY (Day 2)
4. Add RAG and Knowledge Graph capabilities to MCP server
5. Test autonomous tool selection

### 🟢 LOW PRIORITY (Day 3+)
6. Add write operations to MCP server
7. Consider replacing stdio with network transport

---

## Testing Verification

After implementation, verify:

```bash
# 1. MCP Server exposes correct tools
# Start MCP server and check tool list

# 2. Agent discovers MCP tools
# Agent should log discovered tools on startup

# 3. Agent calls MCP tools correctly
# Query: "List items in current iteration"
# Should see MCP protocol messages, not direct file reads

# 4. Verify no direct file access
# grep -r "backlog.json" agent/src/
# Should only appear in comments or config, not in active code
```

---

## Files to Update

### MCP Server
- ✅ `mcp/src/server/mcpServer.ts` - Add backlog tools
- ✅ `mcp/package.json` - Verify dependencies

### Agent  
- ❌ `agent/src/agent.ts` - Add MCP client connection
- ❌ `agent/src/tools/backlogTools.ts` - Remove or mark deprecated
- ❌ `agent/src/tools/index.ts` - Remove local tool definitions
- ❌ `agent/package.json` - Add MCP client SDK

### Documentation
- ✅ `plan/action_plan_v2.md` - Corrected architecture
- ✅ `plan/day_1_v2_corrected.md` - Corrected Day 1 plan
- ❌ `plan/day_1_completion.md` - Update to reflect required changes

---

## Next Steps

1. Review corrected architecture documents:
   - `plan/action_plan_v2.md`
   - `plan/day_1_v2_corrected.md`
   
2. Implement MCP server backlog tools

3. Refactor agent to use MCP client

4. Test end-to-end MCP communication

5. Update completion documentation

---

## Questions for Review

1. Should we keep `backlogTools.ts` for reference, or delete it completely?
2. Should MCP server and agent run in same process (stdio) or separate processes?
3. Do we need to update any build scripts for the new architecture?
4. Should we create integration tests for MCP protocol communication?
