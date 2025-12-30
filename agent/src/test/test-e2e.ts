import { processQuery } from '../agent.js';
import { cleanupAgent } from '../utils/agentFactory.js';

/**
 * End-to-end test: Agent → MCP → Backlog
 * Verifies agent can communicate with MCP server and retrieve backlog data
 */
async function testE2E() {
  console.log('='.repeat(60));
  console.log('End-to-End Test: Agent → MCP → Backlog');
  console.log('='.repeat(60));
  console.log();

  try {
    // Test: Get specific work item by ID
    console.log('🧪 Testing: Get work item details');
    console.log('   Query: "Show me the details for work item 123"');
    console.log();
    
    const response = await processQuery('Show me the details for work item 123');
    
    console.log('✅ Response:');
    console.log('─'.repeat(60));
    console.log(response);
    console.log('─'.repeat(60));
    console.log();
    
    console.log('✅ SUCCESS: Agent successfully communicates with MCP server!');
    
  } catch (error) {
    console.error('❌ FAILED:', error);
    await cleanupAgent();
    process.exit(1);
  } finally {
    // Clean up MCP client to allow process to exit
    await cleanupAgent();
    console.log('🧹 Cleaned up resources');
  }
}

testE2E().catch(console.error);
