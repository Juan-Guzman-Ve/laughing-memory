# PoC Action Plan — Multi-Source Chatbot with Intelligent Agent Orchestration

**Date:** December 26, 2025  
**Owner:** Juan Guzman  
**Context:** Internal assistant focused on Azure DevOps backlog. Hosted LLM = **Gemini API** (Google). Actions = **MCP Server** (Node/TypeScript). Orchestration = **LangChain (Node/TS)**.

---

## 1) Objectives
- Answer informational questions about user stories and backlog items in the **current iteration**.
- Perform **actions** on items (e.g., update fields, add comments, create child tasks) strictly through **MCP Server**.
- Ensure the agent **autonomously** chooses between informational (RAG+KG) vs. action (MCP) routes — **no keyword routing or if/else**.
- Keep the architecture modular to add tools without changing routing logic.

---

## 2) Scope (Phase 1 PoC)
- **Informational**: Read from mock ADO JSON (Day 1), then enrich with **RAG** (Day 2) and **Knowledge Graph** (Day 2).
- **Actions**: Implement via **MCP tools** (Day 3) — update work item state/tags, add comment, create child task.
- **UI**: Minimal chat UI (LangChain Agent Chat UI or Express endpoint) — passive, agent decides routes.

---

## 3) High-Level Architecture

```
+-----------------+            +-------------------------+            +---------------------------+
|     Chat UI     |  ------>   |      Agent (LangChain)  |   ----->   |  Hosted LLM (Gemini API) |
|  (passive UI)   |            |  - Tool-calling agent   |            |   - Tool selection logic  |
+-----------------+            |  - RAG + KG (info)      |            +---------------------------+
                               |  - MCP tools (actions)  |
                               +------------+------------+
                                            |
                                            v
              +----------------------+   +-----------------+
              |   RAG Vector Store   |   | Knowledge Graph |
              | (FAISS / local)      |   | (in-memory)     |
              +----------------------+   +-----------------+
                                            |
                                            v
                                   +---------------------+
                                   |  MCP Server (Node)  |
                                   |  - ADO action tools |
                                   +---------------------+
```

**Notes**
- Hosted LLM (Gemini) provides function/tool-calling to choose tools automatically.
- Informational flow: Centralized RAG + KG pipeline (always goes through agent).
- Action flow: Only via MCP Server — never mixed into RAG/KG.

---

## 4) Components

### 4.1 Agent (LangChain, Node/TS)
- Registers tools:
  - `search_docs` (RAG retrieval)
  - `query_graph` (KG facts/relationships)
  - MCP action tools: `getWorkItem`, `queryCurrentIterationBacklog`, `updateWorkItem`, `addComment`, `createChildTask`
- Binds to **Gemini** model via LangChain’s Google GenAI integration.

### 4.2 RAG
- Source docs: Work item descriptions, acceptance criteria, and comments (mocked initially).
- Store: Local **FAISS** (simple for PoC).
- Goal: Provide high-relevance snippets for informational answers.

### 4.3 Knowledge Graph (KG)
- In-memory graph representing relations: user story ↔ tasks/bugs ↔ PRs.
- Answer structural queries (children, parent, severity, iteration, area).

### 4.4 MCP Server (Node/TS)
- Exposes **action-only** tools to enforce separation.
- Uses Azure DevOps PAT **later** (Phase 2). For PoC, can stub responses or operate on mock JSON.

### 4.5 UI
- LangChain Agent Chat UI or minimal Express endpoint.
- Only forwards messages; does not decide which tool to use.

---

## 5) Data & Configuration
- **Day 1 mock**: `data/backlog.json` containing current iteration items (UserStory/Task/Bug, fields, children, links).
- `.env` keys for **Gemini**:
  - `GEMINI_API_KEY`
- Later (Day 3): ADO PAT `ADO_PAT` for MCP actions.

---

## 6) Timeline & Milestones

### Day 1 — Foundations (mock data + hosted LLM wiring)
- Create `data/backlog.json` (current iteration).
- Set up LangChain with **Gemini** (API key in `.env`).
- Implement read-only informational tools that query `backlog.json`.
- **Checkpoint**: Agent answers “List items in current iteration” and “Show acceptance criteria + children for ID X” using hosted LLM.

### Day 2 — Informational Pipeline (RAG + KG)
- Ingest mock docs → build FAISS index.
- Create in-memory KG (relationships).
- Ensure centralized agent path combines RAG + KG results.
- **Checkpoint**: Agent answers questions requiring both snippets and relationships.

### Day 3 — Actions via MCP Server
- Implement MCP tools (update fields/state/tags, add comment, create child task).
- Enforce that **all actions** use MCP; info-tools remain read-only.
- **Checkpoint**: Agent autonomously triggers MCP tools on action requests.

### Day 4 — UI Integration & E2E
- Connect passive chat UI.
- Validate autonomous routing across informational vs actions.
- **Checkpoint**: Real user prompts invoke correct tools, end-to-end.

### Day 5 — Validation & Hardening
- Evaluate against challenge criteria (autonomy, separation, modularity).
- Handle edge cases (missing ID, auth errors, empty results).
- **Checkpoint**: All criteria satisfied; document outcomes.

---

## 7) Acceptance Criteria
- Informational queries **always** use centralized RAG + KG agent flow.
- Action requests **always** execute via MCP Server.
- Agent **autonomously** selects route; no if/else logic.
- Architecture is modular: adding tools does **not** require routing changes.
- MCP tools implement valid schemas; errors handled gracefully.

---

## 8) Testing Scenarios (examples)
- "What are the acceptance criteria and linked tasks for US-123?" → RAG + KG.
- "Add comment 'Ready for QA' to US-123 and tag it 'ready'." → MCP actions.
- "List current iteration items with owner and state." → MCP (query) or mock JSON in Day 1.

---

## 9) Risks & Mitigations
- **Hosted LLM cost/limits** → Use smaller model, cap tokens, cache results.
- **Ambiguous queries** → Agent asks clarifying questions.
- **Auth failures (later)** → Clear error messages and PAT scope guidance.
- **Data sparsity** → Seed mock docs and graph for demo quality.

---

## 10) Deliverables
- `data/backlog.json` (mock ADO data)
- Agent + tools (read-only on Day 1)
- RAG index + KG (Day 2)
- MCP Server tools (Day 3)
- Passive UI (Day 4)
- Validation report (Day 5)

---

## 11) Next Steps After PoC
- Replace mock data with live ADO via MCP.
- Expand KG (optional: move to Neo4j).
- Expose MCP publicly for clients (VS Code MCP, GitHub Copilot CLI integrations where applicable).
- Team onboarding and documentation.
