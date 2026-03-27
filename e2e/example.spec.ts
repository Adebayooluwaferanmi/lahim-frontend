import { test, expect } from '@playwright/test'

/**
 * Example E2E test
 * This demonstrates Playwright testing setup
 */

test.describe('LaHIM Application', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Check if page loaded
    await expect(page).toHaveTitle(/LaHIM|HospitalRun/i)
  })

  test('should navigate to patients page', async ({ page }) => {
    await page.goto('/')
    
    // Click on patients link (adjust selector based on your UI)
    // await page.click('text=Patients')
    
    // Wait for navigation
    // await page.waitForURL('**/patients')
    
    // Verify we're on patients page
    // await expect(page).toHaveURL(/.*patients/)
  })
})

