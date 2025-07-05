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
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, systemPrompt: customSystemPrompt } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const systemPrompt = customSystemPrompt || 'You are a helpful assistant.';
        let responseContent: string;

        try {
            responseContent = await callMistralAPI(systemPrompt, message);
        } catch (mistralError) {
            console.warn('Mistral failed, trying Claude as fallback:', mistralError);

            try {
                responseContent = await callClaudeAPI(systemPrompt, message);
            } catch (claudeError) {
                console.error('Both AI models failed:', claudeError);
                return res.status(503).json({ error: 'AI service is temporarily unavailable.' });
            }
        }

        return res.status(200).json({ response: responseContent });

    } catch (error) {
        console.error('Error in ai-chat handler:', error);
        return res.status(500).json({ error: 'An internal server error occurred.' });
    }
} 