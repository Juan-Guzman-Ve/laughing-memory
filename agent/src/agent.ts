import 'dotenv/config';
import { createAgent } from './utils/agentFactory.js';

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
