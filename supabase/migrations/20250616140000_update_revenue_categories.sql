-- 새로운 카테고리 구조로 변경하는 마이그레이션
-- 1. 기존 카테고리 데이터 백업 (필요시 복구용)
CREATE TABLE IF NOT EXISTS revenue_categories_backup AS
SELECT
    *
FROM
    public.revenue_categories;

-- 2. 기존 카테고리 비활성화
UPDATE public.revenue_categories
SET
    is_active = false;

-- 3. 새로운 5가지 대표 카테고리 삽입
INSERT INTO
    public.revenue_categories (name, color, is_active)
VALUES
    ('제품 매출', '#3B82F6', true),
    ('건설기계 매출', '#EF4444', true),
    ('무역 매출', '#10B981', true),
    ('온라인 매출', '#F59E0B', true),
    ('기타 매출', '#8B5CF6', true) ON CONFLICT (name) DO
UPDATE
SET
    is_active = true,
    color = EXCLUDED.color;

-- 4. 기존 매출 데이터의 카테고리를 새로운 구조로 매핑
UPDATE public.revenue_data
SET
    category = CASE
        WHEN category IN ('린코트 제품', '린하드 제품', '린씰 제품') THEN '제품 매출'
        WHEN category IN ('건설장비 판매') THEN '건설기계 매출'
        WHEN category IN ('기술 서비스') THEN '기타 매출'
        WHEN category IN ('유지보수') THEN '기타 매출'
        ELSE '기타 매출'
    END;

-- 5. 제품명을 새로운 표준 명칭으로 업데이트
UPDATE public.revenue_data
SET
    product_name = CASE
    -- 제품 매출 카테고리 제품명 표준화
        WHEN product_name LIKE '%린코트%'
        AND product_name NOT LIKE '%원%' THEN 'RIN-COAT'
        WHEN product_name LIKE '%린원코트%'
        AND product_name NOT LIKE '%RK%' THEN 'RIN-ONE COAT'
        WHEN product_name LIKE '%RK%'
        OR product_name LIKE '%rk%' THEN 'RIN-ONE COAT(RK-61)'
        WHEN product_name LIKE '%린하드%'
        AND product_name LIKE '%에이스%' THEN 'RIN-HARD ACE'
        WHEN product_name LIKE '%린하드%'
        AND product_name LIKE '%플러스%'
        AND product_name LIKE '%LI%' THEN 'RIN-HARD PLUS(LI)'
        WHEN product_name LIKE '%린하드%'
        AND product_name LIKE '%플러스%' THEN 'RIN-HARD PLUS'
        WHEN product_name LIKE '%린씰%'
        AND product_name LIKE '%플러스%' THEN 'RIN-SEAL PLUS'
        WHEN product_name LIKE '%린크리트%'
        OR product_name LIKE '%CRETE%' THEN 'RIN-CRETE'
        WHEN product_name LIKE '%침투성%'
        OR product_name LIKE '%방수제%' THEN '고성능 침투성 방수제'
        -- 건설기계 매출 카테고리 제품명 표준화
        WHEN product_name LIKE '%950%' THEN '950GT'
        WHEN product_name LIKE '%850%' THEN '850GT'
        WHEN product_name LIKE '%Falcon%'
        OR product_name LIKE '%팰콘%' THEN 'Falcon'
        WHEN product_name LIKE '%D1688%' THEN 'D1688'
        WHEN product_name LIKE '%D1325%'
        OR product_name LIKE '%Leopard%' THEN 'Leopard-D1325'
        ELSE product_name
    END
WHERE
    category IN ('제품 매출', '건설기계 매출');

-- 6. 기존 비활성화된 카테고리 제거 (선택사항 - 주석 해제시 실행)
-- DELETE FROM public.revenue_categories WHERE is_active = false;