-- ========================================
-- RIN Korea 데이터베이스 다국어 번역 업데이트 쿼리
-- Supabase SQL 에디터에서 실행하세요
-- ========================================

-- Products 테이블 번역 업데이트 쿼리
-- RIN-COAT 2KG/4KG 제품 번역
UPDATE "public"."products" 
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
UPDATE "public"."products" 
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
UPDATE "public"."products" 
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

-- 고성능 침투 방수제 18L 제품 번역
UPDATE "public"."products" 
SET 
    name_ko = '린코리아 고성능 침투 방수제 18L',
    name_en = 'RIN Korea High-Performance Penetrating Waterproofing Agent 18L',
    name_zh = 'RIN Korea 高性能渗透性防水剂 18L',
    name_id = 'RIN Korea Agen Tahan Air Penetrasi Kinerja Tinggi 18L',
    description_ko = '수성 침투 다목적 콘크리트 외벽 옥상 주차장 베란다벽돌 대용량',
    description_en = 'Water-based penetrating multipurpose concrete exterior wall rooftop parking garage veranda brick large capacity',
    description_zh = '水性渗透多用途混凝土外墙屋顶停车场阳台砖大容量',
    description_id = 'Penetrasi berbasis air serbaguna beton dinding eksterior atap garasi parkir beranda bata kapasitas besar'
WHERE id = '35648bf3-ff37-4fb1-821d-4c7d8135c2f2';

-- RIN-HARD PLUS 20KG 제품 번역
UPDATE "public"."products" 
SET 
    name_ko = '린코리아 콘크리트 표면강화제 린하드 플러스 20KG',
    name_en = 'RIN Korea Concrete Surface Hardener RIN-HARD PLUS 20KG',
    name_zh = 'RIN Korea 混凝土表面增强剂 RIN-HARD PLUS 20KG',
    name_id = 'RIN Korea Pengeras Permukaan Beton RIN-HARD PLUS 20KG',
    description_ko = '액상하드너 바닥재 - 콘크리트 표면을 강화하고 내구성을 향상시킵니다.',
    description_en = 'Liquid hardener flooring material - Strengthens concrete surfaces and improves durability.',
    description_zh = '液体硬化剂地面材料 - 强化混凝土表面，提高耐久性。',
    description_id = 'Bahan lantai pengeras cair - Memperkuat permukaan beton dan meningkatkan daya tahan.'
WHERE id = '5465f2dc-2a9b-416a-9b70-a28b02cf198f';

-- 고성능 침투성 방수제 4L 제품 번역
UPDATE "public"."products" 
SET 
    name_ko = '린코리아 고성능 침투성 방수제 4L',
    name_en = 'RIN Korea High-Performance Penetrating Waterproofing Agent 4L',
    name_zh = 'RIN Korea 高性能渗透性防水剂 4L',
    name_id = 'RIN Korea Agen Tahan Air Penetrasi Kinerja Tinggi 4L',
    description_ko = '수성 침투 다목적 콘크리트 외벽 옥상 주차장 베란다벽돌 대용량',
    description_en = 'Water-based penetrating multipurpose concrete exterior wall rooftop parking garage veranda brick large capacity',
    description_zh = '水性渗透多用途混凝土外墙屋顶停车场阳台砖大容量',
    description_id = 'Penetrasi berbasis air serbaguna beton dinding eksterior atap garasi parkir beranda bata kapasitas besar'
WHERE id = '7d957892-f2b8-4f74-9306-aea307046ec5';

-- ========================================
-- Projects 테이블 번역 업데이트 쿼리
-- ========================================

-- 전북 완주 공장 신축 프로젝트 번역
UPDATE "public"."projects" 
SET 
    title_ko = '전북 완주 공장 신축',
    title_en = 'Jeonbuk Wanju Factory New Construction',
    title_zh = '全罗北道完州工厂新建',
    title_id = 'Konstruksi Baru Pabrik Wanju Jeonbuk',
    location_ko = '전북 완주시',
    location_en = 'Wanju-si, Jeollabuk-do',
    location_zh = '全罗北道完州市',
    location_id = 'Wanju-si, Jeollabuk-do',
    description_ko = '린코트 적용\n방수 비교 사진 첨부 ',
    description_en = 'RIN-COAT application\nWaterproofing comparison photos attached',
    description_zh = 'RIN-COAT应用\n附防水对比照片',
    description_id = 'Aplikasi RIN-COAT\nFoto perbandingan tahan air terlampir',
    features_ko = '{"린코트 적용","방수, 발유 기능 향상"}',
    features_en = '{"RIN-COAT application","Waterproof and oil-resistant function improvement"}',
    features_zh = '{"RIN-COAT应用","防水、防油功能改善"}',
    features_id = '{"Aplikasi RIN-COAT","Peningkatan fungsi tahan air dan oli"}'
