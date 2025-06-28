-- ==============================================
-- Resource Categories 다국어 지원을 위한 SQL 스크립트
-- Supabase SQL 에디터에서 실행하세요
-- ==============================================

-- 1. 다국어 컬럼들이 없는 경우를 위한 컬럼 추가 (이미 존재하면 무시됨)
DO $$
BEGIN
    -- 한국어 컬럼 추가
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='resource_categories' AND column_name='name_ko') THEN
        ALTER TABLE resource_categories ADD COLUMN name_ko TEXT;
    END IF;
    
    -- 영어 컬럼 추가
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='resource_categories' AND column_name='name_en') THEN
        ALTER TABLE resource_categories ADD COLUMN name_en TEXT;
    END IF;
    
    -- 중국어 컬럼 추가
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='resource_categories' AND column_name='name_zh') THEN
        ALTER TABLE resource_categories ADD COLUMN name_zh TEXT;
    END IF;
    
    -- 인도네시아어 컬럼 추가
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='resource_categories' AND column_name='name_id') THEN
        ALTER TABLE resource_categories ADD COLUMN name_id TEXT;
    END IF;
END $$;

-- 2. 기존 데이터의 다국어 필드 업데이트
-- 한국어는 기본값으로 기존 name 사용
UPDATE resource_categories 
SET name_ko = COALESCE(name_ko, name)
WHERE name_ko IS NULL OR name_ko = '';

-- 3. 각 카테고리별 다국어 번역 업데이트

-- 기술자료 카테고리 번역
UPDATE resource_categories 
SET 
    name_ko = '기술자료',
    name_en = 'Technical Materials',
    name_zh = '技术资料',
    name_id = 'Materi Teknis'
WHERE id = '10ee353f-95b1-4fb1-a377-616b4139a522';

-- 기타 카테고리 번역
UPDATE resource_categories 
SET 
    name_ko = '기타',
    name_en = 'Others',
    name_zh = '其他',
    name_id = 'Lainnya'
WHERE id = '58be4cfe-e58e-483d-b4f0-81027ca22065';

-- 시험성적서 카테고리 번역
UPDATE resource_categories 
SET 
    name_ko = '시험성적서',
    name_en = 'Test Reports',
    name_zh = '试验报告',
    name_id = 'Laporan Uji'
WHERE id = 'abf115eb-4df4-4e8d-8781-454e3514a19f';

-- 카탈로그 카테고리 번역
UPDATE resource_categories 
SET 
    name_ko = '카탈로그',
    name_en = 'Catalog',
    name_zh = '目录',
    name_id = 'Katalog'
WHERE id = 'b0d0ead0-747e-4bef-b8f4-a630c144a0a9';

-- 인증서 카테고리 번역
UPDATE resource_categories 
SET 
    name_ko = '인증서',
    name_en = 'Certificates',
    name_zh = '证书',
    name_id = 'Sertifikat'
WHERE id = 'be783aca-7dbe-4b16-9049-fe97f272ff9a';

-- 매뉴얼 카테고리 번역
UPDATE resource_categories 
SET 
    name_ko = '매뉴얼',
    name_en = 'Manual',
    name_zh = '手册',
    name_id = 'Manual'
WHERE id = 'e5e64254-6f77-4092-952e-9c05ce4f4eeb';

-- 4. 데이터 검증 - 다국어 지원 상태 확인
SELECT 
    id,
    name as original_name,
    name_ko,
    name_en,
    name_zh,
    name_id,
    color,
    is_active,
    created_at
FROM resource_categories 
ORDER BY name_ko;

-- 5. 다국어 번역 완성도 확인
SELECT 
    COUNT(*) as total_categories,
    COUNT(name_ko) as name_ko_count,
    COUNT(name_en) as name_en_count,
    COUNT(name_zh) as name_zh_count,
    COUNT(name_id) as name_id_count,
    ROUND(COUNT(name_en)::numeric / COUNT(*)::numeric * 100, 1) as en_completion_rate,
    ROUND(COUNT(name_zh)::numeric / COUNT(*)::numeric * 100, 1) as zh_completion_rate,
    ROUND(COUNT(name_id)::numeric / COUNT(*)::numeric * 100, 1) as id_completion_rate
FROM resource_categories 
WHERE is_active = true;

-- 완료 메시지
SELECT 'Resource Categories multilanguage support completed successfully! Updated ' || 
       (SELECT COUNT(*) FROM resource_categories WHERE name_ko IS NOT NULL AND name_en IS NOT NULL) || 
       ' categories with translations.' as result; 