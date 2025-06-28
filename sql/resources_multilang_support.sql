-- ==============================================
-- Resources 다국어 지원을 위한 SQL 스크립트
-- Supabase SQL 에디터에서 실행하세요
-- ==============================================

-- 1. resources 테이블에 다국어 컬럼 추가
DO $$
BEGIN
    -- 제목 다국어 컬럼 추가
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='resources' AND column_name='title_ko') THEN
        ALTER TABLE resources ADD COLUMN title_ko TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='resources' AND column_name='title_en') THEN
        ALTER TABLE resources ADD COLUMN title_en TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='resources' AND column_name='title_zh') THEN
        ALTER TABLE resources ADD COLUMN title_zh TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='resources' AND column_name='title_id') THEN
        ALTER TABLE resources ADD COLUMN title_id TEXT;
    END IF;
    
    -- 설명 다국어 컬럼 추가
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='resources' AND column_name='description_ko') THEN
        ALTER TABLE resources ADD COLUMN description_ko TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='resources' AND column_name='description_en') THEN
        ALTER TABLE resources ADD COLUMN description_en TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='resources' AND column_name='description_zh') THEN
        ALTER TABLE resources ADD COLUMN description_zh TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='resources' AND column_name='description_id') THEN
        ALTER TABLE resources ADD COLUMN description_id TEXT;
    END IF;
END $$;

-- 2. 기존 데이터의 다국어 필드 업데이트
-- 한국어는 기본값으로 기존 title, description 사용
UPDATE resources 
SET 
    title_ko = COALESCE(title_ko, title),
    description_ko = COALESCE(description_ko, description)
WHERE title_ko IS NULL OR title_ko = '' OR description_ko IS NULL OR description_ko = '';

-- 3. 현재 자료들의 영어 번역 예시 업데이트
-- (실제 운영시에는 정확한 번역으로 대체해야 함)

-- RIN-COAT 관련 자료들 번역
UPDATE resources 
SET 
    title_en = CASE 
        WHEN title_ko LIKE '%린코트%' OR title_ko LIKE '%RIN-COAT%' THEN 
            REPLACE(REPLACE(title_ko, '린코트', 'RIN-COAT'), '도장사양서', 'Coating Specification')
        WHEN title_ko LIKE '%카탈로그%' THEN 
            REPLACE(title_ko, '카탈로그', 'Catalog')
        WHEN title_ko LIKE '%매뉴얼%' THEN 
            REPLACE(title_ko, '매뉴얼', 'Manual')
        WHEN title_ko LIKE '%시험성적서%' THEN 
            REPLACE(title_ko, '시험성적서', 'Test Report')
        WHEN title_ko LIKE '%인증서%' THEN 
            REPLACE(title_ko, '인증서', 'Certificate')
        ELSE title_ko
    END,
    description_en = CASE 
        WHEN description_ko LIKE '%도장사양서%' THEN 
            REPLACE(description_ko, '도장사양서', 'Coating Specification')
        WHEN description_ko LIKE '%카탈로그%' THEN 
            REPLACE(description_ko, '카탈로그', 'Catalog')
        WHEN description_ko LIKE '%매뉴얼%' THEN 
            REPLACE(description_ko, '매뉴얼', 'Manual')
        WHEN description_ko LIKE '%시험성적서%' THEN 
            REPLACE(description_ko, '시험성적서', 'Test Report')
        WHEN description_ko LIKE '%인증서%' THEN 
            REPLACE(description_ko, '인증서', 'Certificate')
        ELSE description_ko
    END,
    title_zh = CASE 
        WHEN title_ko LIKE '%린코트%' OR title_ko LIKE '%RIN-COAT%' THEN 
            REPLACE(REPLACE(title_ko, '린코트', 'RIN-COAT'), '도장사양서', '涂装规格书')
        WHEN title_ko LIKE '%카탈로그%' THEN 
            REPLACE(title_ko, '카탈로그', '目录')
        WHEN title_ko LIKE '%매뉴얼%' THEN 
            REPLACE(title_ko, '매뉴얼', '手册')
        WHEN title_ko LIKE '%시험성적서%' THEN 
            REPLACE(title_ko, '시험성적서', '试验报告')
        WHEN title_ko LIKE '%인증서%' THEN 
            REPLACE(title_ko, '인증서', '证书')
        ELSE title_ko
    END,
    description_zh = CASE 
        WHEN description_ko LIKE '%도장사양서%' THEN 
            REPLACE(description_ko, '도장사양서', '涂装规格书')
        WHEN description_ko LIKE '%카탈로그%' THEN 
            REPLACE(description_ko, '카탈로그', '目录')
        WHEN description_ko LIKE '%매뉴얼%' THEN 
            REPLACE(description_ko, '매뉴얼', '手册')
        WHEN description_ko LIKE '%시험성적서%' THEN 
            REPLACE(description_ko, '시험성적서', '试验报告')
        WHEN description_ko LIKE '%인증서%' THEN 
            REPLACE(description_ko, '인증서', '证书')
        ELSE description_ko
    END,
    title_id = CASE 
        WHEN title_ko LIKE '%린코트%' OR title_ko LIKE '%RIN-COAT%' THEN 
            REPLACE(REPLACE(title_ko, '린코트', 'RIN-COAT'), '도장사양서', 'Spesifikasi Pelapis')
        WHEN title_ko LIKE '%카탈로그%' THEN 
            REPLACE(title_ko, '카탈로그', 'Katalog')
        WHEN title_ko LIKE '%매뉴얼%' THEN 
            REPLACE(title_ko, '매뉴얼', 'Manual')
        WHEN title_ko LIKE '%시험성적서%' THEN 
            REPLACE(title_ko, '시험성적서', 'Laporan Uji')
        WHEN title_ko LIKE '%인증서%' THEN 
            REPLACE(title_ko, '인증서', 'Sertifikat')
        ELSE title_ko
    END,
    description_id = CASE 
        WHEN description_ko LIKE '%도장사양서%' THEN 
            REPLACE(description_ko, '도장사양서', 'Spesifikasi Pelapis')
        WHEN description_ko LIKE '%카탈로그%' THEN 
            REPLACE(description_ko, '카탈로그', 'Katalog')
        WHEN description_ko LIKE '%매뉴얼%' THEN 
            REPLACE(description_ko, '매뉴얼', 'Manual')
        WHEN description_ko LIKE '%시험성적서%' THEN 
            REPLACE(description_ko, '시험성적서', 'Laporan Uji')
        WHEN description_ko LIKE '%인증서%' THEN 
            REPLACE(description_ko, '인증서', 'Sertifikat')
        ELSE description_ko
    END
