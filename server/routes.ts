import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPosSettingsSchema, insertPosOrderSchema, insertUserSessionSchema, type UserSession } from "@shared/schema";
import axios from "axios";
import jwt from "jsonwebtoken";
import https from "https";

interface AuthRequest extends Request {
  user?: UserSession;
}

interface WooCommerceConfig {
  url: string;
  consumerKey: string;
  consumerSecret: string;
}

// WooCommerce API client
class WooCommerceAPI {
  private config: WooCommerceConfig;

  constructor(config: WooCommerceConfig) {
    this.config = config;
  }

  private getAuthHeaders() {
    const auth = Buffer.from(`${this.config.consumerKey}:${this.config.consumerSecret}`).toString('base64');
    return {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    };
  }

  async get(endpoint: string, params?: any) {
    try {
      const response = await axios.get(`${this.config.url}/wp-json/wc/v3${endpoint}`, {
        headers: this.getAuthHeaders(),
        params,
        timeout: 10000,
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      });
      return response.data;
    } catch (error) {
      console.error('WooCommerce API Error:', error);
      throw error;
    }
  }

  async post(endpoint: string, data: any) {
    try {
      const response = await axios.post(`${this.config.url}/wp-json/wc/v3${endpoint}`, data, {
        headers: this.getAuthHeaders(),
        timeout: 10000,
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      });
      return response.data;
    } catch (error) {
      console.error('WooCommerce API Error:', error);
      throw error;
    }
  }

  async put(endpoint: string, data: any) {
    try {
      const response = await axios.put(`${this.config.url}/wp-json/wc/v3${endpoint}`, data, {
        headers: this.getAuthHeaders(),
        timeout: 10000,
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      });
      return response.data;
    } catch (error) {
      console.error('WooCommerce API Error:', error);
      throw error;
    }
  }
}

