import { 
  type PosSettings, 
  type InsertPosSettings,
  type PosOrder,
  type InsertPosOrder,
  type CachedProduct,
  type CachedCustomer,
  type UserSession,
  type InsertUserSession,
  type StockAdjustment,
  type InsertStockAdjustment
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Settings
  getPosSettings(): Promise<PosSettings | undefined>;
  createPosSettings(settings: InsertPosSettings): Promise<PosSettings>;
  updatePosSettings(id: string, settings: Partial<InsertPosSettings>): Promise<PosSettings>;

  // Orders
  createPosOrder(order: InsertPosOrder): Promise<PosOrder>;
  getPosOrder(id: string): Promise<PosOrder | undefined>;
  getPosOrderByOrderId(orderId: string): Promise<PosOrder | undefined>;
  getAllPosOrders(limit?: number): Promise<PosOrder[]>;
  updatePosOrder(id: string, order: Partial<PosOrder>): Promise<PosOrder>;
  getUnsyncedOrders(): Promise<PosOrder[]>;

  // Cached Products
  getCachedProducts(limit?: number): Promise<CachedProduct[]>;
  getCachedProduct(id: number): Promise<CachedProduct | undefined>;
  setCachedProducts(products: CachedProduct[]): Promise<void>;
  setCachedProduct(product: CachedProduct): Promise<void>;
  updateCachedProduct(id: number, updates: Partial<CachedProduct>): Promise<void>;
  deleteCachedProduct(id: number): Promise<void>;
  searchCachedProducts(query: string): Promise<CachedProduct[]>;
  getCachedProductBySku(sku: string): Promise<CachedProduct | undefined>;

  // Cached Customers
  getCachedCustomers(limit?: number): Promise<CachedCustomer[]>;
  getCachedCustomer(id: number): Promise<CachedCustomer | undefined>;
  setCachedCustomers(customers: CachedCustomer[]): Promise<void>;
  setCachedCustomer(customer: CachedCustomer): Promise<void>;
  searchCachedCustomers(query: string): Promise<CachedCustomer[]>;

  // User Sessions
  createUserSession(session: InsertUserSession): Promise<UserSession>;
  getUserSession(sessionToken: string): Promise<UserSession | undefined>;
  updateUserSession(id: string, session: Partial<UserSession>): Promise<UserSession>;
  deleteUserSession(sessionToken: string): Promise<void>;

  // Stock Adjustments
  recordStockAdjustment(adjustment: InsertStockAdjustment): Promise<StockAdjustment>;
  getStockAdjustmentsByProduct(productId: number, limit?: number): Promise<StockAdjustment[]>;
}

export class MemStorage implements IStorage {
  private settings: Map<string, PosSettings> = new Map();
  private orders: Map<string, PosOrder> = new Map();
  private products: Map<number, CachedProduct> = new Map();
  private customers: Map<number, CachedCustomer> = new Map();
  private sessions: Map<string, UserSession> = new Map();
  private stockAdjustments: Map<string, StockAdjustment> = new Map();

  // Settings
  async getPosSettings(): Promise<PosSettings | undefined> {
    return Array.from(this.settings.values())[0];
  }