WHERE id = '091f3e65-04a1-47b1-ac40-a8247a60a753';

-- NH농협은행 금융센터 신축 프로젝트 번역
UPDATE "public"."projects" 
SET 
    title_ko = 'NH농협은행 금융센터 신축',
    title_en = 'NH Nonghyup Bank Financial Center New Construction',
    title_zh = 'NH农协银行金融中心新建',
    title_id = 'Konstruksi Baru Pusat Keuangan Bank NH Nonghyup',
    location_ko = '서울 서초구',
    location_en = 'Seocho-gu, Seoul',
    location_zh = '首尔瑞草区',
    location_id = 'Seocho-gu, Seoul',
    description_ko = '린코트 적용',
    description_en = 'RIN-COAT application',
    description_zh = 'RIN-COAT应用',
    description_id = 'Aplikasi RIN-COAT',
    features_ko = '{"린코트 적용","옥상 적용"}',
    features_en = '{"RIN-COAT application","Rooftop application"}',
    features_zh = '{"RIN-COAT应用","屋顶应用"}',
    features_id = '{"Aplikasi RIN-COAT","Aplikasi atap"}'
WHERE id = '0d07db37-00e4-43ba-b916-37447e6b83ea';

-- 홈마트 식자재마트 리모델링 프로젝트 번역
UPDATE "public"."projects" 
SET 
    title_ko = '홈마트 식자재마트 리모델링',
    title_en = 'Home Mart Food Ingredients Mart Remodeling',
    title_zh = '家乐玛食材超市改造',
    title_id = 'Renovasi Mart Bahan Makanan Home Mart',
    location_ko = '경기도 동두천시',
    location_en = 'Dongducheon-si, Gyeonggi-do',
    location_zh = '京畿道东豆川市',
    location_id = 'Dongducheon-si, Gyeonggi-do',
    description_ko = '에폭시 제거 후 린코트 반광 적용',
    description_en = 'RIN-COAT semi-gloss application after epoxy removal',
    description_zh = '去除环氧树脂后应用RIN-COAT半光',
    description_id = 'Aplikasi RIN-COAT semi-gloss setelah pengangkatan epoksi',
    features_ko = '{"린코트 반광 적용","에폭시 제거 리모델링"}',
    features_en = '{"RIN-COAT semi-gloss application","Epoxy removal remodeling"}',
    features_zh = '{"RIN-COAT半光应用","环氧树脂去除改造"}',
    features_id = '{"Aplikasi RIN-COAT semi-gloss","Renovasi pengangkatan epoksi"}'
WHERE id = '21e2c0c1-2325-4a9b-a19b-d7e1b41ee456';

-- (주)상전정공 화성공장 증축 프로젝트 번역
UPDATE "public"."projects" 
SET 
    title_ko = '(주)상전정공 화성공장 증축',
    title_en = 'Sangjeon Precision Hwaseong Factory Extension',
    title_zh = '尚田精工华城工厂扩建',
    title_id = 'Perluasan Pabrik Hwaseong Sangjeon Precision',
    location_ko = '화성시 양감면',
    location_en = 'Yanggam-myeon, Hwaseong-si',
    location_zh = '华城市梁甘面',
    location_id = 'Yanggam-myeon, Hwaseong-si',
    description_ko = '린코트 적용',
    description_en = 'RIN-COAT application',
    description_zh = 'RIN-COAT应用',
    description_id = 'Aplikasi RIN-COAT',
    features_ko = '{"린코트 적용"}',
    features_en = '{"RIN-COAT application"}',
    features_zh = '{"RIN-COAT应用"}',
    features_id = '{"Aplikasi RIN-COAT"}'
WHERE id = '262bb464-1a0f-4e69-8d69-481e98fdef85';

-- 경기도 광주 물류창고 신축 프로젝트 번역
UPDATE "public"."projects" 
SET 
    title_ko = '경기도 광주 물류창고 신축',
    title_en = 'Gyeonggi-do Gwangju Logistics Warehouse New Construction',
    title_zh = '京畿道广州物流仓库新建',
    title_id = 'Konstruksi Baru Gudang Logistik Gwangju Gyeonggi-do',
    location_ko = '경기도 광주시',
    location_en = 'Gwangju-si, Gyeonggi-do',
    location_zh = '京畿道广州市',
    location_id = 'Gwangju-si, Gyeonggi-do',
    description_ko = '린코트 적용',
    description_en = 'RIN-COAT application',
    description_zh = 'RIN-COAT应用',
    description_id = 'Aplikasi RIN-COAT',
    features_ko = '{"린코트 적용","물류창고 적용"}',
    features_en = '{"RIN-COAT application","Logistics warehouse application"}',
    features_zh = '{"RIN-COAT应用","物流仓库应用"}',
    features_id = '{"Aplikasi RIN-COAT","Aplikasi gudang logistik"}'
