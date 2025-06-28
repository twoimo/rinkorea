-- ==============================================
-- Shop 다국어 지원을 위한 SQL 스크립트
-- Supabase SQL 에디터에서 실행하세요
-- ==============================================

-- 1. 다국어 컬럼들이 없는 경우를 위한 컬럼 추가 (이미 존재하면 무시됨)
DO $$
BEGIN
    -- 한국어 컬럼 추가
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='name_ko') THEN
        ALTER TABLE products ADD COLUMN name_ko TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='description_ko') THEN
        ALTER TABLE products ADD COLUMN description_ko TEXT;
    END IF;
    
    -- 영어 컬럼 추가
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='name_en') THEN
        ALTER TABLE products ADD COLUMN name_en TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='description_en') THEN
        ALTER TABLE products ADD COLUMN description_en TEXT;
    END IF;
    
    -- 중국어 컬럼 추가
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='name_zh') THEN
        ALTER TABLE products ADD COLUMN name_zh TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='description_zh') THEN
        ALTER TABLE products ADD COLUMN description_zh TEXT;
    END IF;
    
    -- 인도네시아어 컬럼 추가
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='name_id') THEN
        ALTER TABLE products ADD COLUMN name_id TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='description_id') THEN
        ALTER TABLE products ADD COLUMN description_id TEXT;
    END IF;
END $$;

-- 2. 기존 데이터의 다국어 필드 업데이트 (null인 경우에만)
-- 한국어는 기본값으로 기존 name, description 사용
UPDATE products 
SET 
  name_ko = COALESCE(name_ko, name),
  description_ko = COALESCE(description_ko, description)
WHERE name_ko IS NULL OR description_ko IS NULL OR name_ko = '' OR description_ko = '';

-- 영어 필드 업데이트 (이미 존재하는 데이터 유지)
UPDATE products 
SET 
  name_en = COALESCE(name_en, name),
  description_en = COALESCE(description_en, description)
WHERE (name_en IS NULL OR name_en = '') AND (description_en IS NULL OR description_en = '');

-- 중국어 필드 업데이트 (이미 존재하는 데이터 유지)
UPDATE products 
SET 
  name_zh = COALESCE(name_zh, name),
  description_zh = COALESCE(description_zh, description)
WHERE (name_zh IS NULL OR name_zh = '') AND (description_zh IS NULL OR description_zh = '');

-- 인도네시아어 필드 업데이트 (이미 존재하는 데이터 유지)
UPDATE products 
SET 
  name_id = COALESCE(name_id, name),
  description_id = COALESCE(description_id, description)
WHERE (name_id IS NULL OR name_id = '') AND (description_id IS NULL OR description_id = '');

-- 3. 다국어 데이터 확인 쿼리 (선택사항)
-- 아래 쿼리를 실행하여 다국어 데이터가 올바르게 설정되었는지 확인할 수 있습니다
/*
SELECT 
  id, 
  name, 
  name_ko, 
  name_en, 
  name_zh, 
  name_id,
  SUBSTRING(description, 1, 30) as description_short,
  SUBSTRING(description_ko, 1, 30) as description_ko_short,
  SUBSTRING(description_en, 1, 30) as description_en_short,
  SUBSTRING(description_zh, 1, 30) as description_zh_short,
  SUBSTRING(description_id, 1, 30) as description_id_short
FROM products 
ORDER BY created_at DESC;
*/ 