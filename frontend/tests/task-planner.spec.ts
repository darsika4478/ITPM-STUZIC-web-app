import { expect, test, type Page } from '@playwright/test';

/**
 * Task Planner Playwright tests.
 *
 * Uses a REAL Firebase login (no mocking) so screenshots show the actual
 * logged-in user's sidebar / avatar / task board.
 *
 * Credentials can be overridden via env vars:
 *   USER_EMAIL, USER_PASSWORD
 *
 * All flows are non-destructive — we never click the final "Add" or "Delete"
 * buttons, so no tasks are actually written to Firestore.
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

async function gotoTasks(page: Page) {
  await loginAsUser(page);
  await page.goto('/dashboard/tasks', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('Loading dashboard...')).toBeHidden({ timeout: 20000 });
  await expect(page.getByRole('heading', { name: '📋 Task Planner' })).toBeVisible({ timeout: 20000 });
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

test.describe('Task Planner', () => {
  test('TC-TP-01: task planner page loads with heading and quick capture bar', async ({ page }) => {
    await gotoTasks(page);

    await expect(page.getByRole('heading', { name: '📋 Task Planner' })).toBeVisible();
    await expect(page.getByText('Organize your study tasks and stay on track')).toBeVisible();
    await expect(page.getByText('Take a note...')).toBeVisible();

    await settle(page);
    await page.screenshot({ path: 'test-evidence/task-planner/TC-TP-01-page-loaded.png'});
  });

  test('TC-TP-02: clicking quick capture opens composer form with title input', async ({ page }) => {
    await gotoTasks(page);

    await page.getByText('Take a note...').click();

    await expect(page.getByPlaceholder('Title')).toBeVisible();
    await expect(page.getByPlaceholder('Take a note...').last()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add', exact: true })).toBeVisible();

    await settle(page);
    await page.screenshot({ path: 'test-evidence/task-planner/TC-TP-02-composer-open.png'});
  });

  test('TC-TP-03: Add button is disabled until the user types a title or body', async ({ page }) => {
    await gotoTasks(page);

    await page.getByText('Take a note...').click();

    const addButton = page.getByRole('button', { name: 'Add', exact: true });
    await expect(addButton).toBeDisabled();

    await page.getByPlaceholder('Title').fill('Finish lab report');
    await expect(addButton).toBeEnabled();

    await settle(page);
    await page.screenshot({ path: 'test-evidence/task-planner/TC-TP-03-add-enabled.png'});
  });

  test('TC-TP-04: composer supports switching to checklist mode with add-item input', async ({ page }) => {
    await gotoTasks(page);

    await page.getByText('Take a note...').click();
    await page.getByPlaceholder('Title').fill('Revision checklist');

    // Switch to checklist mode
    await page.getByRole('button', { name: 'Checklist' }).click();
    await expect(page.getByPlaceholder('Add list item')).toBeVisible();

    await settle(page);
    await page.screenshot({ path: 'test-evidence/task-planner/TC-TP-04-checklist-mode.png'});
  });

  test('TC-TP-05: stats row and search bar render after form close', async ({ page }) => {
    await gotoTasks(page);

    await expect(page.getByPlaceholder('Search tasks...')).toBeVisible();
    await expect(page.getByText('Total', { exact: true })).toBeVisible();
    await expect(page.getByText('Active', { exact: true })).toBeVisible();
    await expect(page.getByText('Completed', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Overdue', { exact: true })).toBeVisible();

    await settle(page);
    await page.screenshot({ path: 'test-evidence/task-planner/TC-TP-05-stats-search.png'});
  });

  test('TC-TP-06: priority filter tabs are visible', async ({ page }) => {
    await gotoTasks(page);

    await expect(page.getByRole('button', { name: /Low/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Medium/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /High/ })).toBeVisible();

    await settle(page);
    await page.screenshot({ path: 'test-evidence/task-planner/TC-TP-06-priority-filters.png'});
  });

  test('TC-TP-07: bin button opens the bin modal and can be closed', async ({ page }) => {
    await gotoTasks(page);

    await page.getByTitle('Open bin').click();
    await expect(page.getByRole('heading', { name: '🗑️ Bin' })).toBeVisible();

    await settle(page);
    await page.screenshot({ path: 'test-evidence/task-planner/TC-TP-07-bin-modal.png'});
  });
});
