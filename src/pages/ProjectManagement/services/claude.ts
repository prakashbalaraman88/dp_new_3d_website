import { Anthropic } from '@anthropic-ai/sdk';
import { env } from '../../../config/environment';

const anthropic = new Anthropic({
  apiKey: env.CLAUDE_API_KEY
});

const SYSTEM_PROMPT = `You are a financial assistant for a construction company. Your task is to analyze messages and extract transaction details.

For any financial transaction:
1. Extract the amount (remove ₹, Rs, commas)
2. Determine if it's income or expense based on keywords (received, paid, bought, etc.)
3. Create a clear description
4. Assign a category from: Materials, Labor, Equipment, Transportation, Client Payments, Utilities, Professional Services, Other

Example inputs and outputs:
"Paid Rs 5000 for cement" -> 
{
  "amount": 5000,
  "type": "expense",
  "description": "Cement purchase",
  "category": "Materials"
}

"Received advance payment 25000" ->
{
  "amount": 25000,
  "type": "income",
  "description": "Advance payment received",
  "category": "Client Payments"
}`;

interface TransactionResponse {
  amount: number;
  type: 'income' | 'expense';
  description: string;
  category: string;
}

export async function analyzeText(text: string): Promise<TransactionResponse> {
  if (!text?.trim()) {
    throw new Error('Please provide text to analyze');
  }

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1024,
      temperature: 0,
      system: SYSTEM_PROMPT,
      messages: [{
        role: "user",
        content: `Extract transaction details from: "${text}". Respond ONLY with a JSON object containing amount, type, description, and category.`
      }]
    });

    const content = response.content?.[0]?.text?.trim();
    if (!content) {
      throw new Error('No response received from Claude');
    }

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract transaction details');
    }

    const result = JSON.parse(jsonMatch[0]);

    // Validate response
    if (!result.amount || !result.type || !result.description || !result.category) {
      throw new Error('Invalid transaction format received');
    }

    // Clean amount
    const amount = Number(String(result.amount).replace(/[₹,Rs. ]/g, ''));
    if (isNaN(amount)) {
      throw new Error('Invalid amount format');
    }

    return {
      amount,
      type: result.type,
      description: result.description,
      category: result.category
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to analyze text: ${error.message}`);
    }
    throw new Error('An unexpected error occurred while analyzing text');
  }
}

export async function analyzeImage(base64Image: string): Promise<TransactionResponse> {
  if (!base64Image) {
    throw new Error('Please provide an image to analyze');
  }

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1024,
      temperature: 0,
      system: SYSTEM_PROMPT,
      messages: [{
        role: "user",
        content: [
          {
            type: "text",
            text: "Extract transaction details from this receipt/image. Respond ONLY with a JSON object containing amount, type, description, and category."
          },
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: base64Image
            }
          }
        ]
      }]
    });

    const content = response.content?.[0]?.text?.trim();
    if (!content) {
      throw new Error('No response received from Claude');
    }

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract transaction details from image');
    }

    const result = JSON.parse(jsonMatch[0]);

    // Validate response
    if (!result.amount || !result.type || !result.description || !result.category) {
      throw new Error('Invalid transaction format received');
    }

    // Clean amount
    const amount = Number(String(result.amount).replace(/[₹,Rs. ]/g, ''));
    if (isNaN(amount)) {
      throw new Error('Invalid amount format');
    }

    return {
      amount,
      type: result.type,
      description: result.description,
      category: result.category
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to analyze image: ${error.message}`);
    }
    throw new Error('An unexpected error occurred while analyzing image');
  }
}