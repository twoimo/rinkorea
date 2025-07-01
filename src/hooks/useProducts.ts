import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../integrations/supabase/client';
import { SupabaseClient } from '@supabase/supabase-js';
import { Product } from '@/types/product';

// 언어별 컬럼을 포함한 전체 선택 쿼리
const SELECT_COLUMNS = `
  *,
  name_ko,
  name_en, 
  name_zh,
  description_ko,
  description_en,
  description_zh,
  features_ko,
  features_en,
  features_zh
`;

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [hiddenProductIds, setHiddenProductIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setError(null);
      const { data, error: fetchError } = await (supabase as unknown as SupabaseClient)
        .from('product_introductions')
        .select(SELECT_COLUMNS)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      if (data) {
        const productsWithDetailImages = data.map(product => ({
          ...product,
          detail_images: product.detail_images || []
        }));
        setProducts(productsWithDetailImages);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    }
  }, []);

  const fetchHiddenProducts = useCallback(async () => {
    try {
      const { data, error: fetchError } = await (supabase as unknown as SupabaseClient)
        .from('product_introduction_hidden')
        .select('product_id');

      if (!fetchError && data) {
        setHiddenProductIds(data.map((h: { product_id: string }) => h.product_id));
      }
    } catch (err) {
      console.error('Error fetching hidden products:', err);
    }
  }, []);

  const toggleProductVisibility = useCallback(async (productId: string) => {
    try {
      const isHidden = hiddenProductIds.includes(productId);

      if (isHidden) {
        const { error } = await (supabase as unknown as SupabaseClient)
          .from('product_introduction_hidden')
          .delete()
          .eq('product_id', productId);

        if (!error) {
          setHiddenProductIds(prev => prev.filter(id => id !== productId));
        }
      } else {
        const { error } = await (supabase as unknown as SupabaseClient)
          .from('product_introduction_hidden')
          .insert([{ product_id: productId }]);

        if (!error) {
          setHiddenProductIds(prev => [...prev, productId]);
        }
      }
    } catch (err) {
      console.error('Error toggling product visibility:', err);
    }
  }, [hiddenProductIds]);

  const createProduct = useCallback(async (productData: Partial<Product>) => {
    try {
      console.log('Creating product with data:', productData);
      const insertPayload = {
        ...productData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        features: Array.isArray(productData.features) ? productData.features : [],
        detail_images: Array.isArray(productData.detail_images) ? productData.detail_images : []
      };

      console.log('Insert payload:', insertPayload);

      const { data, error } = await (supabase as unknown as SupabaseClient)
        .from('product_introductions')
        .insert([insertPayload])
        .select(SELECT_COLUMNS);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (data && data[0]) {
        console.log('Created product:', data[0]);
        const newProduct = {
          ...data[0],
          features: data[0].features || [],
          detail_images: data[0].detail_images || []
        };
        setProducts(prev => [...prev, newProduct]);
        return { data: newProduct };
      }
    } catch (err) {
      console.error('Error creating product:', err);
      return { error: err };
    }
  }, []);

  const updateProduct = useCallback(async (productId: string, updates: Partial<Product>) => {
    try {
      const payload = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await (supabase as unknown as SupabaseClient)
        .from('product_introductions')
        .update(payload)
        .eq('id', productId)
        .select(SELECT_COLUMNS);

      if (error) throw error;

      if (data) {
        const updatedProduct = { ...data[0], detail_images: data[0].detail_images || [] };
        setProducts(prev =>
          prev.map(p => p.id === productId ? updatedProduct : p)
        );
        return { data: updatedProduct };
      }
    } catch (err) {
      console.error('Error updating product:', err);
      return { error: err };
    }
  }, []);

  const deleteProduct = useCallback(async (productId: string) => {
    try {
      const { error } = await (supabase as unknown as SupabaseClient)
        .from('product_introductions')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      setProducts(prev => prev.filter(p => p.id !== productId));
      return { success: true };
    } catch (err) {
      console.error('Error deleting product:', err);
      return { error: err };
    }
  }, []);

  const visibleProducts = useMemo(() => {
    return products.filter(product => !hiddenProductIds.includes(product.id));
  }, [products, hiddenProductIds]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchHiddenProducts()]);
      setLoading(false);
    };

    loadData();
  }, [fetchProducts, fetchHiddenProducts]);

  return {
    products,
    visibleProducts,
    hiddenProductIds,
    loading,
    error,
    toggleProductVisibility,
    createProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts
  };
};
