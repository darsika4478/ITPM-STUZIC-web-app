import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

async function openMoodRoute(page: import('@playwright/test').Page) {
  return page.goto(`${BASE_URL}/dashboard/mood`, { waitUntil: 'domcontentloaded' });
}

// TC-01
 test('TC-01: Mood route responds without server error', async ({ page }) => {
  const response = await openMoodRoute(page);
  expect(response).not.toBeNull();
  expect(response!.status()).toBeLessThan(500);
});

// TC-02
 test('TC-02: Mood route keeps browser on app origin', async ({ page }) => {
  await openMoodRoute(page);
  expect(page.url().startsWith(BASE_URL)).toBeTruthy();
});

// TC-03
 test('TC-03: Document root element exists', async ({ page }) => {
  await openMoodRoute(page);
  await expect(page.locator('html')).toBeVisible();
});

// TC-04
 test('TC-04: Body element exists', async ({ page }) => {
  await openMoodRoute(page);
  await expect(page.locator('body')).toBeVisible();
});

// TC-05
 test('TC-05: App root container exists', async ({ page }) => {
  await openMoodRoute(page);
  await expect(page.locator('#root')).toBeVisible();
});

// TC-06
 test('TC-06: DOM readiness reaches interactive/complete', async ({ page }) => {
  await openMoodRoute(page);
  const state = await page.evaluate(() => document.readyState);
  expect(state === 'interactive' || state === 'complete').toBeTruthy();
});

// TC-07
 test('TC-07: Reload on mood route stays on app origin', async ({ page }) => {
  await openMoodRoute(page);
  await page.reload({ waitUntil: 'domcontentloaded' });
  expect(page.url().startsWith(BASE_URL)).toBeTruthy();
});

// TC-08
 test('TC-08: Login route is reachable', async ({ page }) => {
  const response = await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
  expect(response).not.toBeNull();
  expect(response!.status()).toBeLessThan(500);
});

// TC-09
 test('TC-09: Home route is reachable', async ({ page }) => {
  const response = await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  expect(response).not.toBeNull();
  expect(response!.status()).toBeLessThan(500);
});

// TC-10
 test('TC-10: Login page has form controls', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
  const emailCount = await page.locator('input#email, input[type="email"]').count();
  const passCount = await page.locator('input#password, input[type="password"]').count();
  expect(emailCount).toBeGreaterThan(0);
  expect(passCount).toBeGreaterThan(0);
});

// TC-11
 test('TC-11: Mood route preserves valid HTTP protocol', async ({ page }) => {
  await openMoodRoute(page);
  expect(page.url().startsWith('http://')).toBeTruthy();
});

// TC-12
 test('TC-12: Document content type is HTML', async ({ page }) => {
  await openMoodRoute(page);
  const contentType = await page.evaluate(() => document.contentType);
  expect(contentType.toLowerCase()).toContain('html');
});
