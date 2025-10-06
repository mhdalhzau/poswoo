import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserSession, PosSettings } from '@shared/schema';

interface AuthState {
  user: UserSession | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => void;
}

interface SettingsState {
  settings: PosSettings | null;
  isConnected: boolean;
  setSettings: (settings: PosSettings) => void;
  testConnection: (config: { storeUrl: string; consumerKey: string; consumerSecret: string }) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: async (username: string, password: string) => {
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          });
          
          if (!response.ok) {
            throw new Error('Login failed');
          }
          
          const data = await response.json();
          set({
            user: data.session,
            token: data.token,
            isAuthenticated: true,
          });
        } catch (error) {
          throw error;
        }
      },
      
      logout: async () => {
        const { token } = get();
        if (token) {
          try {
            await fetch('/api/auth/logout', {
              method: 'POST',
              headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
            });
          } catch (error) {
            console.error('Logout request failed:', error);
          }
        }
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
      
      initialize: () => {
        const { token } = get();
        if (token) {
          // Verify token is still valid
          fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` },
          })
            .then(response => {
              if (!response.ok) {
                throw new Error('Token invalid');
              }
              return response.json();
            })
            .then(data => {
              set({
                user: data.user,
                isAuthenticated: true,
              });
            })
            .catch(() => {
              set({
                user: null,
                token: null,
                isAuthenticated: false,
              });
            });
        }
      },
    }),
    {
      name: 'dreampos-auth',
    }
  )
);

export const useSettingsStore = create<SettingsState>()((set, get) => ({
  settings: null,
  isConnected: false,
  
  setSettings: (settings: PosSettings) => {
    set({ settings, isConnected: true });
  },
  
  testConnection: async (config) => {
    try {
      const response = await fetch('/api/settings/test-connection', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${useAuthStore.getState().token}`
        },
        body: JSON.stringify(config),
      });
      
      const result = await response.json();
      const connected = response.ok && result.connected;
      set({ isConnected: connected });
      return connected;
    } catch (error) {
      set({ isConnected: false });
      return false;
    }
  },
}));

// Cart state for POS
interface CartItem {
  id: number;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  subtotal: number;
  image?: string;
}

interface CartState {
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  selectedCustomer: any;
  paymentMethod: string;
  addItem: (product: any) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  setDiscount: (discount: number) => void;
  setCustomer: (customer: any) => void;
  setPaymentMethod: (method: string) => void;
  clearCart: () => void;
  calculateTotals: () => void;
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  subtotal: 0,
  discount: 0,
  tax: 0,
  total: 0,
  selectedCustomer: null,
  paymentMethod: 'cash',
  
  addItem: (product) => {
    const { items } = get();
    const existingItem = items.find(item => item.id === product.id);
    
    if (existingItem) {
      get().updateQuantity(product.id, existingItem.quantity + 1);
    } else {
      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        sku: product.sku,
        price: parseFloat(product.price) || 0,
        quantity: 1,
        subtotal: parseFloat(product.price) || 0,
        image: product.images?.[0]?.src,
      };
      
      set({ items: [...items, newItem] });
      get().calculateTotals();
    }
  },
  
  removeItem: (productId) => {
    const { items } = get();
    set({ items: items.filter(item => item.id !== productId) });
    get().calculateTotals();
  },
  
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    
    const { items } = get();
    const updatedItems = items.map(item => 
      item.id === productId 
        ? { ...item, quantity, subtotal: item.price * quantity }
        : item
    );
    
    set({ items: updatedItems });
    get().calculateTotals();
  },
  
  setDiscount: (discount) => {
    set({ discount });
    get().calculateTotals();
  },
  
  setCustomer: (customer) => {
    set({ selectedCustomer: customer });
  },
  
  setPaymentMethod: (method) => {
    set({ paymentMethod: method });
  },
  
  clearCart: () => {
    set({
      items: [],
      subtotal: 0,
      discount: 0,
      tax: 0,
      total: 0,
      selectedCustomer: null,
      paymentMethod: 'cash',
    });
  },
  
  calculateTotals: () => {
    const { items, discount } = get();
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const discountAmount = typeof discount === 'number' ? discount : 0;
    const taxAmount = (subtotal - discountAmount) * 0.1; // 10% tax
    const total = subtotal - discountAmount + taxAmount;
    
    set({
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(taxAmount * 100) / 100,
      total: Math.round(total * 100) / 100,
    });
  },
}));
