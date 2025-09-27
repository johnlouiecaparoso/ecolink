import { test, expect } from '@playwright/test'

test.describe('Marketplace Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/marketplace')
  })

  test('should display marketplace page', async ({ page }) => {
    await expect(page.locator('h1.page-title')).toContainText('Carbon Credit Marketplace')
    await expect(page.locator('.search-input')).toBeVisible()
  })

  test('should filter projects by search', async ({ page }) => {
    await page.fill('.search-input', 'forest')
    await page.waitForTimeout(500) // Wait for debounced search

    // Should show filtered results
    await expect(page.locator('.project-card')).toBeVisible()
  })

  test('should filter by category', async ({ page }) => {
    // Look for radio button instead of select
    await page.click('input[value="Forestry"]')
    await page.waitForTimeout(500)

    // Should show filtered results
    await expect(page.locator('.project-card')).toBeVisible()
  })

  test('should sort projects', async ({ page }) => {
    // Look for sort dropdown in the actual implementation
    await page.selectOption('select[name="sortBy"]', 'price-low-high')

    // Should show sorted results
    await expect(page.locator('.project-card')).toBeVisible()
  })

  test('should show project details on card click', async ({ page }) => {
    const firstCard = page.locator('.project-card').first()
    await firstCard.click()

    // Should show project details or navigate to detail page
    await expect(page.locator('.project-details, .modal-content')).toBeVisible()
  })

  test('should require login for purchase', async ({ page }) => {
    const purchaseButton = page.locator('.purchase-button').first()
    await purchaseButton.click()

    // Should redirect to login or show login modal
    await expect(page).toHaveURL(/\/login/)
  })

  test('should show purchase modal for authenticated user', async ({ page }) => {
    // Mock authentication
    await page.evaluate(() => {
      localStorage.setItem('supabase.auth.token', 'mock-token')
    })

    await page.reload()
    await page.waitForTimeout(1000)

    const purchaseButton = page.locator('.purchase-button').first()
    await purchaseButton.click()

    // Should show purchase modal
    await expect(page.locator('.modal-content')).toBeVisible()
    await expect(page.locator('h2')).toContainText('Purchase Carbon Credits')
  })

  test('should handle purchase flow', async ({ page }) => {
    // Mock authentication and payment
    await page.evaluate(() => {
      localStorage.setItem('supabase.auth.token', 'mock-token')
    })

    await page.route('**/api/payments/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          paymentIntentId: 'pi_test_123',
          clientSecret: 'pi_test_123_secret',
        }),
      })
    })

    await page.reload()
    await page.waitForTimeout(1000)

    const purchaseButton = page.locator('.purchase-button').first()
    await purchaseButton.click()

    // Fill purchase form
    await page.fill('input[name="quantity"]', '10')
    await page.click('button[type="submit"]')

    // Should show payment modal
    await expect(page.locator('.payment-modal')).toBeVisible()
  })

  test('should display marketplace statistics', async ({ page }) => {
    await expect(page.locator('.stats-card')).toBeVisible()
    await expect(page.locator('.stats-value')).toBeVisible()
  })

  test('should handle empty state', async ({ page }) => {
    // Mock empty results
    await page.route('**/api/marketplace/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    })

    await page.reload()

    // Should show empty state
    await expect(page.locator('.empty-state')).toBeVisible()
  })

  test('should handle loading state', async ({ page }) => {
    // Mock slow response
    await page.route('**/api/marketplace/**', (route) => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        })
      }, 2000)
    })

    await page.reload()

    // Should show loading state
    await expect(page.locator('.loading-spinner')).toBeVisible()
  })

  test('should handle error state', async ({ page }) => {
    // Mock error response
    await page.route('**/api/marketplace/**', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' }),
      })
    })

    await page.reload()

    // Should show error state
    await expect(page.locator('.error-state')).toBeVisible()
  })
})
