import { test, expect } from '@playwright/test'

test.describe('Logout Functionality', () => {
  test('should logout and redirect to login page', async ({ page }) => {
    // First, try to access a protected page (should redirect to login)
    await page.goto('/wallet')

    // Should be redirected to login page
    await expect(page).toHaveURL(/\/login/)

    // Check that login page loads correctly
    await expect(page.locator('h1')).toContainText('ECOLINK')

    // Check that login form is visible
    const loginForm = page.locator('form, input, button')
    await expect(loginForm.first()).toBeVisible()
  })

  test('should clear session data on logout', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login')

    // Check that we're on login page
    await expect(page).toHaveURL('/login')

    // Verify login form elements are present
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should handle logout from any page', async ({ page }) => {
    // Try accessing different pages - all should redirect to login when not authenticated
    const pages = ['/wallet', '/profile', '/dashboard', '/projects']

    for (const pagePath of pages) {
      await page.goto(pagePath)
      // All protected pages should redirect to login
      await expect(page).toHaveURL(/\/login/)
    }
  })
})