WHERE title_en IS NULL OR title_en = '' OR description_en IS NULL OR description_en = '';

-- 4. 데이터 검증 - 다국어 지원 상태 확인
SELECT 
    id,
    title as original_title,
    title_ko,
    title_en,
    title_zh,
    title_id,
    SUBSTRING(description, 1, 50) as original_description_short,
    SUBSTRING(description_ko, 1, 50) as description_ko_short,
    SUBSTRING(description_en, 1, 50) as description_en_short,
    SUBSTRING(description_zh, 1, 50) as description_zh_short,
    SUBSTRING(description_id, 1, 50) as description_id_short,
    category,
    is_active,
    created_at
FROM resources 
ORDER BY created_at DESC
LIMIT 10;

-- 5. 다국어 번역 완성도 확인
SELECT 
    COUNT(*) as total_resources,
    COUNT(title_ko) as title_ko_count,
    COUNT(title_en) as title_en_count,
    COUNT(title_zh) as title_zh_count,
    COUNT(title_id) as title_id_count,
    COUNT(description_ko) as desc_ko_count,
    COUNT(description_en) as desc_en_count,
    COUNT(description_zh) as desc_zh_count,
    COUNT(description_id) as desc_id_count,
    ROUND(COUNT(title_en)::numeric / COUNT(*)::numeric * 100, 1) as title_en_completion_rate,
    ROUND(COUNT(title_zh)::numeric / COUNT(*)::numeric * 100, 1) as title_zh_completion_rate,
    ROUND(COUNT(title_id)::numeric / COUNT(*)::numeric * 100, 1) as title_id_completion_rate
FROM resources 
WHERE is_active = true;

-- 완료 메시지
SELECT 'Resources multilanguage support completed successfully! Updated ' || 
       (SELECT COUNT(*) FROM resources WHERE title_ko IS NOT NULL AND title_en IS NOT NULL) || 
       ' resources with translations.' as result; 
