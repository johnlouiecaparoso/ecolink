/**
 * Image optimization utilities
 */

/**
 * Generate responsive image URLs with different sizes
 */
export function getResponsiveImageUrl(baseUrl, width, height, quality = 80) {
  if (!baseUrl) return null

  // For Unsplash images, we can optimize them
  if (baseUrl.includes('unsplash.com')) {
    const url = new URL(baseUrl)
    url.searchParams.set('w', width.toString())
    url.searchParams.set('h', height.toString())
    url.searchParams.set('q', quality.toString())
    url.searchParams.set('fit', 'crop')
    url.searchParams.set('auto', 'format')
    return url.toString()
  }

  // For other images, return as-is
  return baseUrl
}

/**
 * Generate WebP image URLs for better compression
 */
export function getWebPImageUrl(baseUrl, width, height, quality = 80) {
  if (!baseUrl) return null

  if (baseUrl.includes('unsplash.com')) {
    const url = new URL(baseUrl)
    url.searchParams.set('w', width.toString())
    url.searchParams.set('h', height.toString())
    url.searchParams.set('q', quality.toString())
    url.searchParams.set('fit', 'crop')
    url.searchParams.set('auto', 'format')
    url.searchParams.set('fm', 'webp')
    return url.toString()
  }

  return baseUrl
}

/**
 * Lazy load images with intersection observer
 */
export function setupLazyLoading() {
  if (typeof window === 'undefined') return

  const imageObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target
          const src = img.dataset.src
          const srcset = img.dataset.srcset

          if (src) {
            img.src = src
            img.removeAttribute('data-src')
          }

          if (srcset) {
            img.srcset = srcset
            img.removeAttribute('data-srcset')
          }

          img.classList.remove('lazy')
          img.classList.add('loaded')
          observer.unobserve(img)
        }
      })
    },
    {
      rootMargin: '50px 0px',
      threshold: 0.01,
    },
  )

  // Observe all lazy images
  document.querySelectorAll('img[data-src]').forEach((img) => {
    imageObserver.observe(img)
  })

  return imageObserver
}

/**
 * Preload critical images
 */
export function preloadCriticalImages(imageUrls) {
  if (typeof window === 'undefined') return

  imageUrls.forEach((url) => {
    // Skip if already preloaded
    const existingPreload = document.querySelector(`link[rel="preload"][href="${url}"]`)
    if (existingPreload) return

    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = url
    link.crossOrigin = 'anonymous' // For external images

    // Add error handling
    link.onerror = () => {
      console.warn(`Failed to preload image: ${url}`)
      link.remove()
    }

    document.head.appendChild(link)
  })
}

/**
 * Generate image placeholder
 */
export function generateImagePlaceholder(width, height, text = 'Loading...') {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  canvas.width = width
  canvas.height = height

  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#f0f0f0')
  gradient.addColorStop(1, '#e0e0e0')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  // Add text
  ctx.fillStyle = '#999'
  ctx.font = '14px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(text, width / 2, height / 2)

  return canvas.toDataURL()
}

/**
 * Optimize image loading with progressive enhancement
 */
export function optimizeImageLoading() {
  if (typeof window === 'undefined') return

  // Check for WebP support
  const supportsWebP = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
  }

  // Add WebP class to body if supported
  if (supportsWebP()) {
    document.body.classList.add('webp')
  }

  // Setup lazy loading
  setupLazyLoading()

  // Only preload images if they're actually used on the current page
  // Check if there are any img elements that reference these Unsplash images
  const checkForUnsplashImages = () => {
    const images = document.querySelectorAll('img')
    const unsplashImages = []

    images.forEach((img) => {
      const src = img.src || img.dataset.src || ''
      if (src.includes('unsplash.com')) {
        unsplashImages.push(src)
      }
    })

    return unsplashImages
  }

  // Wait for DOM to be ready, then check for actual image usage
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const usedImages = checkForUnsplashImages()
      if (usedImages.length > 0) {
        preloadCriticalImages(usedImages)
      }
    })
  } else {
    const usedImages = checkForUnsplashImages()
    if (usedImages.length > 0) {
      preloadCriticalImages(usedImages)
    }
  }
}
