-- 매출 관리 시스템 테스트 데이터 생성 SQL

-- 1. 매출 카테고리 테이블 생성 및 데이터 삽입
CREATE TABLE IF NOT EXISTS revenue_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 카테고리 데이터 삽입
INSERT INTO revenue_categories (name, color, is_active) VALUES
('린코트 제품', '#3B82F6', true),
('린하드 제품', '#10B981', true),
('린씰 제품', '#F59E0B', true),
('건설장비 판매', '#EF4444', true),
('기술 서비스', '#8B5CF6', true),
('유지보수', '#6B7280', true)
ON CONFLICT (name) DO NOTHING;

-- 2. 매출 데이터 테이블 생성
CREATE TABLE IF NOT EXISTS revenue_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    category TEXT NOT NULL,
    product_name TEXT,
    revenue NUMERIC(15,2) NOT NULL CHECK (revenue >= 0),
    quantity INTEGER CHECK (quantity >= 0),
    unit_price NUMERIC(15,2) CHECK (unit_price >= 0),
    region TEXT,
    customer_type TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID
);

-- 3. 임의 매출 데이터 생성 (최근 2년간 데이터)
DO $$
DECLARE
    start_date DATE := '2023-01-01';
    end_date DATE := '2025-06-15';
    current_date_iter DATE;
    category_names TEXT[] := ARRAY['린코트 제품', '린하드 제품', '린씰 제품', '건설장비 판매', '기술 서비스', '유지보수'];
    product_names TEXT[] := ARRAY[
        '린코트 20kg', '린코트 18L', '린원코트 20kg', 
        '린하드 에이스 20kg', '린하드 플러스 18L',
        '린씰 플러스 20kg', '린씰 원샷 15L',
        'D1325 굴삭기', 'DF20 덤프트럭', '850GT 로더',
        '방수 컨설팅', '시공 기술 지원', '품질 검사',
        '장비 점검', '보수 공사', 'A/S 서비스'
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
        -- 하루에 1~8개의 매출 기록 생성 (주말에는 적게)
        IF EXTRACT(DOW FROM current_date_iter) IN (0, 6) THEN
            records_per_day := (random() * 3 + 1)::INTEGER; -- 주말: 1-3개
        ELSE
            records_per_day := (random() * 6 + 2)::INTEGER; -- 평일: 2-7개
        END IF;
        
        FOR i IN 1..records_per_day LOOP
            -- 랜덤 카테고리 선택 (안전한 인덱스 계산)
            random_category := category_names[1 + floor(random() * array_length(category_names, 1))::INTEGER];
            
            -- 카테고리 유효성 검증 및 기본값 설정
            IF random_category IS NULL OR random_category = '' THEN
                random_category := '린코트 제품'; -- 기본값
            END IF;
            
            -- 카테고리에 따른 제품명 선택
            CASE random_category
                WHEN '린코트 제품' THEN
                    random_product := (ARRAY['린코트 20kg', '린코트 18L', '린원코트 20kg', '린원코트 RK61 20kg'])[1 + floor(random() * 4)::INTEGER];
                WHEN '린하드 제품' THEN
                    random_product := (ARRAY['린하드 에이스 20kg', '린하드 플러스 18L', '린하드 프로 25kg'])[1 + floor(random() * 3)::INTEGER];
                WHEN '린씰 제품' THEN
                    random_product := (ARRAY['린씰 플러스 20kg', '린씰 원샷 15L', '린씰 프로 18L'])[1 + floor(random() * 3)::INTEGER];
                WHEN '건설장비 판매' THEN
                    random_product := (ARRAY['D1325 굴삭기', 'DF20 덤프트럭', '850GT 로더', '950GT 로더', 'PRO850 로더'])[1 + floor(random() * 5)::INTEGER];
                WHEN '기술 서비스' THEN
                    random_product := (ARRAY['방수 컨설팅', '시공 기술 지원', '품질 검사', '현장 진단'])[1 + floor(random() * 4)::INTEGER];
                WHEN '유지보수' THEN
                    random_product := (ARRAY['장비 점검', '보수 공사', 'A/S 서비스', '정기 점검'])[1 + floor(random() * 4)::INTEGER];
                ELSE
                    -- 매칭되지 않는 경우 기본 제품 설정
                    random_product := '린코트 20kg';
                    random_category := '린코트 제품'; -- 카테고리도 기본값으로 재설정
            END CASE;
            
            -- 제품명 유효성 검증
            IF random_product IS NULL OR random_product = '' THEN
                random_product := '린코트 20kg';
            END IF;
            
            -- 랜덤 지역 및 고객 유형 (안전한 인덱스 계산)
            random_region := regions[1 + floor(random() * array_length(regions, 1))::INTEGER];
            random_customer_type := customer_types[1 + floor(random() * array_length(customer_types, 1))::INTEGER];
            
            -- 기본값 설정
            IF random_region IS NULL OR random_region = '' THEN
                random_region := '서울';
            END IF;
            IF random_customer_type IS NULL OR random_customer_type = '' THEN
                random_customer_type := '일반';
            END IF;
            
            -- 카테고리에 따른 수량 및 단가 설정
            CASE random_category
                WHEN '린코트 제품' THEN
                    random_quantity := (random() * 50 + 1)::INTEGER; -- 1-50개
                    random_unit_price := (random() * 50000 + 80000)::NUMERIC; -- 8만-13만원
                WHEN '린하드 제품' THEN
                    random_quantity := (random() * 30 + 1)::INTEGER; -- 1-30개
                    random_unit_price := (random() * 40000 + 90000)::NUMERIC; -- 9만-13만원
                WHEN '린씰 제품' THEN
                    random_quantity := (random() * 40 + 1)::INTEGER; -- 1-40개
                    random_unit_price := (random() * 30000 + 70000)::NUMERIC; -- 7만-10만원
                WHEN '건설장비 판매' THEN
                    random_quantity := 1; -- 장비는 1대씩
                    random_unit_price := (random() * 20000000 + 50000000)::NUMERIC; -- 5천만-7천만원
                WHEN '기술 서비스' THEN
                    random_quantity := (random() * 10 + 1)::INTEGER; -- 1-10건
                    random_unit_price := (random() * 500000 + 500000)::NUMERIC; -- 50만-100만원
                WHEN '유지보수' THEN
                    random_quantity := (random() * 5 + 1)::INTEGER; -- 1-5건
                    random_unit_price := (random() * 200000 + 300000)::NUMERIC; -- 30만-50만원
                ELSE
                    random_quantity := (random() * 20 + 1)::INTEGER;
                    random_unit_price := (random() * 100000 + 50000)::NUMERIC;
            END CASE;
            
            -- 매출 계산 (수량 * 단가)
            random_revenue := random_quantity * random_unit_price;
            
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
                current_date_iter,
                random_category,
                random_product,
                random_revenue,
                random_quantity,
                random_unit_price,
                random_region,
                random_customer_type,
                CASE 
                    WHEN random() < 0.3 THEN 
                        (ARRAY['정기 고객', '신규 고객', '재주문', '대량 주문', '급주문', '특별 할인', '프로모션 적용'])[1 + (random() * 7)::INTEGER]
                    ELSE NULL
                END,
                current_date_iter + (random() * INTERVAL '1 day'),
                current_date_iter + (random() * INTERVAL '1 day')
            );
        END LOOP;
        
        current_date_iter := current_date_iter + INTERVAL '1 day';
    END LOOP;
    
    RAISE NOTICE '매출 데이터 생성 완료: % ~ %', start_date, end_date;
END $$;

-- 4. 생성된 데이터 확인 쿼리
SELECT 
    '총 매출 데이터 건수' as 구분,
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