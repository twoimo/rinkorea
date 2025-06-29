-- ========================================
-- RIN Korea Products 테이블 나머지 번역 업데이트 (Part 2)
-- 인도네시아어 제외, 한국어/영어/중국어만 작업
-- ========================================

-- 고성능 침투 방수제 18L 제품 번역
UPDATE products 
SET 
    name_ko = '린코리아 고성능 침투 방수제 18L',
    name_en = 'RIN Korea High-Performance Penetrating Waterproofing Agent 18L',
    name_zh = 'RIN Korea 高性能渗透性防水剂 18L',
    description_ko = '수성 침투 다목적 콘크리트 외벽 옥상 주차장 베란다벽돌 대용량',
    description_en = 'Water-based penetrating multipurpose concrete exterior wall rooftop parking garage veranda brick large capacity',
    description_zh = '水性渗透多用途混凝土外墙屋顶停车场阳台砖大容量'
WHERE id = '35648bf3-ff37-4fb1-821d-4c7d8135c2f2';

-- RIN-HARD PLUS 20KG 제품 번역
UPDATE products 
SET 
    name_ko = '린코리아 콘크리트 표면강화제 린하드 플러스 20KG',
    name_en = 'RIN Korea Concrete Surface Hardener RIN-HARD PLUS 20KG',
    name_zh = 'RIN Korea 混凝土表面增强剂 RIN-HARD PLUS 20KG',
    description_ko = '액상하드너 바닥재 - 콘크리트 표면을 강화하고 내구성을 향상시킵니다.',
    description_en = 'Liquid hardener flooring material - Strengthens concrete surfaces and improves durability.',
    description_zh = '液体硬化剂地面材料 - 强化混凝土表面，提高耐久性。'
WHERE id = '5465f2dc-2a9b-416a-9b70-a28b02cf198f';

-- 고성능 침투성 방수제 4L 제품 번역
UPDATE products 
SET 
    name_ko = '린코리아 고성능 침투성 방수제 4L',
    name_en = 'RIN Korea High-Performance Penetrating Waterproofing Agent 4L',
    name_zh = 'RIN Korea 高性能渗透性防水剂 4L',
    description_ko = '수성 침투 다목적 콘크리트 외벽 옥상 주차장 베란다벽돌 대용량',
    description_en = 'Water-based penetrating multipurpose concrete exterior wall rooftop parking garage veranda brick large capacity',
    description_zh = '水性渗透多用途混凝土外墙屋顶停车场阳台砖大容量'
WHERE id = '7d957892-f2b8-4f74-9306-aea307046ec5';

SELECT 'Products Part 2 translation completed!' as result; 