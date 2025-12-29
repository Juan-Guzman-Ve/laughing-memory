import 'dotenv/config';
import { initializeModel } from '../utils/modelInitializer.js';

/**
 * Simple test to verify Gemini API connection
 * This test does NOT require MCP server
 */
async function testGeminiConnection() {
  console.log('='.repeat(60));
  console.log('Testing Gemini API Connection');
  console.log('='.repeat(60));
  console.log();

  try {
    // Initialize Gemini model
    console.log('📡 Initializing Gemini model...');
    const model = initializeModel();
    console.log('✅ Gemini model initialized');
    console.log();

    // Test simple invocation
    console.log('💬 Sending test message to Gemini...');
    const response = await model.invoke('Hello! Please respond with a simple greeting.');
    
    console.log('✅ Response received from Gemini:');
    console.log('-'.repeat(60));
    console.log(response.content);
    console.log('-'.repeat(60));
    console.log();

    console.log('✅ SUCCESS: Agent can reach Gemini API!');
    console.log();
  } catch (error) {
    console.error('❌ FAILED: Could not connect to Gemini API');
    console.error('Error:', error instanceof Error ? error.message : String(error));
    console.log();
    console.log('Please check:');
    console.log('1. GEMINI_API_KEY is set in .env file');
    console.log('2. API key is valid');
    console.log('3. Internet connection is working');
    process.exit(1);
  }
}

testGeminiConnection().catch(console.error);
