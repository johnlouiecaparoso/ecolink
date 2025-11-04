/**
 * Caching utilities for better performance
 */

/**
 * Simple in-memory cache
 */
class MemoryCache {
  constructor(maxSize = 100, ttl = 5 * 60 * 1000) {
    // 5 minutes default TTL
    this.cache = new Map()
    this.maxSize = maxSize
    this.ttl = ttl
  }

  set(key, value, customTtl = null) {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    const ttl = customTtl || this.ttl
    const expiry = Date.now() + ttl

    this.cache.set(key, {
      value,
      expiry,
    })
  }

  get(key) {
    const item = this.cache.get(key)

    if (!item) {
      return null
    }

    // Check if expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }

    return item.value
  }

  has(key) {
    return this.get(key) !== null
  }

  delete(key) {
    return this.cache.delete(key)
  }

  clear() {
    this.cache.clear()
  }

  size() {
    return this.cache.size
  }
}

// Create cache instances for different data types
export const apiCache = new MemoryCache(50, 2 * 60 * 1000) // 2 minutes for API calls
export const imageCache = new MemoryCache(20, 10 * 60 * 1000) // 10 minutes for images
export const userCache = new MemoryCache(10, 5 * 60 * 1000) // 5 minutes for user data

/**
 * Cache wrapper for API calls
 */
export async function cachedApiCall(key, apiFunction, ttl = null) {
  // Check cache first
  const cached = apiCache.get(key)
  if (cached) {
    console.log(`Cache hit for ${key}`)
    return cached
  }

  // Make API call
  console.log(`Cache miss for ${key}, making API call`)
  try {
    const result = await apiFunction()
    apiCache.set(key, result, ttl)
    return result
  } catch (error) {
    console.error(`API call failed for ${key}:`, error)
    throw error
  }
}

/**
 * Cache wrapper for images
 */
export function cachedImageLoad(src, width, height) {
  const cacheKey = `${src}-${width}x${height}`

  // Check cache first
  const cached = imageCache.get(cacheKey)
  if (cached) {
    return Promise.resolve(cached)
  }

  // Load image
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const result = {
        src: img.src,
        width: img.width,
        height: img.height,
        loaded: true,
      }
      imageCache.set(cacheKey, result)
      resolve(result)
    }
    img.onerror = reject
    img.src = src
  })
}

/**
 * Cache user preferences
 */
export function cacheUserPreferences(userId, preferences) {
  const key = `user_prefs_${userId}`
  userCache.set(key, preferences)
}

export function getCachedUserPreferences(userId) {
  const key = `user_prefs_${userId}`
  return userCache.get(key)
}

/**
 * Cache marketplace listings
 */
export function cacheMarketplaceListings(filters, listings) {
  const key = `marketplace_${JSON.stringify(filters)}`
  apiCache.set(key, listings, 3 * 60 * 1000) // 3 minutes
}

export function getCachedMarketplaceListings(filters) {
  const key = `marketplace_${JSON.stringify(filters)}`
  return apiCache.get(key)
}

/**
 * Cache analytics data
 */
export function cacheAnalyticsData(userId, data) {
  const key = `analytics_${userId}`
  apiCache.set(key, data, 5 * 60 * 1000) // 5 minutes
}

export function getCachedAnalyticsData(userId) {
  const key = `analytics_${userId}`
  return apiCache.get(key)
}

/**
 * Clear all caches
 */
export function clearAllCaches() {
  apiCache.clear()
  imageCache.clear()
  userCache.clear()
  console.log('All caches cleared')
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    api: {
      size: apiCache.size(),
      maxSize: apiCache.maxSize,
    },
    image: {
      size: imageCache.size(),
      maxSize: imageCache.maxSize,
    },
    user: {
      size: userCache.size(),
      maxSize: userCache.maxSize,
    },
  }
}

/**
 * Service Worker cache management
 */
export function setupServiceWorkerCache() {
  if ('serviceWorker' in navigator) {
    // Use setTimeout to avoid DOMException from using objects after page navigation
    setTimeout(() => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          // Only log if registration is still valid
          if (registration && registration.active) {
            console.log('✅ Service Worker registered successfully')
          }
        })
        .catch((error) => {
          // Silently ignore service worker errors - they're optional
          // Only log specific errors that aren't DOMException
          if (error.name !== 'DOMException') {
            console.debug('Service Worker not available (optional):', error.message)
          }
        })
    }, 100)
  }
}
