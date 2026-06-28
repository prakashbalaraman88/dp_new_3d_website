import { analyzeText } from '../services/claude';

export async function parseTransaction(text: string) {
  if (!text?.trim()) {
    throw new Error('Please provide text to analyze');
  }

  try {
    return await analyzeText(text);
  } catch (error) {
    console.error('Transaction parsing error:', error);
    throw error;
  }
}