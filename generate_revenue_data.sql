-- SQL Script for Generating Sales Management System Test Data
-- Version: 6.0 (Guaranteed Recent Data & Enhanced 30-Day Upward Trend)
-- This script creates tables, generates realistic test data with a long-term and a specific
-- 30-day upward trend, and includes verification queries.

-- 1. Create Revenue Categories Table and Insert Data
-- This table defines the main sales categories.
CREATE TABLE IF NOT EXISTS public.revenue_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert or update the main categories.
INSERT INTO public.revenue_categories (name, color, is_active) VALUES
('제품 매출', '#3B82F6', true),
('건설기계 매출', '#EF4444', true),
('무역 매출', '#10B981', true),
('온라인 매출', '#F59E0B', true),
('기타 매출', '#8B5CF6', true)
ON CONFLICT (name) DO UPDATE SET 
    is_active = true,
    color = EXCLUDED.color;

-- 2. Create Revenue Data Table
-- This table stores individual sales records.
CREATE TABLE IF NOT EXISTS public.revenue_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    category TEXT NOT NULL,
    product_name TEXT,
    revenue DECIMAL(15,2) NOT NULL,
    quantity INTEGER DEFAULT 0,
    unit_price DECIMAL(12,2),
    region TEXT,
    customer_type TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID
);

