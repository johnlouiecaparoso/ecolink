import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display homepage with login/register buttons', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('EcoLink')
    await expect(page.locator('a[href="/login"]')).toBeVisible()
    await expect(page.locator('a[href="/register"]')).toBeVisible()
  })

  test('should navigate to login page', async ({ page }) => {
    await page.click('a[href="/login"]')
    await expect(page).toHaveURL('/login')
    await expect(page.locator('h1')).toContainText('Sign In')
  })

  test('should navigate to register page', async ({ page }) => {
    await page.click('a[href="/register"]')
    await expect(page).toHaveURL('/register')
    await expect(page.locator('h1')).toContainText('Create Account')
  })

  test('should show validation errors for empty login form', async ({ page }) => {
    await page.goto('/login')
    await page.click('button[type="submit"]')

    await expect(page.locator('.error-message')).toBeVisible()
  })

  test('should show validation errors for invalid email', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'invalid-email')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')

    await expect(page.locator('.error-message')).toBeVisible()
  })

  test('should show validation errors for short password', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', '123')
    await page.click('button[type="submit"]')

    await expect(page.locator('.error-message')).toBeVisible()
  })

  test('should handle login with demo credentials', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'demo@ecolink.io')
    await page.fill('input[type="password"]', 'demo123')
    await page.click('button[type="submit"]')

    // Should redirect to dashboard or show success
    await expect(page).toHaveURL(/\/(dashboard|profile)/)
  })

  test('should handle registration flow', async ({ page }) => {
    await page.goto('/register')

    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.fill('input[name="confirmPassword"]', 'password123')
    await page.click('button[type="submit"]')

    // Should redirect to login or show success message
    await expect(page).toHaveURL(/\/login/)
  })

  test('should show password mismatch error', async ({ page }) => {
    await page.goto('/register')

    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.fill('input[name="confirmPassword"]', 'different123')
    await page.click('button[type="submit"]')

    await expect(page.locator('.error-message')).toBeVisible()
  })
})


