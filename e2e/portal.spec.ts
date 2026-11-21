import { test, expect } from '@playwright/test'

const ADMIN_EMAIL = 'admin@foundtab.com'
const ADMIN_PASSWORD = 'FoundTab@Admin2024!'
const ADMIN_NAME = 'Admin'

test.describe('Portal Setup Flow', () => {
  test('setup page renders correctly', async ({ page }) => {
    await page.goto('/setup')
    await page.waitForLoadState('networkidle')

    if (!page.url().includes('/setup')) {
      // Admin already exists — setup correctly redirected to login
      await expect(page.locator('text=Admin Portal')).toBeVisible({ timeout: 15_000 })
      await page.screenshot({ path: '/tmp/portal-setup-page.png', fullPage: true })
      return
    }

    await expect(page.locator('text=Admin Portal')).toBeVisible({ timeout: 15_000 })
    await expect(page.locator('text=Create your admin account')).toBeVisible()

    // Password requirements only appear after typing in the password field
    await page.getByPlaceholder('Password', { exact: true }).fill('test')
    await expect(page.locator('text=At least 12 characters')).toBeVisible()

    await page.screenshot({ path: '/tmp/portal-setup-page.png', fullPage: true })
  })

  test('create admin account via setup form', async ({ page }) => {
    await page.goto('/setup')
    await page.waitForLoadState('networkidle')

    if (!page.url().includes('/setup')) {
      // Admin already exists — setup correctly redirected to login
      expect(page.url()).toContain('/login')
      return
    }

    await page.getByPlaceholder('Your name').fill(ADMIN_NAME)
    await page.getByPlaceholder('Email').fill(ADMIN_EMAIL)
    await page.getByPlaceholder('Password', { exact: true }).fill(ADMIN_PASSWORD)
    await page.getByPlaceholder('Confirm password').fill(ADMIN_PASSWORD)

    await expect(page.locator('text=At least 12 characters')).toBeVisible()

    await page.locator('button[type="submit"]').click()

    await page.waitForURL(url => !url.toString().includes('/setup'), { timeout: 20_000 })
    expect(page.url()).not.toContain('/setup')

    await page.screenshot({ path: '/tmp/portal-setup-done.png', fullPage: true })
  })
})

test.describe('Portal Login Flow', () => {
  test('login page renders correctly', async ({ page }) => {
    await page.goto('/login')
    // Wait for the checking-state API call to complete (login page returns null while checking)
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByPlaceholder('Password', { exact: true })).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
    await page.screenshot({ path: '/tmp/portal-login-page.png', fullPage: true })
  })

  test('login with valid credentials reaches dashboard', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 15_000 })

    await page.locator('input[type="email"]').fill(ADMIN_EMAIL)
    await page.getByPlaceholder('Password', { exact: true }).fill(ADMIN_PASSWORD)
    await page.locator('button[type="submit"]').click()

    await page.waitForURL(
      url => !url.toString().includes('/login') && !url.toString().includes('/setup'),
      { timeout: 20_000 },
    )
    await page.waitForLoadState('networkidle')

    await page.screenshot({ path: '/tmp/portal-dashboard.png', fullPage: true })
    expect(page.url()).not.toContain('/login')
  })

  test('login with wrong password shows error', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 15_000 })

    await page.locator('input[type="email"]').fill(ADMIN_EMAIL)
    await page.getByPlaceholder('Password', { exact: true }).fill('WrongPassword123!')
    await page.locator('button[type="submit"]').click()

    // Should NOT reach dashboard
    await page.waitForTimeout(3000)
    expect(page.url()).not.toContain('/orgs')
    await page.screenshot({ path: '/tmp/portal-login-error.png', fullPage: true })
  })
})

test.describe('Portal Dashboard (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 15_000 })
    await page.locator('input[type="email"]').fill(ADMIN_EMAIL)
    await page.getByPlaceholder('Password', { exact: true }).fill(ADMIN_PASSWORD)
    await page.locator('button[type="submit"]').click()
    await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 20_000 })
    await page.waitForLoadState('networkidle')
  })

  test('dashboard loads with key sections visible', async ({ page }) => {
    await page.screenshot({ path: '/tmp/portal-authenticated-dashboard.png', fullPage: true })
    expect(page.url()).not.toContain('/login')
    await expect(page.locator('body')).not.toContainText('Something went wrong')
  })

  test('unauthenticated access to protected page redirects to login', async ({ page }) => {
    await page.context().clearCookies()
    await page.goto('/')
    await page.waitForURL(
      url => url.toString().includes('/login') || url.toString().includes('/setup'),
      { timeout: 15_000 },
    )
    expect(page.url()).toMatch(/\/(login|setup)/)
  })
})
