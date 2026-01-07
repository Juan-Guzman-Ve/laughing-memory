import * as readline from 'readline';

export function createReadlineInterface(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

export function askQuestion(rl: readline.Interface, query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

export function displayWelcomeBanner(): void {
  console.log('='.repeat(60));
  console.log('Azure DevOps Agent - Day 1 Demo (Gemini + Read-Only Tools)');
  console.log('='.repeat(60));
  console.log('\nType your questions or commands. Type "exit" to quit.\n');
}

export function displayGoodbyeMessage(): void {
  console.log('\nGoodbye!\n');
}
