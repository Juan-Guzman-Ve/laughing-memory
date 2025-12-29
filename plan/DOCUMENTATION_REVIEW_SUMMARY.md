# Documentation Review & Architecture Correction - Summary

**Date:** December 29, 2025  
**Completed By:** GitHub Copilot

---

## What Was Done

### 1. ✅ Reviewed All Planning Documents
- Examined `plan/action_plan.md`
- Examined `plan/day_1.md`
- Examined `plan/day_1_completion.md`
- Examined `docs/TECHNICAL_REQUIREMENTS.md`
- Examined `docs/MCP_DEVELOPMENT_GUIDE.md`

### 2. ✅ Identified Architectural Issue
The current agent implementation **violates the intended MCP architecture**:

**Current (WRONG)**:
```
Agent → backlogTools.ts → fs.readFile() → backlog.json
```

**Required (CORRECT)**:
```
Agent (MCP Client) → MCP Protocol → MCP Server → backlog.json
                     (stdio)         (tools)
```

### 3. ✅ Created Corrected Documentation

#### New Documents Created:

1. **[plan/action_plan_v2.md](../plan/action_plan_v2.md)**
   - Complete corrected action plan
   - Clarifies MCP-first architecture
   - Agent as MCP client explicitly stated
   - MCP server as abstraction layer for backlog.json
   - Updated all 5 days with MCP focus

2. **[plan/day_1_v2_corrected.md](../plan/day_1_v2_corrected.md)**
   - Corrected Day 1 specifications
   - MCP server must expose backlog tools
   - Agent must connect as MCP client
   - Clear implementation steps provided

3. **[plan/ARCHITECTURE_CORRECTION_NEEDED.md](../plan/ARCHITECTURE_CORRECTION_NEEDED.md)**
   - Detailed explanation of what's wrong
   - Side-by-side comparison of current vs required
   - Specific code changes needed
   - Testing verification steps

#### Updated Documents:

4. **[plan/day_1_completion.md](../plan/day_1_completion.md)**
   - Added warning about architectural issue
   - Marked as "NEEDS ARCHITECTURAL CORRECTION"
   - References correction document

---

## Key Findings

### Correct Understanding (from requirements)

1. **backlog.json Purpose**: Mock of Azure DevOps REST API (external tool)
2. **MCP Server Role**: Abstraction layer that accesses external tools securely
3. **Agent Role**: MCP client that consumes tools via MCP protocol
4. **Security Principle**: Agent should NEVER directly access files or external APIs

### Current Implementation Issues

1. ❌ `agent/src/tools/backlogTools.ts` directly reads `backlog.json`
2. ❌ Agent has local functions instead of MCP tool calls
3. ❌ No MCP client connection in agent
4. ❌ MCP server missing backlog tools (`list_current_iteration_items`, `get_work_item_by_id`)

---

## What Needs to Happen Next

### Phase 1: MCP Server (Priority 1)
**File**: `mcp/src/server/mcpServer.ts`

Add two new tools:
```typescript
1. list_current_iteration_items
   - Reads data/backlog.json
   - Returns formatted list of all items
   
2. get_work_item_by_id
   - Input: workItemId (number)
   - Reads data/backlog.json
   - Returns detailed item info or "not found"
```

### Phase 2: Agent Refactoring (Priority 1)
**Files**: `agent/src/agent.ts`, `agent/src/tools/*`

1. Add MCP client SDK dependency (`@modelcontextprotocol/sdk`)
2. Configure stdio transport to MCP server
3. Remove direct file access from `backlogTools.ts`
4. Use MCP tool discovery instead of local tool definitions

### Phase 3: Testing (Priority 1)
1. Verify agent connects to MCP server via stdio
2. Verify agent discovers MCP tools
3. Test: "List items" → calls MCP tool
4. Test: "Get item 123" → calls MCP tool
5. Verify: No direct file access in agent code

### Phase 4: Day 2+ (Future)
- Add RAG to MCP server (Day 2)
- Add Knowledge Graph to MCP server (Day 2)
- Add write operations to MCP server (Day 3)
- Agent automatically discovers new tools (no code changes needed)

---

## Architecture Diagrams