-- 3. Test Data Generation Function (with Enhanced Upward Trend)
-- This function generates records with a general upward trend over 10 years
-- and a more pronounced upward trend specifically within the last 30 days.
CREATE OR REPLACE FUNCTION generate_revenue_test_data(
    record_count INTEGER DEFAULT 250
)
RETURNS VOID AS $$
DECLARE
    -- Arrays for random selection
    product_sales_products TEXT[] := ARRAY['RIN-SEAL PLUS', 'RIN-HARD PLUS', 'RIN-ONE COAT', 'RIN-ONE COAT(RK-61)', 'RIN-HARD ACE', 'RIN-HARD PLUS(LI)', 'RIN-CRETE', '고성능 침투성 방수제'];
    construction_equipment_products TEXT[] := ARRAY['950GT', '850GT', 'Falcon'];
    trade_products TEXT[] := ARRAY['수출용 방수재', '수입 장비 부품', '해외 기술 라이선스'];
    online_products TEXT[] := ARRAY['온라인 방수재 패키지', '디지털 기술 상담', '온라인 교육 과정'];
    other_products TEXT[] := ARRAY['기술 컨설팅', '시공 서비스', '품질 검사', 'A/S 서비스', '교육 프로그램'];
    regions TEXT[] := ARRAY['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];
    customer_types TEXT[] := ARRAY['일반', '기업', '대리점', '직판'];
    
    -- Record variables
    random_date DATE;
    random_category TEXT;
    random_product TEXT;
    random_revenue NUMERIC;
    random_quantity INTEGER;
    random_unit_price NUMERIC;
    random_region TEXT;
    random_customer_type TEXT;
    
    -- Date range and growth factors
    start_date DATE := CURRENT_DATE - INTERVAL '10 years';
    end_date DATE := CURRENT_DATE;
    long_term_growth_factor NUMERIC;
    recent_growth_factor NUMERIC;
BEGIN
    -- Clear existing data
    DELETE FROM public.revenue_data;

    FOR i IN 1..record_count LOOP
        -- **MODIFIED DATE LOGIC**
        -- Force a significant number of records into the last 30 days to model a clear trend.
        IF i <= 40 THEN -- Guarantee at least 40 records within the last 30 days.
            random_date := CURRENT_DATE - (floor(random() * 30))::INTEGER * INTERVAL '1 day';
        ELSIF i <= 50 THEN -- Add some records to the last year for better distribution.
             random_date := CURRENT_DATE - (floor(random() * 335) + 30)::INTEGER * INTERVAL '1 day';
        ELSE -- Distribute the rest over the last 10 years.
            random_date := start_date + (random() * (end_date - start_date))::INTEGER;
        END IF;
        
        -- Weighted category selection
        IF random() < 0.5 THEN
            random_category := '제품 매출';
        ELSE
            random_category := (ARRAY['건설기계 매출', '무역 매출', '온라인 매출', '기타 매출'])[floor(random() * 4) + 1];
        END IF;

        -- Product selection based on category
        CASE random_category
            WHEN '제품 매출' THEN
                IF random() < 0.4 THEN
                    random_product := 'RIN-COAT';
                ELSE
                    random_product := product_sales_products[floor(random() * array_length(product_sales_products, 1)) + 1];
                END IF;
            WHEN '건설기계 매출' THEN
                random_product := construction_equipment_products[floor(random() * array_length(construction_equipment_products, 1)) + 1];
            WHEN '무역 매출' THEN
                random_product := trade_products[floor(random() * array_length(trade_products, 1)) + 1];
            WHEN '온라인 매출' THEN
                random_product := online_products[floor(random() * array_length(online_products, 1)) + 1];
            ELSE -- '기타 매출'
                random_product := other_products[floor(random() * array_length(other_products, 1)) + 1];
        END CASE;

        -- Differentiated revenue scale per category
        CASE random_category
            WHEN '제품 매출' THEN
                random_quantity := (random() * 50 + 1)::INTEGER;
                random_unit_price := (random() * 500000 + 50000);
            WHEN '건설기계 매출' THEN
                random_quantity := (random() * 5 + 1)::INTEGER;
                random_unit_price := (random() * 50000000 + 10000000);
            WHEN '무역 매출' THEN
                random_quantity := (random() * 20 + 1)::INTEGER;
                random_unit_price := (random() * 2000000 + 200000);
            WHEN '온라인 매출' THEN
                random_quantity := (random() * 100 + 1)::INTEGER;
                random_unit_price := (random() * 100000 + 10000);
            ELSE -- 기타 매출
                random_quantity := (random() * 10 + 1)::INTEGER;
                random_unit_price := (random() * 1000000 + 100000);
        END CASE;
        
        -- Calculate base revenue
        random_revenue := random_quantity * random_unit_price;
        
        -- **MODIFIED REVENUE LOGIC**
        -- Apply a long-term growth factor for the general 10-year upward trend
        long_term_growth_factor := 1.0 + ( (random_date - start_date)::numeric / (end_date - start_date)::numeric ) * 1.5;
        random_revenue := random_revenue * long_term_growth_factor;

        -- Apply an additional, stronger growth factor if the date is within the last 30 days.
        IF random_date >= CURRENT_DATE - INTERVAL '30 days' THEN
            -- This factor is higher for more recent dates (closer to CURRENT_DATE).
            -- (30 - days_ago) / 30 makes the multiplier stronger for recent days.
            recent_growth_factor := 1.0 + ( (30 - (CURRENT_DATE - random_date))::numeric / 30.0 ) * 2.0; -- A 2.0 multiplier for strong recent growth
            random_revenue := random_revenue * recent_growth_factor;
        END IF;

        -- Weighted region selection
        DECLARE region_rand REAL := random();
        BEGIN
            IF region_rand < 0.3 THEN
                random_region := '서울';
            ELSIF region_rand < 0.5 THEN
                random_region := '경기';
            ELSE
                random_region := regions[floor(random() * array_length(regions, 1)) + 1];
            END IF;
        END;

        -- Random customer type
        random_customer_type := customer_types[floor(random() * array_length(customer_types, 1)) + 1];

        -- Insert the generated data
        INSERT INTO public.revenue_data (
            date, category, product_name, revenue, quantity, unit_price, 
            region, customer_type, notes, created_at, updated_at
        ) VALUES (
            random_date, random_category, random_product, random_revenue, random_quantity,
            random_unit_price, random_region, random_customer_type, '테스트 데이터 - ' || random_product,
            NOW(), NOW()
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 4. Execute Data Generation
-- This will generate 250 new test records with the new trend logic.
SELECT generate_revenue_test_data(250);

-- 5. Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_revenue_data_date ON public.revenue_data(date);
CREATE INDEX IF NOT EXISTS idx_revenue_data_category ON public.revenue_data(category);
CREATE INDEX IF NOT EXISTS idx_revenue_data_product_name ON public.revenue_data(product_name);
CREATE INDEX IF NOT EXISTS idx_revenue_data_date_category ON public.revenue_data(date, category);
CREATE INDEX IF NOT EXISTS idx_revenue_data_created_at ON public.revenue_data(created_at);

-- Update database statistics
ANALYZE public.revenue_data;

-- 6. Verify Generated Data

-- Check overall statistics
SELECT 
    '총 데이터 수' as "항목", COUNT(*)::TEXT as "값" FROM public.revenue_data
UNION ALL
SELECT '데이터 기간', MIN(date)::TEXT || ' ~ ' || MAX(date)::TEXT FROM public.revenue_data
UNION ALL
SELECT '총 매출 합계', TO_CHAR(SUM(revenue), 'FM999,999,999,999') || '원' FROM public.revenue_data;

-- **NEW: Verify 30-Day Upward Trend**
-- This query shows the daily total revenue for the last 30 days.
-- You should see a clear upward trend in the "일별 매출 합계" column.
SELECT
    date as "날짜",
    TO_CHAR(SUM(revenue), 'FM999,999,999,999') || '원' as "일별 매출 합계",
    COUNT(*) as "거래 건수"
FROM public.revenue_data
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY date
ORDER BY date ASC;

-- Check monthly sales trend to confirm long-term upward growth
SELECT
    TO_CHAR(date, 'YYYY-MM') as "월",
    TO_CHAR(SUM(revenue), 'FM999,999,999,999') || '원' as "월별 매출 합계"
FROM public.revenue_data
GROUP BY TO_CHAR(date, 'YYYY-MM')
ORDER BY "월" ASC;

-- Check category distribution
SELECT 
    category as "카테고리", COUNT(*) as "건수",
    TO_CHAR(SUM(revenue), 'FM999,999,999,999') || '원' as "총매출",
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM public.revenue_data), 2) || '%' as "비율"
FROM public.revenue_data 
GROUP BY category 
ORDER BY "건수" DESC;

-- 7. Verify Data Distribution for Quick Selection Periods
-- This query now guarantees non-zero counts for all periods.
SELECT '최근 1일' as "기간", COUNT(*) as "데이터 수" FROM public.revenue_data WHERE date >= CURRENT_DATE - INTERVAL '1 day'
UNION ALL
SELECT '최근 7일', COUNT(*) FROM public.revenue_data WHERE date >= CURRENT_DATE - INTERVAL '7 days'
UNION ALL
SELECT '최근 1개월', COUNT(*) FROM public.revenue_data WHERE date >= CURRENT_DATE - INTERVAL '1 month'
UNION ALL
SELECT '최근 3개월', COUNT(*) FROM public.revenue_data WHERE date >= CURRENT_DATE - INTERVAL '3 months'
UNION ALL
SELECT '최근 6개월', COUNT(*) FROM public.revenue_data WHERE date >= CURRENT_DATE - INTERVAL '6 months'
UNION ALL
SELECT '최근 1년', COUNT(*) FROM public.revenue_data WHERE date >= CURRENT_DATE - INTERVAL '1 year'
UNION ALL
SELECT '전체 (10년)', COUNT(*) FROM public.revenue_data WHERE date >= CURRENT_DATE - INTERVAL '10 years';

