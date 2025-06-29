-- =====================================================
-- 자료실 다국어 지원 SQL
-- =====================================================

-- 1. 자료 카테고리 번역 테이블 생성
CREATE TABLE IF NOT EXISTS "public"."resource_category_translations" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "category_id" UUID NOT NULL REFERENCES "public"."resource_categories"("id") ON DELETE CASCADE,
    "language" VARCHAR(5) NOT NULL CHECK (language IN ('ko', 'en', 'zh')),
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(category_id, language)
);

-- 2. 자료 번역 테이블 생성
CREATE TABLE IF NOT EXISTS "public"."resource_translations" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "resource_id" UUID NOT NULL REFERENCES "public"."resources"("id") ON DELETE CASCADE,
    "language" VARCHAR(5) NOT NULL CHECK (language IN ('ko', 'en', 'zh')),
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(resource_id, language)
);

-- 3. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS "idx_resource_category_translations_category_id" ON "public"."resource_category_translations"("category_id");
CREATE INDEX IF NOT EXISTS "idx_resource_category_translations_language" ON "public"."resource_category_translations"("language");
CREATE INDEX IF NOT EXISTS "idx_resource_translations_resource_id" ON "public"."resource_translations"("resource_id");
CREATE INDEX IF NOT EXISTS "idx_resource_translations_language" ON "public"."resource_translations"("language");

-- 4. 카테고리 번역 데이터 삽입
INSERT INTO "public"."resource_category_translations" ("category_id", "language", "name") VALUES
-- 카탈로그
('b0d0ead0-747e-4bef-b8f4-a630c144a0a9', 'ko', '카탈로그'),
('b0d0ead0-747e-4bef-b8f4-a630c144a0a9', 'en', 'Catalog'),
('b0d0ead0-747e-4bef-b8f4-a630c144a0a9', 'zh', '产品目录'),

-- 시험성적서
('abf115eb-4df4-4e8d-8781-454e3514a19f', 'ko', '시험성적서'),
('abf115eb-4df4-4e8d-8781-454e3514a19f', 'en', 'Test Report'),
('abf115eb-4df4-4e8d-8781-454e3514a19f', 'zh', '测试报告'),

-- 매뉴얼
('e5e64254-6f77-4092-952e-9c05ce4f4eeb', 'ko', '매뉴얼'),
('e5e64254-6f77-4092-952e-9c05ce4f4eeb', 'en', 'Manual'),
('e5e64254-6f77-4092-952e-9c05ce4f4eeb', 'zh', '操作手册'),

-- 기술자료
('10ee353f-95b1-4fb1-a377-616b4139a522', 'ko', '기술자료'),
('10ee353f-95b1-4fb1-a377-616b4139a522', 'en', 'Technical Data'),
('10ee353f-95b1-4fb1-a377-616b4139a522', 'zh', '技术资料'),

-- 인증서
('be783aca-7dbe-4b16-9049-fe97f272ff9a', 'ko', '인증서'),
('be783aca-7dbe-4b16-9049-fe97f272ff9a', 'en', 'Certificate'),
('be783aca-7dbe-4b16-9049-fe97f272ff9a', 'zh', '认证文件'),

-- 기타
('58be4cfe-e58e-483d-b4f0-81027ca22065', 'ko', '기타'),
('58be4cfe-e58e-483d-b4f0-81027ca22065', 'en', 'Other'),
('58be4cfe-e58e-483d-b4f0-81027ca22065', 'zh', '其他')
ON CONFLICT (category_id, language) DO NOTHING;

-- 5. 자료 번역 데이터 삽입
INSERT INTO "public"."resource_translations" ("resource_id", "language", "title", "description") VALUES
-- RIN-COAT 도장사양서
('ca78d0d8-aa88-4964-a600-4ffd59dd0768', 'ko', 'RIN-COAT 도장사양서', '도장사양서'),
('ca78d0d8-aa88-4964-a600-4ffd59dd0768', 'en', 'RIN-COAT Coating Specification', 'Coating specification document'),
('ca78d0d8-aa88-4964-a600-4ffd59dd0768', 'zh', 'RIN-COAT 涂装规格书', '涂装规格书'),

