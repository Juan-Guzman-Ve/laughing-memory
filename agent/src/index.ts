import { processQuery } from './agent.js';
import * as readline from 'readline';

/**
 * Simple CLI interface for testing the agent
 */
async function main() {
  console.log('='.repeat(60));
  console.log('Azure DevOps Agent - Day 1 Demo (Gemini + Read-Only Tools)');
  console.log('='.repeat(60));
  console.log('\nType your questions or commands. Type "exit" to quit.\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const askQuestion = (query: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(query, resolve);
    });
  };

  try {
    while (true) {
      const userInput = await askQuestion('\n> ');
      
      if (!userInput || userInput.trim() === '') {
        continue;
      }

      if (userInput.toLowerCase() === 'exit') {
        console.log('\nGoodbye!\n');
        rl.close();
        break;
      }

      console.log('\nProcessing...\n');
      
      try {
        const response = await processQuery(userInput);
        console.log('Agent:', response);
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
      }
    }
  } catch (error) {
    console.error('Fatal error:', error);
    rl.close();
  }
}

// Run the CLI
main().catch(console.error);
