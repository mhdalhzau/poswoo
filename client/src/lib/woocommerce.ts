import { apiRequest, getAuthToken } from './queryClient';
import type { WooCommerceProduct, WooCommerceCustomer, WooCommerceOrder } from '@/types/woocommerce';

export class WooCommerceClient {
  private baseUrl = '/api';

  private async authFetch(url: string, options?: RequestInit): Promise<Response> {
    const token = getAuthToken();
    const headers: Record<string, string> = {
      ...((options?.headers as Record<string, string>) || {}),
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });
    
    return response;
  }

  async getProducts(params?: {
    search?: string;
    category?: string;
    per_page?: number;
    page?: number;
  }): Promise<WooCommerceProduct[]> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString());
    if (params?.page) searchParams.set('page', params.page.toString());

    const response = await this.authFetch(`${this.baseUrl}/products?${searchParams}`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  }

  async getProduct(id: number): Promise<WooCommerceProduct> {
    const response = await this.authFetch(`${this.baseUrl}/products/${id}`);
    if (!response.ok) throw new Error('Failed to fetch product');
    return response.json();
  }

  async searchProductByBarcode(code: string): Promise<WooCommerceProduct> {
    const response = await this.authFetch(`${this.baseUrl}/products/search/barcode/${code}`);
    if (!response.ok) throw new Error('Product not found');
    return response.json();
  }

  async getCustomers(params?: {
    search?: string;
    per_page?: number;
    page?: number;
  }): Promise<WooCommerceCustomer[]> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString());
    if (params?.page) searchParams.set('page', params.page.toString());

    const response = await this.authFetch(`${this.baseUrl}/customers?${searchParams}`);
    if (!response.ok) throw new Error('Failed to fetch customers');
    return response.json();
  }

  async createOrder(orderData: any): Promise<WooCommerceOrder> {
    const response = await apiRequest('POST', `${this.baseUrl}/orders`, orderData);
    return response.json();
  }

  async getOrders(limit?: number): Promise<any[]> {
    const params = limit ? `?limit=${limit}` : '';
    const response = await this.authFetch(`${this.baseUrl}/orders${params}`);
    if (!response.ok) throw new Error('Failed to fetch orders');
    return response.json();
  }

  async getOrder(id: string): Promise<any> {
    const response = await this.authFetch(`${this.baseUrl}/orders/${id}`);
    if (!response.ok) throw new Error('Failed to fetch order');
    return response.json();
  }

  async syncOrders(): Promise<any> {
    const response = await apiRequest('POST', `${this.baseUrl}/orders/sync`, {});
    return response.json();
  }

  async getDashboardStats(): Promise<{
    todaysSales: string;
    todaysOrders: number;
    totalProducts: number;
    totalCustomers: number;
    lowStockProducts: number;
  }> {
    const response = await this.authFetch(`${this.baseUrl}/dashboard/stats`);
    if (!response.ok) throw new Error('Failed to fetch dashboard stats');
    return response.json();
  }

  async testConnection(config: {
    storeUrl: string;
    consumerKey: string;
    consumerSecret: string;
  }): Promise<{ connected: boolean; message: string }> {
    const response = await apiRequest('POST', `${this.baseUrl}/settings/test-connection`, config);
    return response.json();
  }

  async saveSettings(settings: any): Promise<any> {
    const response = await apiRequest('POST', `${this.baseUrl}/settings`, settings);
    return response.json();
  }

  async getSettings(): Promise<any> {
    const response = await this.authFetch(`${this.baseUrl}/settings`);
    if (!response.ok) throw new Error('Failed to fetch settings');
    return response.json();
  }

  async syncProducts(): Promise<{ success: boolean; message: string; count: number }> {
    const response = await apiRequest('POST', `${this.baseUrl}/products/sync`, {});
    return response.json();
  }

  async syncCustomers(): Promise<{ success: boolean; message: string; count: number }> {
    const response = await apiRequest('POST', `${this.baseUrl}/customers/sync`, {});
    return response.json();
  }

  async fetchOrders(): Promise<{ success: boolean; message: string; orders: any[]; count: number }> {
    const response = await apiRequest('POST', `${this.baseUrl}/orders/fetch`, {});
    return response.json();
  }

  async updateProductStock(productId: number, quantity: number): Promise<any> {
    const response = await apiRequest('PUT', `${this.baseUrl}/products/${productId}/stock`, { quantity });
    return response.json();
  }
}

export const woocommerce = new WooCommerceClient();
