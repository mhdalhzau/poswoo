import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// POS Settings
export const posSettings = pgTable("pos_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  storeUrl: text("store_url").notNull(),
  consumerKey: text("consumer_key").notNull(),
  consumerSecret: text("consumer_secret").notNull(),
  cacheDuration: integer("cache_duration").default(5),
  autoRefresh: boolean("auto_refresh").default(true),
  permissions: json("permissions").$type<{
    products: boolean;
    orders: boolean;
    customers: boolean;
    inventory: boolean;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// POS Orders (local tracking before sync to WooCommerce)
export const posOrders = pgTable("pos_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: text("order_id").notNull().unique(),
  woocommerceOrderId: integer("woocommerce_order_id"),
  customerId: integer("customer_id"),
  customerName: text("customer_name"),
  customerEmail: text("customer_email"),
  status: text("status").notNull().default("pending"), // pending, processing, completed, cancelled
  items: json("items").$type<Array<{
    id: number;
    name: string;
    sku: string;
    price: number;
    quantity: number;
    subtotal: number;
  }>>(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  tax: decimal("tax", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(), // cash, card, digital, split
  amountPaid: decimal("amount_paid", { precision: 10, scale: 2 }),
  change: decimal("change", { precision: 10, scale: 2 }),
  cashierId: text("cashier_id").notNull(),
  cashierName: text("cashier_name").notNull(),
  receiptPrinted: boolean("receipt_printed").default(false),
  syncedToWoocommerce: boolean("synced_to_woocommerce").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cached WooCommerce Products
export const cachedProducts = pgTable("cached_products", {
  id: integer("id").primaryKey(), // WooCommerce product ID
  name: text("name").notNull(),
  slug: text("slug"),
  sku: text("sku"),
  price: text("price"),
  regularPrice: text("regular_price"),
  salePrice: text("sale_price"),
  onSale: boolean("on_sale").default(false),
  status: text("status").notNull(), // publish, private, draft
  stockStatus: text("stock_status"), // instock, outofstock, onbackorder
  stockQuantity: integer("stock_quantity"),
  manageStock: boolean("manage_stock").default(false),
  categories: json("categories").$type<Array<{
    id: number;
    name: string;
    slug: string;
  }>>(),
  images: json("images").$type<Array<{
    id: number;
    src: string;
    name: string;
    alt: string;
  }>>(),
  weight: text("weight"),
  dimensions: json("dimensions").$type<{
    length: string;
    width: string;
    height: string;
  }>(),
  shortDescription: text("short_description"),
  description: text("description"),
  lastSyncAt: timestamp("last_sync_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cached WooCommerce Customers
export const cachedCustomers = pgTable("cached_customers", {
  id: integer("id").primaryKey(), // WooCommerce customer ID
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  displayName: text("display_name"),
  username: text("username"),
  billing: json("billing").$type<{
    firstName: string;
    lastName: string;
    company: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
  }>(),
  shipping: json("shipping").$type<{
    firstName: string;
    lastName: string;
    company: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  }>(),
  avatarUrl: text("avatar_url"),
  dateCreated: timestamp("date_created"),
  ordersCount: integer("orders_count").default(0),
  totalSpent: text("total_spent").default("0"),
  lastSyncAt: timestamp("last_sync_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User sessions for POS access
export const userSessions = pgTable("user_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  username: text("username").notNull(),
  displayName: text("display_name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("cashier"), // admin, manager, cashier
  permissions: json("permissions").$type<{
    canViewReports: boolean;
    canManageProducts: boolean;
    canManageCustomers: boolean;
    canProcessRefunds: boolean;
    canAccessSettings: boolean;
  }>(),
  sessionToken: text("session_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Stock Adjustments History
export const stockAdjustments = pgTable("stock_adjustments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: integer("product_id").notNull(),
  sessionId: varchar("session_id"),
  username: text("username").notNull(),
  adjustmentType: text("adjustment_type").notNull(),
  quantityChange: integer("quantity_change").notNull(),
  quantityBefore: integer("quantity_before").notNull(),
  quantityAfter: integer("quantity_after").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPosSettingsSchema = createInsertSchema(posSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPosOrderSchema = createInsertSchema(posOrders).omit({
  id: true,
  woocommerceOrderId: true,
  syncedToWoocommerce: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  id: true,
  createdAt: true,
});

export const insertStockAdjustmentSchema = createInsertSchema(stockAdjustments).omit({
  id: true,
  createdAt: true,
});

export type InsertPosSettings = z.infer<typeof insertPosSettingsSchema>;
export type InsertPosOrder = z.infer<typeof insertPosOrderSchema>;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type InsertStockAdjustment = z.infer<typeof insertStockAdjustmentSchema>;

export type PosSettings = typeof posSettings.$inferSelect;
export type PosOrder = typeof posOrders.$inferSelect;
export type CachedProduct = typeof cachedProducts.$inferSelect;
export type CachedCustomer = typeof cachedCustomers.$inferSelect;
export type UserSession = typeof userSessions.$inferSelect;
export type StockAdjustment = typeof stockAdjustments.$inferSelect;
