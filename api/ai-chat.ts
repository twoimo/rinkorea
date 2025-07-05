import { VercelRequest, VercelResponse } from '@vercel/node';

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY || '';
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || '';

async function callMistralAPI(systemPrompt: string, userMessage: string): Promise<string> {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        },
        body: JSON.stringify({
            model: 'mistral-large-latest',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
            ],
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error('Mistral API Error:', response.status, errorBody);
        throw new Error(`Mistral API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

async function callClaudeAPI(systemPrompt: string, userMessage: string): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': CLAUDE_API_KEY,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model: 'claude-3-opus-20240229',
            system: systemPrompt,
            messages: [{ role: 'user', content: userMessage }],
            max_tokens: 1024,
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error('Claude API Error:', response.status, errorBody);
        throw new Error(`Claude API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    console.log("--- AI Chat Handler: Execution Started ---");

    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        console.log("AI Chat Handler: Handling OPTIONS request.");
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        console.error(`AI Chat Handler: Invalid method - ${req.method}`);
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log("AI Chat Handler: Parsing request body...");
        const { message, systemPrompt: customSystemPrompt } = req.body;
        console.log("AI Chat Handler: Request body parsed successfully.");

        if (!message) {
            console.error("AI Chat Handler: Validation failed - Message is required.");
            return res.status(400).json({ error: 'Message is required' });
        }

        const systemPrompt = customSystemPrompt || 'You are a helpful assistant.';
        console.log(`AI Chat Handler: System prompt is set. Length: ${systemPrompt.length}`);

        console.log(`AI Chat Handler: Mistral Key available: ${!!MISTRAL_API_KEY}`);
        console.log(`AI Chat Handler: Claude Key available: ${!!CLAUDE_API_KEY}`);

        let responseContent: string;

        try {
            console.log("AI Chat Handler: Attempting to call Mistral API...");
            responseContent = await callMistralAPI(systemPrompt, message);
            console.log("AI Chat Handler: Mistral API call successful.");
        } catch (mistralError) {
            console.warn("AI Chat Handler: Mistral API failed. Trying Claude fallback.", mistralError);

            try {
                console.log("AI Chat Handler: Attempting to call Claude API as fallback...");
                responseContent = await callClaudeAPI(systemPrompt, message);
                console.log("AI Chat Handler: Claude API call successful.");
            } catch (claudeError) {
                console.error("AI Chat Handler: Both AI models failed.", claudeError);
                return res.status(503).json({ error: 'AI service is temporarily unavailable.' });
            }
        }

        console.log("AI Chat Handler: Sending successful response.");
        return res.status(200).json({ response: responseContent });

    } catch (error) {
        console.error('AI Chat Handler: FATAL Error in handler.', error);
        return res.status(500).json({ error: 'An internal server error occurred.' });
    }
} 