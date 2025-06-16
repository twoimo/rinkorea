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

-- 매출 관리 페이지용 최적화된 테스트 데이터 생성 (250개)
-- RIN-COAT를 인기 제품으로 설정하고 다양한 기간에 대응

-- 기존 데이터 정리 (필요시)
-- DELETE FROM revenue_data;

-- 임시 시퀀스 생성 함수
CREATE OR REPLACE FUNCTION generate_revenue_test_data()
RETURNS void AS $$
DECLARE
    i INTEGER;
    random_date DATE;
    random_category TEXT;
    random_product TEXT;
    random_revenue DECIMAL(15,2);
    random_quantity INTEGER;
    random_unit_price DECIMAL(10,2);
    random_region TEXT;
    random_customer_type TEXT;
    
    -- 카테고리별 제품 정의
    categories TEXT[] := ARRAY['제품 매출', '건설기계 매출', '무역 매출', '온라인 매출', '기타 매출'];
    
    -- 제품별 가중치 (RIN-COAT가 가장 높음)
    product_weights RECORD;
    
    -- 지역 목록
    regions TEXT[] := ARRAY['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];
    
    -- 고객 유형
    customer_types TEXT[] := ARRAY['일반', '기업', '대리점', '직판'];
    
    -- 날짜 범위 설정 (현재 기준 10년 전부터 현재까지)
    start_date DATE := CURRENT_DATE - INTERVAL '10 years';
    end_date DATE := CURRENT_DATE;
    
BEGIN
    -- 250개의 데이터 생성
    FOR i IN 1..250 LOOP
        -- 랜덤 날짜 생성 (10년간의 데이터)
        random_date := start_date + (random() * (end_date - start_date))::INTEGER;
        
        -- 카테고리 선택 (제품 매출이 60% 확률)
        IF random() < 0.6 THEN
            random_category := '제품 매출';
        ELSE
            random_category := categories[1 + floor(random() * array_length(categories, 1))];
        END IF;
        
        -- 카테고리별 제품 선택
        CASE random_category
            WHEN '제품 매출' THEN
                -- RIN-COAT가 40% 확률로 선택되도록 가중치 적용
                IF random() < 0.4 THEN
                    random_product := 'RIN-COAT';
                ELSE
                    random_product := (ARRAY['RIN-SEAL PLUS', 'RIN-HARD PLUS', 'RIN-ONE COAT', 'RIN-ONE COAT(RK-61)', 'RIN-HARD ACE', 'RIN-HARD PLUS(LI)', 'RIN-CRETE', '고성능 침투성 방수제'])[1 + floor(random() * 8)];
                END IF;
                
            WHEN '건설기계 매출' THEN
                random_product := (ARRAY['950GT', '850GT', 'Falcon', 'D1688', 'Leopard-D1325'])[1 + floor(random() * 5)];
                
            WHEN '무역 매출' THEN
                random_product := (ARRAY['수출용 방수재', '수입 장비 부품', '해외 기술 라이선스'])[1 + floor(random() * 3)];
                
            WHEN '온라인 매출' THEN
                random_product := (ARRAY['온라인 방수재 패키지', '디지털 기술 상담', '온라인 교육 과정'])[1 + floor(random() * 3)];
                
            WHEN '기타 매출' THEN
                random_product := (ARRAY['기술 컨설팅', '시공 서비스', '품질 검사', 'A/S 서비스', '교육 프로그램'])[1 + floor(random() * 5)];
                
            ELSE
                random_product := 'RIN-COAT';
        END CASE;
        
        -- 제품별 매출 범위 설정
        CASE random_category
            WHEN '제품 매출' THEN
                random_quantity := 1 + floor(random() * 100);
                CASE random_product
                    WHEN 'RIN-COAT' THEN
                        random_unit_price := 25000 + (random() * 15000)::DECIMAL(10,2); -- 25,000 ~ 40,000
                    WHEN 'RIN-SEAL PLUS' THEN
                        random_unit_price := 30000 + (random() * 20000)::DECIMAL(10,2); -- 30,000 ~ 50,000
                    WHEN 'RIN-HARD PLUS' THEN
                        random_unit_price := 35000 + (random() * 25000)::DECIMAL(10,2); -- 35,000 ~ 60,000
                    ELSE
                        random_unit_price := 20000 + (random() * 30000)::DECIMAL(10,2); -- 20,000 ~ 50,000
                END CASE;
                
            WHEN '건설기계 매출' THEN
                random_quantity := 1 + floor(random() * 10);
                random_unit_price := 1000000 + (random() * 4000000)::DECIMAL(10,2); -- 100만 ~ 500만
                
            WHEN '무역 매출' THEN
                random_quantity := 1 + floor(random() * 50);
                random_unit_price := 50000 + (random() * 150000)::DECIMAL(10,2); -- 5만 ~ 20만
                
            WHEN '온라인 매출' THEN
                random_quantity := 1 + floor(random() * 30);
                random_unit_price := 10000 + (random() * 40000)::DECIMAL(10,2); -- 1만 ~ 5만
                
            ELSE -- 기타 매출
                random_quantity := 1 + floor(random() * 20);
                random_unit_price := 100000 + (random() * 500000)::DECIMAL(10,2); -- 10만 ~ 60만
        END CASE;
        
        -- 매출 계산
        random_revenue := random_quantity * random_unit_price;
        
        -- 지역 선택 (서울, 경기가 더 높은 확률)
        IF random() < 0.3 THEN
            random_region := '서울';
        ELSIF random() < 0.5 THEN
            random_region := '경기';
        ELSE
            random_region := regions[1 + floor(random() * array_length(regions, 1))];
        END IF;
        
        -- 고객 유형 선택
        random_customer_type := customer_types[1 + floor(random() * array_length(customer_types, 1))];
        
        -- 데이터 삽입
        INSERT INTO revenue_data (
            date,
            category,
            product_name,
            revenue,
            quantity,
            unit_price,
            region,
            customer_type,
            notes,
            created_at,
            updated_at
        ) VALUES (
            random_date,
            random_category,
            random_product,
            random_revenue,
            random_quantity,
            random_unit_price,
            random_region,
            random_customer_type,
            CASE 
                WHEN random() < 0.3 THEN '테스트 데이터'
                WHEN random() < 0.6 THEN '자동 생성'
                ELSE NULL
            END,
            NOW(),
            NOW()
        );
        
    END LOOP;
    
    RAISE NOTICE '250개의 테스트 데이터가 성공적으로 생성되었습니다.';
END;
$$ LANGUAGE plpgsql;

-- 함수 실행
SELECT generate_revenue_test_data();

-- 함수 삭제 (정리)
DROP FUNCTION generate_revenue_test_data();

-- 생성된 데이터 확인
SELECT 
    '데이터 생성 완료' as 상태,
    COUNT(*) as 총_레코드수,
    MIN(date) as 시작일,
    MAX(date) as 종료일
FROM revenue_data;

-- 카테고리별 분포 확인
SELECT 
    category as 카테고리,
    COUNT(*) as 건수,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM revenue_data), 2) || '%' as 비율
