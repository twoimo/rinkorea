-- Products 테이블 번역 업데이트
-- Supabase SQL 에디터에서 실행하세요

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