-- RIN-COAT 카탈로그
('65bf7c12-cffa-44a5-b26e-3776556683e8', 'ko', 'RIN-COAT 카탈로그', '카탈로그'),
('65bf7c12-cffa-44a5-b26e-3776556683e8', 'en', 'RIN-COAT Catalog', 'Product catalog'),
('65bf7c12-cffa-44a5-b26e-3776556683e8', 'zh', 'RIN-COAT 产品目录', '产品目录'),

-- MSDS 안내
('8b5e0f8a-940c-4d7b-920b-e8984055c25d', 'ko', 'MSDS 안내', '고객상담 페이지, 이메일을 통해 현장명을 전달 주시면 MSDS를 발송드리고 있습니다.'),
('8b5e0f8a-940c-4d7b-920b-e8984055c25d', 'en', 'MSDS Information', 'Please provide your site name through the customer consultation page or email, and we will send you the MSDS.'),
('8b5e0f8a-940c-4d7b-920b-e8984055c25d', 'zh', 'MSDS 资料说明', '请通过客户咨询页面或邮件提供现场名称，我们将向您发送MSDS资料。'),

-- RIN-HARD PLUS 카탈로그
('19e91b90-2318-4950-aca6-46e58c88eba5', 'ko', 'RIN-HARD PLUS 카탈로그', '카탈로그'),
('19e91b90-2318-4950-aca6-46e58c88eba5', 'en', 'RIN-HARD PLUS Catalog', 'Product catalog'),
('19e91b90-2318-4950-aca6-46e58c88eba5', 'zh', 'RIN-HARD PLUS 产品目录', '产品目录'),

-- RIN-SEAL PLUS 카탈로그
('ac29e0dd-25fa-4fce-aefd-8b6d1a7f03f2', 'ko', 'RIN-SEAL PLUS 카탈로그', '카탈로그'),
('ac29e0dd-25fa-4fce-aefd-8b6d1a7f03f2', 'en', 'RIN-SEAL PLUS Catalog', 'Product catalog'),
('ac29e0dd-25fa-4fce-aefd-8b6d1a7f03f2', 'zh', 'RIN-SEAL PLUS 产品目录', '产品目录'),

-- 린코리아 콘크리트 폴리싱 기술자료
('b8d8912b-0532-4d6b-a7a6-f875fa54fa48', 'ko', '린코리아 콘크리트 폴리싱 기술자료', '린코리아 콘크리트 폴리싱 기술자료'),
('b8d8912b-0532-4d6b-a7a6-f875fa54fa48', 'en', 'RIN Korea Concrete Polishing Technical Data', 'RIN Korea concrete polishing technical documentation'),
('b8d8912b-0532-4d6b-a7a6-f875fa54fa48', 'zh', '林韩国混凝土抛光技术资料', '林韩国混凝土抛光技术文档'),

-- RIN-SEAL PLUS 도장사양서
('bd65b737-6ee6-4c6d-a14e-edfb93d1b1f5', 'ko', 'RIN-SEAL PLUS 도장사양서', '도장사양서'),
('bd65b737-6ee6-4c6d-a14e-edfb93d1b1f5', 'en', 'RIN-SEAL PLUS Coating Specification', 'Coating specification document'),
('bd65b737-6ee6-4c6d-a14e-edfb93d1b1f5', 'zh', 'RIN-SEAL PLUS 涂装规格书', '涂装规格书'),

-- 자재공급원 서류 안내
('01f296f4-5ff5-46fe-9499-36c74f1adaca', 'ko', '자재공급원 서류 안내', '고객상담 페이지, 이메일을 통해 현장명을 전달 주시면 자재공급원 서류를 발송드리고 있습니다.'),
('01f296f4-5ff5-46fe-9499-36c74f1adaca', 'en', 'Material Supplier Document Information', 'Please provide your site name through the customer consultation page or email, and we will send you the material supplier documents.'),
('01f296f4-5ff5-46fe-9499-36c74f1adaca', 'zh', '材料供应商文件说明', '请通过客户咨询页面或邮件提供现场名称，我们将向您发送材料供应商文件。'),

