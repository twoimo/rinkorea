-- Projects 테이블 번역 업데이트 (Part 1)
-- 한국어/영어/중국어만 작업

-- 전북 완주 공장 신축 프로젝트 번역
UPDATE projects 
SET 
    title_ko = '전북 완주 공장 신축',
    title_en = 'Jeonbuk Wanju Factory New Construction',
    title_zh = '全罗北道完州工厂新建',
    location_ko = '전북 완주시',
    location_en = 'Wanju-si, Jeollabuk-do',
    location_zh = '全罗北道完州市',
    description_ko = '린코트 적용, 방수 비교 사진 첨부',
    description_en = 'RIN-COAT application, waterproofing comparison photos attached',
    description_zh = 'RIN-COAT应用，附防水对比照片',
    features_ko = '{"린코트 적용","방수, 발유 기능 향상"}',
    features_en = '{"RIN-COAT application","Waterproof and oil-resistant function improvement"}',
    features_zh = '{"RIN-COAT应用","防水、防油功能改善"}'
WHERE id = '091f3e65-04a1-47b1-ac40-a8247a60a753';

-- NH농협은행 금융센터 신축 프로젝트 번역
UPDATE projects 
SET 
    title_ko = 'NH농협은행 금융센터 신축',
    title_en = 'NH Nonghyup Bank Financial Center New Construction',
    title_zh = 'NH农协银行金融中心新建',
    location_ko = '서울 서초구',
    location_en = 'Seocho-gu, Seoul',
    location_zh = '首尔瑞草区',
    description_ko = '린코트 적용',
    description_en = 'RIN-COAT application',
    description_zh = 'RIN-COAT应用',
    features_ko = '{"린코트 적용","옥상 적용"}',
    features_en = '{"RIN-COAT application","Rooftop application"}',
    features_zh = '{"RIN-COAT应用","屋顶应用"}'
WHERE id = '0d07db37-00e4-43ba-b916-37447e6b83ea';

-- 홈마트 식자재마트 리모델링 프로젝트 번역
UPDATE projects 
SET 
    title_ko = '홈마트 식자재마트 리모델링',
    title_en = 'Home Mart Food Ingredients Mart Remodeling',
    title_zh = '家乐玛食材超市改造',
    location_ko = '경기도 동두천시',
    location_en = 'Dongducheon-si, Gyeonggi-do',
    location_zh = '京畿道东豆川市',
    description_ko = '에폭시 제거 후 린코트 반광 적용',
    description_en = 'RIN-COAT semi-gloss application after epoxy removal',
    description_zh = '去除环氧树脂后应用RIN-COAT半光',
    features_ko = '{"린코트 반광 적용","에폭시 제거 리모델링"}',
    features_en = '{"RIN-COAT semi-gloss application","Epoxy removal remodeling"}',
    features_zh = '{"RIN-COAT半光应用","环氧树脂去除改造"}'
WHERE id = '21e2c0c1-2325-4a9b-a19b-d7e1b41ee456'; 