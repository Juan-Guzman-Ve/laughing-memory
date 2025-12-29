# Azure DevOps Agent - Day 1 Implementation

This is a LangChain-based agent using **Gemini API** for intelligent backlog querying.

## Setup Instructions

### 1. Install Dependencies

```bash
cd agent
npm install
```

### 2. Configure Environment

Create a `.env` file in the **root** of the project (not inside `agent/`):

```bash
cp .env.example .env
```

Edit `.env` and add your Gemini API key:
```
GEMINI_API_KEY=your_actual_key_here
```

Get your API key from: https://makersuite.google.com/app/apikey

### 3. Run the Agent

```bash
npm run dev
```

## Day 1 Features (Read-Only)

✅ **Informational Tools:**
- `list_current_iteration_items` - Lists all items in current sprint
- `get_work_item_by_id` - Gets detailed info for a specific work item

✅ **Mock Data:** Uses `data/backlog.json` with Sprint 25 data

✅ **Autonomous Tool Selection:** Gemini chooses the right tool based on the query

## Example Queries

Try these in the CLI:

1. **List items:**
   ```
   List all items in the current iteration
   ```

2. **Get details:**
   ```
   Show me the acceptance criteria and linked tasks for work item 123
   ```

3. **Natural language:**
   ```
   What bugs are assigned to Carol?
   ```

4. **Complex query:**
   ```
   Tell me about the password reset user story, including all its child tasks
   ```

## Architecture

```
agent/
  src/
    index.ts          - CLI interface
    agent.ts          - Agent configuration with Gemini
    tools/
      backlogTools.ts - Data loading functions
      index.ts        - Tool definitions
```

## Next Steps (Day 2)

- Add RAG (vector store with FAISS)
- Add Knowledge Graph for relationships
- Centralized informational pipeline

## Troubleshooting

**Error: GEMINI_API_KEY not set**
- Make sure `.env` is in the root directory (c:\git\chalCP)
- Verify the key is valid

**Module errors:**
- Run `npm install` in the `agent/` directory
- Check Node.js version (should be 18+)
