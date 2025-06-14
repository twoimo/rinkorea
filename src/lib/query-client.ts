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
    },
    PROJECTS: {
        ALL: "projects-all",
        BY_ID: (id: string) => `project-${id}`,
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
        },
        mutations: {
            retry: 1,
        },
    },
});

// 캐시 무효화 헬퍼 함수
export const invalidateQueries = {
    products: () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS.ALL] });
    },
    product: (id: string) => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS.BY_ID(id)] });
    },
    news: () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NEWS.ALL] });
    },
    projects: () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROJECTS.ALL] });
    },
}; 