  async createPosSettings(insertSettings: InsertPosSettings): Promise<PosSettings> {
    const id = randomUUID();
    const settings: PosSettings = {
      ...insertSettings,
      id,
      permissions: insertSettings.permissions || null,
      cacheDuration: insertSettings.cacheDuration ?? null,
      autoRefresh: insertSettings.autoRefresh ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.settings.set(id, settings);
    return settings;
  }

  async updatePosSettings(id: string, updates: Partial<InsertPosSettings>): Promise<PosSettings> {
    const existing = this.settings.get(id);
    if (!existing) throw new Error("Settings not found");
    
    const updated: PosSettings = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.settings.set(id, updated);
    return updated;
  }

  // Orders
  async createPosOrder(insertOrder: InsertPosOrder): Promise<PosOrder> {
    const id = randomUUID();
    const order: PosOrder = {
      ...insertOrder,
      id,
      woocommerceOrderId: null,
      syncedToWoocommerce: false,
      customerId: insertOrder.customerId ?? null,
      customerName: insertOrder.customerName ?? null,
      customerEmail: insertOrder.customerEmail ?? null,
      items: insertOrder.items ?? null,
      discount: insertOrder.discount ?? null,
      tax: insertOrder.tax ?? null,
      amountPaid: insertOrder.amountPaid ?? null,
      change: insertOrder.change ?? null,
      receiptPrinted: insertOrder.receiptPrinted ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.orders.set(id, order);
    return order;
  }

  async getPosOrder(id: string): Promise<PosOrder | undefined> {
    return this.orders.get(id);
  }

  async getPosOrderByOrderId(orderId: string): Promise<PosOrder | undefined> {
    return Array.from(this.orders.values()).find(order => order.orderId === orderId);
  }

  async getAllPosOrders(limit = 50): Promise<PosOrder[]> {
    return Array.from(this.orders.values())
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, limit);
  }

  async updatePosOrder(id: string, updates: Partial<PosOrder>): Promise<PosOrder> {
    const existing = this.orders.get(id);
    if (!existing) throw new Error("Order not found");
    
    const updated: PosOrder = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.orders.set(id, updated);
    return updated;
  }

  async getUnsyncedOrders(): Promise<PosOrder[]> {
    return Array.from(this.orders.values()).filter(order => !order.syncedToWoocommerce);
  }

  // Cached Products
  async getCachedProducts(limit = 100): Promise<CachedProduct[]> {
    return Array.from(this.products.values()).slice(0, limit);
  }

  async getCachedProduct(id: number): Promise<CachedProduct | undefined> {
    return this.products.get(id);
  }

  async setCachedProducts(products: CachedProduct[]): Promise<void> {
    this.products.clear();
    products.forEach(product => {
      this.products.set(product.id, product);
    });
  }

  async searchCachedProducts(query: string): Promise<CachedProduct[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.products.values()).filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      (product.sku && product.sku.toLowerCase().includes(searchTerm))
    );
  }

  async getCachedProductBySku(sku: string): Promise<CachedProduct | undefined> {
    return Array.from(this.products.values()).find(product => product.sku === sku);
  }

  async setCachedProduct(product: CachedProduct): Promise<void> {
    this.products.set(product.id, product);
  }

  async updateCachedProduct(id: number, updates: Partial<CachedProduct>): Promise<void> {
    const existing = this.products.get(id);
    if (existing) {
      const updated = { ...existing, ...updates };
      this.products.set(id, updated);
    }
  }

  async deleteCachedProduct(id: number): Promise<void> {
    this.products.delete(id);
  }

  // Cached Customers
  async getCachedCustomers(limit = 100): Promise<CachedCustomer[]> {
    return Array.from(this.customers.values()).slice(0, limit);
  }

  async getCachedCustomer(id: number): Promise<CachedCustomer | undefined> {
    return this.customers.get(id);
  }

  async setCachedCustomers(customers: CachedCustomer[]): Promise<void> {
    this.customers.clear();
    customers.forEach(customer => {
      this.customers.set(customer.id, customer);
    });
  }

  async searchCachedCustomers(query: string): Promise<CachedCustomer[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.customers.values()).filter(customer =>
      customer.email.toLowerCase().includes(searchTerm) ||
      (customer.firstName && customer.firstName.toLowerCase().includes(searchTerm)) ||
      (customer.lastName && customer.lastName.toLowerCase().includes(searchTerm)) ||
      (customer.displayName && customer.displayName.toLowerCase().includes(searchTerm))
    );
  }

  async setCachedCustomer(customer: CachedCustomer): Promise<void> {
    this.customers.set(customer.id, customer);
  }

  // User Sessions
  async createUserSession(insertSession: InsertUserSession): Promise<UserSession> {
    const id = randomUUID();
    const session: UserSession = {
      ...insertSession,
      id,
      role: insertSession.role || "cashier",
      permissions: insertSession.permissions || null,
      createdAt: new Date(),
    };
    this.sessions.set(session.sessionToken, session);
    return session;
  }

  async getUserSession(sessionToken: string): Promise<UserSession | undefined> {
    const session = this.sessions.get(sessionToken);
    if (session && new Date() > new Date(session.expiresAt)) {
      this.sessions.delete(sessionToken);
      return undefined;
    }
    return session;
  }

  async updateUserSession(id: string, updates: Partial<UserSession>): Promise<UserSession> {
    const existing = Array.from(this.sessions.values()).find(s => s.id === id);
    if (!existing) throw new Error("Session not found");
    
    const updated: UserSession = {
      ...existing,
      ...updates,
    };
    this.sessions.delete(existing.sessionToken);
    this.sessions.set(updated.sessionToken, updated);
    return updated;
  }

  async deleteUserSession(sessionToken: string): Promise<void> {
    this.sessions.delete(sessionToken);
  }

  // Stock Adjustments
  async recordStockAdjustment(insertAdjustment: InsertStockAdjustment): Promise<StockAdjustment> {
    const id = randomUUID();
    const adjustment: StockAdjustment = {
      ...insertAdjustment,
      id,
      sessionId: insertAdjustment.sessionId ?? null,
      notes: insertAdjustment.notes ?? null,
      createdAt: new Date(),
    };
    this.stockAdjustments.set(id, adjustment);
    return adjustment;
  }

  async getStockAdjustmentsByProduct(productId: number, limit = 50): Promise<StockAdjustment[]> {
    return Array.from(this.stockAdjustments.values())
      .filter(adjustment => adjustment.productId === productId)
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
