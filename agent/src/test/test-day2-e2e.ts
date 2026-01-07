import { MCPClientWrapper } from '../utils/mcpClient.js';

/**
 * Day 2 E2E Test - Verify agent discovers new RAG and KG tools
 */
async function testDay2E2E() {
  console.log('=== Day 2 Tool Discovery Test ===\n');
  
  try {
    // Connect to MCP server
    const mcpClient = new MCPClientWrapper();
    await mcpClient.connect();
    console.log('✓ Connected to MCP server\n');
    
    // Get tools
    const tools = await mcpClient.getTools();
    console.log(`Discovered ${tools.length} tools:\n`);
    
    // Check Day 1 tools
    const hasCalculate = tools.some(t => t.name === 'calculate');
    const hasTime = tools.some(t => t.name === 'get_current_time');
    const hasList = tools.some(t => t.name === 'list_current_iteration_items');
    const hasGetItem = tools.some(t => t.name === 'get_work_item_by_id');
    
    // Check Day 2 tools
    const hasSearchDocs = tools.some(t => t.name === 'search_docs');
    const hasQueryGraph = tools.some(t => t.name === 'query_graph');
    
    console.log('Day 1 Tools:');
    console.log(`  ${hasCalculate ? '✓' : '✗'} calculate`);
    console.log(`  ${hasTime ? '✓' : '✗'} get_current_time`);
    console.log(`  ${hasList ? '✓' : '✗'} list_current_iteration_items`);
    console.log(`  ${hasGetItem ? '✓' : '✗'} get_work_item_by_id`);
    console.log('\nDay 2 Tools (NEW):');
    console.log(`  ${hasSearchDocs ? '✓' : '✗'} search_docs`);
    console.log(`  ${hasQueryGraph ? '✓' : '✗'} query_graph`);
    console.log();
    
    // Verify counts
    if (tools.length !== 6) {
      throw new Error(`Expected 6 tools but found ${tools.length}`);
    }
    
    if (!hasSearchDocs || !hasQueryGraph) {
      throw new Error('Day 2 tools not found!');
    }
    
    await mcpClient.disconnect();
    
    console.log('✓ Day 2 Test PASSED!');
    console.log('  - 6 tools discovered (4 from Day 1 + 2 from Day 2)');
    console.log('  - No agent code changes needed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testDay2E2E().catch(console.error);
