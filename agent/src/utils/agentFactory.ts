import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { initializeModel } from './modelInitializer.js';
import { MCPClientWrapper } from './mcpClient.js';
import { AgentRAGHelper } from './ragHelper.js';

let mcpClient: MCPClientWrapper | null = null;
let ragHelper: AgentRAGHelper | null = null;

async function getMCPClient(): Promise<MCPClientWrapper> {
  if (!mcpClient) {
    mcpClient = new MCPClientWrapper();
    await mcpClient.connect();
  }
  return mcpClient;
}

function createAgentPrompt(): ChatPromptTemplate {
  return ChatPromptTemplate.fromMessages([
    ['system', `You are an intelligent assistant that helps users understand and interact with their Azure DevOps backlog.

    Your capabilities:
    - You can list all work items in the current sprint iteration using list_current_iteration_items
    - You can retrieve detailed information about specific work items using get_work_item_by_id
    - You can use the Knowledge Graph (query_graph tool) to filter work items by:
      * tag (e.g., "auth", "security", "performance")
      * type (e.g., "Bug", "Task", "UserStory")
      * state (e.g., "Active", "New", "Completed")
      * area (e.g., "Web", "Backend", "Documentation")
      * assignee (e.g., "Alice", "Bob")
      * parent-child relationships (children, parent)

    Guidelines:
    - ALWAYS use the available MCP tools to retrieve data - never make up information
    - For authentication/auth queries: use query_graph with queryType="by-tag" and tag="auth"
    - For security queries: use query_graph with queryType="by-tag" and tag="security"
    - For performance queries: use query_graph with queryType="by-tag" and tag="performance"
    - For filtering by type/state/area/assignee: use query_graph with appropriate queryType
    - For specific work item details: use get_work_item_by_id
    - For listing all items: use list_current_iteration_items
    - If a work item ID is not found, inform the user clearly
    - When listing items, format the output in a clear, readable way

    Current date: December 29, 2025`],
        ['placeholder', '{chat_history}'],
        ['human', '{input}'],
        ['placeholder', '{agent_scratchpad}'],
  ]);
}

export async function createAgent(): Promise<AgentExecutor> {
  const model = initializeModel();
  const prompt = createAgentPrompt();
  
  // Get MCP client and discover tools
  const client = await getMCPClient();
  const tools = await client.getTools();
  
  console.log(`🔧 Using ${tools.length} tools from MCP server`);
  
  // Initialize RAG with backlog data from MCP
  try {
    console.log('Initializing Agent RAG...');
    const backlogResult = await client.callTool('list_current_iteration_items', {});
    
    if (!ragHelper) {
      ragHelper = new AgentRAGHelper();
    }
    await ragHelper.initialize(backlogResult as any);
  } catch (error) {
    console.warn('⚠ RAG initialization failed (continuing without semantic search):', error);
  }
  
  // Create the tool-calling agent
  const agent = await createToolCallingAgent({
    llm: model,
    tools: tools,
    prompt,
  });

  // Create the agent executor
  const agentExecutor = new AgentExecutor({
    agent,
    tools: tools,
    verbose: true, // Set to true for debugging
  });

  return agentExecutor;
}

export async function cleanupAgent(): Promise<void> {
  if (mcpClient) {
    await mcpClient.disconnect();
    mcpClient = null;
  }
  ragHelper = null;
}

export function getRAGHelper(): AgentRAGHelper | null {
  return ragHelper;
}
