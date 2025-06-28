/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Language = 'ko' | 'en' | 'zh' | 'id';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, fallback?: string) => string;
    isAutoDetecting: boolean;
    detectionMethod: string;
    supportedLanguages: Language[];
}

// 국가별 기본 언어 매핑
const geolocationLanguageMap: Record<string, Language> = {
    'KR': 'ko',
    'US': 'en', 'GB': 'en', 'CA': 'en', 'AU': 'en', 'NZ': 'en',
    'CN': 'zh', 'TW': 'zh', 'HK': 'zh', 'MO': 'zh',
    'ID': 'id'
};

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
        hero_title_line1: '친환경 불연재(일액형)',
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

        // Projects Stats
        projects_stats_title: '시공 실적',
        projects_stats_subtitle: '다양한 분야에서 인정받는 린코리아의 기술력',
        projects_stats_construction_projects: '시공 프로젝트',
        projects_stats_customer_satisfaction: '고객 만족도',
        projects_stats_product_lineup: '린코리아 제품군',

        // Equipment Page
        equipment_hero_title: '기계소개',
        equipment_hero_subtitle: '최첨단 콘크리트 연마 기술로 최고의 품질과 효율성을 제공합니다.',
        equipment_add_btn: '기계 추가',
        equipment_partnership_title: 'Shanghai JS Floor Systems 공식 파트너',
        equipment_partnership_desc: 'Shanghai JS Floor Systems의 공식 파트너로서 한국 공식 판매대리점 및 서비스센터를 운영하고 있습니다. 세계적 수준의 건설현장에서 사용되는 콘크리트 그라인더 시장의 선두주자입니다.',
        equipment_partnership_contact: '한국 공식 판매 & 공식 서비스센터 (AS)\n주소: 인천광역시 서구 백범로 707 (주안국가산업단지)\n문의전화: 032-571-1023',
        equipment_construction_tab: '건설기계',

        // Phone numbers
        phone_number: '032-571-1023',
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
        product_card_show: 'Tampilkan',
        product_card_hide: 'Sembunyikan',
        product_card_edit: 'Edit',
        product_card_delete: 'Hapus',
        product_card_view_detail: 'Lihat Detail',
        product_card_more_items: ' lebih banyak',
        product_card_show_less: 'Lebih sedikit',

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
        news_hero_title: '공지사항',
        news_hero_subtitle: '린코리아의 최신 소식과 중요한 공지사항을 확인하세요.',

        // QnA Page
        qna_hero_title: '고객상담',
        qna_hero_subtitle: '궁금한 점이 있으시면 언제든지 문의해 주세요. 전문가가 신속하고 정확하게 답변해 드립니다.',

        // Resources Page
        resources_hero_title: '자료실',
        resources_hero_subtitle: '제품 카탈로그, 기술자료, 인증서 등 다양한 자료를 확인해보세요.',
        resources_add_btn: '자료 추가',

        // Resources list and search
        search_resources: '자료명, 설명, 파일명으로 검색...',
        all_categories: '전체 카테고리',
        total_resources_count: '총 {{count}}개의 자료가 있습니다',
        search_results_for: "'{{term}}' 검색 결과",
        no_resources_found: '자료가 없습니다',
        try_different_filter: '검색 조건을 변경하거나 다른 카테고리를 확인해보세요.',
        grid_view: '격자',
        list_view: '목록',
        resources_form_category: '카테고리',

        // Resource categories
        technical_data: '기술자료',
        catalog: '카탈로그',
        manual: '매뉴얼',
        specification: '사양서',
        certificate: '인증서',
        test_report: '시험성적서',

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
        shop_product_out_of_stock: '품절',
        shop_product_buy_now: '구매하기',
        show: '노출 해제',
        hide: '숨기기',

        // Currency
        currency_loading: '환율 정보 로딩 중...',
        currency_error: '환율 정보를 불러올 수 없습니다',

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
        certificates_add_btn: '인증서 추가',
        certificates_updated: '인증서가 수정되었습니다.',
        certificates_added: '인증서가 추가되었습니다.',

        // Certificate Types
        certificates_type_patent: '특허 등록증',
        certificate_type_patent: '특허',
        certificates_type_patent_desc: '1액형 세라믹 제조기술에 대한 특허 등록으로 기술력을 인정받았습니다.',
        certificates_type_fireproof: '불연재 인증',
        certificate_type_report: '성적서',
        certificates_type_fireproof_desc: '안전한 순수 무기질 세라믹 코팅제입니다',
        certificates_type_quality: '품질시험성적서',
        certificate_type_test_report: '시험성적서',
        certificates_type_quality_desc: '공인시험기관에서 실시한 각종 품질 시험 결과를 확인할 수 있습니다.',

        // Certificate Sections
        certificates_patent_trademark_title: '특허 및 상표 등록증',
        certificates_patent_trademark_desc: '린코리아의 기술력과 브랜드를 보증하는 공식 문서들',
        certificates_rincoat_test_title: 'RIN-COAT 시험성적서',
        certificates_rincoat_test_desc: '공인시험기관에서 실시한 품질 시험 결과 전체 문서',
        certificates_rin_test_title: '린코리아 시험성적서',
        certificates_rin_test_desc: '린코리아 제품의 품질을 검증하는 시험성적서',

        // Certificate Form
        certificates_form_add_title: '인증서 추가',
        certificates_form_edit_title: '인증서 수정',
        certificates_form_name: '인증서명',
        certificates_form_description: '설명',
        certificates_form_image_url: '이미지 URL',
        certificates_form_category: '카테고리',
        certificates_form_issue_date: '발급일',
        certificates_form_expiry_date: '만료일',
        certificates_form_close: '닫기',
        certificates_form_save: '저장',
        certificates_form_saving: '저장 중...',

        // Certificate Delete
        certificates_delete_title: '인증서 삭제',
        certificates_delete_confirm: '정말로 이 인증서를 삭제하시겠습니까?',
        certificates_delete_btn: '삭제',
        certificates_deleting: '삭제 중...',

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

        // QnA Filters
        qna_filter_all: '전체',
        qna_filter_unanswered: '답변대기',
        qna_filter_answered: '답변완료',
        qna_search_placeholder: '문의 제목이나 내용을 검색하세요',
        login_to_inquire: '로그인하여 문의하기',
        qna_ask_question: '문의하기',

        // QnA Form
        qna_form_title: '문의 작성',
        qna_form_edit_title: '문의 수정',
        qna_form_subject: '제목',
        qna_form_content: '내용',
        qna_form_category: '카테고리',
        qna_form_private: '비공개 문의',
        qna_form_submit: '문의 등록',
        qna_form_update: '수정하기',
        qna_form_cancel: '취소',
        qna_form_submitting: '등록 중...',
        qna_form_updating: '수정 중...',

        // QnA List
        qna_no_questions: '등록된 문의가 없습니다.',
        qna_load_more: '더 보기',
        qna_loading: '로딩 중...',

        // QnA Item
        qna_status_answered: '답변완료',
        qna_status_pending: '답변대기',
        qna_private_question: '비공개 질문',
        qna_show_content: '내용 보기',
        qna_hide_content: '내용 숨기기',
        qna_edit: '수정',
        qna_delete: '삭제',
        qna_delete_confirm: '정말로 이 질문을 삭제하시겠습니까?',
        qna_answer: '답변',
        qna_view_answer: '답변 보기',
        qna_hide_answer: '답변 숨기기',
        anonymous: '익명',

        // QnA Categories
        qna_category_general: '일반문의',
        qna_category_product: '제품문의',
        qna_category_technical: '기술문의',
        qna_category_service: '서비스문의',
        qna_category_other: '기타',

        // Contact Page
        contact_hero_title: '연락처',
        contact_hero_subtitle: '린코리아와 함께 더 나은 건설환경을 만들어가세요.\n언제든지 문의해 주시면 성심껏 답변드리겠습니다.',
        contact_company_info: '회사 정보',
        contact_address_label: '주소',
        contact_address_value: '인천광역시 서구 백범로 707 (주안국가산업단지)\n천안 테크노파크 산업단지 입주예정 (2026~)',
        contact_phone_label: '전화번호',
        contact_email_label: '이메일',
        contact_business_info: '사업자 정보',
        contact_company_name: '상호',
        contact_company_name_value: '린코리아',
        contact_business_number: '사업자등록번호',
        contact_business_number_value: '747-42-00526',
        contact_ceo: '대표',
        contact_ceo_value: '김정희',
        contact_social_media: '소셜 미디어',
        contact_call_button: '전화하기',
        contact_email_button: '메일보내기',
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
        hero_title_line1: 'Eco-friendly Non-Combustible',
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
        feature_fire_resistant_title: 'Non-Combustible Certification',
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
        about_materials_desc: 'This is RIN Korea\'s core business division that produces the highest quality products such as concrete surface finishing one-component ceramic coatings (Non-Combustible materials), heat-resistant paints, and special-purpose coatings.',
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

        // Projects Stats
        projects_stats_title: 'Construction Performance',
        projects_stats_subtitle: 'RIN Korea\'s technology recognized in various fields',
        projects_stats_construction_projects: 'Construction Projects',
        projects_stats_customer_satisfaction: 'Customer Satisfaction',
        projects_stats_product_lineup: 'RIN Korea Product Line',

        // Equipment Page
        equipment_hero_title: 'Equipment Introduction',
        equipment_hero_subtitle: 'Providing the highest quality and efficiency with state-of-the-art concrete grinding technology.',
        equipment_add_btn: 'Add Equipment',
        equipment_partnership_title: 'Shanghai JS Floor Systems Official Partner',
        equipment_partnership_desc: 'As an official partner of Shanghai JS Floor Systems, we operate the official sales agency and service center in Korea. We are leaders in the concrete grinder market used at world-class construction sites.',
        equipment_partnership_contact: 'Korea Official Sales & Official Service Center (AS)\nAddress: 707 Baekbeom-ro, Seo-gu, Incheon (Juan National Industrial Complex)\nInquiry Phone: +82 32-571-1023',
        equipment_construction_tab: 'Construction Equipment',

        // Phone numbers
        phone_number: '+82 32-571-1023',
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
        product_card_show_less: 'Less',

        // Product Benefits
        product_benefits_title: 'Product Benefits',
        product_benefits_subtitle: 'Why RIN Korea Ceramic Coatings Are Chosen',
        product_benefits_fire_resistant_title: 'Non-Combustible Certification',
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
        resources_add_btn: 'Add Resource',

        // Resources list and search
        search_resources: 'Search by resource name, description, filename...',
        all_categories: 'All Categories',
        total_resources_count: 'Total {{count}} resources available',
        search_results_for: "Search results for '{{term}}'",
        no_resources_found: 'No resources found',
        try_different_filter: 'Try changing search criteria or check other categories.',
        grid_view: 'Grid',
        list_view: 'List',
        resources_form_category: 'Category',

        // Resource categories
        technical_data: 'Technical Data',
        catalog: 'Catalog',
        manual: 'Manual',
        specification: 'Specification',
        certificate: 'Certificate',
        test_report: 'Test Report',

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
        shop_product_out_of_stock: 'Out of Stock',
        shop_product_buy_now: 'Buy Now',
        show: 'Show',
        hide: 'Hide',

        // Currency
        currency_loading: 'Loading exchange rates...',
        currency_error: 'Unable to load exchange rates',

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
        certificates_add_btn: 'Add Certificate',
        certificates_updated: 'Certificate has been updated.',
        certificates_added: 'Certificate has been added.',

        // Certificate Types
        certificates_type_patent: 'Patent Registration',
        certificate_type_patent: 'Patent',
        certificates_type_patent_desc: 'Technology recognized through patent registration for one-component ceramic manufacturing technology.',
        certificates_type_fireproof: 'Non-Combustible Certification',
        certificate_type_report: 'Report',
        certificates_type_fireproof_desc: 'Safe pure inorganic ceramic coating material',
        certificates_type_quality: 'Quality Test Report',
        certificate_type_test_report: 'Test Report',
        certificates_type_quality_desc: 'Quality test results conducted by authorized testing institutions.',

        // Certificate Sections
        certificates_patent_trademark_title: 'Patents and Trademarks',
        certificates_patent_trademark_desc: 'Official documents certifying RIN Korea\'s technology and brand',
        certificates_rincoat_test_title: 'RIN-COAT Test Reports',
        certificates_rincoat_test_desc: 'Complete quality test results conducted by authorized testing institutions',
        certificates_rin_test_title: 'RIN Korea Test Reports',
        certificates_rin_test_desc: 'Test reports verifying the quality of RIN Korea products',

        // Certificate Form
        certificates_form_add_title: 'Add Certificate',
        certificates_form_edit_title: 'Edit Certificate',
        certificates_form_name: 'Certificate Name',
        certificates_form_description: 'Description',
        certificates_form_image_url: 'Image URL',
        certificates_form_category: 'Category',
        certificates_form_issue_date: 'Issue Date',
        certificates_form_expiry_date: 'Expiry Date',
        certificates_form_close: 'Close',
        certificates_form_save: 'Save',
        certificates_form_saving: 'Saving...',

        // Certificate Delete
        certificates_delete_title: 'Delete Certificate',
        certificates_delete_confirm: 'Are you sure you want to delete this certificate?',
        certificates_delete_btn: 'Delete',
        certificates_deleting: 'Deleting...',

        // Company Overview Section
        company_overview_title_reliable: 'Reliable',
        company_overview_title_partner: 'Partner',
        company_overview_description: 'RIN Korea provides comprehensive construction solutions through its Construction Materials and Construction Machinery divisions.',
        company_overview_location_label: 'Headquarters Location',
        company_overview_location_value: 'Incheon, Seo-gu, Baekbeom-ro 707 (Juan National Industrial Complex)\nTechnopark Industrial Complex (scheduled 2026~)',
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

        // QnA Filters
        qna_filter_all: 'All',
        qna_filter_unanswered: 'Pending',
        qna_filter_answered: 'Answered',
        qna_search_placeholder: 'Search inquiry title or content',
        login_to_inquire: 'Login to Inquire',
        qna_ask_question: 'Ask Question',

        // QnA Form
        qna_form_title: 'Write Inquiry',
        qna_form_edit_title: 'Edit Inquiry',
        qna_form_subject: 'Subject',
        qna_form_content: 'Content',
        qna_form_category: 'Category',
        qna_form_private: 'Private Inquiry',
        qna_form_submit: 'Submit Inquiry',
        qna_form_update: 'Update',
        qna_form_cancel: 'Cancel',
        qna_form_submitting: 'Submitting...',
        qna_form_updating: 'Updating...',

        // QnA List
        qna_no_questions: 'No inquiries registered.',
        qna_load_more: 'Load More',
        qna_loading: 'Loading...',

        // QnA Item
        qna_status_answered: 'Answered',
        qna_status_pending: 'Pending',
        qna_private_question: 'Private Question',
        qna_show_content: 'Show Content',
        qna_hide_content: 'Hide Content',
        qna_edit: 'Edit',
        qna_delete: 'Delete',
        qna_delete_confirm: 'Are you sure you want to delete this question?',
        qna_answer: 'Answer',
        qna_view_answer: 'View Answer',
        qna_hide_answer: 'Hide Answer',
        anonymous: 'Anonymous',

        // QnA Categories
        qna_category_general: 'General Inquiry',
        qna_category_product: 'Product Inquiry',
        qna_category_technical: 'Technical Inquiry',
        qna_category_service: 'Service Inquiry',
        qna_category_other: 'Other',

        // Contact Page
        contact_hero_title: 'Contact',
        contact_hero_subtitle: 'Let\'s create a better construction environment together with RIN Korea.\nPlease feel free to contact us anytime and we will respond sincerely.',
        contact_company_info: 'Company Information',
        contact_address_label: 'Address',
        contact_address_value: 'Incheon, Seo-gu, Baekbeom-ro 707 (Juan National Industrial Complex)\nTechnopark Industrial Complex (scheduled 2026~)',
        contact_phone_label: 'Phone',
        contact_email_label: 'Email',
        contact_business_info: 'Business Information',
        contact_company_name: 'Company Name',
        contact_company_name_value: 'RIN Korea',
        contact_business_number: 'Business Registration Number',
        contact_business_number_value: '747-42-00526',
        contact_ceo: 'CEO',
        contact_ceo_value: 'Kim Jung-hee',
        contact_social_media: 'Social Media',
        contact_call_button: 'Call',
        contact_email_button: 'Send Email',
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
        hero_title_line1: '环保不燃性物质（单一成分）',
        hero_title_line2: '新概念陶瓷涂层剂',
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

        // Projects Stats
        projects_stats_title: '施工实绩',
        projects_stats_subtitle: '在各个领域获得认可的RIN Korea技术力',
        projects_stats_construction_projects: '施工项目',
        projects_stats_customer_satisfaction: '客户满意度',
        projects_stats_product_lineup: 'RIN Korea产品线',

        // Equipment Page
        equipment_hero_title: '建筑设备介绍',
        equipment_hero_subtitle: '以最先进的混凝土研磨技术提供最高品质和效率。',
        equipment_add_btn: '添加设备',
        equipment_partnership_title: 'Shanghai JS Floor Systems 官方合作伙伴',
        equipment_partnership_desc: '作为Shanghai JS Floor Systems的官方合作伙伴，运营韩国官方销售代理店和服务中心。是在世界级建筑现场使用的混凝土研磨机市场的领导者。',
        equipment_partnership_contact: '韩国官方销售 & 官方服务中心(AS)\n地址: 仁川广域市西区白凡路707号 (注安国家产业园区)\n咨询电话: +82 32-571-1023',
        equipment_construction_tab: '建筑设备',

        // Phone numbers
        phone_number: '+82 32-571-1023',

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
        product_card_show_less: '折叠',

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

        // Resources Page
        resources_hero_title: '资料库',
        resources_hero_subtitle: '查看RIN Korea的产品目录、技术资料、证书等各种材料。',
        resources_add_btn: '添加资料',

        // Resources list and search
        search_resources: '按资料名称、描述、文件名搜索...',
        all_categories: '全部类别',
        total_resources_count: '共有{{count}}个资料',
        search_results_for: "'{{term}}'搜索结果",
        no_resources_found: '未找到资料',
        try_different_filter: '请尝试更改搜索条件或查看其他类别。',
        grid_view: '网格',
        list_view: '列表',
        resources_form_category: '类别',

        // Resource categories
        technical_data: '技术资料',
        catalog: '产品目录',
        manual: '手册',
        specification: '规格书',
        certificate: '证书',
        test_report: '测试报告',

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
        shop_product_out_of_stock: '缺货',
        shop_product_buy_now: '立即购买',
        show: '显示',
        hide: '隐藏',

        // Currency
        currency_loading: '汇率信息加载中...',
        currency_error: '无法加载汇率信息',

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
        certificates_add_btn: '添加证书',
        certificates_updated: '证书已更新。',
        certificates_added: '证书已添加。',

        // Certificate Types
        certificates_type_patent: '专利注册证',
        certificate_type_patent: '专利',
        certificates_type_patent_desc: '通过单组分陶瓷制造技术专利注册，技术力得到认可。',
        certificates_type_fireproof: '阻燃材料认证',
        certificate_type_report: '报告书',
        certificates_type_fireproof_desc: '安全的纯无机陶瓷涂料',
        certificates_type_quality: '质量测试报告',
        certificate_type_test_report: '测试报告',
        certificates_type_quality_desc: '由权威测试机构进行的各种质量测试结果。',

        // Certificate Sections
        certificates_patent_trademark_title: '专利和商标',
        certificates_patent_trademark_desc: '证明RIN Korea技术和品牌的官方文件',
        certificates_rincoat_test_title: 'RIN-COAT测试报告',
        certificates_rincoat_test_desc: '由权威测试机构进行的完整质量测试结果',
        certificates_rin_test_title: 'RIN Korea测试报告',
        certificates_rin_test_desc: '验证RIN Korea产品质量的测试报告',

        // Certificate Form
        certificates_form_add_title: '添加证书',
        certificates_form_edit_title: '编辑证书',
        certificates_form_name: '证书名称',
        certificates_form_description: '描述',
        certificates_form_image_url: '图片URL',
        certificates_form_category: '类别',
        certificates_form_issue_date: '发行日期',
        certificates_form_expiry_date: '到期日期',
        certificates_form_close: '关闭',
        certificates_form_save: '保存',
        certificates_form_saving: '保存中...',

        // Certificate Delete
        certificates_delete_title: '删除证书',
        certificates_delete_confirm: '确定要删除此证书吗？',
        certificates_delete_btn: '删除',
        certificates_deleting: '删除中...',

        // Company Overview Section
        company_overview_title_reliable: '可靠的',
        company_overview_title_partner: '合作伙伴',
        company_overview_description: 'RIN Korea通过建筑材料和建筑机械两大核心业务，提供全面的建筑解决方案。',
        company_overview_location_label: '总部位置',
        company_overview_location_value: '仁川广域市西区白凡路707号（注安国家产业园区）\n天安科技园产业园区入驻预定（2026~）',
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

        // QnA Page
        qna_hero_title: '客户咨询',
        qna_hero_subtitle: '如果您有任何问题，请随时联系我们。我们的专家将迅速准确地回复。',

        // QnA Filters
        qna_filter_all: '全部',
        qna_filter_unanswered: '待回复',
        qna_filter_answered: '已回复',
        qna_search_placeholder: '搜索咨询标题或内容',
        login_to_inquire: '登录咨询',
        qna_ask_question: '提问',

        // QnA Form
        qna_form_title: '撰写咨询',
        qna_form_edit_title: '编辑咨询',
        qna_form_subject: '标题',
        qna_form_content: '内容',
        qna_form_category: '类别',
        qna_form_private: '私密咨询',
        qna_form_submit: '提交咨询',
        qna_form_update: '更新',
        qna_form_cancel: '取消',
        qna_form_submitting: '提交中...',
        qna_form_updating: '更新中...',

        // QnA List
        qna_no_questions: '没有注册的咨询。',
        qna_load_more: '加载更多',
        qna_loading: '加载中...',

        // QnA Item
        qna_status_answered: '已回复',
        qna_status_pending: '待回复',
        qna_private_question: '私密问题',
        qna_show_content: '显示内容',
        qna_hide_content: '隐藏内容',
        qna_edit: '编辑',
        qna_delete: '删除',
        qna_delete_confirm: '确定要删除此问题吗？',
        qna_answer: '回复',
        qna_view_answer: '查看回复',
        qna_hide_answer: '隐藏回复',
        anonymous: '匿名',

        // QnA Categories
        qna_category_general: '一般咨询',
        qna_category_product: '产品咨询',
        qna_category_technical: '技术咨询',
        qna_category_service: '服务咨询',
        qna_category_other: '其他',

        // Contact Page
        contact_hero_title: '联系我们',
        contact_hero_subtitle: '与RIN Korea一起创造更好的建筑环境。\n请随时联系我们，我们将真诚回复。',
        contact_company_info: '公司信息',
        contact_address_label: '地址',
        contact_address_value: '仁川广域市西区白凡路707号（注安国家产业园区）\n天安科技园产业园区입驻预定（2026~）',
        contact_phone_label: '电话',
        contact_email_label: '邮箱',
        contact_business_info: '营业信息',
        contact_company_name: '公司名',
        contact_company_name_value: 'RIN Korea',
        contact_business_number: '营业执照号码',
        contact_business_number_value: '747-42-00526',
        contact_ceo: '代表',
        contact_ceo_value: '金正姬',
        contact_social_media: '社交媒体',
        contact_call_button: '拨打电话',
        contact_email_button: '发送邮件',
    },
    id: {
        // Navigation
        home: 'Beranda',
        about: 'Tentang Kami',
        products: 'Produk',
        equipment: 'Peralatan',
        shop: 'Toko Online',
        projects: 'Proyek',
        certificates: 'Sertifikat/Certification',
        qna: 'Konsultasi',
        news: 'Berita',
        resources: 'Ruang Materi',
        contact: 'Kontak',

        // User menu
        admin: 'Admin',
        user: 'Pengguna',
        revenue_management: 'Manajemen Pendapatan',
        admin_danger_zone: 'Area Bahaya Admin',
        profile_settings: 'Pengaturan Profil',
        login: 'Masuk',
        logout: 'Keluar',
        welcome: 'Selamat Datang!',
        admin_account: 'Akun Admin',

        // Hero Section
        hero_patent: 'Nomor Paten 10-2312833',
        hero_trademark: 'Nomor Merk 40-1678504',
        hero_title_line1: 'Bahan Terbakar Lingkungan',
        hero_title_line2: 'Bahan Keramik Baru',
        hero_inquiry_btn: 'Pertanyaan Produk',
        hero_purchase_btn: 'Beli Produk',
        hero_projects_btn: 'Lihat Proyek',
        hero_admin_youtube_edit: 'Edit Tautan Video YouTube Utama',
        hero_youtube_placeholder: 'Masukkan URL Video YouTube',
        hero_embed_preview: 'URL Embed Dikonversi:',
        hero_save_btn: 'Simpan',
        hero_saving: 'Menyimpan...',
        hero_save_success: 'Tautan YouTube telah disimpan.',

        // Features Section
        features_title: 'Apa yang Membuat',
        features_title_highlight: 'Khas RIN Korea',
        features_subtitle: 'Membuat Lingkungan Konstruksi yang Aman dan Ramah Lingkungan dengan Bahan Keramik Berkualitas Tinggi',

        // Feature items
        feature_fire_resistant_title: 'Sertifikasi Tahan Api',
        feature_fire_resistant_desc: 'Bahan Keramik Organik Tahan Api yang Aman',
        feature_eco_friendly_title: 'Metode Penutupan Ramah Lingkungan',
        feature_eco_friendly_desc: 'Penutupan Baru yang Ramah Lingkungan Satu Komponen Keramik',
        feature_quality_title: 'Kualitas Tinggi',
        feature_quality_desc: 'Kualitas diverifikasi melalui berbagai laporan uji dan sertifikasi, diterapkan di lebih dari 1.000 situs',
        feature_industrial_title: 'Penerapan Industri',
        feature_industrial_desc: 'Kegagalan yang terbukti di berbagai situs konstruksi',
        feature_time_saving_title: 'Penghematan Waktu',
        feature_time_saving_desc: 'Menghemat langkah penpolishing beton secara signifikan untuk konstruksi yang sederhana dan cepat',
        feature_verified_title: 'Kinerja Diverifikasi',
        feature_verified_desc: 'Produk yang telah melalui uji kualitas yang ketat',

        // Footer
        footer_company_info: 'Informasi Perusahaan',
        footer_address: 'Incheon, Seo-gu, Baekbeom-ro 707 (Juan National Industrial Complex)',
        footer_business_number: 'Nomor Pendaftaran Bisnis: 747-42-00526',
        footer_quick_links: 'Tautan Cepat',
        footer_customer_service: 'Layanan Pelanggan',
        footer_social_media: 'Media Sosial',
        footer_copyright: '© 2025 RIN Korea. Hak Cipta Dilindungi.',

        // About Page
        about_hero_title: 'Tentang Kami',
        about_hero_subtitle: 'RIN Korea, perusahaan manufaktur bahan konstruksi khusus, menetapkan standar baru di industri konstruksi dengan teknologi inovatif dan kualitas.',
        about_intro_title: 'RIN Korea Introduction',
        about_intro_description: 'RIN Korea telah tumbuh menjadi perusahaan khusus yang menyediakan solusi inovatif di bidang bahan konstruksi dan peralatan konstruksi. Kami akan menjadi mitra terbaik untuk kesuksesan pelanggan kami dengan kualitas dan teknologi tertinggi.',
        about_vision: 'Visi',
        about_vision_desc: 'Perusahaan global yang memimpin inovasi di industri konstruksi',
        about_mission: 'Misi',
        about_mission_desc: 'Membuat nilai pelanggan dengan kualitas dan teknologi tertinggi',
        about_core_values: 'Nilai Inti',
        about_core_values_desc: 'Kepercayaan, Inovasi, Kekelanhidupan',
        about_business_title: 'Bidang Bisnis',
        about_business_subtitle: 'RIN Korea memimpin pengembangan industri konstruksi melalui dua bisnis inti: bahan konstruksi dan peralatan konstruksi.',
        about_materials_title: 'Divisi Bahan Konstruksi',
        about_materials_subtitle: 'Bidang Bisnis Inti',
        about_materials_desc: 'Ini adalah divisi bisnis inti RIN Korea yang menghasilkan produk bahan konstruksi berkualitas tinggi seperti penutupan permukaan satu komponen keramik (bahan terbakar), cat anti panas, dan cat khusus.',
        about_equipment_title: 'Divisi Peralatan Konstruksi',
        about_equipment_subtitle: 'Shanghai JS Floor Systems Official Partner',
        about_equipment_desc: 'Sebagai mitra resmi Shanghai JS Floor Systems, kami mengoperasikan agen penjualan resmi dan pusat layanan di Korea. Kami pemimpin di pasar penghalus dan penghalus beton yang digunakan di situs konstruksi global.',
        about_location_title: 'Lokasi',
        about_address_label: 'Alamat',
        about_phone_label: 'Telepon',
        about_email_label: 'Surel',

        // About Business Items
        about_materials_item1: 'Penguat Permukaan Beton/Cat (Silika)',
        about_materials_item2: 'Semen Khusus/Penguat Air (Air Tidak Mampu)',
        about_materials_item3: 'Penguat Permukaan Elastis/Penguat Air (Air Tidak Mampu)',
        about_materials_item4: 'Penguat Permukaan/Epoxy, dll. Pengeluaran Khusus',
        about_equipment_item1: 'Pengadaan Peralatan Konstruksi dan Bagian',
        about_equipment_item2: 'Operasi Pusat Layanan Resmi (Dukungan A/S)',
        about_equipment_item3: 'Dukungan Teknis dan Konsultasi',
        about_equipment_item4: 'Kebijakan Harga yang Masuk Akal dan Manajemen Terintegrasi',

        // Common
        loading: 'Memuat...',
        error: 'Kesalahan',
        success: 'Berhasil',
        cancel: 'Batal',
        confirm: 'Konfirmasi',
        save: 'Simpan',
        edit: 'Mengedit',
        delete: 'Hapus',
        add: 'Tambah',
        search: 'Pencarian',
        filter: 'Filter',
        reset: 'Setel Ulang',
        select: 'Pilih',
        none: 'Tidak Ada',

        // Language names
        korean: 'Bahasa Korea',
        english: 'English',
        chinese: '中文',

        // Projects Page
        projects_hero_title: 'Proyek',
        projects_hero_subtitle: 'Temukan berbagai kasus proyek di mana teknologi keramik RIN Korea telah diterapkan.',
        projects_add_btn: 'Tambah Proyek',
        projects_no_projects: 'Tidak ada proyek terdaftar.',
        projects_admin_add: 'Tambah Proyek Baru',
        projects_form_title_add: 'Tambah Proyek',
        projects_form_title_edit: 'Edit Proyek',
        projects_form_name: 'Nama Proyek',
        projects_form_location: 'Lokasi',
        projects_form_description: 'Deskripsi',
        projects_form_image: 'URL Gambar',
        projects_form_features: 'Fitur',
        projects_form_category: 'Kategori',
        projects_form_add_feature: 'Masukkan fitur baru',
        projects_delete_confirm: 'Apakah Anda yakin ingin menghapus proyek ini?',
        projects_delete_title: 'Hapus Proyek',
        projects_saving: 'Menyimpan...',
        projects_view_detail: 'Lihat Detail',
        projects_various_title: 'Berbagai Proyek',
        projects_various_desc: 'Kasus Proyek RIN Korea',
        projects_delete_error: 'Gagal menghapus proyek.',
        projects_delete_success: 'Proyek telah dihapus.',

        // Projects Stats
        projects_stats_title: 'Kinerja Konstruksi',
        projects_stats_subtitle: 'Teknologi RIN Korea dikenal di berbagai bidang',
        projects_stats_construction_projects: 'Proyek Konstruksi',
        projects_stats_customer_satisfaction: 'Kepuasan Pelanggan',
        projects_stats_product_lineup: 'RIN Korea Product Line',

        // Equipment Page
        equipment_hero_title: 'Pengenalan Peralatan',
        equipment_hero_subtitle: 'Menyediakan kualitas dan efisiensi tertinggi dengan teknologi penghalusan beton terbaru.',
        equipment_add_btn: 'Tambah Peralatan',
        equipment_partnership_title: 'Shanghai JS Floor Systems Official Partner',
        equipment_partnership_desc: 'Sebagai mitra resmi Shanghai JS Floor Systems, kami mengoperasikan agen penjualan resmi dan pusat layanan di Korea. Kami pemimpin di pasar penghalus dan penghalus beton yang digunakan di situs konstruksi kelas dunia.',
        equipment_partnership_contact: 'Korea Official Sales & Official Service Center (AS)\nAlamat: 707 Baekbeom-ro, Seo-gu, Incheon (Juan National Industrial Complex)\nTelepon Pertanyaan: +82 32-571-1023',
        equipment_construction_tab: 'Peralatan Konstruksi',

        // Phone numbers
        phone_number: '+82 32-571-1023',

        equipment_diatool_tab: 'Diamond Tools',
        equipment_premium_title: 'Penghalus Beton Terbaru',
        equipment_premium_subtitle: 'Lineup penghalus premium dengan teknologi canggih',
        equipment_professional_title: 'Penghalus Beton',
        equipment_professional_subtitle: 'Seri penghalus kinerja tinggi untuk profesional',
        equipment_diatool_title: 'Diamond Tools',
        equipment_diatool_subtitle: 'Diamond tools dan aksesoris berkualitas tinggi',
        equipment_diatool_empty: 'Produk diamond tool akan segera hadir.',
        equipment_diatool_add: 'Tambah Diamond Tool',
        equipment_features_label: 'Fitur Utama:',
        equipment_edit_modal_title: 'Edit Peralatan',
        equipment_add_modal_title: 'Tambah Peralatan',
        equipment_delete_modal_title: 'Hapus Peralatan',
        equipment_delete_confirm: 'Apakah Anda yakin ingin menghapus peralatan ini?',
        equipment_form_name: 'Nama',
        equipment_form_description: 'Deskripsi',
        equipment_form_image: 'URL Gambar',
        equipment_form_icon: 'Ikon',
        equipment_form_category: 'Kategori',
        equipment_form_features: 'Fitur',
        equipment_form_add_feature: 'Masukkan fitur baru',
        equipment_saving: 'Menyimpan...',
        equipment_updated_success: 'Peralatan telah diperbarui.',
        equipment_added_success: 'Peralatan telah ditambahkan.',

        // Resources Page
        resources_hero_title: 'Ruang Materi',
        resources_hero_subtitle: 'Periksa berbagai materi seperti katalog produk RIN Korea, data teknis, dan sertifikat.',
        resources_add_btn: 'Tambah Materi',

        // Resources list and search
        search_resources: 'Cari berdasarkan nama materi, deskripsi, nama file...',
        all_categories: 'Semua Kategori',
        total_resources_count: 'Total {{count}} materi tersedia',
        search_results_for: "Hasil pencarian untuk '{{term}}'",
        no_resources_found: 'Materi tidak ditemukan',
        try_different_filter: 'Coba ubah kriteria pencarian atau periksa kategori lain.',
        grid_view: 'Grid',
        list_view: 'Daftar',
        resources_form_category: 'Kategori',

        // Products Page
        products_hero_title: 'Produk',
        products_hero_subtitle: 'Temukan bahan keramik inovatif RIN Korea dan bahan konstruksi ramah lingkungan.',
        products_add_btn: 'Tambah Produk',
        products_save_success: 'Produk telah diperbarui.',
        products_add_success: 'Produk telah ditambahkan.',
        products_error_occurred: 'Terjadi kesalahan.',

        // Product Card
        product_card_show: 'Tampilkan',
        product_card_hide: 'Sembunyikan',
        product_card_edit: 'Edit',
        product_card_delete: 'Hapus',
        product_card_view_detail: 'Lihat Detail',
        product_card_more_items: ' lebih banyak',
        product_card_show_less: 'Lebih sedikit',

        // Contact Page
        contact_hero_title: 'Kontak',
        contact_hero_subtitle: 'Mari ciptakan lingkungan konstruksi yang lebih baik bersama RIN Korea.\nSilakan hubungi kami kapan saja dan kami akan merespons dengan tulus.',
        contact_company_info: 'Informasi Perusahaan',
        contact_address_label: 'Alamat',
        contact_address_value: 'Incheon, Seo-gu, Baekbeom-ro 707 (Juan National Industrial Complex)\nTechnopark Industrial Complex (dijadwalkan 2026~)',
        contact_phone_label: 'Telepon',
        contact_email_label: 'Email',
        contact_business_info: 'Informasi Bisnis',
        contact_company_name: 'Nama Perusahaan',
        contact_company_name_value: 'RIN Korea',
        contact_business_number: 'Nomor Pendaftaran Bisnis',
        contact_business_number_value: '747-42-00526',
        contact_ceo: 'CEO',
        contact_ceo_value: 'Kim Jung-hee',
        contact_social_media: 'Media Sosial',
        contact_call_button: 'Panggil',
        contact_email_button: 'Kirim Email',

        // News Page
        news_hero_title: 'Berita',
        news_hero_subtitle: 'Periksa berita terbaru dan pengumuman penting dari RIN Korea.',

        // QnA Page
        qna_hero_title: 'Konsultasi Pelanggan',
        qna_hero_subtitle: 'Jika Anda memiliki pertanyaan, silakan hubungi kami kapan saja. Para ahli kami akan merespons dengan cepat dan akurat.',

        // Shop Page
        shop_hero_title: 'Toko Online',
        shop_hero_subtitle: 'Anda dapat memesan dan membeli produk RIN Korea secara online.',
        shop_add_product: 'Tambah Produk',

        // Shop sorting options
        shop_sort_popularity: 'Berdasarkan Popularitas',
        shop_sort_newest: 'Terbaru Dulu',
        shop_sort_price_low: 'Harga: Rendah ke Tinggi',
        shop_sort_price_high: 'Harga: Tinggi ke Rendah',
        shop_sort_discount: 'Berdasarkan Diskon',
        shop_sort_sales: 'Berdasarkan Penjualan',
        shop_sort_reviews: 'Paling Banyak Diulas',
        shop_sort_rating: 'Rating Tertinggi',

        // Shop controls
        shop_sort_select: 'Pilih Opsi Urutan',
        shop_grid_label: 'Grid',
        shop_grid_setting: 'Pengaturan Grid',
        shop_grid_apply: 'Terapkan',
        shop_grid_applying: 'Menerapkan...',

        // Shop product grid
        reviews: 'Ulasan',
        shop_product_out_of_stock: 'Stok Habis',
        shop_product_buy_now: 'Beli Sekarang',
        show: 'Tampilkan',
        hide: 'Sembunyikan',

        // Currency
        currency_loading: 'Memuat nilai tukar...',
        currency_error: 'Tidak dapat memuat nilai tukar',

        // Shop product form
        shop_edit_product: 'Edit Produk',
        close: 'Tutup',
        shop_form_product_name: 'Nama Produk',
        shop_form_description: 'Deskripsi',
        shop_form_image_url: 'URL Gambar atau Nama File',
        shop_form_image_placeholder: 'contoh: image.jpg atau https://example.com/image.jpg',
        shop_form_image_note: 'Jika Anda hanya memasukkan nama file, jalur /images/ akan ditambahkan secara otomatis',
        shop_form_price: 'Harga',
        shop_form_original_price: 'Harga Asli',
        shop_form_discount: 'Diskon (%)',
        shop_form_stock: 'Stok',
        shop_form_rating: 'Rating',
        shop_form_reviews: 'Jumlah Ulasan',
        shop_form_naver_url: 'URL Toko Naver',
        shop_form_new_product: 'Produk Baru',
        shop_form_best_product: 'Terlaris',
        shop_form_saving: 'Menyimpan...',

        // Shop delete modal
        shop_delete_title: 'Hapus Produk',
        shop_delete_confirm: 'Apakah Anda yakin ingin menghapus',
        shop_delete_confirm_product: 'produk?',
        shop_deleting: 'Menghapus...',

        // Success messages
        saved_success: 'Berhasil disimpan.',
        shop_deleted_success: 'Berhasil dihapus.',
    },
};

