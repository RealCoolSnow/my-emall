import { useState, useEffect, useCallback } from 'react';
import { Product } from 'shared/types';
import { ProductFilters } from '../types';
import { FrontendPaginatedResponse } from '../lib/api';
import productService, { ProductQuery } from '../services/productService';

export interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: ProductFilters;
}

export const useProducts = (initialFilters: ProductFilters = {}) => {
  const [state, setState] = useState<ProductsState>({
    products: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    },
    filters: initialFilters,
  });

  // 加载产品列表
  const loadProducts = useCallback(
    async (query: ProductQuery = {}) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await productService.getProducts({
          page: state.pagination.page,
          limit: state.pagination.limit,
          ...state.filters,
          ...query,
        });

        setState((prev) => ({
          ...prev,
          products: response.data,
          pagination: response.pagination,
          loading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : '加载产品失败',
          loading: false,
        }));
      }
    },
    [state.pagination.page, state.pagination.limit, state.filters]
  );

  // 搜索产品
  const searchProducts = useCallback(async (keyword: string) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, search: keyword },
      pagination: { ...prev.pagination, page: 1 },
    }));
  }, []);

  // 设置筛选条件
  const setFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
      pagination: { ...prev.pagination, page: 1 },
    }));
  }, []);

  // 清除筛选条件
  const clearFilters = useCallback(() => {
    setState((prev) => ({
      ...prev,
      filters: {},
      pagination: { ...prev.pagination, page: 1 },
    }));
  }, []);

  // 翻页
  const goToPage = useCallback((page: number) => {
    setState((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, page },
    }));
  }, []);

  // 设置每页数量
  const setPageSize = useCallback((limit: number) => {
    setState((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, limit, page: 1 },
    }));
  }, []);

  // 刷新产品列表
  const refresh = useCallback(() => {
    loadProducts();
  }, [loadProducts]);

  // 当筛选条件或分页改变时重新加载
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    ...state,
    loadProducts,
    searchProducts,
    setFilters,
    clearFilters,
    goToPage,
    setPageSize,
    refresh,
  };
};
