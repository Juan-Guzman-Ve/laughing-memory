import 'dotenv/config';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

/**
 * Initialize the Gemini model with tool-calling capabilities
 */
export function initializeModel(): ChatGoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;

  console.log('Using Gemini API Key:', apiKey ? 'Provided' : 'Not Provided');
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables. Please create a .env file with your API key.');
  }

  return new ChatGoogleGenerativeAI({
    model: 'models/gemini-2.5-flash',
    apiKey,
    apiVersion: "v1beta", 
    temperature: 0.1,
  });
}
