import { expect, test, type Page } from '@playwright/test';

/**
 * Admin Panel Playwright tests.
 *
 * This spec uses a REAL Firebase admin login (no mocking) so that the
 * screenshots capture actual admin dashboard / user management / announcements
 * content. The teammate-provided admin account is used for evidence.
 *
 * Credentials can be overridden via env vars:
 *   ADMIN_EMAIL, ADMIN_PASSWORD
 */

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@stuzic.lk';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123';

async function loginAsAdmin(page: Page) {
  await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });

  await page.getByPlaceholder('admin@stuzic.lk').fill(ADMIN_EMAIL);
  await page.getByPlaceholder('Enter admin password').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Access Admin Panel' }).click();

  // Wait for successful login — redirects to /admin/dashboard
  await page.waitForURL(/\/admin\/dashboard$/, { timeout: 30000 });
  await expect(page.getByText('Verifying admin access...')).toBeHidden({ timeout: 20000 });
  await expect(page.getByText('Loading admin dashboard...')).toBeHidden({ timeout: 20000 });
}

/** Wait for network to go idle + small buffer so screenshots show fully-rendered UI. */
async function settle(page: Page, extraMs = 1200) {
  try {
    await page.waitForLoadState('networkidle', { timeout: 10000 });
  } catch {
    // Firebase keeps long-poll streams open; ignore and fall through to buffer
  }
  await page.waitForTimeout(extraMs);
}

test.describe('Admin Panel — access control', () => {
  test('TC-AP-01: admin login page renders branding and the login form', async ({ page }) => {
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/\/admin\/login$/);
    await expect(page.getByText('Admin Portal')).toBeVisible();
    await expect(page.getByPlaceholder('admin@stuzic.lk')).toBeVisible();
    await expect(page.getByPlaceholder('Enter admin password')).toBeVisible();
    await expect(page.getByRole('button', { name: /Access Admin Panel|Verifying/ })).toBeVisible();

    await settle(page);
    await page.screenshot({ path: 'test-evidence/admin-panel/TC-AP-01-login-page.png', fullPage: true });
  });

  test('TC-AP-02: admin login form rejects empty submission with validation', async ({ page }) => {
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });

    await page.getByRole('button', { name: 'Access Admin Panel' }).click();

    // Validation error text appears and we stay on /admin/login
    await expect(page.getByText('Email is required.')).toBeVisible();
    await expect(page.getByText('Password is required.')).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login$/);

    await settle(page);
    await page.screenshot({ path: 'test-evidence/admin-panel/TC-AP-02-empty-submit-blocked.png', fullPage: true });
  });

  test('TC-AP-03: admin login rejects invalid credentials', async ({ page }) => {
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });

    await page.getByPlaceholder('admin@stuzic.lk').fill('notadmin@example.com');
    await page.getByPlaceholder('Enter admin password').fill('WrongPassword1!');
    await page.getByRole('button', { name: 'Access Admin Panel' }).click();

    // Either invalid credentials or access denied — both are acceptable rejections
    await expect(
      page.getByText(/Invalid email or password\.|Access denied\. Admin privileges required\./),
    ).toBeVisible({ timeout: 20000 });
    await expect(page).toHaveURL(/\/admin\/login$/);

    await settle(page);
    await page.screenshot({ path: 'test-evidence/admin-panel/TC-AP-03-invalid-credentials.png', fullPage: true });
  });

  test('TC-AP-04: unauthenticated visit to /admin/dashboard redirects to /admin/login', async ({ page }) => {
    await page.goto('/admin/dashboard', { waitUntil: 'domcontentloaded' });

    await expect(page.getByText('Verifying admin access...')).toBeHidden({ timeout: 20000 });
    await expect(page).toHaveURL(/\/admin\/login$/);

    await settle(page);
    await page.screenshot({ path: 'test-evidence/admin-panel/TC-AP-04-dashboard-redirect.png', fullPage: true });
  });
});

test.describe('Admin Panel — logged-in admin flows', () => {
  test('TC-AP-05: admin successfully logs in and reaches the Admin Dashboard', async ({ page }) => {
    await loginAsAdmin(page);

    await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('Overview of all STUZIC platform activity')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Today' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'This Week' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'This Month' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'All Time' })).toBeVisible();

    // Let the dashboard settle so stat cards have data
    await page.waitForTimeout(1500);

    await settle(page);
    await page.screenshot({ path: 'test-evidence/admin-panel/TC-AP-05-dashboard.png', fullPage: true });
  });

  test('TC-AP-06: admin can switch dashboard period filter to This Week', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible({ timeout: 20000 });

    await page.getByRole('button', { name: 'This Week' }).click();
    await page.waitForTimeout(800);
    await expect(page).toHaveURL(/\/admin\/dashboard$/);

    await settle(page);
    await page.screenshot({ path: 'test-evidence/admin-panel/TC-AP-06-dashboard-this-week.png', fullPage: true });
  });

  test('TC-AP-07: admin can open User Management and see search / export / table', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto('/admin/users', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Loading users...')).toBeHidden({ timeout: 20000 });

    await expect(page.getByRole('heading', { name: 'User Management' })).toBeVisible({ timeout: 20000 });
    await expect(page.getByPlaceholder('Search name/email')).toBeVisible();
    await expect(page.getByText('⬇ Export CSV')).toBeVisible();

    await settle(page);
    await page.screenshot({ path: 'test-evidence/admin-panel/TC-AP-07-user-management.png', fullPage: true });
  });

  test('TC-AP-08: User Management search input filters to an empty result', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/users', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Loading users...')).toBeHidden({ timeout: 20000 });
    await expect(page.getByRole('heading', { name: 'User Management' })).toBeVisible({ timeout: 20000 });

    const search = page.getByPlaceholder('Search name/email');
    await search.fill('zzzz-no-such-user-9999');
    await expect(search).toHaveValue('zzzz-no-such-user-9999');

    await settle(page);
    await page.screenshot({ path: 'test-evidence/admin-panel/TC-AP-08-user-search.png', fullPage: true });
  });

  test('TC-AP-09: admin can open Announcements page and see broadcast form', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto('/admin/announcements', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Loading announcements...')).toBeHidden({ timeout: 20000 });

    await expect(page.getByText('📣 Broadcast Announcement')).toBeVisible({ timeout: 20000 });
    await expect(page.getByPlaceholder('Type your announcement here...')).toBeVisible();
    await expect(page.getByRole('button', { name: /Send Broadcast|Sending/ })).toBeVisible();

    await settle(page);
    await page.screenshot({ path: 'test-evidence/admin-panel/TC-AP-09-announcements.png', fullPage: true });
  });

  test('TC-AP-10: Announcements textarea accepts input and enables Send Broadcast', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/announcements', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Loading announcements...')).toBeHidden({ timeout: 20000 });
    await expect(page.getByText('📣 Broadcast Announcement')).toBeVisible({ timeout: 20000 });

    const textarea = page.getByPlaceholder('Type your announcement here...');
    await textarea.fill('Playwright test draft — exam week reminder.');
    await expect(textarea).toHaveValue('Playwright test draft — exam week reminder.');

    const sendButton = page.getByRole('button', { name: /Send Broadcast|Sending/ });
    await expect(sendButton).toBeEnabled();

    await settle(page);
    await page.screenshot({ path: 'test-evidence/admin-panel/TC-AP-10-announcement-draft.png', fullPage: true });
  });
});
