import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_CLAUDE_API_KEY
});

export async function POST(req: Request) {
  try {
    if (!req.body) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400 }
      );
    }

    const { message } = await req.json();

    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1024,
      temperature: 0,
      messages: [{
        role: "user",
        content: `Extract transaction details from this text: "${message}"
          If this is a financial transaction, identify:
          - The amount in Indian Rupees (₹ or Rs.)
          - Whether it's income or expense
          - A clear description
          - The category (Materials, Labor, Equipment, Transportation, Client Payments, Utilities, Professional Services, or Other)
          
          Respond with ONLY a JSON object like this:
          {
            "amount": number,
            "type": "income" or "expense",
            "description": "string",
            "category": "string"
          }`
      }]
    });

    if (!response.content?.[0]?.text) {
      throw new Error('No response from Claude');
    }

    const responseText = response.content[0].text.trim();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }

    const result = JSON.parse(jsonMatch[0]);

    // Validate response
    if (!result.amount || !result.type || !result.description || !result.category) {
      throw new Error('Missing required fields in response');
    }

    // Clean amount - remove currency symbols and convert to number
    const amount = Number(String(result.amount).replace(/[₹,Rs. ]/g, ''));
    if (isNaN(amount)) {
      throw new Error('Invalid amount');
    }

    return new Response(JSON.stringify({
      amount,
      type: result.type,
      description: result.description,
      category: result.category
    }), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process message' }),
      { status: 500 }
    );
  }
}