FROM revenue_data 
GROUP BY category 
ORDER BY COUNT(*) DESC;

-- 제품별 매출 상위 10개 확인 (RIN-COAT가 1위인지 확인)
SELECT 
    product_name as 제품명,
    category as 카테고리,
    COUNT(*) as 거래건수,
    SUM(quantity) as 총수량,
    TO_CHAR(SUM(revenue), 'FM999,999,999,999') || '원' as 총매출,
    TO_CHAR(AVG(unit_price), 'FM999,999,999') || '원' as 평균단가
FROM revenue_data 
WHERE product_name IS NOT NULL
GROUP BY product_name, category
ORDER BY SUM(revenue) DESC
LIMIT 10;

-- 월별 매출 분포 확인 (최근 12개월)
SELECT 
    TO_CHAR(date, 'YYYY-MM') as 월,
    COUNT(*) as 거래건수,
    TO_CHAR(SUM(revenue), 'FM999,999,999,999') || '원' as 월매출
FROM revenue_data 
WHERE date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY TO_CHAR(date, 'YYYY-MM')
ORDER BY 월 DESC;

-- 빠른 선택 기간별 데이터 분포 확인
SELECT 
    '전체' as 기간,
    COUNT(*) as 데이터수,
    MIN(date) as 시작일,
    MAX(date) as 종료일
FROM revenue_data

UNION ALL

SELECT 
    '최근 1일' as 기간,
    COUNT(*) as 데이터수,
    MIN(date) as 시작일,
    MAX(date) as 종료일
FROM revenue_data 
WHERE date >= CURRENT_DATE - INTERVAL '1 day'

UNION ALL

SELECT 
    '최근 7일' as 기간,
    COUNT(*) as 데이터수,
    MIN(date) as 시작일,
    MAX(date) as 종료일
FROM revenue_data 
WHERE date >= CURRENT_DATE - INTERVAL '7 days'

UNION ALL

SELECT 
    '최근 1개월' as 기간,
    COUNT(*) as 데이터수,
    MIN(date) as 시작일,
    MAX(date) as 종료일
FROM revenue_data 
WHERE date >= CURRENT_DATE - INTERVAL '1 month'

UNION ALL

SELECT 
    '최근 3개월' as 기간,
    COUNT(*) as 데이터수,
    MIN(date) as 시작일,
    MAX(date) as 종료일
FROM revenue_data 
WHERE date >= CURRENT_DATE - INTERVAL '3 months'

UNION ALL

SELECT 
    '최근 6개월' as 기간,
    COUNT(*) as 데이터수,
    MIN(date) as 시작일,
    MAX(date) as 종료일
FROM revenue_data 
WHERE date >= CURRENT_DATE - INTERVAL '6 months'

UNION ALL

SELECT 
    '최근 1년' as 기간,
    COUNT(*) as 데이터수,
    MIN(date) as 시작일,
    MAX(date) as 종료일
FROM revenue_data 
WHERE date >= CURRENT_DATE - INTERVAL '1 year'

UNION ALL

SELECT 
    '최근 3년' as 기간,
    COUNT(*) as 데이터수,
    MIN(date) as 시작일,
    MAX(date) as 종료일
FROM revenue_data 
WHERE date >= CURRENT_DATE - INTERVAL '3 years'

UNION ALL

SELECT 
    '최근 5년' as 기간,
    COUNT(*) as 데이터수,
    MIN(date) as 시작일,
    MAX(date) as 종료일
FROM revenue_data 
WHERE date >= CURRENT_DATE - INTERVAL '5 years'

UNION ALL

SELECT 
    '최근 10년' as 기간,
    COUNT(*) as 데이터수,
    MIN(date) as 시작일,
    MAX(date) as 종료일
FROM revenue_data 
WHERE date >= CURRENT_DATE - INTERVAL '10 years';

-- 성능을 위한 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_revenue_data_date ON revenue_data(date);
CREATE INDEX IF NOT EXISTS idx_revenue_data_category ON revenue_data(category);
CREATE INDEX IF NOT EXISTS idx_revenue_data_product_name ON revenue_data(product_name);
CREATE INDEX IF NOT EXISTS idx_revenue_data_date_category ON revenue_data(date, category);
CREATE INDEX IF NOT EXISTS idx_revenue_data_created_at ON revenue_data(created_at);

-- 통계 정보 업데이트
ANALYZE revenue_data;