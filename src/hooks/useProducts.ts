
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  category: string | null;
  stock_quantity: number | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (product: {
    name: string;
    description?: string;
    price?: number;
    image_url?: string;
    category?: string;
    stock_quantity?: number;
  }) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          ...product,
          created_by: user?.id
        })
        .select()
        .single();

      if (error) {
        return { error };
      }

      setProducts(prev => [data, ...prev]);
      return { data };
    } catch (error) {
      return { error };
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { error };
      }

      setProducts(prev => prev.map(product => 
        product.id === id ? data : product
      ));
      return { data };
    } catch (error) {
      return { error };
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        return { error };
      }

      setProducts(prev => prev.filter(product => product.id !== id));
      return { success: true };
    } catch (error) {
      return { error };
    }
  };

  return {
    products,
    loading,
    createProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts
  };
};
