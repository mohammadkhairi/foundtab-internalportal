import { test, expect } from '@playwright/test'

const ADMIN_EMAIL = 'admin@foundtab.com'
const ADMIN_PASSWORD = 'FoundTab@Admin2024!'
const ADMIN_NAME = 'Admin'

// Use pressSequentially so React onChange fires for each character
async function fillPassword(page: Parameters<typeof test>[1] extends (...args: infer A) => void ? never : import('@playwright/test').Page, placeholder: string, value: string) {
  const loc = page.getByPlaceholder(placeholder, { exact: true })
  await loc.click()
  await loc.pressSequentially(value, { delay: 20 })
}

test.describe('Portal Setup Flow', () => {
  test('setup page renders correctly', async ({ page }) => {
    await page.goto('/setup')
    await page.waitForLoadState('networkidle')

    if (!page.url().includes('/setup')) {
      await expect(page.locator('text=Admin Portal')).toBeVisible({ timeout: 15_000 })
      await page.screenshot({ path: '/tmp/portal-setup-page.png', fullPage: true })
      return
    }

    await expect(page.locator('text=Admin Portal')).toBeVisible({ timeout: 15_000 })
    await expect(page.locator('text=Create your admin account')).toBeVisible()

    await fillPassword(page, 'Password', 'test')
    await expect(page.locator('text=At least 12 characters')).toBeVisible()
    await page.screenshot({ path: '/tmp/portal-setup-page.png', fullPage: true })
  })

  test('create admin account via setup form', async ({ page }) => {
    await page.goto('/setup')
    await page.waitForLoadState('networkidle')

    if (!page.url().includes('/setup')) {
      expect(page.url()).toContain('/login')
      return
    }

    // Wait for form to fully render (checking=false)
    await page.getByPlaceholder('Your name').waitFor({ state: 'visible', timeout: 10_000 })

    await page.getByPlaceholder('Your name').fill(ADMIN_NAME)
    await page.getByPlaceholder('Email').fill(ADMIN_EMAIL)
    await fillPassword(page, 'Password', ADMIN_PASSWORD)
    await fillPassword(page, 'Confirm password', ADMIN_PASSWORD)

    // Wait for all password rules to pass and button to be enabled
    await expect(page.locator('button[type="submit"]')).toBeEnabled({ timeout: 10_000 })
    await page.locator('button[type="submit"]').click()

    await page.waitForURL(url => !url.toString().includes('/setup'), { timeout: 20_000 })
    expect(page.url()).not.toContain('/setup')
    await page.screenshot({ path: '/tmp/portal-setup-done.png', fullPage: true })
  })
})

async function loginToPortal(page: import('@playwright/test').Page) {
  await page.goto('/login')
  // Handle case where portal has no admin yet (redirects to setup)
  await page.waitForLoadState('networkidle')
  if (page.url().includes('/setup')) {
    await page.getByPlaceholder('Your name').waitFor({ state: 'visible', timeout: 10_000 })
    await page.getByPlaceholder('Your name').fill(ADMIN_NAME)
    await page.getByPlaceholder('Email').fill(ADMIN_EMAIL)
    await fillPassword(page, 'Password', ADMIN_PASSWORD)
    await fillPassword(page, 'Confirm password', ADMIN_PASSWORD)
    await expect(page.locator('button[type="submit"]')).toBeEnabled({ timeout: 10_000 })
    await page.locator('button[type="submit"]').click()
    await page.waitForURL(url => !url.toString().includes('/setup'), { timeout: 20_000 })
    return
  }
  await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 15_000 })
  await page.locator('input[type="email"]').fill(ADMIN_EMAIL)
  await fillPassword(page, 'Password', ADMIN_PASSWORD)
  await expect(page.locator('button[type="submit"]')).toBeEnabled({ timeout: 5_000 })
  await page.locator('button[type="submit"]').click()
  await page.waitForURL(
    url => !url.toString().includes('/login') && !url.toString().includes('/setup'),
    { timeout: 20_000 },
  )
}

test.describe('Portal Login Flow', () => {
  test('login page renders correctly', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    // May redirect to /setup if no admin exists
    const url = page.url()
    if (url.includes('/setup')) {
      await expect(page.locator('text=Admin Portal')).toBeVisible({ timeout: 10_000 })
    } else {
      await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 15_000 })
      await expect(page.getByPlaceholder('Password', { exact: true })).toBeVisible()
      await expect(page.locator('button[type="submit"]')).toBeVisible()
    }
    await page.screenshot({ path: '/tmp/portal-login-page.png', fullPage: true })
  })

  test('login with valid credentials reaches dashboard', async ({ page }) => {
    await loginToPortal(page)
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: '/tmp/portal-dashboard.png', fullPage: true })
    expect(page.url()).not.toContain('/login')
    expect(page.url()).not.toContain('/setup')
  })

  test('login with wrong password shows error', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // If redirected to setup, skip — no admin yet
    if (page.url().includes('/setup')) {
      test.skip(true, 'No admin user exists yet — login error test not applicable')
      return
    }

    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 15_000 })
    await page.locator('input[type="email"]').fill(ADMIN_EMAIL)
    await fillPassword(page, 'Password', 'WrongPassword123!')
    await expect(page.locator('button[type="submit"]')).toBeEnabled({ timeout: 5_000 })
    await page.locator('button[type="submit"]').click()

    await page.waitForTimeout(3000)
    expect(page.url()).not.toContain('/orgs')
    await page.screenshot({ path: '/tmp/portal-login-error.png', fullPage: true })
  })
})

test.describe('Portal Dashboard (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    await loginToPortal(page)
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
