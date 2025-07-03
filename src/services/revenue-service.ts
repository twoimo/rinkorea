import { supabase } from '@/integrations/supabase/client';
import { requireAdmin } from './auth-simple';

export interface RevenueData {
    id: string;
    date: string;
    category: string;
    product_name: string | null;
    revenue: number;
    quantity: number | null;
    region: string | null;
    customer_type: string | null;
}

export interface RevenueFilters {
    startDate?: string;
    endDate?: string;
    category?: string;
    product_name?: string;
    region?: string;
}

export class RevenueService {
    private static instance: RevenueService;

    private constructor() { }

    public static getInstance(): RevenueService {
        if (!RevenueService.instance) {
            RevenueService.instance = new RevenueService();
        }
        return RevenueService.instance;
    }

    /**
     * 특정 기간 및 필터에 따른 매출 데이터를 조회합니다.
     * 관리자만 호출할 수 있습니다.
     * @param filters - 조회 필터 (기간, 카테고리 등)
     * @returns 매출 데이터 배열
     */
    async getRevenueData(filters: RevenueFilters): Promise<RevenueData[]> {
        await requireAdmin(); // 관리자 권한 확인
        let query = supabase.from('revenue_data').select('*');

        if (filters.startDate) {
            query = query.gte('date', filters.startDate);
        }
        if (filters.endDate) {
            query = query.lte('date', filters.endDate);
        }
        if (filters.category) {
            query = query.eq('category', filters.category);
        }
        if (filters.product_name) {
            query = query.eq('product_name', filters.product_name);
        }
        if (filters.region) {
            query = query.eq('region', filters.region);
        }

        const { data, error } = await query
            .order('date', { ascending: false })
            .limit(1000); // 데이터 양을 제한하여 성능 저하 방지

        if (error) {
            console.error('Error fetching revenue data:', error);
            throw new Error('매출 데이터를 가져오는 데 실패했습니다.');
        }

        return data as RevenueData[];
    }

    /**
     * AI 분석을 위해 매출 데이터를 텍스트로 요약합니다.
     * @param data - 매출 데이터 배열
     * @returns AI 프롬프트에 포함할 요약 텍스트
     */
    summarizeRevenueForAI(data: RevenueData[]): string {
        if (data.length === 0) {
            return "해당 기간에 조회된 매출 데이터가 없습니다.";
        }

        const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
        const startDate = data[data.length - 1]?.date;
        const endDate = data[0]?.date;

        const summary = `
- 조회 기간: ${startDate} ~ ${endDate}
- 총 매출: ${totalRevenue.toLocaleString()}원
- 총 거래 건수: ${data.length}건
- 주요 상품 카테고리: ${[...new Set(data.map(d => d.category))].join(', ')}
- 주요 지역: ${[...new Set(data.map(d => d.region))].filter(r => r).join(', ')}
`;

        // 상세 데이터 샘플 (최대 10개)
        const sampleData = data.slice(0, 10).map(d =>
            `  - [${d.date}] ${d.product_name || d.category}: ${d.revenue.toLocaleString()}원`
        ).join('\n');

        return `
## 매출 데이터 요약
${summary}

## 상세 거래 내역 (샘플)
${sampleData}
`;
    }
} 