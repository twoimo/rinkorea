-- Seed product introductions data
INSERT INTO product_introductions (name, description, image_url, icon, features, is_active) VALUES
(
  'RIN-COAT',
  '세라믹계 고분자화합물을 주원료로 개발된 자연경화형 친환경 무기질코팅제입니다. 표면경도, 내마모성, 내화학성, 내열성, 내오염성 등의 물리적, 화학적 특성을 고루 갖춘 콘크리트 표면마감 일액형 세라믹코팅제입니다.',
  '/images/main-18.jpg',
  'paint-brush',
  ARRAY['불연재 인증', '1액형 타입', '표면경도, 내마모성 강화', '친환경 마감 공법'],
  true
),
(
  'RIN-COAT COLOR',
  '다양한 색상을 적용할 수 있는 컬러형 세라믹 코팅제입니다.',
  '/images/main-8.jpg',
  'palette',
  ARRAY['다양한 색상', '미적 효과', '불연 성능', '장기 내구성'],
  true
),
(
  'RIN-HARD PLUS',
  '강화된 성능의 프리미엄 세라믹 코팅제로 최고의 품질을 제공합니다.',
  '/images/main-11.jpg',
  'shield',
  ARRAY['프리미엄 품질', '향상된 강도', '특수 용도', '고성능 불연재'],
  true
),
(
  'RIN-COAT PRIMER',
  '콘크리트 표면의 전처리를 위한 프라이머 코팅제입니다.',
  '/images/main-18.jpg',
  'layer',
  ARRAY['표면 전처리', '접착력 강화', '내구성 향상', '시공성 개선'],
  true
),
(
  'RIN-COAT SEALER',
  '표면 보호와 광택을 위한 상도 실러 코팅제입니다.',
  '/images/main-8.jpg',
  'sparkles',
  ARRAY['표면 보호', '광택 효과', '내구성 강화', '유지관리 용이'],
  true
),
(
  'RIN-COAT ANTI-STATIC',
  '정전기 방지 기능이 추가된 특수 목적 코팅제입니다.',
  '/images/main-11.jpg',
  'zap',
  ARRAY['정전기 방지', '전도성 확보', '안전성 강화', '특수 환경 적합'],
  true
),
(
  'RIN-COAT WATERPROOF',
  '방수 기능이 강화된 특수 코팅제입니다.',
  '/images/main-18.jpg',
  'droplet',
  ARRAY['방수 성능', '내수성 강화', '구조물 보호', '장기 내구성'],
  true
),
(
  'RIN-COAT HEAT-RESIST',
  '고온 환경에 적합한 내열성 코팅제입니다.',
  '/images/main-8.jpg',
  'flame',
  ARRAY['내열성 강화', '온도 저항성', '열화 방지', '특수 환경용'],
  true
),
(
  'RIN-COAT ECO-FRESH',
  '친환경 성능이 더욱 강화된 프리미엄 코팅제입니다.',
  '/images/main-11.jpg',
  'leaf',
  ARRAY['친환경 인증', '무독성', '환경 친화적', '지속가능성'],
  true
),
(
  'RIN-COAT QUICK-SET',
  '빠른 경화가 가능한 속경화형 코팅제입니다.',
  '/images/main-18.jpg',
  'timer',
  ARRAY['빠른 경화', '신속 시공', '조기 강도 발현', '공기 단축'],
  true
),
(
  'RIN-COAT FLEX',
  '유연성이 향상된 탄성 코팅제입니다.',
  '/images/main-8.jpg',
  'waves',
  ARRAY['고탄성', '크랙 저항성', '충격 흡수', '변형 대응'],
  true
),
(
  'RIN-COAT ULTRA-HARD',
  '초고강도 성능을 제공하는 특수 코팅제입니다.',
  '/images/main-11.jpg',
  'diamond',
  ARRAY['초고강도', '내마모성 극대화', '중하중 적용', '산업용 특화'],
  true
); 