import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, CACHE_TIME, invalidateQueries } from "@/lib/query-client";

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
}

interface CreateProductData {
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
}

// 모든 제품 가져오기
export function useProducts() {
    return useQuery({
        queryKey: [QUERY_KEYS.PRODUCTS.ALL],
        queryFn: () => apiClient.get<Product[]>("/products", {
            revalidate: CACHE_TIME.MEDIUM,
        }),
        staleTime: CACHE_TIME.SHORT,
    });
}

// 특정 제품 가져오기
export function useProduct(id: string) {
    return useQuery({
        queryKey: [QUERY_KEYS.PRODUCTS.BY_ID(id)],
        queryFn: () => apiClient.get<Product>(`/products/${id}`, {
            revalidate: CACHE_TIME.MEDIUM,
        }),
        staleTime: CACHE_TIME.SHORT,
    });
}

// 카테고리별 제품 가져오기
export function useProductsByCategory(category: string) {
    return useQuery({
        queryKey: [QUERY_KEYS.PRODUCTS.BY_CATEGORY(category)],
        queryFn: () => apiClient.get<Product[]>(`/products/category/${category}`, {
            revalidate: CACHE_TIME.MEDIUM,
        }),
        staleTime: CACHE_TIME.SHORT,
    });
}

// 제품 생성
export function useCreateProduct() {
    return useMutation({
        mutationFn: (data: CreateProductData) =>
            apiClient.post<Product>("/products", data),
        onSuccess: () => {
            invalidateQueries.products();
        },
    });
}

// 제품 수정
export function useUpdateProduct() {
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateProductData> }) =>
            apiClient.put<Product>(`/products/${id}`, data),
        onSuccess: (_, { id }) => {
            invalidateQueries.product(id);
            invalidateQueries.products();
        },
    });
}

// 제품 삭제
export function useDeleteProduct() {
    return useMutation({
        mutationFn: (id: string) => apiClient.delete(`/products/${id}`),
        onSuccess: (_, id) => {
            invalidateQueries.product(id);
            invalidateQueries.products();
        },
    });
} 