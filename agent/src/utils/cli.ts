import * as readline from 'readline';

/**
 * Create a readline interface for CLI interaction
 */
export function createReadlineInterface(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

/**
 * Ask a question and return the user's response
 */
export function askQuestion(rl: readline.Interface, query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

/**
 * Display the welcome banner
 */
export function displayWelcomeBanner(): void {
  console.log('='.repeat(60));
  console.log('Azure DevOps Agent - Day 1 Demo (Gemini + Read-Only Tools)');
  console.log('='.repeat(60));
  console.log('\nType your questions or commands. Type "exit" to quit.\n');
}

/**
 * Display the goodbye message
 */
export function displayGoodbyeMessage(): void {
  console.log('\nGoodbye!\n');
}
