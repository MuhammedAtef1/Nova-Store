import { api } from '@/lib/api';
import { Category, PaginatedList, ProductDetail, ProductSummary } from '@/types/catalog';

export const CatalogService = {
  async getSettings(): Promise<any[]> {
    const response = await api.get<any[]>('/catalog/settings');
    return response.data;
  },

  async getCategories(): Promise<Category[]> {
    const response = await api.get<Category[]>('/catalog/categories');
    return response.data;
  },

  async getProducts(
    category?: string,
    search?: string,
    page: number = 1,
    pageSize: number = 12
  ): Promise<PaginatedList<ProductSummary>> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());

    const response = await api.get<PaginatedList<ProductSummary>>(`/catalog/products?${params.toString()}`);
    return response.data;
  },

  async getFeaturedProducts(): Promise<ProductSummary[]> {
    const response = await api.get<ProductSummary[]>('/catalog/products/featured');
    return response.data;
  },

  async getNewArrivals(): Promise<ProductSummary[]> {
    const response = await api.get<ProductSummary[]>('/catalog/products/new-arrivals');
    return response.data;
  },

  async getProductBySlug(slug: string): Promise<ProductDetail> {
    const response = await api.get<ProductDetail>(`/catalog/products/${slug}`);
    return response.data;
  }
};
