-- Seed equipment introductions data
INSERT INTO equipment_introductions (name, description, image_url, icon, features, category, is_active) VALUES
(
  '950GT',
  '최신형 콘크리트 연삭기의 최상위 모델로, 뛰어난 성능과 효율성을 제공합니다.',
  '/images/equipment-1.jpg',
  'settings',
  ARRAY['대형 작업장 적합', '고효율 연삭 성능', '첨단 제어 시스템', '우수한 내구성'],
  'premium',
  true
),
(
  '850GT',
  '중대형 작업장에 최적화된 최신형 콘크리트 연삭기입니다.',
  '/images/equipment-2.jpg',
  'settings',
  ARRAY['중대형 작업장 적합', '안정적인 성능', '사용자 친화적 설계', '효율적인 먼지 제어'],
  'premium',
  true
),
(
  'Falcon',
  '혁신적인 디자인과 성능을 갖춘 최신형 콘크리트 연삭기입니다.',
  '/images/equipment-3.jpg',
  'settings',
  ARRAY['혁신적 디자인', '고급 연마 기능', '정밀한 제어', '다목적 활용'],
  'premium',
  true
),
(
  'PRO950',
  '전문가용 고성능 콘크리트 연삭기로, 안정적인 작업을 보장합니다.',
  '/images/equipment-4.jpg',
  'wrench',
  ARRAY['전문가용 설계', '높은 내구성', '편리한 유지보수', '강력한 연삭력'],
  'professional',
  true
),
(
  'PRO850',
  '중형 작업장에 적합한 전문가용 콘크리트 연삭기입니다.',
  '/images/equipment-5.jpg',
  'wrench',
  ARRAY['중형 작업장 최적화', '균일한 연삭 품질', '손쉬운 조작', '경제적인 유지비용'],
  'professional',
  true
); 