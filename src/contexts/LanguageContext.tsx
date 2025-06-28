/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ko' | 'en' | 'zh';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
    ko: {
        // Navigation
        home: '홈',
        about: '회사소개',
        products: '제품소개',
        equipment: '기계소개',
        shop: '온라인쇼핑몰',
        projects: '시공사례',
        certificates: '시험성적서/인증',
        qna: '고객상담',
        news: '공지사항',
        resources: '자료실',
        contact: '연락처',

        // User menu
        admin: '관리자',
        user: '사용자',
        revenue_management: '매출 관리',
        admin_danger_zone: '관리자 위험구역',
        profile_settings: '프로필 설정',
        login: '로그인',
        logout: '로그아웃',
        welcome: '환영합니다!',
        admin_account: '관리자 계정',

        // Hero Section
        hero_patent: '특허번호 10-2312833',
        hero_trademark: '상표번호 40-1678504',
        hero_title_line1: '친환경 불연재료(1액형)',
        hero_title_line2: '신개념 세라믹 코팅제',
        hero_inquiry_btn: '제품문의',
        hero_purchase_btn: '제품구매',
        hero_projects_btn: '시공사례 보기',
        hero_admin_youtube_edit: '메인 유튜브 영상 링크 편집',
        hero_youtube_placeholder: '유튜브 영상 URL을 입력하세요',
        hero_embed_preview: '변환된 embed URL:',
        hero_save_btn: '저장',
        hero_saving: '저장 중...',
        hero_save_success: '유튜브 링크가 저장되었습니다.',

        // Features Section
        features_title: '린코리아만의',
        features_title_highlight: '특별함',
        features_subtitle: '최고 품질의 세라믹 코팅재로 안전하고 친환경적인 건설 환경을 조성합니다',

        // Feature items
        feature_fire_resistant_title: '불연재 인증',
        feature_fire_resistant_desc: '안전한 순수 무기질 세라믹 코팅제',
        feature_eco_friendly_title: '친환경 마감공법',
        feature_eco_friendly_desc: '환경을 고려한 친환경 1액형 신개념 세라믹 코팅 마감',
        feature_quality_title: '우수한 품질',
        feature_quality_desc: '다양한 시험성적서와 인증을 통해 검증된 품질, 1,000여 현장 적용',
        feature_industrial_title: '산업 적용',
        feature_industrial_desc: '다양한 건설 현장에서 검증된 신뢰성',
        feature_time_saving_title: '공기 단축',
        feature_time_saving_desc: '콘크리트 연마 단계를 획기적으로 단축하여 간편하고 빠른 시공',
        feature_verified_title: '검증된 성능',
        feature_verified_desc: '엄격한 품질 테스트를 통과한 제품',

        // Footer
        footer_company_info: '회사 정보',
        footer_address: '인천광역시 서구 백범로 707 (주안국가산업단지)',
        footer_business_number: '사업자등록번호: 747-42-00526',
        footer_quick_links: '바로가기',
        footer_customer_service: '고객센터',
        footer_social_media: '소셜미디어',
        footer_copyright: '© 2025 RIN Korea. All rights reserved.',

        // About Page
        about_hero_title: '회사소개',
        about_hero_subtitle: '건설재료 제조 전문기업 린코리아는 혁신적인 기술과 품질로 건설업계의 새로운 기준을 제시합니다.',
        about_intro_title: '린코리아 소개',
        about_intro_description: '린코리아는 건설재료와 건설기계 분야에서 혁신적인 솔루션을 제공하는 전문기업으로 성장해왔습니다. 최고의 품질과 기술력으로 고객의 성공을 위한 최적의 파트너가 되겠습니다.',
        about_vision: '비전',
        about_vision_desc: '건설업계 혁신을 선도하는 글로벌 기업',
        about_mission: '미션',
        about_mission_desc: '최고의 품질과 기술로 고객 가치 창조',
        about_core_values: '핵심가치',
        about_core_values_desc: '신뢰, 혁신, 지속가능성',
        about_business_title: '사업영역',
        about_business_subtitle: '린코리아는 건설재료와 건설기계라는 두 개의 핵심 사업을 통해 건설업계 발전을 선도하고 있습니다.',
        about_materials_title: '건설재료사업부',
        about_materials_subtitle: '핵심 사업영역',
        about_materials_desc: '콘크리트 표면 마감 1액형 세라믹 코팅제(불연재료), 방열도료, 특수용도 코팅제 등 최고 품질의 제품을 생산하는 린코리아의 핵심 사업부입니다.',
        about_equipment_title: '건설기계사업부',
        about_equipment_subtitle: 'Shanghai JS Floor Systems 공식 파트너',
        about_equipment_desc: 'Shanghai JS Floor Systems의 공식 파트너로서 한국 공식 판매대리점 및 서비스센터를 운영하고 있습니다. 세계 각국 건설현장에서 사용되는 콘크리트 그라인더 및 폴리셔 시장의 선두주자입니다.',
        about_location_title: '위치 정보',
        about_address_label: '주소',
        about_phone_label: '전화번호',
        about_email_label: '이메일',

        // About Business Items
        about_materials_item1: '콘크리트 표면 강화제/코팅제(실러)',
        about_materials_item2: '특수시멘트/구체방수제(방청)',
        about_materials_item3: '탄성도막방수제/침투식 교면방수제',
        about_materials_item4: '발수제/에폭시 등 전문 제조',
        about_equipment_item1: '건설기계 장비 및 부품 공급',
        about_equipment_item2: '공식 서비스센터 운영 (A/S 지원)',
        about_equipment_item3: '기술 지원 및 컨설팅',
        about_equipment_item4: '합리적인 가격 정책 및 체계적 관리',

        // Common
        loading: '로딩 중...',
        error: '오류',
        success: '성공',
        cancel: '취소',
        confirm: '확인',
        save: '저장',
        edit: '편집',
        delete: '삭제',
        add: '추가',
        search: '검색',
        filter: '필터',
        reset: '재설정',
        select: '선택하세요',
        none: '없음',

        // Language names
        korean: '한국어',
        english: 'English',
        chinese: '中文',

        // Projects Page
        projects_hero_title: '시공사례',
        projects_hero_subtitle: '린코리아의 혁신적인 세라믹 코팅 기술이 적용된 다양한 프로젝트 사례를 확인해보세요.',
        projects_add_btn: '프로젝트 추가',
        projects_no_projects: '등록된 프로젝트가 없습니다.',
        projects_admin_add: '새 프로젝트 추가',
        projects_form_title_add: '프로젝트 추가',
        projects_form_title_edit: '프로젝트 수정',
        projects_form_name: '프로젝트명',
        projects_form_location: '위치',
        projects_form_description: '설명',
        projects_form_image: '이미지 URL',
        projects_form_features: '특징',
        projects_form_category: '카테고리',
        projects_form_add_feature: '새로운 특징을 입력하세요',
        projects_delete_confirm: '정말로 이 프로젝트를 삭제하시겠습니까?',
        projects_delete_title: '프로젝트 삭제',
        projects_saving: '저장 중...',
        projects_view_detail: '자세히 보기',
        projects_various_title: '다양한 프로젝트',
        projects_various_desc: '린코리아 프로젝트 사례',
        projects_delete_error: '프로젝트 삭제에 실패했습니다.',
        projects_delete_success: '프로젝트가 삭제되었습니다.',

        // Equipment Page
        equipment_hero_title: '기계소개',
        equipment_hero_subtitle: '최첨단 콘크리트 연마 기술로 최고의 품질과 효율성을 제공합니다.',
        equipment_add_btn: '기계 추가',
        equipment_partnership_title: 'Shanghai JS Floor Systems 공식 파트너',
        equipment_partnership_desc: 'Shanghai JS Floor Systems의 공식 파트너로서 한국 공식 판매대리점 및 서비스센터를 운영하고 있습니다. 세계적 수준의 건설현장에서 사용되는 콘크리트 그라인더 시장의 선두주자입니다.',
        equipment_partnership_contact: '한국 공식 판매 & 공식 서비스센터 (AS)\n주소: 인천\n문의전화: 032-571-1023',
        equipment_construction_tab: '건설기계',
        equipment_diatool_tab: '다이아몬드 툴',
        equipment_premium_title: '최신형 콘크리트 그라인더',
        equipment_premium_subtitle: '최첨단 기술이 적용된 프리미엄 그라인더 라인업',
        equipment_professional_title: '콘크리트 그라인더',
        equipment_professional_subtitle: '전문가를 위한 고성능 그라인더 시리즈',
        equipment_diatool_title: '다이아몬드 툴',
        equipment_diatool_subtitle: '고품질 다이아몬드 툴 및 액세서리',
        equipment_diatool_empty: '다이아몬드 툴 제품이 준비 중입니다.',
        equipment_diatool_add: '다이아몬드 툴 추가',
        equipment_features_label: '주요 특징:',
        equipment_edit_modal_title: '기계 수정',
        equipment_add_modal_title: '기계 추가',
        equipment_delete_modal_title: '기계 삭제',
        equipment_delete_confirm: '정말로 이 기계를 삭제하시겠습니까?',
        equipment_form_name: '이름',
        equipment_form_description: '설명',
        equipment_form_image: '이미지 URL',
        equipment_form_icon: '아이콘',
        equipment_form_category: '카테고리',
        equipment_form_features: '특징',
        equipment_form_add_feature: '새로운 특징을 입력하세요',
        equipment_saving: '저장 중...',
        equipment_updated_success: '기계가 수정되었습니다.',
        equipment_added_success: '기계가 추가되었습니다.',

        // Products Page
        products_hero_title: '제품소개',
        products_hero_subtitle: '린코리아의 혁신적인 세라믹 코팅재와 친환경 건설재료를 만나보세요.',
        products_add_btn: '제품 추가',
        products_save_success: '제품이 수정되었습니다.',
        products_add_success: '제품이 추가되었습니다.',
        products_error_occurred: '오류가 발생했습니다.',

        // Product Card
        product_card_show: '표시하기',
        product_card_hide: '숨기기',
        product_card_edit: '편집',
        product_card_delete: '삭제',
        product_card_view_detail: '자세히 보기',
        product_card_more_items: '개 더',

        // Product Benefits
        product_benefits_title: '제품의 장점',
        product_benefits_subtitle: '린코리아 세라믹 코팅제가 선택받는 이유',
        product_benefits_fire_resistant_title: '불연재 인증',
        product_benefits_fire_resistant_desc: '안전한 순수 무기질 세라믹 코팅제',
        product_benefits_easy_construction_title: '간편한 시공',
        product_benefits_easy_construction_desc: '1액형으로 간편하게 시공 가능',
        product_benefits_quality_title: '우수한 품질',
        product_benefits_quality_desc: '엄격한 품질 관리를 통한 우수한 품질',
        product_benefits_variety_title: '다양한 선택',
        product_benefits_variety_desc: '용도와 요구사항에 맞는 다양한 제품군',

        // News Page
        news_hero_title: '新闻公告',
        news_hero_subtitle: '查看RIN Korea的最新消息和重要公告。',

        // QnA Page
        qna_hero_title: '客户咨询',
        qna_hero_subtitle: '如果您有任何问题，请随时联系我们。我们的专家将迅速准确地回复。',

        // Resources Page
        resources_hero_title: '자료실',
        resources_hero_subtitle: '린코리아의 제품 카탈로그, 기술자료, 인증서 등 다양한 자료를 확인해보세요.',

        // Shop Page
        shop_hero_title: '온라인 쇼핑몰',
        shop_hero_subtitle: '린코리아 제품을 온라인으로 주문하고 구매할 수 있습니다.',
        shop_add_product: '제품 추가',

        // Shop sorting options
        shop_sort_popularity: '인기도순',
        shop_sort_newest: '최신등록순',
        shop_sort_price_low: '낮은 가격순',
        shop_sort_price_high: '높은 가격순',
        shop_sort_discount: '할인율순',
        shop_sort_sales: '누적 판매순',
        shop_sort_reviews: '리뷰 많은순',
        shop_sort_rating: '평점 높은순',

        // Shop controls
        shop_sort_select: '정렬 방식 선택',
        shop_grid_label: '그리드',
        shop_grid_setting: '그리드 설정',
        shop_grid_apply: '적용',
        shop_grid_applying: '적용 중...',

        // Shop product grid
        reviews: '리뷰',
        currency_won: '원',
        shop_product_out_of_stock: '품절',
        shop_product_buy_now: '구매하기',
        show: '노출 해제',
        hide: '숨기기',

        // Shop product form
        shop_edit_product: '상품 수정',
        close: '닫기',
        shop_form_product_name: '상품명',
        shop_form_description: '설명',
        shop_form_image_url: '이미지 URL 또는 파일명',
        shop_form_image_placeholder: '예: image.jpg 또는 https://example.com/image.jpg',
        shop_form_image_note: '파일명만 입력하면 자동으로 /images/ 경로가 추가됩니다',
        shop_form_price: '판매가(원)',
        shop_form_original_price: '정가(원)',
        shop_form_discount: '할인율(%)',
        shop_form_stock: '재고',
        shop_form_rating: '평점',
        shop_form_reviews: '리뷰 수',
        shop_form_naver_url: '네이버 스토어 URL',
        shop_form_new_product: '신상품',
        shop_form_best_product: '베스트',
        shop_form_saving: '저장 중...',

        // 다국어 폼 관련 추가 번역
        shop_form_basic_info: '기본 정보',
        shop_form_product_names: '제품명 (다국어)',
        shop_form_descriptions: '제품 설명 (다국어)',
        shop_form_price_info: '가격 및 재고 정보',
        shop_form_review_info: '평점 및 리뷰 정보',
        shop_form_product_options: '제품 옵션',
        shop_form_product_name_ko: '제품명 (한국어)',
        shop_form_product_name_en: '제품명 (English)',
        shop_form_product_name_zh: '제품명 (中文)',
        shop_form_product_name_id: '제품명 (Indonesia)',
        shop_form_description_ko: '설명 (한국어)',
        shop_form_description_en: '설명 (English)',
        shop_form_description_zh: '설명 (中文)',
        shop_form_description_id: '설명 (Indonesia)',

        // Shop delete modal
        shop_delete_title: '상품 삭제',
        shop_delete_confirm: '정말로',
        shop_delete_confirm_product: '상품을 삭제하시겠습니까?',
        shop_deleting: '삭제 중...',

        // Success messages
        saved_success: '저장되었습니다.',
        shop_deleted_success: '삭제되었습니다.',

        // Certificates Page
        certificates_hero_title: '시험성적서/인증',
        certificates_hero_subtitle: '린코리아 제품의 품질과 안전성을 증명하는 시험성적서와 인증서를 확인해보세요.',

        // Company Overview Section
        company_overview_title_reliable: '신뢰할 수 있는',
        company_overview_title_partner: '파트너',
        company_overview_description: '린코리아는 건설재료사업부와 2024년 신설된 건설기계사업부를 통해 종합적인 건설 솔루션을 제공합니다.',
        company_overview_location_label: '본사 위치',
        company_overview_location_value: '인천광역시 서구 백범로 707 (주안국가산업단지)\n천안 테크노파크 산업단지 입주예정 (2026~)',
        company_overview_business_number_label: '사업자등록번호',
        company_overview_business_number_value: '747-42-00526',
        company_overview_business_division_label: '사업부문',
        company_overview_business_division_value: '건설재료사업부 / 건설기계사업부',
        company_overview_learn_more: '회사소개 자세히 보기',
        company_overview_contact: '연락하기',

        // Profile Page
        profile_subtitle: '회원정보를 확인하고 수정할 수 있습니다.',
        profile_name: '이름',
        profile_email: '이메일',
        profile_company: '회사명',
        profile_phone: '연락처',
        profile_phone_error: '전화번호 형식이 올바르지 않습니다. 예: 010-1234-5678',
        profile_password_change: '비밀번호 변경',
        profile_current_password: '현재 비밀번호',
        profile_new_password: '새 비밀번호',
        profile_confirm_password: '새 비밀번호 확인',
        profile_password_warning: '비밀번호를 잊어버리면 복구할 수 없으니 안전한 곳에 보관해주세요.',
        profile_save: '저장',
        profile_saving: '저장 중...',
        profile_account_delete: '계정 탈퇴',
        profile_account_delete_warning: '계정을 탈퇴하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.',
        profile_account_delete_confirm_title: '계정 탈퇴 확인',
        profile_account_delete_confirm_message: '정말로 계정을 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없으며, 모든 데이터가 영구적으로 삭제됩니다.',
        profile_update_success: '프로필이 성공적으로 저장되었습니다.',
        profile_update_failed: '프로필 업데이트 실패',
        profile_password_all_required: '모든 항목을 입력해주세요.',
        profile_password_mismatch: '새 비밀번호가 일치하지 않습니다.',
        profile_password_min_length: '비밀번호는 8자 이상이어야 합니다.',
        profile_password_current_invalid: '현재 비밀번호가 올바르지 않습니다.',
        profile_password_change_failed: '비밀번호 변경에 실패했습니다. 다시 시도해주세요.',
        profile_password_change_success: '비밀번호가 성공적으로 변경되었습니다.',
        profile_delete_success: '계정이 성공적으로 삭제되었습니다.',
        profile_delete_failed: '계정 탈퇴 실패',

        // QnA specific
        qna_status_answered: '답변완료',
        qna_status_pending: '답변대기',
        qna_filter_all: '전체',
        qna_private_question: '비공개 질문',
        qna_delete_confirm: '정말로 이 질문을 삭제하시겠습니까?',
        show_content: '내용 보기',
        hide_content: '내용 숨기기',
        anonymous: '익명',
    },
    en: {
        // Navigation
        home: 'Home',
        about: 'About Us',
        products: 'Products',
        equipment: 'Equipment',
        shop: 'Online Store',
        projects: 'Projects',
        certificates: 'Certificates',
        qna: 'Q&A',
        news: 'News',
        resources: 'Resources',
        contact: 'Contact',

        // User menu
        admin: 'Admin',
        user: 'User',
        revenue_management: 'Revenue Management',
        admin_danger_zone: 'Admin Danger Zone',
        profile_settings: 'Profile Settings',
        login: 'Login',
        logout: 'Logout',
        welcome: 'Welcome!',
        admin_account: 'Admin Account',

        // Hero Section
        hero_patent: 'Patent No. 10-2312833',
        hero_trademark: 'Trademark No. 40-1678504',
        hero_title_line1: 'Eco-friendly Fire-resistant',
        hero_title_line2: 'New Ceramic Coating Material',
        hero_inquiry_btn: 'Product Inquiry',
        hero_purchase_btn: 'Purchase Products',
        hero_projects_btn: 'View Projects',
        hero_admin_youtube_edit: 'Edit Main YouTube Video Link',
        hero_youtube_placeholder: 'Enter YouTube video URL',
        hero_embed_preview: 'Converted embed URL:',
        hero_save_btn: 'Save',
        hero_saving: 'Saving...',
        hero_save_success: 'YouTube link has been saved.',

        // Features Section
        features_title: 'What Makes',
        features_title_highlight: 'RIN Korea Special',
        features_subtitle: 'Creating a safe and eco-friendly construction environment with the highest quality ceramic coating materials',

        // Feature items
        feature_fire_resistant_title: 'Fire-resistant Certification',
        feature_fire_resistant_desc: 'Safe pure inorganic ceramic coating material',
        feature_eco_friendly_title: 'Eco-friendly Finishing Method',
        feature_eco_friendly_desc: 'Environmentally friendly one-component new ceramic coating finish',
        feature_quality_title: 'Excellent Quality',
        feature_quality_desc: 'Quality verified through various test reports and certifications, applied in over 1,000 sites',
        feature_industrial_title: 'Industrial Application',
        feature_industrial_desc: 'Reliability proven in various construction sites',
        feature_time_saving_title: 'Time Saving',
        feature_time_saving_desc: 'Dramatically shortens concrete polishing steps for simple and rapid construction',
        feature_verified_title: 'Verified Performance',
        feature_verified_desc: 'Products that have passed rigorous quality testing',

        // Footer
        footer_company_info: 'Company Information',
        footer_address: 'Incheon, Seo-gu, Baekbeom-ro 707 (Juan National Industrial Complex)',
        footer_business_number: 'Business Registration Number: 747-42-00526',
        footer_quick_links: 'Quick Links',
        footer_customer_service: 'Customer Service',
        footer_social_media: 'Social Media',
        footer_copyright: '© 2025 RIN Korea. All rights reserved.',

        // About Page
        about_hero_title: 'About Us',
        about_hero_subtitle: 'RIN Korea, a specialized construction materials manufacturing company, sets new standards in the construction industry with innovative technology and quality.',
        about_intro_title: 'RIN Korea Introduction',
        about_intro_description: 'RIN Korea has grown as a specialized company providing innovative solutions in the fields of construction materials and construction machinery. We will be the optimal partner for our customers\' success with the highest quality and technology.',
        about_vision: 'Vision',
        about_vision_desc: 'A global company leading innovation in the construction industry',
        about_mission: 'Mission',
        about_mission_desc: 'Creating customer value with the highest quality and technology',
        about_core_values: 'Core Values',
        about_core_values_desc: 'Trust, Innovation, Sustainability',
        about_business_title: 'Business Areas',
        about_business_subtitle: 'RIN Korea is leading the development of the construction industry through two core businesses: construction materials and construction machinery.',
        about_materials_title: 'Construction Materials Division',
        about_materials_subtitle: 'Core Business Area',
        about_materials_desc: 'This is RIN Korea\'s core business division that produces the highest quality products such as concrete surface finishing one-component ceramic coatings (fire-resistant materials), heat-resistant paints, and special-purpose coatings.',
        about_equipment_title: 'Construction Equipment Division',
        about_equipment_subtitle: 'Shanghai JS Floor Systems Official Partner',
        about_equipment_desc: 'As an official partner of Shanghai JS Floor Systems, we operate the official sales agency and service center in Korea. We are leaders in the concrete grinder and polisher market used at construction sites worldwide.',
        about_location_title: 'Location',
        about_address_label: 'Address',
        about_phone_label: 'Phone',
        about_email_label: 'Email',

        // About Business Items
        about_materials_item1: 'Concrete Surface Hardener/Coating (Silica)',
        about_materials_item2: 'Special Cement/Concrete Waterproofing (Waterproof)',
        about_materials_item3: 'Elastic Bond Waterproofing/Penetrating Waterproofing',
        about_materials_item4: 'Spray Waterproofing/Epoxy, etc. Special Manufacturing',
        about_equipment_item1: 'Construction Equipment and Parts Supply',
        about_equipment_item2: 'Official Service Center Operation (A/S Support)',
        about_equipment_item3: 'Technical Support and Consulting',
        about_equipment_item4: 'Reasonable Price Policy and Systematic Management',

        // Common
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        cancel: 'Cancel',
        confirm: 'Confirm',
        save: 'Save',
        edit: 'Edit',
        delete: 'Delete',
        add: 'Add',
        search: 'Search',
        filter: 'Filter',
        reset: 'Reset',
        select: 'Please select',
        none: 'None',

        // Language names
        korean: '한국어',
        english: 'English',
        chinese: '中文',

        // Projects Page
        projects_hero_title: 'Projects',
        projects_hero_subtitle: 'Discover various project cases where RIN Korea\'s innovative ceramic coating technology has been applied.',
        projects_add_btn: 'Add Project',
        projects_no_projects: 'No registered projects.',
        projects_admin_add: 'Add New Project',
        projects_form_title_add: 'Add Project',
        projects_form_title_edit: 'Edit Project',
        projects_form_name: 'Project Name',
        projects_form_location: 'Location',
        projects_form_description: 'Description',
        projects_form_image: 'Image URL',
        projects_form_features: 'Features',
        projects_form_category: 'Category',
        projects_form_add_feature: 'Enter a new feature',
        projects_delete_confirm: 'Are you sure you want to delete this project?',
        projects_delete_title: 'Delete Project',
        projects_saving: 'Saving...',
        projects_view_detail: 'View Details',
        projects_various_title: 'Various Projects',
        projects_various_desc: 'RIN Korea Project Cases',
        projects_delete_error: 'Failed to delete project.',
        projects_delete_success: 'Project has been deleted.',

        // Equipment Page
        equipment_hero_title: 'Equipment Introduction',
        equipment_hero_subtitle: 'Providing the highest quality and efficiency with state-of-the-art concrete grinding technology.',
        equipment_add_btn: 'Add Equipment',
        equipment_partnership_title: 'Shanghai JS Floor Systems Official Partner',
        equipment_partnership_desc: 'As an official partner of Shanghai JS Floor Systems, we operate the official sales agency and service center in Korea. We are leaders in the concrete grinder market used at world-class construction sites.',
        equipment_partnership_contact: 'Korea Official Sales & Official Service Center (AS)\nAddress: Incheon\nInquiry Phone: 032-571-1023',
        equipment_construction_tab: 'Construction Equipment',
        equipment_diatool_tab: 'Diamond Tools',
        equipment_premium_title: 'Latest Concrete Grinders',
        equipment_premium_subtitle: 'Premium grinder lineup with cutting-edge technology',
        equipment_professional_title: 'Concrete Grinders',
        equipment_professional_subtitle: 'High-performance grinder series for professionals',
        equipment_diatool_title: 'Diamond Tools',
        equipment_diatool_subtitle: 'High-quality diamond tools and accessories',
        equipment_diatool_empty: 'Diamond tool products are coming soon.',
        equipment_diatool_add: 'Add Diamond Tool',
        equipment_features_label: 'Key Features:',
        equipment_edit_modal_title: 'Edit Equipment',
        equipment_add_modal_title: 'Add Equipment',
        equipment_delete_modal_title: 'Delete Equipment',
        equipment_delete_confirm: 'Are you sure you want to delete this equipment?',
        equipment_form_name: 'Name',
        equipment_form_description: 'Description',
        equipment_form_image: 'Image URL',
        equipment_form_icon: 'Icon',
        equipment_form_category: 'Category',
        equipment_form_features: 'Features',
        equipment_form_add_feature: 'Enter a new feature',
        equipment_saving: 'Saving...',
        equipment_updated_success: 'Equipment has been updated.',
        equipment_added_success: 'Equipment has been added.',

        // Products Page
        products_hero_title: 'Products',
        products_hero_subtitle: 'Discover RIN Korea\'s innovative ceramic coating materials and eco-friendly construction materials.',
        products_add_btn: 'Add Product',
        products_save_success: 'Product has been updated.',
        products_add_success: 'Product has been added.',
        products_error_occurred: 'An error occurred.',

        // Product Card
        product_card_show: 'Show',
        product_card_hide: 'Hide',
        product_card_edit: 'Edit',
        product_card_delete: 'Delete',
        product_card_view_detail: 'View Details',
        product_card_more_items: ' more',

        // Product Benefits
        product_benefits_title: 'Product Benefits',
        product_benefits_subtitle: 'Why RIN Korea Ceramic Coatings Are Chosen',
        product_benefits_fire_resistant_title: 'Fire-resistant Certification',
        product_benefits_fire_resistant_desc: 'Safe pure inorganic ceramic coating material',
        product_benefits_easy_construction_title: 'Easy Construction',
        product_benefits_easy_construction_desc: 'Easy construction with one-component system',
        product_benefits_quality_title: 'Excellent Quality',
        product_benefits_quality_desc: 'Excellent quality through strict quality control',
        product_benefits_variety_title: 'Various Options',
        product_benefits_variety_desc: 'Various product lines for different purposes and requirements',

        // News Page
        news_hero_title: 'News',
        news_hero_subtitle: 'Check the latest news and important announcements from RIN Korea.',

        // QnA Page
        qna_hero_title: 'Customer Support',
        qna_hero_subtitle: 'If you have any questions, please feel free to contact us anytime. Our experts will respond quickly and accurately.',

        // Resources Page
        resources_hero_title: 'Resources',
        resources_hero_subtitle: 'Check various materials such as RIN Korea\'s product catalogs, technical data, and certificates.',

        // Shop Page
        shop_hero_title: 'Online Store',
        shop_hero_subtitle: 'You can order and purchase RIN Korea products online.',
        shop_add_product: 'Add Product',

        // Shop sorting options
        shop_sort_popularity: 'By Popularity',
        shop_sort_newest: 'Newest First',
        shop_sort_price_low: 'Price: Low to High',
        shop_sort_price_high: 'Price: High to Low',
        shop_sort_discount: 'By Discount',
        shop_sort_sales: 'By Sales',
        shop_sort_reviews: 'Most Reviewed',
        shop_sort_rating: 'Highest Rated',

        // Shop controls
        shop_sort_select: 'Select Sort Option',
        shop_grid_label: 'Grid',
        shop_grid_setting: 'Grid Setting',
        shop_grid_apply: 'Apply',
        shop_grid_applying: 'Applying...',

        // Shop product grid
        reviews: 'Reviews',
        currency_won: '',
        shop_product_out_of_stock: 'Out of Stock',
        shop_product_buy_now: 'Buy Now',
        show: 'Show',
        hide: 'Hide',

        // Shop product form
        shop_edit_product: 'Edit Product',
        close: 'Close',
        shop_form_product_name: 'Product Name',
        shop_form_description: 'Description',
        shop_form_image_url: 'Image URL or Filename',
        shop_form_image_placeholder: 'e.g. image.jpg or https://example.com/image.jpg',
        shop_form_image_note: 'If you enter only filename, /images/ path will be added automatically',
        shop_form_price: 'Price',
        shop_form_original_price: 'Original Price',
        shop_form_discount: 'Discount (%)',
        shop_form_stock: 'Stock',
        shop_form_rating: 'Rating',
        shop_form_reviews: 'Review Count',
        shop_form_naver_url: 'Naver Store URL',
        shop_form_new_product: 'New Product',
        shop_form_best_product: 'Best Seller',
        shop_form_saving: 'Saving...',

        // Shop delete modal
        shop_delete_title: 'Delete Product',
        shop_delete_confirm: 'Are you sure you want to delete',
        shop_delete_confirm_product: 'product?',
        shop_deleting: 'Deleting...',

        // Success messages
        saved_success: 'Saved successfully.',
        shop_deleted_success: 'Deleted successfully.',

        // Certificates Page
        certificates_hero_title: 'Certificates',
        certificates_hero_subtitle: 'Check test reports and certifications that prove the quality and safety of RIN Korea products.',

        // Company Overview Section
        company_overview_title_reliable: 'Reliable',
        company_overview_title_partner: 'Partner',
        company_overview_description: 'RIN Korea provides comprehensive construction solutions through its Construction Materials and Construction Machinery divisions.',
        company_overview_location_label: 'Headquarters Location',
        company_overview_location_value: 'Incheon, South Korea\nTechnopark Inju (expected completion: 2026)',
        company_overview_business_number_label: 'Business Registration Number',
        company_overview_business_number_value: '747-42-00526',
        company_overview_business_division_label: 'Business Division',
        company_overview_business_division_value: 'Construction Materials / Construction Machinery',
        company_overview_learn_more: 'Learn More',
        company_overview_contact: 'Contact Us',

        // Profile Page
        profile_subtitle: 'You can check and modify your member information.',
        profile_name: 'Name',
        profile_email: 'Email',
        profile_company: 'Company Name',
        profile_phone: 'Contact',
        profile_phone_error: 'Invalid phone number format. Example: 010-1234-5678',
        profile_password_change: 'Password Change',
        profile_current_password: 'Current Password',
        profile_new_password: 'New Password',
        profile_confirm_password: 'New Password Confirm',
        profile_password_warning: 'If you forget your password, you will not be able to recover it. Please keep it safe.',
        profile_save: 'Save',
        profile_saving: 'Saving...',
        profile_account_delete: 'Account Withdrawal',
        profile_account_delete_warning: 'If you withdraw your account, all data will be permanently deleted and cannot be recovered.',
        profile_account_delete_confirm_title: 'Account Withdrawal Confirmation',
        profile_account_delete_confirm_message: 'Are you sure you want to withdraw your account? This operation cannot be undone and all data will be permanently deleted.',
        profile_update_success: 'Profile has been successfully saved.',
        profile_update_failed: 'Profile update failed',
        profile_password_all_required: 'Please fill in all fields.',
        profile_password_mismatch: 'New passwords do not match.',
        profile_password_min_length: 'Password must be at least 8 characters long.',
        profile_password_current_invalid: 'Current password is invalid.',
        profile_password_change_failed: 'Password change failed. Please try again.',
        profile_password_change_success: 'Password has been successfully changed.',
        profile_delete_success: 'Account has been successfully deleted.',
        profile_delete_failed: 'Account withdrawal failed',

        // QnA specific
        qna_status_answered: 'Answered',
        qna_status_pending: 'Pending',
        qna_filter_all: 'All',
        qna_private_question: 'Private Question',
        qna_delete_confirm: 'Are you sure you want to delete this question?',
        show_content: 'Show Content',
        hide_content: 'Hide Content',
        anonymous: 'Anonymous',
    },
    zh: {
        // Navigation
        home: '首页',
        about: '关于我们',
        products: '产品介绍',
        equipment: '设备介绍',
        shop: '在线商店',
        projects: '施工案例',
        certificates: '证书',
        qna: '客户咨询',
        news: '新闻公告',
        resources: '资料库',
        contact: '联系我们',

        // User menu
        admin: '管理员',
        user: '用户',
        revenue_management: '营收管理',
        admin_danger_zone: '管理员危险区',
        profile_settings: '个人资料设置',
        login: '登录',
        logout: '退出登录',
        welcome: '欢迎！',
        admin_account: '管理员账户',

        // Hero Section
        hero_patent: '专利号 10-2312833',
        hero_trademark: '商标号 40-1678504',
        hero_title_line1: '环保阻燃材料(单组分)',
        hero_title_line2: '新型陶瓷涂料',
        hero_inquiry_btn: '产品咨询',
        hero_purchase_btn: '购买产品',
        hero_projects_btn: '查看施工案例',
        hero_admin_youtube_edit: '编辑主要YouTube视频链接',
        hero_youtube_placeholder: '输入YouTube视频地址',
        hero_embed_preview: '转换后的嵌入地址：',
        hero_save_btn: '保存',
        hero_saving: '保存中...',
        hero_save_success: 'YouTube链接已保存。',

        // Features Section
        features_title: 'RIN Korea的',
        features_title_highlight: '特色之处',
        features_subtitle: '以最高品质的陶瓷涂料创造安全环保的建筑环境',

        // Feature items
        feature_fire_resistant_title: '阻燃认证',
        feature_fire_resistant_desc: '安全的纯无机陶瓷涂料',
        feature_eco_friendly_title: '环保施工工艺',
        feature_eco_friendly_desc: '考虑环境的环保型单组分新型陶瓷涂料',
        feature_quality_title: '优秀品质',
        feature_quality_desc: '通过各种测试报告和认证，在1000多个现场应用中验证的品质',
        feature_industrial_title: '工业应用',
        feature_industrial_desc: '在各种建筑现场验证的可靠性',
        feature_time_saving_title: '缩短工期',
        feature_time_saving_desc: '大幅缩短混凝土抛光步骤，实现简便快速施工',
        feature_verified_title: '验证性能',
        feature_verified_desc: '通过严格质量测试的产品',

        // Footer
        footer_company_info: '公司信息',
        footer_address: '仁川广域市西区白凡路707号 (注安国家产业园区)',
        footer_business_number: '营业执照号码: 747-42-00526',
        footer_quick_links: '快速链接',
        footer_customer_service: '客户服务',
        footer_social_media: '社交媒体',
        footer_copyright: '© 2025 RIN Korea. 版权所有.',

        // About Page
        about_hero_title: '关于我们',
        about_hero_subtitle: 'RIN Korea是建筑材料制造专业企业，以创新技术和品质为建筑行业树立新标准。',
        about_intro_title: 'RIN Korea 介绍',
        about_intro_description: 'RIN Korea在建筑材料和建筑机械领域提供创新解决方案，已发展成为专业企业。我们将以最高的品质和技术力成为客户成功的最佳合作伙伴。',
        about_vision: '愿景',
        about_vision_desc: '引领建筑行业创新的全球企业',
        about_mission: '使命',
        about_mission_desc: '以最高品质和技术创造客户价值',
        about_core_values: '核心价值',
        about_core_values_desc: '信任、创新、可持续性',
        about_business_title: '业务领域',
        about_business_subtitle: 'RIN Korea通过建筑材料和建筑机械两大核心业务引领建筑行业发展。',
        about_materials_title: '建筑材料事业部',
        about_materials_subtitle: '核心业务领域',
        about_materials_desc: '生产混凝土表面装饰单组分陶瓷涂料(阻燃材料)、防热涂料、特殊用途涂料等最高品质产品的RIN Korea核心事业部。',
        about_equipment_title: '建筑机械事业部',
        about_equipment_subtitle: 'Shanghai JS Floor Systems 官方合作伙伴',
        about_equipment_desc: '作为Shanghai JS Floor Systems的官方合作伙伴，运营韩国官方销售代理店和服务中心。是在全球建筑现场使用的混凝土研磨机和抛光机市场的领导者。',
        about_location_title: '地址信息',
        about_address_label: '地址',
        about_phone_label: '电话',
        about_email_label: '邮箱',

        // About Business Items
        about_materials_item1: '混凝土表面硬化剂/涂料(硅)',
        about_materials_item2: '特殊水泥/混凝土防水剂(防水)',
        about_materials_item3: '弹性膜防水剂/渗透性防水剂',
        about_materials_item4: '喷涂防水剂/环氧树脂等特殊制造',
        about_equipment_item1: '建筑设备和部件供应',
        about_equipment_item2: '官方服务中心运营(A/S支持)',
        about_equipment_item3: '技术支持和咨询',
        about_equipment_item4: '合理的定价政策和系统管理',

        // Common
        loading: '加载中...',
        error: '错误',
        success: '成功',
        cancel: '取消',
        confirm: '确认',
        save: '保存',
        edit: '编辑',
        delete: '删除',
        add: '添加',
        search: '搜索',
        filter: '筛选',
        reset: '重置',
        select: '请选择',
        none: '无',

        // Language names
        korean: '한국어',
        english: 'English',
        chinese: '中文',

        // Projects Page
        projects_hero_title: '施工案例',
        projects_hero_subtitle: '查看RIN Korea创新陶瓷涂料技术应用的各种项目案例。',
        projects_add_btn: '添加项目',
        projects_no_projects: '没有注册的项目。',
        projects_admin_add: '添加新项目',
        projects_form_title_add: '添加项目',
        projects_form_title_edit: '编辑项目',
        projects_form_name: '项目名称',
        projects_form_location: '位置',
        projects_form_description: '描述',
        projects_form_image: '图片URL',
        projects_form_features: '特征',
        projects_form_category: '类别',
        projects_form_add_feature: '输入新特征',
        projects_delete_confirm: '确定要删除此项目吗？',
        projects_delete_title: '删除项目',
        projects_saving: '保存中...',
        projects_view_detail: '查看详情',
        projects_various_title: '各种项目',
        projects_various_desc: 'RIN Korea项目案例',
        projects_delete_error: '删除项目失败。',
        projects_delete_success: '项目已删除。',

        // Equipment Page
        equipment_hero_title: '建筑设备介绍',
        equipment_hero_subtitle: '以最先进的混凝土研磨技术提供最高品质和效率。',
        equipment_add_btn: '添加设备',
        equipment_partnership_title: 'Shanghai JS Floor Systems 官方合作伙伴',
        equipment_partnership_desc: '作为Shanghai JS Floor Systems的官方合作伙伴，运营韩国官方销售代理店和服务中心。是在世界级建筑现场使用的混凝土研磨机市场的领导者。',
        equipment_partnership_contact: '韩国官方销售 & 官方服务中心(AS)\n地址: 仁川\n咨询电话: 032-571-1023',
        equipment_construction_tab: '建筑设备',
        equipment_diatool_tab: '钻石工具',
        equipment_premium_title: '最新型混凝土研磨机',
        equipment_premium_subtitle: '应用最先进技术的高端研磨机产品线',
        equipment_professional_title: '混凝土研磨机',
        equipment_professional_subtitle: '专业人士专用高性能研磨机系列',
        equipment_diatool_title: '钻石工具',
        equipment_diatool_subtitle: '高品质钻石工具及配件',
        equipment_diatool_empty: '钻石工具产品正在准备中。',
        equipment_diatool_add: '添加钻石工具',
        equipment_features_label: '主要特征:',
        equipment_edit_modal_title: '编辑设备',
        equipment_add_modal_title: '添加设备',
        equipment_delete_modal_title: '删除设备',
        equipment_delete_confirm: '确定要删除此设备吗？',
        equipment_form_name: '名称',
        equipment_form_description: '描述',
        equipment_form_image: '图片URL',
        equipment_form_icon: '图标',
        equipment_form_category: '类别',
        equipment_form_features: '特征',
        equipment_form_add_feature: '输入新特征',
        equipment_saving: '保存中...',
        equipment_updated_success: '设备已更新。',
        equipment_added_success: '设备已添加。',

        // Products Page
        products_hero_title: '产品介绍',
        products_hero_subtitle: '探索RIN Korea的创新陶瓷涂料材料和环保建筑材料。',
        products_add_btn: '添加产品',
        products_save_success: '产品已更新。',
        products_add_success: '产品已添加。',
        products_error_occurred: '发生错误。',

        // Product Card
        product_card_show: '显示',
        product_card_hide: '隐藏',
        product_card_edit: '编辑',
        product_card_delete: '删除',
        product_card_view_detail: '查看详情',
        product_card_more_items: '个更多',

        // Product Benefits
        product_benefits_title: '产品优势',
        product_benefits_subtitle: 'RIN Korea陶瓷涂料被选择的理由',
        product_benefits_fire_resistant_title: '阻燃认证',
        product_benefits_fire_resistant_desc: '安全的纯无机陶瓷涂料',
        product_benefits_easy_construction_title: '施工简便',
        product_benefits_easy_construction_desc: '单组分系统，施工简便',
        product_benefits_quality_title: '优异品质',
        product_benefits_quality_desc: '通过严格的质量控制保证优异品质',
        product_benefits_variety_title: '多样选择',
        product_benefits_variety_desc: '满足不同用途和要求的多样化产品线',

        // News Page
        news_hero_title: '新闻公告',
        news_hero_subtitle: '查看RIN Korea的最新消息和重要公告。',

        // QnA Page
        qna_hero_title: '客户咨询',
        qna_hero_subtitle: '如果您有任何问题，请随时联系我们。我们的专家将迅速准确地回复。',

        // Resources Page
        resources_hero_title: '资料库',
        resources_hero_subtitle: '查看RIN Korea的产品目录、技术资料、证书等各种材料。',

        // Shop Page
        shop_hero_title: '在线商店',
        shop_hero_subtitle: '您可以在线订购和购买RIN Korea产品。',
        shop_add_product: '添加产品',

        // Shop sorting options
        shop_sort_popularity: '按人气排序',
        shop_sort_newest: '最新注册顺序',
        shop_sort_price_low: '价格：低到高',
        shop_sort_price_high: '价格：高到低',
        shop_sort_discount: '按折扣排序',
        shop_sort_sales: '按销量排序',
        shop_sort_reviews: '评论最多',
        shop_sort_rating: '评分最高',

        // Shop controls
        shop_sort_select: '选择排序方式',
        shop_grid_label: '网格',
        shop_grid_setting: '网格设置',
        shop_grid_apply: '应用',
        shop_grid_applying: '应用中...',

        // Shop product grid
        reviews: '评论',
        currency_won: '元',
        shop_product_out_of_stock: '缺货',
        shop_product_buy_now: '立即购买',
        show: '显示',
        hide: '隐藏',

        // Shop product form
        shop_edit_product: '编辑商品',
        close: '关闭',
        shop_form_product_name: '商品名称',
        shop_form_description: '描述',
        shop_form_image_url: '图片URL或文件名',
        shop_form_image_placeholder: '例如：image.jpg 或 https://example.com/image.jpg',
        shop_form_image_note: '如果只输入文件名，将自动添加 /images/ 路径',
        shop_form_price: '售价',
        shop_form_original_price: '原价',
        shop_form_discount: '折扣 (%)',
        shop_form_stock: '库存',
        shop_form_rating: '评分',
        shop_form_reviews: '评论数',
        shop_form_naver_url: 'Naver商店URL',
        shop_form_new_product: '新产品',
        shop_form_best_product: '热销产品',
        shop_form_saving: '保存中...',

        // 다국어 폼 관련 추가 번역
        shop_form_basic_info: '基本信息',
        shop_form_product_names: '产品名称 (多语言)',
        shop_form_descriptions: '产品描述 (多语言)',
        shop_form_price_info: '价格及库存信息',
        shop_form_review_info: '评分及评论信息',
        shop_form_product_options: '产品选项',
        shop_form_product_name_ko: '产品名称 (韩语)',
        shop_form_product_name_en: '产品名称 (英语)',
        shop_form_product_name_zh: '产品名称 (中文)',
        shop_form_product_name_id: '产品名称 (印尼语)',
        shop_form_description_ko: '描述 (韩语)',
        shop_form_description_en: '描述 (英语)',
        shop_form_description_zh: '描述 (中文)',
        shop_form_description_id: '描述 (印尼语)',

        // Shop delete modal
        shop_delete_title: '删除商品',
        shop_delete_confirm: '确定要删除',
        shop_delete_confirm_product: '商品吗？',
        shop_deleting: '删除中...',

        // Success messages
        saved_success: '保存成功。',
        shop_deleted_success: '删除成功。',

        // Certificates Page
        certificates_hero_title: '证书',
        certificates_hero_subtitle: '查看证明RIN Korea产品质量和安全性的测试报告和认证。',

        // Company Overview Section
        company_overview_title_reliable: '可靠的',
        company_overview_title_partner: '合作伙伴',
        company_overview_description: 'RIN Korea通过建筑材料和建筑机械两大核心业务，提供全面的建筑解决方案。',
        company_overview_location_label: '总部位置',
        company_overview_location_value: '韩国仁川\n仁川技术园区Inju (预计完成时间: 2026年)',
        company_overview_business_number_label: '商业注册号',
        company_overview_business_number_value: '747-42-00526',
        company_overview_business_division_label: '业务部门',
        company_overview_business_division_value: '建筑材料 / 建筑机械',
        company_overview_learn_more: '了解更多',
        company_overview_contact: '联系我们',

        // Profile Page
        profile_subtitle: '您可以检查和修改您的会员信息。',
        profile_name: '姓名',
        profile_email: '电子邮件',
        profile_company: '公司名称',
        profile_phone: '联系',
        profile_phone_error: '无效的电话号码格式。例如：010-1234-5678',
        profile_password_change: '密码更改',
        profile_current_password: '当前密码',
        profile_new_password: '新密码',
        profile_confirm_password: '新密码确认',
        profile_password_warning: '如果您忘记密码，将无法恢复。请将其安全保存。',
        profile_save: '保存',
        profile_saving: '保存中...',
        profile_account_delete: '账户注销',
        profile_account_delete_warning: '如果您注销账户，所有数据将被永久删除且无法恢复。',
        profile_account_delete_confirm_title: '账户注销确认',
        profile_account_delete_confirm_message: '您确定要注销账户吗？此操作无法撤销且所有数据将被永久删除。',
        profile_update_success: '个人资料已成功保存。',
        profile_update_failed: '个人资料更新失败',
        profile_password_all_required: '请填写所有字段。',
        profile_password_mismatch: '新密码不匹配。',
        profile_password_min_length: '密码必须至少为8个字符。',
        profile_password_current_invalid: '当前密码无效。',
        profile_password_change_failed: '密码更改失败。请重试。',
        profile_password_change_success: '密码已成功更改。',
        profile_delete_success: '账户已成功删除。',
        profile_delete_failed: '账户注销失败',

        // QnA specific
        qna_status_answered: '已回复',
        qna_status_pending: '待回复',
        qna_filter_all: '全部',
        qna_private_question: '私密问题',
        qna_delete_confirm: '确定要删除此问题吗？',
        show_content: '显示内容',
        hide_content: '隐藏内容',
        anonymous: '匿名',
    },
};

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        const saved = localStorage.getItem('language');
        return (saved as Language) || 'ko';
    });

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
    };

    const t = (key: string, fallback?: string): string => {
        const keys = key.split('.');
        let value: unknown = translations[language];

        for (const k of keys) {
            value = (value as Record<string, unknown>)?.[k];
        }

        return (value as string) || fallback || key;
    };

    const value = {
        language,
        setLanguage,
        t,
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export const getLocalizedValue = (
    data: Record<string, unknown> | null | undefined,
    field: string,
    language: Language,
    fallback?: string
): string => {
    if (!data) return fallback || '';

    const localizedField = `${field}_${language}`;
    return (data[localizedField] as string) || (data[field] as string) || fallback || '';
};

export const getLocalizedArray = (
    data: Record<string, unknown> | null | undefined,
    field: string,
    language: Language,
    fallback?: string[]
): string[] => {
    if (!data) return fallback || [];

    const localizedField = `${field}_${language}`;
    return (data[localizedField] as string[]) || (data[field] as string[]) || fallback || [];
}; 