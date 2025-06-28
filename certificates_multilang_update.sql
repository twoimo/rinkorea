-- 인증서 페이지 다국어 지원 업데이트 쿼리
-- Certificates Multilanguage Support Update Queries

-- 1. 테이블 구조 확인 (이미 다국어 컬럼이 있는지 확인)
-- Check if multilanguage columns already exist
SELECT 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'certificates' 
    AND table_schema = 'public'
    AND column_name LIKE '%_ko' 
       OR column_name LIKE '%_en' 
       OR column_name LIKE '%_zh' 
       OR column_name LIKE '%_id'
ORDER BY column_name;

-- 2. 기존 데이터가 있는지 확인
-- Check existing data
SELECT 
    id, 
    name, 
    description, 
    category,
    name_ko,
    name_en, 
    name_zh,
    description_ko,
    description_en,
    description_zh
FROM certificates 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. 다국어 컬럼이 없는 경우 추가 (필요시 실행)
-- Add multilanguage columns if they don't exist
-- 주의: 이미 컬럼이 있으면 오류가 발생하므로 확인 후 실행하세요.

-- ALTER TABLE certificates 
-- ADD COLUMN IF NOT EXISTS name_ko VARCHAR(255),
-- ADD COLUMN IF NOT EXISTS name_en VARCHAR(255),
-- ADD COLUMN IF NOT EXISTS name_zh VARCHAR(255),
-- ADD COLUMN IF NOT EXISTS name_id VARCHAR(255),
-- ADD COLUMN IF NOT EXISTS description_ko TEXT,
-- ADD COLUMN IF NOT EXISTS description_en TEXT,
-- ADD COLUMN IF NOT EXISTS description_zh TEXT,
-- ADD COLUMN IF NOT EXISTS description_id TEXT;

-- 4. 기존 한국어 데이터를 다국어 컬럼으로 복사 (필요시 실행)
-- Copy existing Korean data to multilanguage columns
-- UPDATE certificates 
-- SET 
--     name_ko = name,
--     description_ko = description
-- WHERE name_ko IS NULL OR description_ko IS NULL;

-- 5. 누락된 영어 번역 추가 예시
-- Example: Add missing English translations
UPDATE certificates 
SET 
    name_en = CASE 
        WHEN name_ko LIKE '%특허등록증%' THEN 'Patent Registration Certificate'
        WHEN name_ko LIKE '%상표등록증%' THEN 'Trademark Registration Certificate'
        WHEN name_ko LIKE '%불연재료%' THEN 'Fire-resistant Material Compliance'
        WHEN name_ko LIKE '%가스유해성%' THEN 'Gas Toxicity Test'
        WHEN name_ko LIKE '%미끄럼저항성%' THEN 'Slip Resistance (BPN)'
        WHEN name_ko LIKE '%마모감량%' THEN 'Abrasion Loss'
        WHEN name_ko LIKE '%4대 중금속%' THEN 'Four Heavy Metals Test'
        WHEN name_ko LIKE '%내세척성%' THEN 'Washability, Liquid Resistance, Adhesion Strength'
        WHEN name_ko LIKE '%지촉건조시간%' THEN 'Touch Dry Time, Gloss, Pencil Hardness'
        ELSE name_en
    END,
    description_en = CASE 
        WHEN description_ko LIKE '%특허등록증%' THEN 'RIN Korea Patent Registration Certificate'
        WHEN description_ko LIKE '%상표등록증%' THEN 'RIN Korea Trademark Registration Certificate'
        WHEN description_ko LIKE '%불연성적서%' THEN 'KTR Fire-resistant Test Report'
        WHEN description_ko LIKE '%가스유해성%' THEN 'RIN-COAT Gas Toxicity Test'
        WHEN description_ko LIKE '%미끄럼저항성%' THEN 'Slip Resistance (BPN) Test'
        WHEN description_ko LIKE '%마모감량%' THEN 'Abrasion Loss Test'
        WHEN description_ko LIKE '%4대 중금속%' THEN 'Four Heavy Metals Test'
        ELSE description_en
    END