### Current Architecture (WRONG)
```
┌──────────────┐
│    Agent     │
│              │
│ ┌──────────┐ │
│ │ backlog  │ │  ← Direct file access (WRONG!)
│ │ Tools.ts │ │
│ └────┬─────┘ │
└──────┼───────┘
       │ fs.readFile()
       v
┌──────────────┐
│ backlog.json │
└──────────────┘

┌──────────────┐
│  MCP Server  │  ← Has calculate, time tools only
│              │     Missing backlog tools!
└──────────────┘
```

### Required Architecture (CORRECT)
```
┌──────────────┐
│    Agent     │
│ (MCP Client) │
│              │
│  - Gemini    │
│  - LangChain │
└──────┬───────┘
       │ MCP Protocol
       │ (stdio)
       v
┌──────────────┐
│  MCP Server  │
│              │
│  Tools:      │
│  - calculate │
│  - time      │
│  - list_     │
│    current_  │
│    items     │
│  - get_work_ │
│    item_by_  │
│    id        │
└──────┬───────┘
       │ file read
       v
┌──────────────┐
│ backlog.json │  ← Mock Azure DevOps API
└──────────────┘
```

---

## Documentation Roadmap

### ✅ Completed
- [x] action_plan_v2.md - Corrected full action plan
- [x] day_1_v2_corrected.md - Corrected Day 1 specifications
- [x] ARCHITECTURE_CORRECTION_NEEDED.md - Detailed correction guide
- [x] Updated day_1_completion.md with warning

### 📋 Recommended Next Steps
1. Review corrected documents as a team
2. Decide: Refactor existing code or start fresh with correct architecture?
3. Update agent code to use MCP client
4. Update MCP server with backlog tools
5. Test end-to-end MCP communication
6. Update completion documents when done

---

## Files Reference

### Planning Documents (NEW/UPDATED)
- `plan/action_plan_v2.md` - **NEW** - Corrected action plan
- `plan/day_1_v2_corrected.md` - **NEW** - Corrected Day 1 plan
- `plan/ARCHITECTURE_CORRECTION_NEEDED.md` - **NEW** - What needs fixing
- `plan/day_1_completion.md` - **UPDATED** - Added warning

### Current Implementation (NEEDS REFACTORING)
- `agent/src/tools/backlogTools.ts` - Contains direct file access (WRONG)
- `agent/src/agent.ts` - Missing MCP client connection
- `agent/src/tools/index.ts` - Local tool definitions (should use MCP)

### Target Implementation (WHERE TO ADD CODE)
- `mcp/src/server/mcpServer.ts` - Add backlog tools here
- `mcp/src/server/backlogTools.ts` - **CREATE** - Helper functions for backlog
- `agent/src/agent.ts` - Add MCP client connection

### Data (CORRECT - No changes needed)
- `data/backlog.json` - Mock Azure DevOps data ✅

---

## Key Principles to Remember

1. **Agent is a consumer, never a producer** of external data
2. **MCP server is the only gateway** to external resources
3. **backlog.json is not "just a file"** - it's a mock of an external API
4. **Adding tools to MCP server** should automatically make them available to agent
5. **Security matters** - agent should not be able to bypass MCP server

---

## Questions Answered

**Q: Should the agent read backlog.json directly?**  
A: ❌ NO. backlog.json mocks Azure DevOps API (external tool). Agent must access via MCP server.

**Q: Where should backlog access logic live?**  
A: ✅ In MCP server tools (`mcp/src/server/mcpServer.ts`), NOT in agent code.

**Q: How should agent get backlog data?**  
A: ✅ Agent calls MCP tools (`list_current_iteration_items`, `get_work_item_by_id`) via MCP protocol.

**Q: What is the purpose of MCP server?**  
A: ✅ Secure abstraction layer for ALL external resources (files, APIs, databases).

**Q: Can we keep current agent code?**  
A: ⚠️ Needs refactoring. Remove direct file access, add MCP client connection.

---

## Success Criteria

✅ Day 1 is complete when:
- MCP server exposes `list_current_iteration_items` and `get_work_item_by_id` tools
- Agent connects to MCP server as client (stdio transport)
- Agent discovers MCP tools dynamically
- Agent calls MCP tools to answer queries (no direct file access)
- Test: "List items" works via MCP protocol
- Test: "Get item 123" works via MCP protocol
- Code review shows NO direct file access in agent code

---

**Prepared by**: GitHub Copilot  
**Review Status**: Ready for team review  
**Action Required**: Implement architectural corrections per `ARCHITECTURE_CORRECTION_NEEDED.md`
