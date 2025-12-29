import { processQuery } from './agent.js';
import { 
  createReadlineInterface, 
  askQuestion, 
  displayWelcomeBanner, 
  displayGoodbyeMessage 
} from './utils/cli.js';

/**
 * Simple CLI interface for testing the agent
 */
async function main() {
  displayWelcomeBanner();

  const rl = createReadlineInterface();

  try {
    while (true) {
      const userInput = await askQuestion(rl, '\n> ');
      
      if (!userInput || userInput.trim() === '') {
        continue;
      }

      if (userInput.toLowerCase() === 'exit') {
        displayGoodbyeMessage();
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