// Middleware to check authentication
async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = authHeader.substring(7);
  const session = await storage.getUserSession(token);
  
  if (!session) {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }

  req.user = session;
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // In a real implementation, validate against WordPress users
      // For now, create a demo session
      const sessionToken = jwt.sign({ username }, process.env.SESSION_SECRET || 'demo-secret', { expiresIn: '24h' });
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      const session = await storage.createUserSession({
        userId: 'demo-user',
        username,
        displayName: username,
        email: `${username}@store.com`,
        role: 'admin',
        permissions: {
          canViewReports: true,
          canManageProducts: true,
          canManageCustomers: true,
          canProcessRefunds: true,
          canAccessSettings: true,
        },
        sessionToken,
        expiresAt,
      });

      res.json({ 
        session: { 
          ...session, 
          sessionToken: undefined // Don't send token in response body
        },
        token: sessionToken 
      });
    } catch (error) {
      res.status(500).json({ message: 'Login failed', error: error.message });
    }
  });

  app.post("/api/auth/logout", requireAuth, async (req, res) => {
    try {
      const token = req.headers.authorization?.substring(7);
      if (token) {
        await storage.deleteUserSession(token);
      }
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Logout failed', error: error.message });
    }
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    res.json({ user: req.user });
  });

  // Settings routes
  app.get("/api/settings", requireAuth, async (req, res) => {
    try {
      const settings = await storage.getPosSettings();
      if (!settings) {
        return res.status(404).json({ message: 'Settings not found' });
      }
      // Don't expose sensitive credentials
      const publicSettings = {
        ...settings,
        consumerKey: settings.consumerKey ? '••••••••••••' + settings.consumerKey.slice(-4) : '',
        consumerSecret: '••••••••••••',
      };
      res.json(publicSettings);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get settings', error: error.message });
    }
  });

  app.post("/api/settings", requireAuth, async (req, res) => {
    try {
      const validatedData = insertPosSettingsSchema.parse(req.body);
      const settings = await storage.createPosSettings(validatedData);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ message: 'Invalid settings data', error: error.message });
    }
  });

  app.put("/api/settings/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const settings = await storage.updatePosSettings(id, updates);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update settings', error: error.message });
    }
  });

  // Test WooCommerce connection
  app.post("/api/settings/test-connection", requireAuth, async (req, res) => {
    try {
      const { storeUrl, consumerKey, consumerSecret } = req.body;
      
      const wc = new WooCommerceAPI({ url: storeUrl, consumerKey, consumerSecret });
      const systemStatus = await wc.get('/system_status');
      
      res.json({ 
        connected: true, 
        message: 'Connection successful',
        woocommerceVersion: systemStatus.environment?.version || 'Unknown'
      });
    } catch (error) {
      res.status(400).json({ 
        connected: false, 
        message: 'Connection failed', 
        error: error.response?.data?.message || error.message 
      });
    }
  });

  // Product routes (with WooCommerce integration)
  app.get("/api/products", requireAuth, async (req, res) => {
    try {
      const { search, category, per_page = 20, page = 1 } = req.query;
      
      // Try to get from cache first
      let products = search ? 
        await storage.searchCachedProducts(search as string) : 
        await storage.getCachedProducts(parseInt(per_page as string));

      // If cache is empty or stale, fetch from WooCommerce
      if (products.length === 0) {
        const settings = await storage.getPosSettings();
        if (settings) {
          try {
            const wc = new WooCommerceAPI({
              url: settings.storeUrl,
              consumerKey: settings.consumerKey,
              consumerSecret: settings.consumerSecret,
            });

            const wcProducts = await wc.get('/products', {
              search,
              category,
              per_page,
              page,
              status: 'publish',
            });

            // Cache the products
            const cachedProducts = wcProducts.map((product: any) => ({
              id: product.id,
              name: product.name,
              slug: product.slug,
              sku: product.sku,
              price: product.price,
              regularPrice: product.regular_price,
              salePrice: product.sale_price,
              onSale: product.on_sale,
              status: product.status,
              stockStatus: product.stock_status,
              stockQuantity: product.stock_quantity,
              manageStock: product.manage_stock,
              categories: product.categories,
              images: product.images,
              weight: product.weight,
              dimensions: product.dimensions,
              shortDescription: product.short_description,
              description: product.description,
              lastSyncAt: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
            }));

            await storage.setCachedProducts(cachedProducts);
            products = cachedProducts;
          } catch (error) {
            console.error('Failed to fetch from WooCommerce:', error);
          }
        }
      }

      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get products', error: error.message });
    }
  });

  app.get("/api/products/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const product = await storage.getCachedProduct(parseInt(id));
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.json(product);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get product', error: error.message });
    }
  });

  // Product search by SKU/barcode
  app.get("/api/products/search/barcode/:code", requireAuth, async (req, res) => {
    try {
      const { code } = req.params;
      const product = await storage.getCachedProductBySku(code);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.json(product);
    } catch (error) {
      res.status(500).json({ message: 'Failed to search by barcode', error: error.message });
    }
  });

  // Update product stock in WooCommerce
  app.put("/api/products/:id/stock", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      
      const settings = await storage.getPosSettings();
      if (!settings) {
        return res.status(400).json({ message: 'WooCommerce settings not configured' });
      }

      const wc = new WooCommerceAPI({
        url: settings.storeUrl,
        consumerKey: settings.consumerKey,
        consumerSecret: settings.consumerSecret,
      });

      const updatedProduct = await wc.put(`/products/${id}`, {
        stock_quantity: quantity,
      });

      // Update cache
      await storage.updateCachedProduct(parseInt(id), {
        stockQuantity: updatedProduct.stock_quantity,
        stockStatus: updatedProduct.stock_status,
        updatedAt: new Date(),
      });

      res.json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update product stock', error: error.message });
    }
  });

  // Customer routes
  app.get("/api/customers", requireAuth, async (req, res) => {
    try {
      const { search, per_page = 20, page = 1 } = req.query;
      
      let customers = search ? 
        await storage.searchCachedCustomers(search as string) : 
        await storage.getCachedCustomers(parseInt(per_page as string));

      // If cache is empty, fetch from WooCommerce
      if (customers.length === 0) {
        const settings = await storage.getPosSettings();
        if (settings) {
          try {
            const wc = new WooCommerceAPI({
              url: settings.storeUrl,
              consumerKey: settings.consumerKey,
              consumerSecret: settings.consumerSecret,
            });

            const wcCustomers = await wc.get('/customers', {
              search,
              per_page,
              page,
            });

            // Cache the customers
            const cachedCustomers = wcCustomers.map((customer: any) => ({
              id: customer.id,
              email: customer.email,
              firstName: customer.first_name,
              lastName: customer.last_name,
              username: customer.username,
              billing: customer.billing,
              shipping: customer.shipping,
              avatarUrl: customer.avatar_url,
              totalSpent: customer.total_spent,
              ordersCount: customer.orders_count,
              lastSyncAt: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
            }));

            await storage.setCachedCustomers(cachedCustomers);
            customers = cachedCustomers;
          } catch (error) {
            console.error('Failed to fetch customers from WooCommerce:', error);
          }
        }
      }

      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get customers', error: error.message });
    }
  });

  // Create customer in WooCommerce
  app.post("/api/customers", requireAuth, async (req, res) => {
    try {
      const { email, firstName, lastName, phone, billing, shipping } = req.body;
      
      const settings = await storage.getPosSettings();
      if (!settings) {
        return res.status(400).json({ message: 'WooCommerce settings not configured' });
      }

      const wc = new WooCommerceAPI({
        url: settings.storeUrl,
        consumerKey: settings.consumerKey,
        consumerSecret: settings.consumerSecret,
      });

      const customerData = {
        email,
        first_name: firstName,
        last_name: lastName,
        billing: billing || {
          first_name: firstName,
          last_name: lastName,
          phone: phone || '',
        },
        shipping: shipping || {
          first_name: firstName,
          last_name: lastName,
        },
      };

      const wcCustomer = await wc.post('/customers', customerData);

      // Cache the new customer
      const cachedCustomer = {
        id: wcCustomer.id,
        email: wcCustomer.email,
        firstName: wcCustomer.first_name,
        lastName: wcCustomer.last_name,
        username: wcCustomer.username,
        billing: wcCustomer.billing,
        shipping: wcCustomer.shipping,
        avatarUrl: wcCustomer.avatar_url,
        totalSpent: wcCustomer.total_spent,
        ordersCount: wcCustomer.orders_count,
        lastSyncAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await storage.setCachedCustomer(cachedCustomer);

      res.json(wcCustomer);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create customer', error: error.message });
    }
  });

  // Order routes
  app.post("/api/orders", requireAuth, async (req, res) => {
    try {
      const orderData = insertPosOrderSchema.parse({
        ...req.body,
        cashierId: req.user.userId,
        cashierName: req.user.displayName,
      });

      // Generate order ID
      const orderNumber = Date.now().toString();
      const orderId = `POS-${orderNumber}`;
      
      const order = await storage.createPosOrder({
        ...orderData,
        orderId,
      });

      // Try to sync to WooCommerce immediately
      const settings = await storage.getPosSettings();
      if (settings) {
        try {
          const wc = new WooCommerceAPI({
            url: settings.storeUrl,
            consumerKey: settings.consumerKey,
            consumerSecret: settings.consumerSecret,
          });

          const wcOrderData = {
            status: 'processing',
            customer_id: order.customerId || 0,
            billing: order.customerEmail ? {
              email: order.customerEmail,
              first_name: order.customerName?.split(' ')[0] || '',
              last_name: order.customerName?.split(' ').slice(1).join(' ') || '',
            } : {},
            line_items: order.items?.map((item: any) => ({
              product_id: item.id,
              quantity: item.quantity,
              total: item.subtotal.toString(),
            })) || [],
            meta_data: [
              {
                key: '_pos_order_id',
                value: order.orderId,
              },
              {
                key: '_pos_cashier',
                value: order.cashierName,
              },
            ],
          };

          const wcOrder = await wc.post('/orders', wcOrderData);
          
          // Update local order with WooCommerce ID
          await storage.updatePosOrder(order.id, {
            woocommerceOrderId: wcOrder.id,
            syncedToWoocommerce: true,
          });
        } catch (error) {
          console.error('Failed to sync order to WooCommerce:', error);
          // Order is saved locally, sync can be retried later
        }
      }

      res.json(order);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create order', error: error.message });
    }
  });

  app.get("/api/orders", requireAuth, async (req, res) => {
    try {
      const { limit } = req.query;
      const orders = await storage.getAllPosOrders(limit ? parseInt(limit as string) : undefined);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get orders', error: error.message });
    }
  });

  app.get("/api/orders/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const order = await storage.getPosOrder(id);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get order', error: error.message });
    }
  });

  // Sync products from WooCommerce
  app.post("/api/products/sync", requireAuth, async (req, res) => {
    try {
      const settings = await storage.getPosSettings();
      if (!settings) {
        return res.status(400).json({ message: 'WooCommerce settings not configured' });
      }

      const wc = new WooCommerceAPI({
        url: settings.storeUrl,
        consumerKey: settings.consumerKey,
        consumerSecret: settings.consumerSecret,
      });

      let allProducts: any[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const wcProducts = await wc.get('/products', {
          per_page: 100,
          page,
          status: 'publish',
        });

        if (wcProducts.length === 0) {
          hasMore = false;
        } else {
          allProducts = allProducts.concat(wcProducts);
          page++;
          if (wcProducts.length < 100) {
            hasMore = false;
          }
        }
      }

      const cachedProducts = allProducts.map((product: any) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        price: product.price,
        regularPrice: product.regular_price,
        salePrice: product.sale_price,
        onSale: product.on_sale,
        status: product.status,
        stockStatus: product.stock_status,
        stockQuantity: product.stock_quantity,
        manageStock: product.manage_stock,
        categories: product.categories,
        images: product.images,
        weight: product.weight,
        dimensions: product.dimensions,
        shortDescription: product.short_description,
        description: product.description,
        lastSyncAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      await storage.setCachedProducts(cachedProducts);

      res.json({ 
        success: true, 
        message: `Synced ${cachedProducts.length} products from WooCommerce`,
        count: cachedProducts.length 
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to sync products', error: error.message });
    }
  });

  // Sync customers from WooCommerce
  app.post("/api/customers/sync", requireAuth, async (req, res) => {
    try {
      const settings = await storage.getPosSettings();
      if (!settings) {
        return res.status(400).json({ message: 'WooCommerce settings not configured' });
      }

      const wc = new WooCommerceAPI({
        url: settings.storeUrl,
        consumerKey: settings.consumerKey,
        consumerSecret: settings.consumerSecret,
      });

      let allCustomers: any[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const wcCustomers = await wc.get('/customers', {
          per_page: 100,
          page,
        });

        if (wcCustomers.length === 0) {
          hasMore = false;
        } else {
          allCustomers = allCustomers.concat(wcCustomers);
          page++;
          if (wcCustomers.length < 100) {
            hasMore = false;
          }
        }
      }

      const cachedCustomers = allCustomers.map((customer: any) => ({
        id: customer.id,
        email: customer.email,
        firstName: customer.first_name,
        lastName: customer.last_name,
        username: customer.username,
        billing: customer.billing,
        shipping: customer.shipping,
        avatarUrl: customer.avatar_url,
        totalSpent: customer.total_spent,
        ordersCount: customer.orders_count,
        lastSyncAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      await storage.setCachedCustomers(cachedCustomers);

      res.json({ 
        success: true, 
        message: `Synced ${cachedCustomers.length} customers from WooCommerce`,
        count: cachedCustomers.length 
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to sync customers', error: error.message });
    }
  });

  // Fetch orders from WooCommerce
  app.post("/api/orders/fetch", requireAuth, async (req, res) => {
    try {
      const settings = await storage.getPosSettings();
      if (!settings) {
        return res.status(400).json({ message: 'WooCommerce settings not configured' });
      }

      const wc = new WooCommerceAPI({
        url: settings.storeUrl,
        consumerKey: settings.consumerKey,
        consumerSecret: settings.consumerSecret,
      });

      const wcOrders = await wc.get('/orders', {
        per_page: 50,
        orderby: 'date',
        order: 'desc',
      });

      res.json({ 
        success: true, 
        message: `Fetched ${wcOrders.length} orders from WooCommerce`,
        orders: wcOrders,
        count: wcOrders.length 
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
    }
  });

  // Sync unsynced orders to WooCommerce
  app.post("/api/orders/sync", requireAuth, async (req, res) => {
    try {
      const unsyncedOrders = await storage.getUnsyncedOrders();
      const settings = await storage.getPosSettings();
      
      if (!settings) {
        return res.status(400).json({ message: 'WooCommerce settings not configured' });
      }

      const wc = new WooCommerceAPI({
        url: settings.storeUrl,
        consumerKey: settings.consumerKey,
        consumerSecret: settings.consumerSecret,
      });

      const results = [];
      
      for (const order of unsyncedOrders) {
        try {
          const wcOrderData = {
            status: 'processing',
            customer_id: order.customerId || 0,
            line_items: order.items?.map((item: any) => ({
              product_id: item.id,
              quantity: item.quantity,
              total: item.subtotal.toString(),
            })) || [],
            meta_data: [
              {
                key: '_pos_order_id',
                value: order.orderId,
              },
            ],
          };

          const wcOrder = await wc.post('/orders', wcOrderData);
          
          await storage.updatePosOrder(order.id, {
            woocommerceOrderId: wcOrder.id,
            syncedToWoocommerce: true,
          });

          results.push({ orderId: order.orderId, success: true, woocommerceId: wcOrder.id });
        } catch (error) {
          results.push({ orderId: order.orderId, success: false, error: error.message });
        }
      }

      res.json({ syncedOrders: results });
    } catch (error) {
      res.status(500).json({ message: 'Failed to sync orders', error: error.message });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const orders = await storage.getAllPosOrders();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayOrders = orders.filter(order => 
        new Date(order.createdAt) >= today && order.status === 'completed'
      );
      
      const todaysSales = todayOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
      const totalOrders = orders.filter(order => order.status === 'completed').length;
      const products = await storage.getCachedProducts();
      const customers = await storage.getCachedCustomers();

      res.json({
        todaysSales: todaysSales.toFixed(2),
        todaysOrders: todayOrders.length,
        totalProducts: products.length,
        totalCustomers: customers.length,
        lowStockProducts: products.filter(p => p.stockQuantity !== null && p.stockQuantity < 10).length,
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get dashboard stats', error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
