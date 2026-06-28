import { Transaction } from '../types';
import { analyzeText } from '../services/claude';

export class MessageProcessor {
  static async processMessage(
    input: string,
  ): Promise<{
    success: boolean;
    transaction?: Omit<Transaction, 'id'>;
    error?: string;
  }> {
    try {
      if (!input?.trim()) {
        return {
          success: false,
          error: 'Please enter a message'
        };
      }

      const result = await analyzeText(input);
      
      return {
        success: true,
        transaction: {
          ...result,
          date: new Date().toISOString().split('T')[0]
        }
      };
    } catch (error) {
      console.error('Message processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process message'
      };
    }
  }
}