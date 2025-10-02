/**
 * Accessibility utilities for keyboard navigation and screen reader support
 */

/**
 * Focus management utilities
 */
export const focusManager = {
  /**
   * Trap focus within an element
   */
  trapFocus(element) {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    function handleTabKey(e) {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus()
            e.preventDefault()
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus()
            e.preventDefault()
          }
        }
      }
    }

    element.addEventListener('keydown', handleTabKey)

    // Return cleanup function
    return () => {
      element.removeEventListener('keydown', handleTabKey)
    }
  },

  /**
   * Focus the first focusable element
   */
  focusFirst(element) {
    const focusableElement = element.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    if (focusableElement) {
      focusableElement.focus()
    }
  },

  /**
   * Focus the last focusable element
   */
  focusLast(element) {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    const lastElement = focusableElements[focusableElements.length - 1]
    if (lastElement) {
      lastElement.focus()
    }
  },

  /**
   * Store and restore focus
   */
  storeFocus() {
    return document.activeElement
  },

  restoreFocus(element) {
    if (element && element.focus) {
      element.focus()
    }
  },
}

/**
 * ARIA utilities
 */
export const ariaUtils = {
  /**
   * Announce message to screen readers
   */
  announce(message, priority = 'polite') {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  },

  /**
   * Set ARIA attributes
   */
  setAttributes(element, attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        element.setAttribute(key, value)
      } else {
        element.removeAttribute(key)
      }
    })
  },

  /**
   * Toggle ARIA expanded state
   */
  toggleExpanded(element, isExpanded) {
    element.setAttribute('aria-expanded', isExpanded)
  },

  /**
   * Toggle ARIA pressed state
   */
  togglePressed(element, isPressed) {
    element.setAttribute('aria-pressed', isPressed)
  },
}

/**
 * Keyboard navigation utilities
 */
export const keyboardNavigation = {
  /**
   * Handle arrow key navigation
   */
  handleArrowKeys(e, options = {}) {
    const { onUp, onDown, onLeft, onRight, preventDefault = true } = options

    switch (e.key) {
      case 'ArrowUp':
        if (onUp) onUp()
        if (preventDefault) e.preventDefault()
        break
      case 'ArrowDown':
        if (onDown) onDown()
        if (preventDefault) e.preventDefault()
        break
      case 'ArrowLeft':
        if (onLeft) onLeft()
        if (preventDefault) e.preventDefault()
        break
      case 'ArrowRight':
        if (onRight) onRight()
        if (preventDefault) e.preventDefault()
        break
    }
  },

  /**
   * Handle Enter and Space key activation
   */
  handleActivation(e, callback) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      callback()
    }
  },

  /**
   * Handle Escape key
   */
  handleEscape(e, callback) {
    if (e.key === 'Escape') {
      e.preventDefault()
      callback()
    }
  },
}

/**
 * Screen reader utilities
 */
export const screenReader = {
  /**
   * Hide element from screen readers
   */
  hideFromScreenReader(element) {
    element.setAttribute('aria-hidden', 'true')
  },

  /**
   * Show element to screen readers
   */
  showToScreenReader(element) {
    element.removeAttribute('aria-hidden')
  },

  /**
   * Create screen reader only text
   */
  createScreenReaderText(text) {
    const element = document.createElement('span')
    element.className = 'sr-only'
    element.textContent = text
    return element
  },
}

/**
 * Color contrast utilities
 */
export const colorContrast = {
  /**
   * Calculate relative luminance
   */
  getLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  },

  /**
   * Calculate contrast ratio
   */
  getContrastRatio(color1, color2) {
    const lum1 = this.getLuminance(...color1)
    const lum2 = this.getLuminance(...color2)
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)
    return (brightest + 0.05) / (darkest + 0.05)
  },

  /**
   * Check if contrast meets WCAG standards
   */
  meetsWCAG(color1, color2, level = 'AA') {
    const ratio = this.getContrastRatio(color1, color2)
    return level === 'AA' ? ratio >= 4.5 : ratio >= 7
  },
}

/**
 * Motion preferences
 */
export const motionPreferences = {
  /**
   * Check if user prefers reduced motion
   */
  prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  },

  /**
   * Apply motion preferences to element
   */
  applyMotionPreferences(element) {
    if (this.prefersReducedMotion()) {
      element.style.animation = 'none'
      element.style.transition = 'none'
    }
  },
}

// Add screen reader only styles
const style = document.createElement('style')
style.textContent = `
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .sr-only:focus {
    position: static;
    width: auto;
    height: auto;
    padding: inherit;
    margin: inherit;
    overflow: visible;
    clip: auto;
    white-space: normal;
  }
`
document.head.appendChild(style)
