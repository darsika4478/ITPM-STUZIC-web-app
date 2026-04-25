import { expect, test, type Page } from '@playwright/test';

/**
 * User Management Playwright tests.
 *
 * Uses a REAL Firebase login (no mocking) so screenshots show the actual
 * logged-in user's profile, account details, and settings pages.
 *
 * Credentials can be overridden via env vars:
 *   USER_EMAIL, USER_PASSWORD
 *
 * All destructive flows (name save, password change, account delete) are
 * intentionally NOT executed — we only open modals / edit-mode and capture
 * evidence, then cancel. This keeps the live account safe.
 */

const USER_EMAIL = process.env.USER_EMAIL || 'w.a.thisarasandapium@gmail.com';
const USER_PASSWORD = process.env.USER_PASSWORD || 'Amazo@5258';

async function loginAsUser(page: Page) {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });

  await page.getByPlaceholder('name@stuzic.lk').fill(USER_EMAIL);
  await page.getByPlaceholder('Your password').fill(USER_PASSWORD);
  await page.getByRole('button', { name: 'Log In' }).click();

  // Wait for redirect to /dashboard (or any /dashboard/* subpage)
  await page.waitForURL(/\/dashboard(\/.*)?$/, { timeout: 30000 });
  await expect(page.getByText('Loading dashboard...')).toBeHidden({ timeout: 20000 });
}

async function gotoProfile(page: Page) {
  await loginAsUser(page);
  await page.goto('/dashboard/profile', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('Loading profile…')).toBeHidden({ timeout: 20000 });
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

test.describe('User Management - Profile page', () => {
  test('TC-UM-01: auth guard allows real logged-in user to reach profile page', async ({ page }) => {
    await gotoProfile(page);
    await expect(page).toHaveURL(/\/dashboard\/profile$/);

    await settle(page);
    await page.screenshot({ path: 'test-evidence/user-management/TC-UM-01-auth-guard.png'});
  });

  test('TC-UM-02: profile page shows user name, email, and account details', async ({ page }) => {
    await gotoProfile(page);

    // Heading (h2) carries the user's display name — assert it exists and is non-empty
    const nameHeading = page.getByRole('heading', { level: 2 }).first();
    await expect(nameHeading).toBeVisible();
    await expect(nameHeading).not.toHaveText('');

    // Email should be rendered somewhere on the profile
    await expect(page.getByText(USER_EMAIL).first()).toBeVisible();

    await expect(page.getByRole('heading', { name: 'Account Details' })).toBeVisible();
    await expect(page.getByText('Account Created')).toBeVisible();
    await expect(page.getByText('Last Sign-In')).toBeVisible();

    await settle(page);
    await page.screenshot({ path: 'test-evidence/user-management/TC-UM-02-profile-details.png'});
  });

  test('TC-UM-03: name field becomes editable and can be cancelled safely', async ({ page }) => {
    await gotoProfile(page);

    await page.getByRole('button', { name: 'Edit Name' }).click();

    const nameInput = page.getByPlaceholder('Enter your name');
    await expect(nameInput).toBeVisible();

    // Capture the real display name from the input itself (populated from Firestore)
    // so we can verify it's restored after cancel.
    await expect(nameInput).not.toHaveValue('');
    const originalName = (await nameInput.inputValue()).trim();

    // Type something but do NOT save — we never want to mutate the real account
    await nameInput.fill('Playwright Test Draft (will cancel)');
    await settle(page);
    await page.screenshot({ path: 'test-evidence/user-management/TC-UM-03a-name-edit-mode.png'});

    await page.getByRole('button', { name: 'Cancel' }).click();

    // After cancel, the original name must still be the one used on the profile.
    // Re-enter edit mode and confirm the input has been restored to the original value.
    await page.getByRole('button', { name: 'Edit Name' }).click();
    await expect(page.getByPlaceholder('Enter your name')).toHaveValue(originalName);
    await page.getByRole('button', { name: 'Cancel' }).click();

    await settle(page);
    await page.screenshot({ path: 'test-evidence/user-management/TC-UM-03b-name-cancelled.png'});
  });

  test('TC-UM-04: change password form renders with all three inputs', async ({ page }) => {
    await gotoProfile(page);

    await expect(page.getByRole('heading', { name: 'Change Password' })).toBeVisible();
    await expect(page.getByPlaceholder('Enter current password')).toBeVisible();
    await expect(page.getByPlaceholder('Minimum 6 characters')).toBeVisible();
    await expect(page.getByPlaceholder('Re-enter new password')).toBeVisible();

    await settle(page);
    await page.screenshot({ path: 'test-evidence/user-management/TC-UM-04-change-password.png'});
  });

  test('TC-UM-05: danger zone exposes delete account flow with confirmation guard', async ({ page }) => {
    await gotoProfile(page);

    await expect(page.getByRole('heading', { name: 'Danger Zone' })).toBeVisible();

    // Open delete confirmation modal — we will NOT submit it
    await page.getByRole('button', { name: 'Delete My Account' }).click();

    await expect(page.getByRole('heading', { name: 'Delete Account' })).toBeVisible();
    await expect(page.getByPlaceholder('Type "DELETE"')).toBeVisible();
    await expect(page.getByPlaceholder('Enter your password')).toBeVisible();

    await settle(page);
    await page.screenshot({ path: 'test-evidence/user-management/TC-UM-05-delete-modal.png'});
  });
});
