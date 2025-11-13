/**
 * Production-safe logging utility
 * Console logs are only shown in development
 */

const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development'

export const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log('[DEV]', ...args)
    }
  },

  warn: (...args) => {
    if (isDevelopment) {
      console.warn('[DEV]', ...args)
    }
  },

  error: (...args) => {
    // Always log errors, but format differently in production
    if (isDevelopment) {
      console.error('[DEV]', ...args)
    } else {
      // In production, only log critical errors (can be sent to error tracking service)
      console.error('[ERROR]', ...args)
    }
  },

  info: (...args) => {
    if (isDevelopment) {
      console.info('[DEV]', ...args)
    }
  },

  debug: (...args) => {
    if (isDevelopment) {
      console.debug('[DEV]', ...args)
    }
  },
}

// Export individual functions for convenience
export const { log, warn, error, info, debug } = logger


