WHERE id = '294471ca-4823-4223-8f2d-25683434ede6';

-- (주)일화헬스팜 외부주차장 프로젝트 번역
UPDATE "public"."projects" 
SET 
    title_ko = '(주)일화헬스팜 외부주차장',
    title_en = 'Ilhwa Health Farm External Parking Lot',
    title_zh = '一和健康农场外部停车场',
    title_id = 'Tempat Parkir Eksternal Ilhwa Health Farm',
    location_ko = '광주시 북구',
    location_en = 'Buk-gu, Gwangju',
    location_zh = '光州市北区',
    location_id = 'Buk-gu, Gwangju',
    description_ko = '린코트 외부주차장 적용\n보수 없이 면처리 후 린코트 도포',
    description_en = 'RIN-COAT external parking lot application\nRIN-COAT application after surface treatment without repair',
    description_zh = 'RIN-COAT外部停车场应用\n无需修复，表面处理后涂布RIN-COAT',
    description_id = 'Aplikasi tempat parkir eksternal RIN-COAT\nAplikasi RIN-COAT setelah perawatan permukaan tanpa perbaikan',
    features_ko = '{"린코트 적용","외부주차장"}',
    features_en = '{"RIN-COAT application","External parking lot"}',
    features_zh = '{"RIN-COAT应用","外部停车场"}',
    features_id = '{"Aplikasi RIN-COAT","Tempat parkir eksternal"}'
WHERE id = '4892a093-6df2-4119-a5b0-10d0a864a1bb';

-- 나노캠텍(주) 공장 증축 프로젝트 번역
UPDATE "public"."projects" 
SET 
    title_ko = '나노캠텍(주) 공장 증축',
    title_en = 'Nanocamtech Factory Extension',
    title_zh = '纳米坎科技工厂扩建',
    title_id = 'Perluasan Pabrik Nanocamtech',
    location_ko = '경기도 안성시',
    location_en = 'Anseong-si, Gyeonggi-do',
    location_zh = '京畿道安城市',
    location_id = 'Anseong-si, Gyeonggi-do',
    description_ko = '린코트 적용',
    description_en = 'RIN-COAT application',
    description_zh = 'RIN-COAT应用',
    description_id = 'Aplikasi RIN-COAT',
    features_ko = '{"린코트 적용","공장 적용"}',
    features_en = '{"RIN-COAT application","Factory application"}',
    features_zh = '{"RIN-COAT应用","工厂应用"}',
    features_id = '{"Aplikasi RIN-COAT","Aplikasi pabrik"}'
WHERE id = 'adb6630b-9f8c-4bbe-948d-22fec04b54e9';

-- 제주대학교 도서관 프로젝트 번역
UPDATE "public"."projects" 
SET 
    title_ko = '제주대학교 도서관',
    title_en = 'Jeju National University Library',
    title_zh = '济州大学图书馆',
    title_id = 'Perpustakaan Universitas Nasional Jeju',
    location_ko = '제주도 제주시',
    location_en = 'Jeju-si, Jeju-do',
    location_zh = '济州岛济州市',
    location_id = 'Jeju-si, Jeju-do',
    description_ko = '린코트 적용',
    description_en = 'RIN-COAT application',
    description_zh = 'RIN-COAT应用',
    description_id = 'Aplikasi RIN-COAT',
    features_ko = '{"린코트 적용"}',
    features_en = '{"RIN-COAT application"}',
    features_zh = '{"RIN-COAT应用"}',
    features_id = '{"Aplikasi RIN-COAT"}'
WHERE id = '7d1efda8-e8d1-4997-8ff4-db41157f56ca';

-- (주)피엘에스 평택 공장 프로젝트 번역
UPDATE "public"."projects" 
SET 
    title_ko = '(주)피엘에스 평택 공장',
    title_en = 'PLS Pyeongtaek Factory',
    title_zh = 'PLS平泽工厂',
    title_id = 'Pabrik PLS Pyeongtaek',
    location_ko = '경기 평택시',
    location_en = 'Pyeongtaek-si, Gyeonggi-do',
    location_zh = '京畿道平泽市',
    location_id = 'Pyeongtaek-si, Gyeonggi-do',
    description_ko = '린코트 적용',
    description_en = 'RIN-COAT application',
    description_zh = 'RIN-COAT应用',
    description_id = 'Aplikasi RIN-COAT',
    features_ko = '{"린코트 적용","대규모 시공","내구성 강화"}',
    features_en = '{"RIN-COAT application","Large-scale construction","Durability enhancement"}',
    features_zh = '{"RIN-COAT应用","大规模施工","耐久性强化"}',
    features_id = '{"Aplikasi RIN-COAT","Konstruksi skala besar","Peningkatan daya tahan"}'
