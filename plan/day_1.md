# Day 1 — Plan & Goals (Hosted LLM: Gemini)

**Date:** December 26, 2025  
**Owner:** Juan Guzman

---

## Goal
Establish a working foundation that answers informational questions about the current iteration backlog using a **hosted LLM (Gemini)** and **mock Azure DevOps data**. No actions (updates) today.

---

## Tasks
1. **Create mock backlog data**
   - File: `data/backlog.json`
   - Include: iteration info, items (UserStory/Task/Bug), fields (title, state, assignedTo, tags, acceptanceCriteria), children, optional links (PRs).

2. **Set environment variables**
   - `.env`: `GEMINI_API_KEY=...`

3. **Wire the agent to Gemini (LangChain)**
   - Configure LangChain’s Google GenAI integration.
   - Bind **informational tools** only:
     - `list_current_iteration_items` (reads JSON)
     - `get_work_item_by_id` (reads JSON)

4. **Basic UI endpoint** (optional today)
   - Minimal REST or CLI interface to send prompts.

5. **Smoke tests**
   - Ask: "List items in the current iteration with owner and state."
   - Ask: "Show acceptance criteria and linked tasks for work item 123."

---

## Deliverables (Day 1)
- `data/backlog.json` with realistic backlog entries.
- Agent configured to use **Gemini API**.
- Informational tools (read-only) working against JSON.
- Optional: lightweight UI for testing.

---

## Checkpoints (move to Day 2 when all are true)
- ✅ JSON loads and queries return expected items.
- ✅ Hosted LLM (Gemini) responds; agent composes answers.
- ✅ No actions performed (read-only).

---

## Notes
- Keep tool descriptions precise to help the LLM choose correctly.
- Day 2 will add **RAG + KG**; retain the JSON as a simple data source.
- Day 3 will introduce **MCP actions**; maintain strict separation between info and actions.
