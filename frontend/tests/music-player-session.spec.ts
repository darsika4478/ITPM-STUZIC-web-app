import { expect, test, type Page, type Route } from '@playwright/test';

const FIREBASE_API_KEY = 'AIzaSyCBVl5yer34kW9Q4-AGF6fhIY3Bof7b3D0';
const AUTH_STORAGE_KEY = `firebase:authUser:${FIREBASE_API_KEY}:[DEFAULT]`;
const TEST_UID = 'playwright-user';

const AUTH_STATE = {
  uid: TEST_UID,
  displayName: 'Playwright User',
  email: 'playwright@example.com',
  emailVerified: true,
  phoneNumber: null,
  photoURL: null,
  isAnonymous: false,
  providerData: [
    {
      providerId: 'password',
      uid: TEST_UID,
      displayName: 'Playwright User',
      email: 'playwright@example.com',
      phoneNumber: null,
      photoURL: null,
    },
  ],
  stsTokenManager: {
    refreshToken: 'playwright-refresh-token',
    accessToken: 'playwright-access-token',
    expirationTime: Date.now() + 60 * 60 * 1000,
  },
  apiKey: FIREBASE_API_KEY,
  appName: '[DEFAULT]',
  createdAt: `${Date.now()}`,
  lastLoginAt: `${Date.now()}`,
};

async function seedAuth(page: Page) {
  await page.addInitScript(
    ({ authKey, authState }: { authKey: string; authState: typeof AUTH_STATE }) => {
      Object.defineProperty(window, 'indexedDB', {
        value: undefined,
        configurable: true,
      });

      window.localStorage.setItem(authKey, JSON.stringify(authState));
    },
    { authKey: AUTH_STORAGE_KEY, authState: AUTH_STATE },
  );

  await page.route(/identitytoolkit\.googleapis\.com\/.*accounts:lookup.*/, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        users: [
          {
            localId: TEST_UID,
            email: 'playwright@example.com',
            emailVerified: true,
            displayName: 'Playwright User',
            createdAt: `${Date.now()}`,
            lastLoginAt: `${Date.now()}`,
            providerUserInfo: [
              {
                providerId: 'password',
                rawId: TEST_UID,
                email: 'playwright@example.com',
                displayName: 'Playwright User',
              },
            ],
          },
        ],
      }),
    });
  });
}

async function openAuthenticatedPage(page: Page, path: string) {
  await seedAuth(page);
  await page.goto(path, { waitUntil: 'domcontentloaded' });

  await expect(page.getByText('Loading dashboard...')).toBeHidden({ timeout: 20000 });

  if (/\/login$/.test(page.url())) {
    await page.reload({ waitUntil: 'domcontentloaded' });
  }
}

async function fillStudySessionConfig(page: Page) {
  await page.locator('input[name="goal"]').fill('Finish chapter 5');
  await page.locator('input[name="subject"]').fill('Math');
  await page.locator('input[name="topic"]').fill('Algebra');
  await page.getByRole('button', { name: 'Save Configuration' }).click();
}

test('TC-11: should display the music player screen with playlist and history tabs', async ({ page }) => {
  await openAuthenticatedPage(page, '/dashboard/music');

  await expect(page.getByRole('button', { name: 'Playlist Table' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'History Log' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Interactive Player' })).toBeVisible();
});

test('TC-12: should toggle play/pause from the music player controls', async ({ page }) => {
  await openAuthenticatedPage(page, '/dashboard/music');

  // Find the main play/pause button in the player controls (larger button, not floating timer)
  const mainPlayerButton = page.locator('button.w-20, button.w-24').first();
  await expect(mainPlayerButton).toBeVisible();

  // Click to start playing
  await mainPlayerButton.click();

  // Wait a moment for state to update, then verify it shows pause
  await page.waitForTimeout(500);
  const pauseButton = page.locator('button.w-20[title="Pause"], button.w-24[title="Pause"]').first();
  await expect(pauseButton).toBeVisible();

  // Click to pause
  await pauseButton.click();

  // Verify it shows play again
  const playButton = page.locator('button.w-20[title="Play"], button.w-24[title="Play"]').first();
  await expect(playButton).toBeVisible();
});

test('TC-13: should switch to history tab and show empty history state', async ({ page }) => {
  await openAuthenticatedPage(page, '/dashboard/music');

  await page.getByRole('button', { name: 'History Log' }).click();
  await expect(page.getByRole('heading', { name: 'Session History' })).toBeVisible();
  await expect(page.getByText('No sessions yet. Start focusing and build your streak! 🎯')).toBeVisible();
});

test('TC-14: should configure, start, pause, and reset a study session timer', async ({ page }) => {
  await openAuthenticatedPage(page, '/dashboard/study-session');

  await expect(page.getByRole('heading', { name: 'Study Session' })).toBeVisible();

  await fillStudySessionConfig(page);
  await expect(page.getByText('"Finish chapter 5"')).toBeVisible();

  await page.getByRole('button', { name: '▶ Start Session' }).click();
  await expect(page.getByRole('button', { name: '⏸ Pause Session' })).toBeVisible();
  await expect(page.getByText('Session Active - GO!')).toBeVisible();

  await page.getByRole('button', { name: '↻ Reset' }).click();
  await expect(page.getByText('Ready to focus?')).toBeVisible();
});

test('TC-15: should validate study duration input before starting a session', async ({ page }) => {
  await openAuthenticatedPage(page, '/dashboard/study-session');

  await expect(page.getByRole('heading', { name: 'Study Session' })).toBeVisible();
  await page.locator('input[type="number"]').fill('0');
  await expect(page.getByText('Minimum duration is 1 minute')).toBeVisible();
});