-- GT 시리즈 메뉴얼
('1dd2562d-968e-4252-85f2-6ef906dcea01', 'ko', 'GT 시리즈 메뉴얼', '850GT, 950GT 매뉴얼'),
('1dd2562d-968e-4252-85f2-6ef906dcea01', 'en', 'GT Series Manual', '850GT, 950GT manual'),
('1dd2562d-968e-4252-85f2-6ef906dcea01', 'zh', 'GT 系列手册', '850GT, 950GT 操作手册'),

-- 2025 JS FLOOR SYSTEMS 카탈로그
('33ea6b75-e6a8-4fca-aef6-178fe6c36d26', 'ko', '2025 JS FLOOR SYSTEMS 카탈로그', '2025 JS FLOOR SYSTEMS 카탈로그'),
('33ea6b75-e6a8-4fca-aef6-178fe6c36d26', 'en', '2025 JS FLOOR SYSTEMS Catalog', '2025 JS FLOOR SYSTEMS catalog'),
('33ea6b75-e6a8-4fca-aef6-178fe6c36d26', 'zh', '2025 JS FLOOR SYSTEMS 产品目录', '2025 JS FLOOR SYSTEMS 产品目录')
ON CONFLICT (resource_id, language) DO NOTHING;

-- 6. 번역 테이블 업데이트 트리거 함수 생성
CREATE OR REPLACE FUNCTION update_translation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. 트리거 생성
CREATE TRIGGER trigger_update_resource_category_translations_updated_at
    BEFORE UPDATE ON "public"."resource_category_translations"
    FOR EACH ROW
    EXECUTE FUNCTION update_translation_updated_at();

CREATE TRIGGER trigger_update_resource_translations_updated_at
    BEFORE UPDATE ON "public"."resource_translations"
    FOR EACH ROW
    EXECUTE FUNCTION update_translation_updated_at();

-- 8. 다국어 조회를 위한 뷰 생성
CREATE OR REPLACE VIEW "public"."resource_categories_with_translations" AS
SELECT 
    rc.id,
    rc.name as original_name,
    rc.color,
    rc.is_active,
    rc.created_at,
    rct_ko.name as name_ko,
    rct_en.name as name_en,
    rct_zh.name as name_zh
FROM "public"."resource_categories" rc
LEFT JOIN "public"."resource_category_translations" rct_ko ON rc.id = rct_ko.category_id AND rct_ko.language = 'ko'
LEFT JOIN "public"."resource_category_translations" rct_en ON rc.id = rct_en.category_id AND rct_en.language = 'en'
LEFT JOIN "public"."resource_category_translations" rct_zh ON rc.id = rct_zh.category_id AND rct_zh.language = 'zh';

CREATE OR REPLACE VIEW "public"."resources_with_translations" AS
SELECT 
    r.id,
    r.title as original_title,
    r.description as original_description,
    r.file_name,
    r.file_url,
    r.file_size,
    r.file_type,
    r.category,
    r.download_count,
    r.is_active,
    r.author_id,
    r.created_at,
    r.updated_at,
    rt_ko.title as title_ko,
    rt_ko.description as description_ko,
    rt_en.title as title_en,
    rt_en.description as description_en,
    rt_zh.title as title_zh,
    rt_zh.description as description_zh
FROM "public"."resources" r
LEFT JOIN "public"."resource_translations" rt_ko ON r.id = rt_ko.resource_id AND rt_ko.language = 'ko'
LEFT JOIN "public"."resource_translations" rt_en ON r.id = rt_en.resource_id AND rt_en.language = 'en'
LEFT JOIN "public"."resource_translations" rt_zh ON r.id = rt_zh.resource_id AND rt_zh.language = 'zh';

-- 9. RLS (Row Level Security) 정책 설정
ALTER TABLE "public"."resource_category_translations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."resource_translations" ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능
CREATE POLICY "resource_category_translations_select_policy" ON "public"."resource_category_translations"
    FOR SELECT USING (true);

CREATE POLICY "resource_translations_select_policy" ON "public"."resource_translations"
    FOR SELECT USING (true);

-- 인증된 사용자만 수정 가능
CREATE POLICY "resource_category_translations_modify_policy" ON "public"."resource_category_translations"
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "resource_translations_modify_policy" ON "public"."resource_translations"
    FOR ALL USING (auth.role() = 'authenticated');

-- 10. 설정 완료 확인

-- 완료 메시지
SELECT 'Resources multi-language support setup completed successfully!' as message; 
