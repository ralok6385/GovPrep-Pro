/**
 * SmartCache - A production-ready in-memory cache with TTL, size limits, and LRU eviction.
 * 
 * Usage:
 *   const cache = new SmartCache({ ttl: 60000, maxSize: 100 });
 *   cache.set('key', { data: 'value' });
 *   const data = cache.get('key'); // null if expired
 * 
 * For multi-instance scaling, replace this with Redis:
 *   npm install ioredis
 *   Use the same API shape with RedisCache adapter
 */

class SmartCache {
    constructor({ ttl = 60000, maxSize = 500, name = 'Cache' } = {}) {
        this.ttl = ttl;           // Time-to-live in ms
        this.maxSize = maxSize;   // Max number of entries
        this.name = name;         // For logging
        this.store = new Map();   // Map preserves insertion order
        this.hits = 0;
        this.misses = 0;

        // Periodic cleanup every 5 minutes
        this._cleanupInterval = setInterval(() => this._cleanup(), 5 * 60 * 1000);
    }

    /**
     * Get a value from cache. Returns null if expired or not found.
     */
    get(key) {
        const entry = this.store.get(key);
        if (!entry) {
            this.misses++;
            return null;
        }

        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            this.misses++;
            return null;
        }

        // Move to end (most recently used)
        this.store.delete(key);
        this.store.set(key, entry);
        this.hits++;
        return entry.data;
    }

    /**
     * Set a value in cache with optional custom TTL.
     */
    set(key, data, customTtl) {
        // Evict if at capacity (remove oldest entry - LRU)
        if (this.store.size >= this.maxSize) {
            const oldestKey = this.store.keys().next().value;
            this.store.delete(oldestKey);
        }

        this.store.set(key, {
            data,
            expiresAt: Date.now() + (customTtl || this.ttl),
            createdAt: Date.now()
        });
    }

    /**
     * Delete a specific key
     */
    delete(key) {
        return this.store.delete(key);
    }

    /**
     * Invalidate all entries matching a prefix
     */
    invalidatePrefix(prefix) {
        let count = 0;
        for (const key of this.store.keys()) {
            if (key.startsWith(prefix)) {
                this.store.delete(key);
                count++;
            }
        }
        return count;
    }

    /**
     * Clear all cached data
     */
    clear() {
        this.store.clear();
        this.hits = 0;
        this.misses = 0;
    }

    /**
     * Get cache stats
     */
    stats() {
        const total = this.hits + this.misses;
        return {
            name: this.name,
            size: this.store.size,
            maxSize: this.maxSize,
            hits: this.hits,
            misses: this.misses,
            hitRate: total > 0 ? `${Math.round((this.hits / total) * 100)}%` : 'N/A',
            ttlSeconds: this.ttl / 1000
        };
    }

    /**
     * Remove all expired entries
     */
    _cleanup() {
        const now = Date.now();
        let evicted = 0;
        for (const [key, entry] of this.store.entries()) {
            if (now > entry.expiresAt) {
                this.store.delete(key);
                evicted++;
            }
        }
        if (evicted > 0) {
            console.log(`[${this.name}] Cleanup: evicted ${evicted} expired entries. Size: ${this.store.size}`);
        }
    }

    /**
     * Cleanup on shutdown
     */
    destroy() {
        clearInterval(this._cleanupInterval);
        this.clear();
    }
}

// Pre-configured cache instances for different use cases
const caches = {
    // Dashboard stats: 60 second TTL, refreshes frequently
    dashboard: new SmartCache({ ttl: 60 * 1000, maxSize: 10, name: 'DashboardCache' }),

    // Student analytics: 2 min TTL, per-student
    studentAnalytics: new SmartCache({ ttl: 2 * 60 * 1000, maxSize: 200, name: 'StudentAnalyticsCache' }),

    // Weakness analysis: 5 min TTL, per-student
    weakness: new SmartCache({ ttl: 5 * 60 * 1000, maxSize: 200, name: 'WeaknessCache' }),

    // Topics list: 10 min TTL, per-subject
    topics: new SmartCache({ ttl: 10 * 60 * 1000, maxSize: 50, name: 'TopicsCache' }),

    // Test comparison: 2 min TTL, per-test-per-student
    testComparison: new SmartCache({ ttl: 2 * 60 * 1000, maxSize: 100, name: 'TestComparisonCache' }),
};

module.exports = { SmartCache, caches };
