import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_CLAUDE_API_KEY || ''
});

const systemPrompt = `You are a financial assistant for a construction company. Analyze the text and extract transaction details.

For any financial transaction:
1. Extract the amount (remove ₹, Rs, commas)
2. Determine if it's income or expense
3. Create a clear description
4. Assign a category from: Materials, Labor, Equipment, Transportation, Client Payments, Utilities, Professional Services, Other

Example inputs:
"Paid 500 rs for sand" -> { amount: 500, type: "expense", description: "Sand purchase", category: "Materials" }
"Received 10000 advance" -> { amount: 10000, type: "income", description: "Advance payment", category: "Client Payments" }`;

export async function analyzeText(text: string) {
  if (!text?.trim()) {
    throw new Error('Please provide some text to analyze');
  }

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1024,
      temperature: 0,
      system: systemPrompt,
      messages: [{
        role: "user",
        content: text
      }]
    });

    const content = response.content[0]?.text;
    if (!content) {
      throw new Error('No response from Claude');
    }

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract transaction details');
    }

    const result = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (!result.amount || !result.type || !result.description || !result.category) {
      throw new Error('Invalid transaction format');
    }

    // Clean and validate amount
    const amount = Number(String(result.amount).replace(/[₹,Rs. ]/g, ''));
    if (isNaN(amount)) {
      throw new Error('Invalid amount');
    }

    return {
      amount,
      type: result.type as 'income' | 'expense',
      description: result.description,
      category: result.category
    };
  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to analyze text');
  }
}