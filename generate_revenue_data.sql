-- 매출 관리 시스템 테스트 데이터 생성 SQL

-- 1. 매출 카테고리 테이블 생성 및 데이터 삽입
CREATE TABLE IF NOT EXISTS revenue_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 새로운 5가지 대표 카테고리 데이터 삽입
INSERT INTO revenue_categories (name, color, is_active) VALUES
('제품 매출', '#3B82F6', true),
('건설기계 매출', '#EF4444', true),
('무역 매출', '#10B981', true),
('온라인 매출', '#F59E0B', true),
('기타 매출', '#8B5CF6', true)
ON CONFLICT (name) DO UPDATE SET 
    is_active = true,
    color = EXCLUDED.color;

-- 2. 매출 데이터 테이블 생성
CREATE TABLE IF NOT EXISTS revenue_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    category TEXT NOT NULL,
    product_name TEXT,
    revenue DECIMAL(12,2) NOT NULL,
    quantity INTEGER DEFAULT 0,
    unit_price DECIMAL(10,2),
    region TEXT,
    customer_type TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID
);

-- 3. 테스트 데이터 생성 함수
CREATE OR REPLACE FUNCTION generate_revenue_test_data(
    start_date DATE DEFAULT '2024-01-01',
    end_date DATE DEFAULT '2024-12-31'
)
RETURNS VOID AS $$
DECLARE
    current_date_iter DATE;
    -- 새로운 카테고리 구조
    category_names TEXT[] := ARRAY['제품 매출', '건설기계 매출', '무역 매출', '온라인 매출', '기타 매출'];
    
    -- 제품 매출 상세 제품
    product_sales_products TEXT[] := ARRAY[
        'RIN-COAT', 'RIN-SEAL PLUS', 'RIN-HARD PLUS', 'RIN-ONE COAT', 
        'RIN-ONE COAT(RK-61)', 'RIN-HARD ACE', 'RIN-HARD PLUS(LI)', 
        'RIN-CRETE', '고성능 침투성 방수제'
    ];
    
    -- 건설기계 매출 상세 제품
    construction_equipment_products TEXT[] := ARRAY[
        '950GT', '850GT', 'Falcon', 'D1688', 'Leopard-D1325'
    ];
    
    -- 무역/온라인/기타 매출 제품 (예시)
    trade_products TEXT[] := ARRAY[
        '수출용 방수재', '수입 장비 부품', '해외 기술 라이선스'
    ];
    
    online_products TEXT[] := ARRAY[
        '온라인 방수재 패키지', '디지털 기술 상담', '온라인 교육 과정'
    ];
    
    other_products TEXT[] := ARRAY[
        '기술 컨설팅', '시공 서비스', '품질 검사', 'A/S 서비스', '교육 프로그램'
    ];
    
    regions TEXT[] := ARRAY['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];
    customer_types TEXT[] := ARRAY['일반', '기업', '대리점', '직판'];
    
    random_category TEXT;
    random_product TEXT;
    random_region TEXT;
    random_customer_type TEXT;
    random_quantity INTEGER;
    random_unit_price NUMERIC;
    random_revenue NUMERIC;
    records_per_day INTEGER;
    i INTEGER;
BEGIN
    current_date_iter := start_date;
    
    WHILE current_date_iter <= end_date LOOP
        -- 하루당 1-8개의 매출 기록 생성
        records_per_day := (RANDOM() * 7)::INTEGER + 1;
        
        FOR i IN 1..records_per_day LOOP
            -- 랜덤 카테고리 선택
            random_category := category_names[1 + (RANDOM() * array_length(category_names, 1))::INTEGER];
            
            -- 카테고리에 따른 제품 선택
            random_product := CASE 
                WHEN random_category = '제품 매출' THEN 
                    product_sales_products[1 + (RANDOM() * array_length(product_sales_products, 1))::INTEGER]
                WHEN random_category = '건설기계 매출' THEN 
                    construction_equipment_products[1 + (RANDOM() * array_length(construction_equipment_products, 1))::INTEGER]
                WHEN random_category = '무역 매출' THEN 
                    trade_products[1 + (RANDOM() * array_length(trade_products, 1))::INTEGER]
                WHEN random_category = '온라인 매출' THEN 
                    online_products[1 + (RANDOM() * array_length(online_products, 1))::INTEGER]
                ELSE 
                    other_products[1 + (RANDOM() * array_length(other_products, 1))::INTEGER]
            END;
            
            random_region := regions[1 + (RANDOM() * array_length(regions, 1))::INTEGER];
            random_customer_type := customer_types[1 + (RANDOM() * array_length(customer_types, 1))::INTEGER];
            
            -- 카테고리별 매출 규모 차별화
            CASE random_category
                WHEN '제품 매출' THEN
                    random_quantity := (RANDOM() * 50)::INTEGER + 1;
                    random_unit_price := (RANDOM() * 500000 + 50000)::NUMERIC;
                WHEN '건설기계 매출' THEN
                    random_quantity := (RANDOM() * 5)::INTEGER + 1;
                    random_unit_price := (RANDOM() * 50000000 + 10000000)::NUMERIC;
                WHEN '무역 매출' THEN
                    random_quantity := (RANDOM() * 20)::INTEGER + 1;
                    random_unit_price := (RANDOM() * 2000000 + 200000)::NUMERIC;
                WHEN '온라인 매출' THEN
                    random_quantity := (RANDOM() * 100)::INTEGER + 1;
                    random_unit_price := (RANDOM() * 100000 + 10000)::NUMERIC;
                ELSE -- 기타 매출
                    random_quantity := (RANDOM() * 10)::INTEGER + 1;
                    random_unit_price := (RANDOM() * 1000000 + 100000)::NUMERIC;
            END CASE;
            
            random_revenue := random_quantity * random_unit_price;
            
            INSERT INTO revenue_data (
                date, category, product_name, revenue, quantity, unit_price, 
                region, customer_type, notes
            ) VALUES (
                current_date_iter,
                random_category,
                random_product,
                random_revenue,
                random_quantity,
                random_unit_price,
                random_region,
                random_customer_type,
                '테스트 데이터 - ' || random_category || ' (' || random_product || ')'
            );
        END LOOP;
        
        current_date_iter := current_date_iter + INTERVAL '1 day';
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 4. 테스트 데이터 생성 실행
SELECT generate_revenue_test_data('2024-01-01', '2024-12-31');

-- 생성된 데이터 확인
SELECT 
    '전체 데이터 건수' as 구분,
    COUNT(*)::TEXT as 값
FROM revenue_data 

UNION ALL

SELECT 
    '카테고리별 데이터 건수' as 구분,
    category || ': ' || COUNT(*)::TEXT as 값
FROM revenue_data 
GROUP BY category

UNION ALL

SELECT 
    '전체 매출 합계' as 구분,
    TO_CHAR(SUM(revenue), 'FM999,999,999,999') || '원' as 값
FROM revenue_data

UNION ALL

SELECT 
    '데이터 기간' as 구분,
    MIN(date)::TEXT || ' ~ ' || MAX(date)::TEXT as 값
FROM revenue_data;

-- 5. 월별 매출 통계 확인
SELECT 
    TO_CHAR(date, 'YYYY-MM') as 월,
    category as 카테고리,
    COUNT(*) as 건수,
    TO_CHAR(SUM(revenue), 'FM999,999,999') || '원' as 매출합계
FROM revenue_data 
WHERE date >= '2024-01-01'
GROUP BY TO_CHAR(date, 'YYYY-MM'), category
ORDER BY 월 DESC, 카테고리;

-- 6. 제품별 매출 통계 확인
SELECT 
    category as 카테고리,
    product_name as 제품명,
    COUNT(*) as 거래건수,
    SUM(quantity) as 총수량,
    TO_CHAR(AVG(unit_price), 'FM999,999,999') || '원' as 평균단가,
    TO_CHAR(SUM(revenue), 'FM999,999,999') || '원' as 총매출
FROM revenue_data 
GROUP BY category, product_name
ORDER BY category, SUM(revenue) DESC;