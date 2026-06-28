import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const systemPrompt = `You are a financial assistant for a construction and interior design company. Your task is to analyze messages and receipts to extract transaction information.

For text and image analysis:
- Look for Indian currency symbols (₹ or Rs.)
- Identify if it's an income or expense
- Extract the amount as a number (remove any currency symbols and commas)
- Determine a suitable category
- Create a clear description

Categories include:
- Materials (e.g., cement, sand, paint)
- Labor (e.g., worker payments, contractor fees)
- Equipment (e.g., tools, machinery rental)
- Transportation (e.g., delivery charges, fuel)
- Client Payments (e.g., advances, installments)
- Utilities (e.g., electricity, water)
- Professional Services (e.g., design fees, consultancy)
- Other (for miscellaneous expenses)

Return only a JSON object with:
{
  "amount": number,
  "type": "income" | "expense",
  "description": string,
  "category": string
}`;

export async function analyzeText(text: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    try {
      const parsedContent = JSON.parse(content);
      return {
        amount: Number(String(parsedContent.amount).replace(/[₹,Rs. ]/g, '')),
        type: parsedContent.type,
        description: parsedContent.description || 'Unspecified transaction',
        category: parsedContent.category || 'Other'
      };
    } catch (error) {
      console.error('JSON parsing error:', error);
      throw new Error('Invalid JSON response from OpenAI');
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}

export async function analyzeImage(imageBase64: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this receipt/message and extract the transaction details."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');

      const parsedContent = JSON.parse(jsonMatch[0]);
      return {
        amount: Number(String(parsedContent.amount).replace(/[₹,Rs. ]/g, '')),
        type: parsedContent.type,
        description: parsedContent.description || 'Unspecified transaction',
        category: parsedContent.category || 'Other'
      };
    } catch (error) {
      console.error('JSON parsing error:', error);
      throw new Error('Invalid JSON response from OpenAI');
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}