WHERE name_en IS NULL OR description_en IS NULL;

-- 6. 누락된 중국어 번역 추가 예시
-- Example: Add missing Chinese translations
UPDATE certificates 
SET 
    name_zh = CASE 
        WHEN name_ko LIKE '%특허등록증%' THEN '专利注册证'
        WHEN name_ko LIKE '%상표등록증%' THEN '商标注册证'
        WHEN name_ko LIKE '%불연재료%' THEN '不燃材料合格'
        WHEN name_ko LIKE '%가스유해성%' THEN '气体毒性试验'
        WHEN name_ko LIKE '%미끄럼저항성%' THEN '防滑性(BPN)'
        WHEN name_ko LIKE '%마모감량%' THEN '磨损量'
        WHEN name_ko LIKE '%4대 중금속%' THEN '四大重金属试验'
        WHEN name_ko LIKE '%내세척성%' THEN '耐清洗性、耐液体性、附着强度'
        WHEN name_ko LIKE '%지촉건조시간%' THEN '指触干燥时间、光泽度、铅笔硬度'
        ELSE name_zh
    END,
    description_zh = CASE 
        WHEN description_ko LIKE '%특허등록증%' THEN 'RIN Korea专利注册证'
        WHEN description_ko LIKE '%상표등록증%' THEN 'RIN Korea商标注册证'
        WHEN description_ko LIKE '%불연성적서%' THEN 'KTR不燃性试验报告'
        WHEN description_ko LIKE '%가스유해성%' THEN 'RIN-COAT 气体毒性试验'
        WHEN description_ko LIKE '%미끄럼저항성%' THEN '防滑性(BPN)试验'
        WHEN description_ko LIKE '%마모감량%' THEN '磨损量试验'
        WHEN description_ko LIKE '%4대 중금속%' THEN '四大重金属试验'
        ELSE description_zh
    END
WHERE name_zh IS NULL OR description_zh IS NULL;

-- 7. 데이터 검증 - 다국어 지원 상태 확인
-- Verify multilanguage support status
SELECT 
    category,
    COUNT(*) as total_count,
    COUNT(name_ko) as name_ko_count,
    COUNT(name_en) as name_en_count,
    COUNT(name_zh) as name_zh_count,
    COUNT(description_ko) as desc_ko_count,
    COUNT(description_en) as desc_en_count,
    COUNT(description_zh) as desc_zh_count,
    ROUND(COUNT(name_en)::numeric / COUNT(*)::numeric * 100, 1) as en_completion_rate,
    ROUND(COUNT(name_zh)::numeric / COUNT(*)::numeric * 100, 1) as zh_completion_rate
FROM certificates 
WHERE is_active = true
GROUP BY category
ORDER BY category;

-- 8. 샘플 다국어 데이터 확인
-- Check sample multilanguage data
SELECT 
    category,
    name_ko,
    name_en,
    name_zh,
    description_ko,
    description_en,
    description_zh
FROM certificates 
WHERE is_active = true
ORDER BY category, created_at
LIMIT 10;

-- 9. 누락된 번역 찾기
-- Find missing translations
SELECT 
    id,
    category,
    name_ko,
    CASE 
        WHEN name_en IS NULL OR name_en = '' THEN 'Missing EN'
        ELSE 'OK'
    END as en_status,
    CASE 
        WHEN name_zh IS NULL OR name_zh = '' THEN 'Missing ZH'
        ELSE 'OK'
    END as zh_status
FROM certificates 
WHERE is_active = true
    AND (name_en IS NULL OR name_en = '' OR name_zh IS NULL OR name_zh = '')
ORDER BY category;

-- 10. 인증서 카테고리별 통계
-- Certificate statistics by category
SELECT 
    category,
    CASE 
        WHEN category = 'patent' THEN '특허/상표'
        WHEN category = 'certification' THEN 'RIN-COAT 시험성적서'
        WHEN category = 'rin_test' THEN '린코리아 시험성적서'
        ELSE category
    END as category_korean,
    COUNT(*) as count,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_count
FROM certificates 
GROUP BY category
ORDER BY category; 