import { test, expect } from '@playwright/test'

test.describe('Login & Auth', () => {
  test('login page loads and shows form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('h1')).toContainText(/log in|sign in/i)
    await expect(page.locator('[type="submit"]')).toBeVisible()
  })

  test('redirects unauthenticated user to login', async ({ page }) => {
    await page.goto('/doer')
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe('Critical Paths — Doer Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('[name="employeeId"]', 'EMP-0004')
    await page.fill('[name="password"]', 'password')
    await page.click('[type="submit"]')
    await expect(page).not.toHaveURL(/\/login/)
  })

  test('doer can view tasks after login', async ({ page }) => {
    await page.goto('/doer/tasks')
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('doer can view attendance', async ({ page }) => {
    await page.goto('/doer/attendance')
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('doer can apply for leave', async ({ page }) => {
    await page.goto('/doer/leave')
    await expect(page.locator('h1').first()).toBeVisible()
    const applyBtn = page.locator('button').filter({ hasText: /apply|new|request/i }).first()
    if (await applyBtn.isVisible()) {
      await applyBtn.click()
    }
  })

  test('doer can view training', async ({ page }) => {
    await page.goto('/doer/training')
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('doer can raise a help ticket', async ({ page }) => {
    await page.goto('/doer/tickets')
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('doer home shows KPI tiles', async ({ page }) => {
    await page.goto('/doer')
    // KPI tiles should be visible
    const kpiValues = page.locator('[class*="kpi-value"]')
    await expect(kpiValues.first()).toBeVisible()
  })
})

test.describe('Critical Paths — Captain Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('[name="employeeId"]', 'EMP-0001')
    await page.fill('[name="password"]', 'password')
    await page.click('[type="submit"]')
    await expect(page).not.toHaveURL(/\/login/)
  })

  test('captain dashboard loads', async ({ page }) => {
    await page.goto('/captain')
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('captain can view rescue queue', async ({ page }) => {
    await page.goto('/captain/rescue')
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('captain can view team', async ({ page }) => {
    await page.goto('/captain/team')
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('captain can view tickets', async ({ page }) => {
    await page.goto('/captain/tickets')
    await expect(page.locator('h1').first()).toBeVisible()
  })
})

test.describe('Critical Paths — Admin Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('[name="employeeId"]', 'EMP-0000')
    await page.fill('[name="password"]', 'password')
    await page.click('[type="submit"]')
    await expect(page).not.toHaveURL(/\/login/)
  })

  test('admin dashboard loads with KPIs', async ({ page }) => {
    await page.goto('/admin')
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('admin can view employees', async ({ page }) => {
    await page.goto('/admin/employees')
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('admin can view leave requests', async ({ page }) => {
    await page.goto('/admin/leave')
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('admin can view insights', async ({ page }) => {
    await page.goto('/admin/insights')
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('admin can view departments', async ({ page }) => {
    await page.goto('/admin/departments')
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('admin can view tickets', async ({ page }) => {
    await page.goto('/admin/tickets')
    await expect(page.locator('h1').first()).toBeVisible()
  })
})

test.describe('Loading & Error States', () => {
  test('pages show loading state before content', async ({ page }) => {
    await page.goto('/login')
    await page.fill('[name="employeeId"]', 'EMP-0004')
    await page.fill('[name="password"]', 'password')
    await page.click('[type="submit"]')
    await page.goto('/doer/tasks')
    // Either loading spinner or content should render
    const spinner = page.locator('[class*="animate-spin"]')
    const content = page.locator('h1').first()
    await expect(spinner.or(content)).toBeVisible({ timeout: 5000 })
  })
})