// 언어 자동 감지 함수들
const detectBrowserLanguage = (supportedLanguages: Language[]): Language | null => {
    const browserLang = navigator.language || navigator.languages?.[0];
    if (!browserLang) return null;

    const lang = browserLang.toLowerCase();
    if (lang.startsWith('ko') && supportedLanguages.includes('ko')) return 'ko';
    if (lang.startsWith('en') && supportedLanguages.includes('en')) return 'en';
    if (lang.startsWith('zh') && supportedLanguages.includes('zh')) return 'zh';
    if (lang.startsWith('id') && supportedLanguages.includes('id')) return 'id';

    return null;
};

const detectGeolocation = async (): Promise<string | null> => {
    try {
        const response = await fetch('https://ipapi.co/country/', {
            method: 'GET',
            headers: { 'Accept': 'text/plain' }
        });
        if (response.ok) {
            return (await response.text()).trim().toUpperCase();
        }
    } catch (error) {
        console.warn('Geolocation detection failed:', error);
    }
    return null;
};

const detectLanguageFromURL = (supportedLanguages: Language[]): Language | null => {
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang') as Language;
    return langParam && supportedLanguages.includes(langParam) ? langParam : null;
};

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const supportedLanguages: Language[] = ['ko', 'en', 'zh', 'id'];
    const [language, setLanguageState] = useState<Language>('ko');
    const [isAutoDetecting, setIsAutoDetecting] = useState(true);
    const [detectionMethod, setDetectionMethod] = useState<string>('Loading...');

    // 자동 언어 감지
    const detectLanguage = useCallback(async (): Promise<Language> => {
        try {
            // 1. URL 파라미터 확인 (최우선)
            const urlLang = detectLanguageFromURL(supportedLanguages);
            if (urlLang) {
                setDetectionMethod('URL Parameter');
                return urlLang;
            }

            // 2. 로컬 스토리지 확인
            const savedLanguage = localStorage.getItem('rin-korea-language') as Language;
            if (savedLanguage && supportedLanguages.includes(savedLanguage)) {
                setDetectionMethod('User Preference');
                return savedLanguage;
            }

            // 3. 브라우저 언어 확인
            const browserLang = detectBrowserLanguage(supportedLanguages);
            if (browserLang) {
                setDetectionMethod('Browser Language');
                return browserLang;
            }

            // 4. 지역 기반 감지
            const countryCode = await detectGeolocation();
            if (countryCode && geolocationLanguageMap[countryCode]) {
                const geoLang = geolocationLanguageMap[countryCode];
                if (supportedLanguages.includes(geoLang)) {
                    setDetectionMethod('Geolocation');
                    return geoLang;
                }
            }

            // 5. 기본값
            setDetectionMethod('Default');
            return 'ko';
        } catch (error) {
            console.error('Language detection failed:', error);
            setDetectionMethod('Error - Default');
            return 'ko';
        }
    }, [supportedLanguages]);

    // 언어 설정 함수
    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('rin-korea-language', lang);

        // URL 파라미터 업데이트
        const url = new URL(window.location.href);
        url.searchParams.set('lang', lang);
        window.history.replaceState({}, '', url.toString());

        // HTML lang 속성 업데이트
        document.documentElement.lang = lang === 'ko' ? 'ko-KR' :
            lang === 'en' ? 'en-US' :
                lang === 'zh' ? 'zh-CN' : 'id-ID';
    }, []);

    // 초기 언어 감지
    useEffect(() => {
        let isMounted = true;

        detectLanguage().then(detectedLang => {
            if (isMounted) {
                setLanguageState(detectedLang);
                setIsAutoDetecting(false);

                // HTML lang 속성 초기 설정
                document.documentElement.lang = detectedLang === 'ko' ? 'ko-KR' :
                    detectedLang === 'en' ? 'en-US' :
                        detectedLang === 'zh' ? 'zh-CN' : 'id-ID';
            }
        });

        return () => {
            isMounted = false;
        };
    }, [detectLanguage]);

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
        isAutoDetecting,
        detectionMethod,
        supportedLanguages
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