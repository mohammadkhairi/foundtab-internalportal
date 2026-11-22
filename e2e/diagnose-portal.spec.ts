import { test, expect } from '@playwright/test'

test('diagnose portal setup/login flow', async ({ page }) => {
  const consoleErrors: string[] = []
  const networkFails: string[] = []
  const apiCalls: { method: string; url: string; status: number; body: string }[] = []

  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  page.on('pageerror', err => consoleErrors.push('PAGE ERROR: ' + err.message))
  page.on('requestfailed', req => {
    networkFails.push(`${req.method()} ${req.url()} — ${req.failure()?.errorText}`)
  })
  page.on('response', async resp => {
    if (resp.url().includes('/api/') || resp.url().includes('/setup') || resp.url().includes('/login')) {
      let body = ''
      try { body = await resp.text() } catch {}
      apiCalls.push({ method: resp.request().method(), url: resp.url(), status: resp.status(), body: body.slice(0, 400) })
    }
  })

  // Step 1: load setup page
  await page.goto('/setup', { waitUntil: 'networkidle' })
  await page.screenshot({ path: '/tmp/portal-diag-1-setup.png', fullPage: true })
  console.log('URL after goto /setup:', page.url())

  const isOnSetup = page.url().includes('/setup')
  if (isOnSetup) {
    console.log('On setup page — filling form')
    await page.getByPlaceholder('Your name').waitFor({ state: 'visible', timeout: 10_000 })
    await page.getByPlaceholder('Your name').fill('Admin')
    await page.getByPlaceholder('Email').fill('admin@foundtab.com')

    const passField = page.getByPlaceholder('Password', { exact: true })
    await passField.click()
    await passField.pressSequentially('FoundTab@Admin2024!', { delay: 20 })

    const confirmField = page.getByPlaceholder('Confirm password', { exact: true })
    await confirmField.click()
    await confirmField.pressSequentially('FoundTab@Admin2024!', { delay: 20 })

    await page.screenshot({ path: '/tmp/portal-diag-2-filled.png', fullPage: true })

    const btn = page.locator('button[type="submit"]')
    await expect(btn).toBeEnabled({ timeout: 10_000 })
    await btn.click()

    console.log('Clicked submit')
    await page.waitForTimeout(5000)
    await page.screenshot({ path: '/tmp/portal-diag-3-after-submit.png', fullPage: true })
    console.log('URL after submit:', page.url())
  } else {
    console.log('Not on setup page — going to login directly')
    await page.goto('/login', { waitUntil: 'networkidle' })
    await page.screenshot({ path: '/tmp/portal-diag-login.png', fullPage: true })
    console.log('URL on login page:', page.url())
  }

  console.log('\n=== CONSOLE ERRORS ===')
  if (consoleErrors.length === 0) console.log('none')
  consoleErrors.forEach(e => console.log('ERR:', e))

  console.log('\n=== NETWORK FAILURES ===')
  if (networkFails.length === 0) console.log('none')
  networkFails.forEach(e => console.log('FAIL:', e))

  console.log('\n=== API/RELEVANT CALLS ===')
  apiCalls.forEach(c => console.log(`[${c.status}] ${c.method} ${c.url}\n  ${c.body.slice(0, 200)}`))
})
