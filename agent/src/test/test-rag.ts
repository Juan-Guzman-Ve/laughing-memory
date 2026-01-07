import { createAgent, cleanupAgent, getRAGHelper } from '../utils/agentFactory.js';

/**
 * Test RAG semantic search capabilities
 */
async function testRAG() {
  console.log('='.repeat(60));
  console.log('RAG Semantic Search Test');
  console.log('='.repeat(60));
  console.log();

  try {
    // Initialize agent (which initializes RAG)
    console.log('Initializing agent with RAG...');
    await createAgent();
    console.log();

    const ragHelper = getRAGHelper();
    if (!ragHelper) {
      throw new Error('RAG helper not initialized');
    }

    // Test 1: Search for authentication/security concepts
    console.log('Test 1: Semantic search for "authentication security login"');
    console.log('-'.repeat(60));
    const results1 = await ragHelper.search('authentication security login', 3);
    results1.forEach((result, i) => {
      console.log(`${i + 1}. [${result.type}] ${result.title}`);
      console.log(`   ID: ${result.id} | State: ${result.state} | Assigned: ${result.assignedTo}`);
      console.log(`   Tags: ${result.tags.join(', ')}`);
      console.log();
    });

    // Test 2: Search for performance issues
    console.log('Test 2: Semantic search for "memory performance optimization"');
    console.log('-'.repeat(60));
    const results2 = await ragHelper.search('memory performance optimization', 3);
    results2.forEach((result, i) => {
      console.log(`${i + 1}. [${result.type}] ${result.title}`);
      console.log(`   ID: ${result.id} | State: ${result.state} | Assigned: ${result.assignedTo}`);
      console.log(`   Tags: ${result.tags.join(', ')}`);
      console.log();
    });

    // Test 3: Search for UI/frontend work
    console.log('Test 3: Semantic search for "user interface dashboard visualization"');
    console.log('-'.repeat(60));
    const results3 = await ragHelper.search('user interface dashboard visualization', 3);
    results3.forEach((result, i) => {
      console.log(`${i + 1}. [${result.type}] ${result.title}`);
      console.log(`   ID: ${result.id} | State: ${result.state} | Assigned: ${result.assignedTo}`);
      console.log(`   Tags: ${result.tags.join(', ')}`);
      console.log();
    });

    console.log('✅ RAG semantic search is working!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await cleanupAgent();
    console.log('🧹 Cleaned up resources');
  }
}

testRAG().catch(console.error);
