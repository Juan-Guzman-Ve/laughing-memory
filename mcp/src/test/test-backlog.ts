import { MCPServer } from '../server/mcpServer.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const SERVER_CONFIG = {
  name: 'test-mcp-server',
  version: '1.0.0',
};

const CLIENT_CONFIG = {
  name: 'test-client',
  version: '1.0.0',
};

const TRANSPORT_CONFIG = {
  command: 'node',
  args: ['./dist/server/index.js'],
};

const TEST_WORK_ITEM_ID = 123;
const RESULT_PREVIEW_LENGTH = 300;

/**
 * Print test section header
 */
function printHeader(title: string): void {
  console.log('='.repeat(60));
  console.log(title);
  console.log('='.repeat(60));
  console.log();
}

/**
 * Print tool call result preview
 */
function printResult(result: any): void {
  const resultStr = JSON.stringify(result, null, 2);
  const preview = resultStr.length > RESULT_PREVIEW_LENGTH 
    ? resultStr.substring(0, RESULT_PREVIEW_LENGTH) + '...' 
    : resultStr;
  console.log('✅ Result:', preview);
  console.log();
}

/**
 * Initialize and start MCP server
 */
async function startServer(): Promise<MCPServer> {
  console.log('🚀 Starting MCP server...');
  const server = new MCPServer(SERVER_CONFIG);
  await server.start();
  console.log('✅ MCP server started');
  console.log();
  
  // Allow server to initialize
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return server;
}

/**
 * Connect MCP client to server
 */
async function connectClient(): Promise<{ client: Client; transport: StdioClientTransport }> {
  const transport = new StdioClientTransport(TRANSPORT_CONFIG);
  const client = new Client(CLIENT_CONFIG, { capabilities: {} });
  
  console.log('🔌 Connecting client to server...');
  await client.connect(transport);
  console.log('✅ Client connected');
  console.log();
  
  return { client, transport };
}

/**
 * List and display available MCP tools
 */
async function listTools(client: Client): Promise<void> {
  console.log('📋 Listing available tools...');
  const { tools } = await client.listTools();
  console.log(`✅ Found ${tools.length} tools:`);
  tools.forEach(tool => console.log(`   - ${tool.name}`));
  console.log();
}

/**
 * Test list_current_iteration_items tool
 */
async function testListCurrentIterationItems(client: Client): Promise<void> {
  console.log('🧪 Testing list_current_iteration_items...');
  const result = await client.callTool({
    name: 'list_current_iteration_items',
    arguments: {},
  });
  printResult(result);
}

/**
 * Test get_work_item_by_id tool
 */
async function testGetWorkItemById(client: Client, workItemId: number): Promise<void> {
  console.log(`🧪 Testing get_work_item_by_id (ID: ${workItemId})...`);
  const result = await client.callTool({
    name: 'get_work_item_by_id',
    arguments: { workItemId },
  });
  printResult(result);
}

/**
 * Clean up resources
 */
async function cleanup(
  client: Client, 
  transport: StdioClientTransport, 
  server: MCPServer
): Promise<void> {
  try {
    await client.close();
  } catch (e) {
    // Client already closed
  }
  
  try {
    await transport.close();
  } catch (e) {
    // Transport already closed
  }
  
  try {
    await server.stop();
  } catch (e) {
    // Server already stopped
  }
}

/**
 * Main test function for MCP server backlog tools
 */
async function testBacklogTools(): Promise<void> {
  printHeader('Testing MCP Server Backlog Tools');
  
  const server = await startServer();
  const { client, transport } = await connectClient();

  try {
    await listTools(client);
    await testListCurrentIterationItems(client);
    await testGetWorkItemById(client, TEST_WORK_ITEM_ID);
    
    console.log('✅ SUCCESS: MCP server backlog tools are working!');
  } catch (error) {
    console.error('❌ FAILED:', error);
    await cleanup(client, transport, server);
    process.exit(1);
  } finally {
    await cleanup(client, transport, server);
  }
}

testBacklogTools().catch(console.error);
