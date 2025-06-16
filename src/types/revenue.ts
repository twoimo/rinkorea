export interface RevenueData {
    id: string;
    date: string;
    category: string;
    product_name?: string;
    revenue: number;
    quantity?: number;
    unit_price?: number;
    region?: string;
    customer_type?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    created_by?: string;
}

export interface RevenueCategory {
    id: string;
    name: string;
    color: string;
    is_active: boolean;
    created_at: string;
}

export interface ChartData {
    date: string;
    [key: string]: number | string;
}

export interface GridLayout {
    rows: number;
    cols: number;
    charts: ChartConfig[];
}

export interface ChartConfig {
    id: string;
    type: 'line' | 'bar' | 'area' | 'pie';
    title: string;
    dataKey: string;
    categories?: string[];
    dateRange?: {
        start: string;
        end: string;
    };
    aggregation: 'sum' | 'avg' | 'count';
    position: {
        row: number;
        col: number;
        rowSpan: number;
        colSpan: number;
    };
}

export interface RevenueStats {
    totalRevenue: number;
    totalQuantity: number;
    avgUnitPrice: number;
    topCategory: string;
    topProduct: string;
    growth: number;
}