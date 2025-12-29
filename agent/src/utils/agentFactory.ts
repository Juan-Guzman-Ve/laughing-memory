import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { initializeModel } from './modelInitializer.js';
import { MCPClientWrapper } from './mcpClient.js';

// Global MCP client instance
let mcpClient: MCPClientWrapper | null = null;

/**
 * Get or create MCP client instance
 */
async function getMCPClient(): Promise<MCPClientWrapper> {
  if (!mcpClient) {
    mcpClient = new MCPClientWrapper();
    await mcpClient.connect();
  }
  return mcpClient;
}

/**
 * Create the agent prompt template
 */
function createAgentPrompt(): ChatPromptTemplate {
  return ChatPromptTemplate.fromMessages([
    ['system', `You are an intelligent assistant that helps users understand and interact with their Azure DevOps backlog.

Your capabilities:
- You can list all work items in the current sprint iteration
- You can retrieve detailed information about specific work items including acceptance criteria, child items, and linked PRs

Guidelines:
- Always be precise and factual
- If a work item ID is not found, inform the user clearly
- When listing items, format the output in a clear, readable way
- When asked about acceptance criteria or details, use the get_work_item_by_id tool

Current date: December 29, 2025`],
    ['placeholder', '{chat_history}'],
    ['human', '{input}'],
    ['placeholder', '{agent_scratchpad}'],
  ]);
}

/**
 * Create the agent with tools from MCP server
 */
export async function createAgent(): Promise<AgentExecutor> {
  const model = initializeModel();
  const prompt = createAgentPrompt();
  
  // Get MCP client and discover tools
  const client = await getMCPClient();
  const tools = await client.getTools();
  
  console.log(`🔧 Using ${tools.length} tools from MCP server`);
  
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

/**
 * Clean up MCP client connection
 */
export async function cleanupAgent(): Promise<void> {
  if (mcpClient) {
    await mcpClient.disconnect();
    mcpClient = null;
  }
}
