import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePreferencesStore = defineStore('preferences', () => {
  // Theme preferences
  const theme = ref(localStorage.getItem('theme') || 'light')
  const systemTheme = ref('light')

  // Language preferences
  const language = ref(localStorage.getItem('language') || 'en')
  const availableLanguages = ref([
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
  ])

  // Notification preferences
  const notifications = ref({
    email: {
      enabled: true,
      newProjects: true,
      priceAlerts: true,
      purchaseConfirmations: true,
      newsletters: false,
    },
    push: {
      enabled: false,
      newProjects: false,
      priceAlerts: true,
      purchaseConfirmations: true,
    },
    inApp: {
      enabled: true,
      newProjects: true,
      priceAlerts: true,
      purchaseConfirmations: true,
      systemUpdates: true,
    },
  })

  // Display preferences
  const display = ref({
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    numberFormat: 'en-US',
    itemsPerPage: 12,
    compactMode: false,
    animations: true,
    reducedMotion: false,
  })

  // Privacy preferences
  const privacy = ref({
    profileVisibility: 'public', // public, friends, private
    showEmail: false,
    showPhone: false,
    allowAnalytics: true,
    allowCookies: true,
    dataSharing: false,
  })

  // Accessibility preferences
  const accessibility = ref({
    highContrast: false,
    largeText: false,
    screenReader: false,
    keyboardNavigation: true,
    focusIndicators: true,
    colorBlindSupport: false,
  })

  // Computed properties
  const isDarkMode = computed(() => theme.value === 'dark')
  const isSystemTheme = computed(() => theme.value === 'system')
  const currentLanguage = computed(
    () =>
      availableLanguages.value.find((lang) => lang.code === language.value) ||
      availableLanguages.value[0],
  )

  // Theme management
  function setTheme(newTheme) {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
    applyTheme()
  }

  function applyTheme() {
    const root = document.documentElement
    const actualTheme = isSystemTheme.value ? systemTheme.value : theme.value

    if (actualTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  function detectSystemTheme() {
    systemTheme.value = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    if (isSystemTheme.value) {
      applyTheme()
    }
  }

  // Language management
  function setLanguage(newLanguage) {
    language.value = newLanguage
    localStorage.setItem('language', newLanguage)
    // Here you would typically load the language pack
    loadLanguagePack(newLanguage)
  }

  function loadLanguagePack(langCode) {
    // This would load the appropriate language pack
    console.log(`Loading language pack for: ${langCode}`)
  }

  // Notification management
  function updateNotificationSettings(category, settings) {
    notifications.value[category] = { ...notifications.value[category], ...settings }
    savePreferences()
  }

  function toggleNotification(category, type) {
    notifications.value[category][type] = !notifications.value[category][type]
    savePreferences()
  }

  // Display management
  function updateDisplaySettings(settings) {
    display.value = { ...display.value, ...settings }
    savePreferences()
  }

  // Privacy management
  function updatePrivacySettings(settings) {
    privacy.value = { ...privacy.value, ...settings }
    savePreferences()
  }

  // Accessibility management
  function updateAccessibilitySettings(settings) {
    accessibility.value = { ...accessibility.value, ...settings }
    applyAccessibilitySettings()
    savePreferences()
  }

  function applyAccessibilitySettings() {
    const root = document.documentElement

    if (accessibility.value.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    if (accessibility.value.largeText) {
      root.classList.add('large-text')
    } else {
      root.classList.remove('large-text')
    }

    if (accessibility.value.reducedMotion) {
      root.classList.add('reduced-motion')
    } else {
      root.classList.remove('reduced-motion')
    }
  }

  // Save preferences to localStorage
  function savePreferences() {
    const preferences = {
      theme: theme.value,
      language: language.value,
      notifications: notifications.value,
      display: display.value,
      privacy: privacy.value,
      accessibility: accessibility.value,
    }
    localStorage.setItem('preferences', JSON.stringify(preferences))
  }

  // Load preferences from localStorage
  function loadPreferences() {
    const saved = localStorage.getItem('preferences')
    if (saved) {
      try {
        const preferences = JSON.parse(saved)
        if (preferences.theme) theme.value = preferences.theme
        if (preferences.language) language.value = preferences.language
        if (preferences.notifications) notifications.value = preferences.notifications
        if (preferences.display) display.value = preferences.display
        if (preferences.privacy) privacy.value = preferences.privacy
        if (preferences.accessibility) accessibility.value = preferences.accessibility
      } catch (error) {
        console.error('Error loading preferences:', error)
      }
    }
  }

  // Reset to defaults
  function resetToDefaults() {
    theme.value = 'light'
    language.value = 'en'
    notifications.value = {
      email: {
        enabled: true,
        newProjects: true,
        priceAlerts: true,
        purchaseConfirmations: true,
        newsletters: false,
      },
      push: { enabled: false, newProjects: false, priceAlerts: true, purchaseConfirmations: true },
      inApp: {
        enabled: true,
        newProjects: true,
        priceAlerts: true,
        purchaseConfirmations: true,
        systemUpdates: true,
      },
    }
    display.value = {
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      numberFormat: 'en-US',
      itemsPerPage: 12,
      compactMode: false,
      animations: true,
      reducedMotion: false,
    }
    privacy.value = {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      allowAnalytics: true,
      allowCookies: true,
      dataSharing: false,
    }
    accessibility.value = {
      highContrast: false,
      largeText: false,
      screenReader: false,
      keyboardNavigation: true,
      focusIndicators: true,
      colorBlindSupport: false,
    }
    savePreferences()
  }

  // Initialize
  function initialize() {
    loadPreferences()
    detectSystemTheme()
    applyTheme()
    applyAccessibilitySettings()

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', detectSystemTheme)
  }

  return {
    // State
    theme,
    systemTheme,
    language,
    availableLanguages,
    notifications,
    display,
    privacy,
    accessibility,

    // Computed
    isDarkMode,
    isSystemTheme,
    currentLanguage,

    // Actions
    setTheme,
    applyTheme,
    detectSystemTheme,
    setLanguage,
    loadLanguagePack,
    updateNotificationSettings,
    toggleNotification,
    updateDisplaySettings,
    updatePrivacySettings,
    updateAccessibilitySettings,
    applyAccessibilitySettings,
    savePreferences,
    loadPreferences,
    resetToDefaults,
    initialize,
  }
})
