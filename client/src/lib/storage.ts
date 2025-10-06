// Local storage utilities for caching and offline support
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export class LocalStorageCache {
  private static instance: LocalStorageCache;
  
  static getInstance(): LocalStorageCache {
    if (!LocalStorageCache.instance) {
      LocalStorageCache.instance = new LocalStorageCache();
    }
    return LocalStorageCache.instance;
  }

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      localStorage.setItem(`dreampos_${key}`, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  }

  get<T>(key: string): T | null {
    try {
      const cached = localStorage.getItem(`dreampos_${key}`);
      if (!cached) return null;

      const cacheItem: CacheItem<T> = JSON.parse(cached);
      const now = Date.now();

      // Check if cache has expired
      if (now - cacheItem.timestamp > cacheItem.ttl) {
        this.remove(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error('Failed to get cached data:', error);
      return null;
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(`dreampos_${key}`);
    } catch (error) {
      console.error('Failed to remove cached data:', error);
    }
  }

  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('dreampos_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  // Cache specific methods
  cacheProducts(products: any[]): void {
    this.set('products', products);
  }

  getCachedProducts(): any[] | null {
    return this.get('products');
  }

  cacheCustomers(customers: any[]): void {
    this.set('customers', customers);
  }

  getCachedCustomers(): any[] | null {
    return this.get('customers');
  }

  cacheSettings(settings: any): void {
    this.set('settings', settings, 24 * 60 * 60 * 1000); // 24 hours
  }

  getCachedSettings(): any | null {
    return this.get('settings');
  }
}

export const cache = LocalStorageCache.getInstance();
