/**
 * Test script to verify backlog tools work without requiring Gemini API
 */
import { listCurrentIterationItems, getWorkItemById } from './tools/backlogTools.js';

async function runTests() {
  console.log('='.repeat(60));
  console.log('Testing Backlog Tools - Day 1');
  console.log('='.repeat(60));
  console.log();

  // Test 1: List all items in current iteration
  console.log('TEST 1: List items in the current iteration with owner and state');
  console.log('-'.repeat(60));
  try {
    const result = await listCurrentIterationItems();
    console.log(result);
    console.log('✅ Test 1 PASSED\n');
  } catch (error) {
    console.error('❌ Test 1 FAILED:', error);
  }

  // Test 2: Get specific work item by ID
  console.log('TEST 2: Show acceptance criteria and linked tasks for work item 123');
  console.log('-'.repeat(60));
  try {
    const result = await getWorkItemById(123);
    console.log(result);
    console.log('✅ Test 2 PASSED\n');
  } catch (error) {
    console.error('❌ Test 2 FAILED:', error);
  }

  // Test 3: Get work item with children (ID 125)
  console.log('TEST 3: Get work item with multiple children (ID 125)');
  console.log('-'.repeat(60));
  try {
    const result = await getWorkItemById(125);
    console.log(result);
    console.log('✅ Test 3 PASSED\n');
  } catch (error) {
    console.error('❌ Test 3 FAILED:', error);
  }

  // Test 4: Test non-existent work item
  console.log('TEST 4: Try to get non-existent work item (ID 999)');
  console.log('-'.repeat(60));
  try {
    const result = await getWorkItemById(999);
    console.log(result);
    console.log('✅ Test 4 PASSED\n');
  } catch (error) {
    console.error('❌ Test 4 FAILED:', error);
  }

  console.log('='.repeat(60));
  console.log('All tests completed!');
  console.log('='.repeat(60));
  console.log();
  console.log('Next Steps:');
  console.log('1. Get a Gemini API key from: https://makersuite.google.com/app/apikey');
  console.log('2. Update the .env file with your API key');
  console.log('3. Run: npm run dev');
  console.log('4. Test the full agent with natural language queries');
}

runTests().catch(console.error);
