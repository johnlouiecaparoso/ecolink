import { ref } from 'vue'

const promptState = ref({
  isOpen: false,
  type: 'confirm',
  title: '',
  message: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  showCancel: true,
  resolve: null,
})

export function useModernPrompt() {
  function showPrompt(options) {
    return new Promise((resolve) => {
      promptState.value = {
        isOpen: true,
        type: options.type || 'confirm',
        title: options.title || 'Confirm Action',
        message: options.message || 'Are you sure?',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        showCancel: options.showCancel !== false,
        resolve,
      }
    })
  }

  function confirm(options) {
    return showPrompt({ ...options, type: 'confirm' })
  }

  function success(options) {
    return showPrompt({ ...options, type: 'success', showCancel: false, confirmText: 'OK' })
  }

  function error(options) {
    return showPrompt({ ...options, type: 'error', showCancel: false, confirmText: 'OK' })
  }

  function warning(options) {
    return showPrompt({ ...options, type: 'warning' })
  }

  function info(options) {
    return showPrompt({ ...options, type: 'info', showCancel: false, confirmText: 'OK' })
  }

  function handleConfirm() {
    if (promptState.value.resolve) {
      promptState.value.resolve(true)
    }
    promptState.value.isOpen = false
    promptState.value.resolve = null
  }

  function handleCancel() {
    if (promptState.value.resolve) {
      promptState.value.resolve(false)
    }
    promptState.value.isOpen = false
    promptState.value.resolve = null
  }

  function handleClose() {
    if (promptState.value.resolve) {
      promptState.value.resolve(false)
    }
    promptState.value.isOpen = false
    promptState.value.resolve = null
  }

  return {
    promptState,
    confirm,
    success,
    error,
    warning,
    info,
    handleConfirm,
    handleCancel,
    handleClose,
  }
}
