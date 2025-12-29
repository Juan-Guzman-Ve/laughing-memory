import { MCPClientWrapper } from '../utils/mcpClient.js';

/**
 * Test MCP server compatibility with agent needs
 * Verifies:
 * 1. MCP server can start
 * 2. Agent can connect to MCP server
 * 3. Required tools are exposed
 * 4. Tools can be called successfully
 */
async function testMCPServerCompatibility() {
  console.log('='.repeat(60));
  console.log('Testing MCP Server Compatibility');
  console.log('='.repeat(60));
  console.log();

  let client: MCPClientWrapper | null = null;

  try {
    // Test 1: Connect to MCP server
    console.log('📡 TEST 1: Connecting to MCP server...');
    client = new MCPClientWrapper();
    await client.connect();
    console.log('✅ Connected to MCP server');
    console.log();

    // Test 2: Discover tools
    console.log('🔍 TEST 2: Discovering MCP tools...');
    const tools = await client.getTools();
    console.log(`✅ Discovered ${tools.length} tools`);
    console.log();

    // Test 3: Verify required tools exist
    console.log('✔️  TEST 3: Verifying required tools...');
    const requiredTools = [
      'list_current_iteration_items',
      'get_work_item_by_id'
    ];

    const toolNames = tools.map(t => t.name);
    console.log('Available tools:', toolNames);
    console.log();

    for (const requiredTool of requiredTools) {
      const found = toolNames.includes(requiredTool);
      if (found) {
        console.log(`  ✅ ${requiredTool} - FOUND`);
      } else {
        console.log(`  ❌ ${requiredTool} - MISSING`);
        throw new Error(`Required tool '${requiredTool}' not found in MCP server`);
      }
    }
    console.log();

    // Test 4: Call list_current_iteration_items tool
    console.log('🧪 TEST 4: Calling list_current_iteration_items...');
    const listTool = tools.find(t => t.name === 'list_current_iteration_items');
    if (listTool) {
      const result = await listTool.call({});
      console.log('✅ Tool executed successfully');
      console.log('Response preview:', result.substring(0, 200) + '...');
      console.log();
    }

    // Test 5: Call get_work_item_by_id tool
    console.log('🧪 TEST 5: Calling get_work_item_by_id (ID: 123)...');
    const getItemTool = tools.find(t => t.name === 'get_work_item_by_id');
    if (getItemTool) {
      const result = await getItemTool.call({ workItemId: 123 } as any);
      console.log('✅ Tool executed successfully');
      console.log('Response preview:', result.substring(0, 200) + '...');
      console.log();
    }

    console.log('='.repeat(60));
    console.log('✅ ALL TESTS PASSED - MCP server is compatible!');
    console.log('='.repeat(60));
    console.log();

  } catch (error) {
    console.log();
    console.log('='.repeat(60));
    console.error('❌ TEST FAILED');
    console.log('='.repeat(60));
    console.error('Error:', error instanceof Error ? error.message : String(error));
    console.log();
    
    if (error instanceof Error && error.message.includes('ENOENT')) {
      console.log('💡 Possible issue: MCP server not compiled');
      console.log('   Run: cd ../mcp && npm run compile');
    }
    
    process.exit(1);
  }
}

testMCPServerCompatibility().catch(console.error);
