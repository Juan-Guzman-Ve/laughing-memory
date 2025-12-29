import { processQuery } from '../agent.js';
import { cleanupAgent } from '../utils/agentFactory.js';

/**
 * End-to-end test: Agent → MCP → Backlog
 * Tests complete flow with natural language queries
 */
async function testE2E() {
  console.log('='.repeat(60));
  console.log('End-to-End Test: Agent → MCP → Backlog');
  console.log('='.repeat(60));
  console.log();

  const tests = [
    {
      name: 'Test 1: List current iteration items',
      query: 'List all items in the current iteration with their owners and states',
    },
    {
      name: 'Test 2: Get specific work item',
      query: 'Show me the details for work item 123',
    },
    {
      name: 'Test 3: Natural language query',
      query: 'What bugs are in the current sprint?',
    },
  ];

  for (const test of tests) {
    console.log(`🧪 ${test.name}`);
    console.log(`   Query: "${test.query}"`);
    console.log();
    
    try {
      const response = await processQuery(test.query);
      console.log('✅ Response:');
      console.log('─'.repeat(60));
      console.log(response);
      console.log('─'.repeat(60));
      console.log();
    } catch (error) {
      console.error('❌ FAILED:', error);
      process.exit(1);
    }
  }

  console.log('✅ SUCCESS: All end-to-end tests passed!');
  console.log('Agent successfully communicates with MCP server and retrieves backlog data.');
  
  // Clean up MCP client to allow process to exit
  await cleanupAgent();
  console.log('🧹 Cleaned up resources');
}

testE2E().catch(console.error);
