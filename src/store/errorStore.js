import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getErrorMessage, logError } from '@/utils/errorHandler'

export const useErrorStore = defineStore('error', () => {
  const notifications = ref([])
  const maxNotifications = 5

  function addNotification(error, options = {}) {
    const id = Date.now() + Math.random()
    const notification = {
      id,
      error,
      duration: options.duration || 5000,
      closable: options.closable !== false,
      timestamp: new Date(),
    }

    // Log error for debugging
    logError(error, 'ErrorNotification')

    // Add to beginning of array
    notifications.value.unshift(notification)

    // Remove oldest if we exceed max
    if (notifications.value.length > maxNotifications) {
      notifications.value = notifications.value.slice(0, maxNotifications)
    }

    return id
  }

  function removeNotification(id) {
    const index = notifications.value.findIndex((n) => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  function clearAll() {
    notifications.value = []
  }

  function showError(message, options = {}) {
    const error = typeof message === 'string' ? new Error(message) : message
    return addNotification(error, { ...options, type: 'error' })
  }

  function showWarning(message, options = {}) {
    const error = typeof message === 'string' ? new Error(message) : message
    return addNotification(error, { ...options, type: 'warning' })
  }

  function showInfo(message, options = {}) {
    const error = typeof message === 'string' ? new Error(message) : message
    return addNotification(error, { ...options, type: 'info' })
  }

  function handleApiError(error, context = '') {
    logError(error, context)
    const message = getErrorMessage(error)
    return showError(message, { duration: 7000 })
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    showError,
    showWarning,
    showInfo,
    handleApiError,
  }
})
