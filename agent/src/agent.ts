import 'dotenv/config';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { informationalTools } from './tools/index.js';

/**
 * Initialize the Gemini model with tool-calling capabilities
 */
function initializeModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables. Please create a .env file with your API key.');
  }

  return new ChatGoogleGenerativeAI({
    modelName: 'gemini-1.5-flash',
    apiKey,
    temperature: 0.1,
  });
}

/**
 * Create the agent with tools
 */
export async function createAgent() {
  const model = initializeModel();
  
  // Define the agent prompt
  const prompt = ChatPromptTemplate.fromMessages([
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

  // Create the tool-calling agent
  const agent = await createToolCallingAgent({
    llm: model,
    tools: informationalTools,
    prompt,
  });

  // Create the agent executor
  const agentExecutor = new AgentExecutor({
    agent,
    tools: informationalTools,
    verbose: true, // Set to true for debugging
  });

  return agentExecutor;
}

/**
 * Process a user query through the agent
 */
export async function processQuery(query: string): Promise<string> {
  const agent = await createAgent();
  
  const result = await agent.invoke({
    input: query,
  });

  return result.output;
}
