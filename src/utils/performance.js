/**
 * Performance monitoring utilities
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map()
    this.observers = []
    this.isEnabled = import.meta.env.PROD
  }

  /**
   * Start timing a performance metric
   */
  startTiming(name) {
    if (!this.isEnabled) return

    this.metrics.set(name, {
      startTime: performance.now(),
      endTime: null,
      duration: null,
    })
  }

  /**
   * End timing a performance metric
   */
  endTiming(name) {
    if (!this.isEnabled) return

    const metric = this.metrics.get(name)
    if (!metric) return

    metric.endTime = performance.now()
    metric.duration = metric.endTime - metric.startTime

    // Log slow operations
    if (metric.duration > 1000) {
      console.warn(`Slow operation detected: ${name} took ${metric.duration.toFixed(2)}ms`)
    }

    return metric.duration
  }

  /**
   * Measure Core Web Vitals
   */
  measureWebVitals() {
    if (!this.isEnabled) return

    // First Contentful Paint
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.recordMetric('FCP', entry.startTime)
          }
        }
      })

      observer.observe({ entryTypes: ['paint'] })
      this.observers.push(observer)
    }

    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        this.recordMetric('LCP', lastEntry.startTime)
      })

      observer.observe({ entryTypes: ['largest-contentful-paint'] })
      this.observers.push(observer)
    }

    // First Input Delay
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('FID', entry.processingStart - entry.startTime)
        }
      })

      observer.observe({ entryTypes: ['first-input'] })
      this.observers.push(observer)
    }
  }

  /**
   * Record a performance metric
   */
  recordMetric(name, value) {
    if (!this.isEnabled) return

    console.log(`Performance Metric: ${name} = ${value}ms`)

    // Send to analytics if available
    if (window.gtag) {
      window.gtag('event', 'performance_metric', {
        metric_name: name,
        metric_value: value,
      })
    }
  }

  /**
   * Measure page load performance
   */
  measurePageLoad() {
    if (!this.isEnabled) return

    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0]

      if (navigation) {
        this.recordMetric(
          'DOMContentLoaded',
          navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        )
        this.recordMetric('LoadComplete', navigation.loadEventEnd - navigation.loadEventStart)
        this.recordMetric('TotalLoadTime', navigation.loadEventEnd - navigation.fetchStart)
      }
    })
  }

  /**
   * Measure API call performance
   */
  measureApiCall(url, startTime, endTime) {
    if (!this.isEnabled) return

    const duration = endTime - startTime
    this.recordMetric(`API_${url}`, duration)

    // Alert on slow API calls
    if (duration > 5000) {
      console.warn(`Slow API call: ${url} took ${duration.toFixed(2)}ms`)
    }
  }

  /**
   * Clean up observers
   */
  cleanup() {
    this.observers.forEach((observer) => observer.disconnect())
    this.observers = []
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Initialize monitoring
if (import.meta.env.PROD) {
  performanceMonitor.measureWebVitals()
  performanceMonitor.measurePageLoad()
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  performanceMonitor.cleanup()
})