WHERE id = '9570acd6-aaaa-4f4d-9c2c-db49e2028305';

-- (주)와이원물류 천안 창고 프로젝트 번역
UPDATE "public"."projects" 
SET 
    title_ko = '(주)와이원물류 천안 창고',
    title_en = 'Y1 Logistics Cheonan Warehouse',
    title_zh = 'Y1物流天安仓库',
    title_id = 'Gudang Y1 Logistics Cheonan',
    location_ko = '천안시 신부동',
    location_en = 'Sinbu-dong, Cheonan-si',
    location_zh = '天安市新富洞',
    location_id = 'Sinbu-dong, Cheonan-si',
    description_ko = '린코트 적용',
    description_en = 'RIN-COAT application',
    description_zh = 'RIN-COAT应用',
    description_id = 'Aplikasi RIN-COAT',
    features_ko = '{"린코트 적용","물류창고 시공"}',
    features_en = '{"RIN-COAT application","Logistics warehouse construction"}',
    features_zh = '{"RIN-COAT应用","物流仓库施工"}',
    features_id = '{"Aplikasi RIN-COAT","Konstruksi gudang logistik"}'
WHERE id = 'aa0e891a-4fcd-4186-a3ff-45a271e2370b';

-- 부평국가산업단지 공장 신축 프로젝트 번역
UPDATE "public"."projects" 
SET 
    title_ko = '부평국가산업단지 공장 신축',
    title_en = 'Bupyeong National Industrial Complex Factory New Construction',
    title_zh = '富平国家产业园区工厂新建',
    title_id = 'Konstruksi Baru Pabrik Kompleks Industri Nasional Bupyeong',
    location_ko = '인천 부평구',
    location_en = 'Bupyeong-gu, Incheon',
    location_zh = '仁川富平区',
    location_id = 'Bupyeong-gu, Incheon',
    description_ko = '린코트 적용',
    description_en = 'RIN-COAT application',
    description_zh = 'RIN-COAT应用',
    description_id = 'Aplikasi RIN-COAT',
    features_ko = '{"린코트 적용","제조공장 적용"}',
    features_en = '{"RIN-COAT application","Manufacturing factory application"}',
    features_zh = '{"RIN-COAT应用","制造工厂应用"}',
    features_id = '{"Aplikasi RIN-COAT","Aplikasi pabrik manufaktur"}'
WHERE id = 'ab03919c-ddd3-40cf-b3b6-b22fb82adbc2';

-- 여의도 현대 마에스트로 오피스텔 신축 프로젝트 번역 (중복 데이터 - 2번째)
UPDATE "public"."projects" 
SET 
    title_ko = '여의도 현대 마에스트로 오피스텔 신축',
    title_en = 'Yeouido Hyundai Maestro Officetel New Construction',
    title_zh = '汝矣岛现代大师办公公寓新建',
    title_id = 'Konstruksi Baru Officetel Hyundai Maestro Yeouido',
    location_ko = '서울 영등포구',
    location_en = 'Yeongdeungpo-gu, Seoul',
    location_zh = '首尔永登浦区',
    location_id = 'Yeongdeungpo-gu, Seoul',
    description_ko = '린코트 적용',
    description_en = 'RIN-COAT application',
    description_zh = 'RIN-COAT应用',
    description_id = 'Aplikasi RIN-COAT',
    features_ko = '{"지하주차장 적용","스키드 마크 최소화","내구성 강화"}',
    features_en = '{"Underground parking garage application","Skid mark minimization","Durability enhancement"}',
    features_zh = '{"地下停车场应用","轮胎痕迹最小化","耐久性强化"}',
    features_id = '{"Aplikasi garasi parkir bawah tanah","Minimalisasi bekas ban","Peningkatan daya tahan"}'
WHERE id = 'cf13bd2b-b31e-4fe6-bdf9-8bbdfc8af99d';

-- 완료 메시지
SELECT 'Translation updates completed successfully! Updated ' || 
       (SELECT COUNT(*) FROM products WHERE name_ko IS NOT NULL AND name_en IS NOT NULL) || 
       ' products and ' ||
       (SELECT COUNT(*) FROM projects WHERE title_ko IS NOT NULL AND title_en IS NOT NULL) || 
       ' projects with translations.' as result; 