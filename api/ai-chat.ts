import { VercelRequest, VercelResponse } from '@vercel/node';
import { ChatMistralAI } from '@langchain/mistralai';
import { ChatAnthropic } from '@langchain/anthropic';
import { createClient } from '@supabase/supabase-js';

// Environment variables
const MISTRAL_API_KEY = process.env.VITE_MISTRAL_API_KEY || '';
const CLAUDE_API_KEY = process.env.VITE_CLAUDE_API_KEY || '';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

// Initialize clients
const mistralModel = new ChatMistralAI({
    model: "mistral-large-latest",
    apiKey: MISTRAL_API_KEY,
    temperature: 0.7,
});

const claudeModel = new ChatAnthropic({
    model: "claude-3-5-sonnet-20241022",
    apiKey: CLAUDE_API_KEY,
    temperature: 0.7,
});

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        const { function_type, message, context = {}, is_admin = false } = req.body;

        if (!function_type || !message) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        const systemPrompt = getSystemPrompt(function_type, is_admin);

        let response;
        try {
            // Try Mistral first
            const mistralResponse = await mistralModel.invoke([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message }
            ]);
            response = mistralResponse.content;
        } catch (mistralError) {
            console.warn('Mistral failed, trying Claude:', mistralError);

            try {
                // Fallback to Claude
                const claudeResponse = await claudeModel.invoke([
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message }
                ]);
                response = claudeResponse.content;
            } catch (claudeError) {
                console.error('Both AI models failed:', claudeError);
                throw new Error('AI service temporarily unavailable');
            }
        }

        // Handle special functions that need database access
        if (function_type === 'document_search') {
            const searchResults = await performDocumentSearch(message);
            response = `${response}\n\n검색 결과:\n${searchResults}`;
        } else if (function_type === 'smart_quote') {
            const quoteData = await generateQuote(message, context);
            response = `${response}\n\n${quoteData}`;
        } else if (function_type === 'financial_analysis' && is_admin) {
            const analysisData = await performFinancialAnalysis(message, context);
            response = `${response}\n\n분석 결과:\n${analysisData}`;
        }

        res.status(200).json({
            success: true,
            response: response,
            function_type,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('AI Chat API Error:', error);
        res.status(500).json({
            error: 'AI 서비스 처리 중 오류가 발생했습니다.',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

function getSystemPrompt(functionType: string, isAdmin: boolean): string {
    const basePrompt = `
당신은 린코리아(RIN Korea)의 AI 어시스턴트입니다. 린코리아는 혁신적인 세라믹 코팅재와 친환경 건설재료를 전문으로 하는 회사입니다.

주요 제품:
- 린코트(RIN-COAT): 1액형 세라믹 코팅제
- 린하드플러스(RIN-HARD PLUS): 고성능 경화제
- 린씰플러스(RIN-SEAL PLUS): 침투성 방수제

항상 정확하고 전문적인 답변을 제공하며, 고객의 요구사항을 정확히 파악하여 최적의 솔루션을 제안해주세요.
${isAdmin ? '관리자 권한으로 모든 기능과 데이터에 접근할 수 있습니다.' : ''}
`;

    switch (functionType) {
        case 'customer_chat':
            return `${basePrompt}
현재 고객 상담 모드입니다. 고객의 문의사항에 대해 친절하고 전문적으로 답변해주세요.
제품 관련 질문, 기술적 문의, 가격 문의 등에 대해 정확한 정보를 제공해주세요.`;

        case 'qna_automation':
            return `${basePrompt}
Q&A 자동화 모드입니다. 기존 Q&A 데이터베이스를 참고하여 유사한 질문의 답변을 제공하거나,
새로운 질문에 대한 적절한 답변을 생성해주세요.`;

        case 'smart_quote':
            return `${basePrompt}
스마트 견적 시스템 모드입니다. 고객의 요구사항을 파악하여 적절한 제품을 추천하고,
면적, 수량, 특수 요구사항 등을 고려하여 정확한 견적을 제공해주세요.`;

        case 'document_search':
            return `${basePrompt}
문서 지능 검색 모드입니다. 사용자가 요청한 정보를 데이터베이스에서 검색하고,
관련 문서나 자료를 찾아서 요약하여 제공해주세요.`;

        case 'financial_analysis':
            return `${basePrompt}
금융 AI 분석 모드입니다. 수익 데이터, 매출 트렌드, 성과 분석 등을 수행하고,
인사이트와 개선 방안을 제공해주세요. 차트나 그래프로 시각화할 수 있는 데이터도 제공해주세요.`;

        default:
            return basePrompt;
    }
}

async function performDocumentSearch(query: string): Promise<string> {
    try {
        // Search in products, projects, news, resources
        const tables = ['products', 'projects', 'news', 'resources'];
        const results = [];

        for (const table of tables) {
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .or(`name.ilike.%${query}%,title.ilike.%${query}%,description.ilike.%${query}%,content.ilike.%${query}%`)
                .limit(3);

            if (!error && data && data.length > 0) {
                results.push(`${table} 검색 결과: ${data.length}개`);
                results.push(...data.map(item =>
                    `- ${item.name || item.title}: ${(item.description || item.content || '').substring(0, 100)}...`
                ));
            }
        }

        return results.length > 0 ? results.join('\n') : '검색 결과가 없습니다.';
    } catch (error) {
        return `검색 중 오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
}

async function generateQuote(_message: string, _context: any): Promise<string> {
    try {
        // Extract product information from message
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .limit(10);

        if (error) {
            return `견적 생성 중 오류가 발생했습니다: ${error.message}`;
        }

        // Simple quote generation (you can enhance this with more sophisticated logic)
        const sampleQuote = {
            products: products?.slice(0, 3).map(p => ({
                name: p.name,
                price: p.price || 100000,
                quantity: 1
            })) || [],
            total: 300000,
            validity: '30일',
            notes: '견적은 참고용이며, 정확한 견적은 별도 문의 바랍니다.'
        };

        return JSON.stringify(sampleQuote, null, 2);
    } catch (error) {
        return `견적 생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
}

async function performFinancialAnalysis(_message: string, _context: any): Promise<string> {
    try {
        const { data: revenueData, error } = await supabase
            .from('revenue_data')
            .select('*')
            .order('date', { ascending: false })
            .limit(50);

        if (error) {
            return `분석 중 오류가 발생했습니다: ${error.message}`;
        }

        if (!revenueData || revenueData.length === 0) {
            return '분석할 데이터가 없습니다.';
        }

        const totalRevenue = revenueData.reduce((sum, item) => sum + (item.revenue || 0), 0);
        const avgRevenue = totalRevenue / revenueData.length;
        const categories = [...new Set(revenueData.map(item => item.category))];

        const analysis = {
            총매출: totalRevenue,
            평균매출: avgRevenue,
            데이터포인트: revenueData.length,
            카테고리수: categories.length,
            최근데이터: revenueData.slice(0, 5)
        };

        return JSON.stringify(analysis, null, 2);
    } catch (error) {
        return `분석 중 오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
} 