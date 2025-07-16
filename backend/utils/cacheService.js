// utils/cacheService.js - NEW FILE
/**
 * Simple in-memory cache service for scan results
 * Prevents duplicate scans and improves performance
 */

class CacheService {
  constructor() {
    this.cache = new Map();
    this.ttl = 60 * 60 * 1000; // 1 hour TTL
    this.maxSize = 1000; // Maximum cache entries
    
    // Clean up expired entries every 30 minutes
    setInterval(() => this.cleanup(), 30 * 60 * 1000);
    
    console.log('🗄️ Cache service initialized');
  }

  /**
   * Generate cache key for scan parameters
   */
  generateKey(email, usernames = []) {
    if (email) {
      return `email:${email.toLowerCase()}`;
    } else if (usernames.length > 0) {
      return `usernames:${usernames.sort().join(',')}`;
    }
    return null;
  }

  /**
   * Get cached result if valid
   */
  get(email, usernames = []) {
    const key = this.generateKey(email, usernames);
    if (!key) return null;

    const cached = this.cache.get(key);
    if (!cached) return null;

    // Check if expired
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    console.log(`✅ Cache HIT for key: ${key}`);
    return {
      ...cached.data,
      _meta: {
        ...cached.data._meta,
        cached: true,
        cachedAt: cached.createdAt
      }
    };
  }

  /**
   * Store result in cache
   */
  set(email, usernames = [], data) {
    const key = this.generateKey(email, usernames);
    if (!key) return false;

    // Don't cache error results
    if (data.error) return false;

    // Ensure cache size limit
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    const cacheEntry = {
      data: data,
      createdAt: new Date().toISOString(),
      expiresAt: Date.now() + this.ttl
    };

    this.cache.set(key, cacheEntry);
    console.log(`💾 Cached result for key: ${key}`);
    return true;
  }

  /**
   * Remove oldest cache entries
   */
  evictOldest() {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].expiresAt - b[1].expiresAt);
    
    // Remove oldest 10% of entries
    const toRemove = Math.ceil(entries.length * 0.1);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
    
    console.log(`🧹 Evicted ${toRemove} old cache entries`);
  }

  /**
   * Clean up expired entries
   */
  cleanup() {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      console.log(`🧹 Cleaned up ${removedCount} expired cache entries`);
    }
  }

  /**
   * Clear all cache entries
   */
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`🗑️ Cleared all ${size} cache entries`);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const entries = Array.from(this.cache.values());
    const now = Date.now();
    const expired = entries.filter(entry => now > entry.expiresAt).length;

    return {
      totalEntries: this.cache.size,
      expiredEntries: expired,
      validEntries: this.cache.size - expired,
      maxSize: this.maxSize,
      ttlHours: this.ttl / (60 * 60 * 1000),
      memoryUsage: process.memoryUsage()
    };
  }

  /**
   * Check if a scan should be cached
   */
  shouldCache(results) {
    // Don't cache if scan failed
    if (!results || results.error) return false;
    
    // Don't cache if no meaningful data
    if (!results.breaches && !results.used_on && !results.sherlock) {
      return false;
    }

    // Cache if we have at least some results
    return (
      (results.breaches && results.breaches.length > 0) ||
      (results.used_on && results.used_on.length > 0) ||
      (results.sherlock && results.sherlock.length > 0)
    );
  }
}

// Export singleton instance
const cacheService = new CacheService();

module.exports = cacheService;