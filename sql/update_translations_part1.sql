-- ========================================
-- RIN Korea Products 테이블 번역 업데이트 (Part 1)
-- Supabase SQL 에디터에서 실행하세요
-- ========================================

-- RIN-COAT 2KG/4KG 제품 번역
UPDATE products 
SET 
    name_ko = '린코리아 불연 세라믹 코팅제(1액형) 린코트 2KG/4KG',
    name_en = 'RIN Korea Fire-Resistant Ceramic Coating (1-Component) RIN-COAT 2KG/4KG',
    name_zh = 'RIN Korea 不燃陶瓷涂料(单组分) RIN-COAT 2KG/4KG',
    name_id = 'RIN Korea Pelapis Keramik Tahan Api (1-Komponen) RIN-COAT 2KG/4KG',
    description_ko = 'RIN COAT 순수 무기질 침투 강화 코팅제 - 수많은 현장에 납품되어 성공적으로 시공되었고, 높은 고객 만족도를 이끌어낸 제품입니다.',
    description_en = 'RIN COAT pure inorganic penetrating reinforcement coating - A product that has been successfully applied to numerous sites and achieved high customer satisfaction.',
    description_zh = 'RIN COAT 纯无机质渗透强化涂料 - 已成功供应并施工于众多现场，获得了很高的客户满意度。',
    description_id = 'RIN COAT lapisan penguatan penetrasi anorganik murni - Produk yang telah berhasil diterapkan di berbagai lokasi dan mencapai kepuasan pelanggan yang tinggi.'
WHERE id = '1047990b-6c4c-4c32-b1b6-3495558dffd5';

-- RIN-COAT 18KG 제품 번역
UPDATE products 
SET 
    name_ko = '린코리아 불연 세라믹 코팅제(1액형) 린코트 18KG',
    name_en = 'RIN Korea Fire-Resistant Ceramic Coating (1-Component) RIN-COAT 18KG',
    name_zh = 'RIN Korea 不燃陶瓷涂料(单组分) RIN-COAT 18KG',
    name_id = 'RIN Korea Pelapis Keramik Tahan Api (1-Komponen) RIN-COAT 18KG',
    description_ko = 'RIN COAT 바닥재 마감재 - 수많은 현장에 납품되어 성공적으로 시공되었고, 높은 고객 만족도를 이끌어낸 제품입니다.',
    description_en = 'RIN COAT flooring finishing material - A product that has been successfully applied to numerous sites and achieved high customer satisfaction.',
    description_zh = 'RIN COAT 地面材料收尾材 - 已成功供应并施工于众多现场，获得了很高的客户满意度。',
    description_id = 'RIN COAT bahan finishing lantai - Produk yang telah berhasil diterapkan di berbagai lokasi dan mencapai kepuasan pelanggan yang tinggi.'
WHERE id = '1917f9fb-3e1f-44f6-8f96-f46ee2a08c68';

-- RIN-SEAL PLUS 20KG 제품 번역
UPDATE products 
SET 
    name_ko = '린코리아 콘크리트 실러 표면코팅제 린씰플러스 20KG',
    name_en = 'RIN Korea Concrete Sealer Surface Coating RIN-SEAL PLUS 20KG',
    name_zh = 'RIN Korea 混凝土密封剂表面涂层 RIN-SEAL PLUS 20KG',
    name_id = 'RIN Korea Pelapis Permukaan Penyegel Beton RIN-SEAL PLUS 20KG',
    description_ko = '표면보호 광택부여 바닥재 바닥마감재',
    description_en = 'Surface protection gloss-providing flooring finishing material',
    description_zh = '表面保护光泽地面材料收尾材',
    description_id = 'Bahan finishing lantai yang memberikan perlindungan permukaan dan kilap'
WHERE id = '2c862bd6-8cda-4abb-9034-9a72111327ff';

SELECT 'Products Part 1 translation completed!' as result; 