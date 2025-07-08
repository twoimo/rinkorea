import { QueryClient } from "@tanstack/react-query";

// 캐시 시간 상수
export const CACHE_TIME = {
    SHORT: 5 * 60 * 1000, // 5분
    MEDIUM: 30 * 60 * 1000, // 30분
    LONG: 24 * 60 * 60 * 1000, // 24시간
    INFINITE: Infinity,
};

// 쿼리 키 상수
export const QUERY_KEYS = {
    AUTH: {
        USER: "auth-user",
        SESSION: "auth-session",
    },
    PRODUCTS: {
        ALL: "products-all",
        BY_ID: (id: string) => `product-${id}`,
        BY_CATEGORY: (category: string) => `products-category-${category}`,
    },
    NEWS: {
        ALL: "news-all",
        BY_ID: (id: string) => `news-${id}`,
        PUBLISHED: "news-published",
    },
    PROJECTS: {
        ALL: "projects-all",
        BY_ID: (id: string) => `project-${id}`,
        VISIBLE: "projects-visible",
    },
    RESOURCES: {
        ALL: "resources-all",
        BY_ID: (id: string) => `resource-${id}`,
        BY_CATEGORY: (category: string) => `resources-category-${category}`,
        ACTIVE: "resources-active",
        STATS: "resource-stats",
    },
    EQUIPMENT: {
        ALL: "equipment-all",
        BY_ID: (id: string) => `equipment-${id}`,
        VISIBLE: "equipment-visible",
        HIDDEN: "equipment-hidden",
    },
    INQUIRIES: {
        ALL: "inquiries-all",
        BY_ID: (id: string) => `inquiry-${id}`,
        REPLIES: (inquiryId: string) => `inquiry-replies-${inquiryId}`,
        BY_USER: (userId: string) => `inquiries-user-${userId}`,
    },
    CERTIFICATES: {
        ALL: "certificates-all",
        BY_ID: (id: string) => `certificate-${id}`,
        VISIBLE: "certificates-visible",
    },
    REVENUE: {
        ALL: "revenue-all",
        BY_DATE_RANGE: (start: string, end: string) => `revenue-${start}-${end}`,
        CATEGORIES: "revenue-categories",
        STATS: "revenue-stats",
    },
} as const;

// React Query 클라이언트 생성
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: CACHE_TIME.SHORT,
            gcTime: CACHE_TIME.MEDIUM,
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnMount: true,
            refetchOnReconnect: true,
            networkMode: 'offlineFirst', // Optimize for mobile networks
        },
        mutations: {
            retry: 1,
        },
    },
});

// 캐시 상태 확인용 디버깅 함수
export const debugQueryCache = () => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    console.log('🔍 Current Query Cache State:');
    queries.forEach(query => {
        console.log(`📋 Query: ${JSON.stringify(query.queryKey)}, State: ${query.state.status}, Data:`, query.state.data);
    });
};

// 캐시 무효화 헬퍼 함수
export const invalidateQueries = {
    // 제품 관련
    products: () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS.ALL] });
    },
    product: (id: string) => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS.BY_ID(id)] });
    },

    // 뉴스 관련
    news: () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NEWS.ALL] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NEWS.PUBLISHED] });
    },
    newsItem: (id: string) => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NEWS.BY_ID(id)] });
    },

    // 프로젝트 관련
    projects: () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROJECTS.ALL] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROJECTS.VISIBLE] });
    },
    project: (id: string) => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROJECTS.BY_ID(id)] });
    },

    // 자료 관련
    resources: () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RESOURCES.ALL] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RESOURCES.ACTIVE] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RESOURCES.STATS] });
    },
    resource: (id: string) => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RESOURCES.BY_ID(id)] });
    },
    resourcesByCategory: (category: string) => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RESOURCES.BY_CATEGORY(category)] });
    },

    // 장비 관련
    equipment: () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EQUIPMENT.ALL] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EQUIPMENT.VISIBLE] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EQUIPMENT.HIDDEN] });
    },
    equipmentItem: (id: string) => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EQUIPMENT.BY_ID(id)] });
    },

    // 문의 관련
    inquiries: () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INQUIRIES.ALL] });
    },
    inquiry: (id: string) => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INQUIRIES.BY_ID(id)] });
    },
    inquiryReplies: (inquiryId: string) => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INQUIRIES.REPLIES(inquiryId)] });
    },
    inquiriesByUser: (userId: string) => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INQUIRIES.BY_USER(userId)] });
    },

    // 인증서 관련
    certificates: () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CERTIFICATES.ALL] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CERTIFICATES.VISIBLE] });
    },
    certificate: (id: string) => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CERTIFICATES.BY_ID(id)] });
    },

    // 매출 관련
    revenue: () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.REVENUE.ALL] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.REVENUE.CATEGORIES] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.REVENUE.STATS] });
    },
    revenueByDateRange: (start: string, end: string) => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.REVENUE.BY_DATE_RANGE(start, end)] });
    },

    // 전체 캐시 무효화
    all: () => {
        queryClient.invalidateQueries();
    },
}; 