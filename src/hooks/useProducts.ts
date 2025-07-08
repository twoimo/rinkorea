import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { SupabaseClient } from '@supabase/supabase-js';
import { Product } from '@/types/product';
import { QUERY_KEYS, debugQueryCache } from '@/lib/query-client';

// 언어별 컬럼을 포함한 전체 선택 쿼리
const SELECT_COLUMNS = `
  *,
  name_ko,
  name_en, 
  name_zh,
  name_id,
  description_ko,
  description_en,
  description_zh,
  description_id,
  features_ko,
  features_en,
  features_zh,
  features_id
`;

// Products 데이터 가져오기
const fetchProducts = async (): Promise<Product[]> => {
  const { data, error } = await (supabase as unknown as SupabaseClient)
    .from('product_introductions')
    .select(SELECT_COLUMNS)
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return data?.map(product => ({
    ...product,
    detail_images: product.detail_images || []
  })) || [];
};

// 숨겨진 제품 ID 목록 가져오기
const fetchHiddenProducts = async (): Promise<string[]> => {
  const { data, error } = await (supabase as unknown as SupabaseClient)
    .from('product_introduction_hidden')
    .select('product_id');

  if (error) throw error;

  return data?.map((h: { product_id: string }) => h.product_id) || [];
};

export const useProducts = () => {
  const queryClient = useQueryClient();

  // Products 쿼리
  const {
    data: products = [],
    isLoading: loading,
    error,
    refetch: refetchProducts
  } = useQuery({
    queryKey: [QUERY_KEYS.PRODUCTS.ALL],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000, // 5분
  });

  // 숨겨진 제품들 쿼리
  const {
    data: hiddenProductIds = [],
    refetch: refetchHiddenProducts
  } = useQuery({
    queryKey: ['products-hidden'],
    queryFn: fetchHiddenProducts,
    staleTime: 5 * 60 * 1000, // 5분
  });

  // 가시적인 제품들 계산
  const visibleProducts = useMemo(() => {
    return products.filter(product => !hiddenProductIds.includes(product.id));
  }, [products, hiddenProductIds]);

  // 제품 생성 mutation
  const createProductMutation = useMutation({
    mutationFn: async (productData: Partial<Product>) => {
      const insertPayload = {
        ...productData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        features: Array.isArray(productData.features) ? productData.features : [],
        detail_images: Array.isArray(productData.detail_images) ? productData.detail_images : []
      };

      const { data, error } = await (supabase as unknown as SupabaseClient)
        .from('product_introductions')
        .insert([insertPayload])
        .select(SELECT_COLUMNS);

      if (error) throw error;
      if (!data || !data[0]) throw new Error('Failed to create product');

      return {
        ...data[0],
        features: data[0].features || [],
        detail_images: data[0].detail_images || []
      };
    },
    onSuccess: (newProduct) => {
      // 모든 관련 쿼리 캐시 무효화
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS.ALL] });
      queryClient.invalidateQueries({ queryKey: ['products-hidden'] });

      // Optimistic update로 즉시 반영
      queryClient.setQueryData([QUERY_KEYS.PRODUCTS.ALL], (oldData: Product[] | undefined) => {
        if (!oldData) return [newProduct];
        return [...oldData, newProduct];
      });

      console.log('Product created successfully:', newProduct);
    },
    onError: (error) => {
      console.error('Error creating product:', error);
    }
  });

  // 제품 업데이트 mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ productId, updates }: { productId: string; updates: Partial<Product> }) => {
      console.log('🔄 Starting product update mutation...', { productId, updates });

      const payload = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      console.log('📤 Sending update to Supabase:', payload);

      const { data, error } = await (supabase as unknown as SupabaseClient)
        .from('product_introductions')
        .update(payload)
        .eq('id', productId)
        .select(SELECT_COLUMNS);

      console.log('📥 Supabase response:', { data, error });

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }
      if (!data || !data[0]) {
        console.error('❌ No data returned from update');
        throw new Error('Failed to update product');
      }

      const result = {
        ...data[0],
        detail_images: data[0].detail_images || []
      };

      console.log('✅ Update successful, returning:', result);
      return result;
    },
    onSuccess: (updatedProduct, { productId }) => {
      console.log('🎉 Product update onSuccess triggered:', { productId, updatedProduct });

      // 강력한 캐시 무효화 - 모든 products 관련 쿼리 무효화
      console.log('🔄 Invalidating ALL product queries...');
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0];
          return typeof key === 'string' && key.includes('products');
        }
      });

      // 직접 캐시 업데이트
      console.log('🔄 Force setting query data...');
      queryClient.setQueryData([QUERY_KEYS.PRODUCTS.ALL], (oldData: Product[] | undefined) => {
        console.log('📊 Current products data before update:', oldData);
        if (!oldData) {
          console.log('📊 No old data, returning single product');
          return [updatedProduct];
        }
        const newData = oldData.map(p => {
          if (p.id === productId) {
            console.log('📊 Updating product:', p.name, '→', updatedProduct.name);
            return updatedProduct;
          }
          return p;
        });
        console.log('📊 Final updated products data:', newData);
        return newData;
      });

      // 캐시 상태 확인
      console.log('🔍 Cache state before refetch:');
      debugQueryCache();

      // 추가로 강제 리페치도 실행
      setTimeout(() => {
        console.log('🔄 Force refetching after 100ms...');
        queryClient.refetchQueries({ queryKey: [QUERY_KEYS.PRODUCTS.ALL] });

        // 리페치 후 캐시 상태 다시 확인
        setTimeout(() => {
          console.log('🔍 Cache state after refetch:');
          debugQueryCache();
        }, 200);
      }, 100);

      console.log('✅ Product updated successfully and cache updated!');
    },
    onError: (error) => {
      console.error('❌ Product update error:', error);
    }
  });

  // 제품 삭제 mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await (supabase as unknown as SupabaseClient)
        .from('product_introductions')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      return productId;
    },
    onSuccess: (productId) => {
      // 모든 관련 쿼리 캐시 무효화
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS.ALL] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS.BY_ID(productId)] });

      // Optimistic update로 즉시 반영
      queryClient.setQueryData([QUERY_KEYS.PRODUCTS.ALL], (oldData: Product[] | undefined) => {
        if (!oldData) return [];
        return oldData.filter(p => p.id !== productId);
      });

      console.log('Product deleted successfully:', productId);
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
    }
  });

  // 제품 가시성 토글 mutation
  const toggleVisibilityMutation = useMutation({
    mutationFn: async (productId: string) => {
      const isHidden = hiddenProductIds.includes(productId);

      if (isHidden) {
        const { error } = await (supabase as unknown as SupabaseClient)
          .from('product_introduction_hidden')
          .delete()
          .eq('product_id', productId);
        if (error) throw error;
        return { productId, action: 'show' };
      } else {
        const { error } = await (supabase as unknown as SupabaseClient)
          .from('product_introduction_hidden')
          .insert([{ product_id: productId }]);
        if (error) throw error;
        return { productId, action: 'hide' };
      }
    },
    onSuccess: ({ productId, action }) => {
      // 숨겨진 제품 쿼리 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['products-hidden'] });

      // Optimistic update로 즉시 반영
      queryClient.setQueryData(['products-hidden'], (oldData: string[] | undefined) => {
        if (!oldData) return action === 'hide' ? [productId] : [];
        if (action === 'hide') {
          return [...oldData, productId];
        } else {
          return oldData.filter(id => id !== productId);
        }
      });

      console.log(`Product ${action} successfully:`, productId);
    },
    onError: (error) => {
      console.error('Error toggling product visibility:', error);
    }
  });

  // 래퍼 함수들 (기존 API 유지)
  const createProduct = useCallback(async (productData: Partial<Product>) => {
    try {
      const result = await createProductMutation.mutateAsync(productData);
      return { data: result };
    } catch (error) {
      return { error };
    }
  }, [createProductMutation]);

  const updateProduct = useCallback(async (productId: string, updates: Partial<Product>) => {
    try {
      const result = await updateProductMutation.mutateAsync({ productId, updates });
      return { data: result };
    } catch (error) {
      return { error };
    }
  }, [updateProductMutation]);

  const deleteProduct = useCallback(async (productId: string) => {
    try {
      await deleteProductMutation.mutateAsync(productId);
      return { success: true };
    } catch (error) {
      return { error };
    }
  }, [deleteProductMutation]);

  const toggleProductVisibility = useCallback(async (productId: string) => {
    try {
      await toggleVisibilityMutation.mutateAsync(productId);
    } catch (error) {
      console.error('Error toggling product visibility:', error);
    }
  }, [toggleVisibilityMutation]);

  // 수동 refetch 함수
  const refetch = useCallback(async () => {
    await Promise.all([refetchProducts(), refetchHiddenProducts()]);
  }, [refetchProducts, refetchHiddenProducts]);

  return {
    products,
    visibleProducts,
    hiddenProductIds,
    loading,
    error: error ? (error instanceof Error ? error.message : 'Failed to fetch products') : null,
    toggleProductVisibility,
    createProduct,
    updateProduct,
    deleteProduct,
    refetch
  };
};
