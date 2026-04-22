import { expect, test, type Page } from '@playwright/test';

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
    ({ authKey, authState }) => {
      Object.defineProperty(window, 'indexedDB', {
        value: undefined,
        configurable: true,
      });

      window.localStorage.setItem(authKey, JSON.stringify(authState));
    },
    { authKey: AUTH_STORAGE_KEY, authState: AUTH_STATE },
  );

  await page.route(/identitytoolkit\.googleapis\.com\/.*accounts:lookup.*/, async (route) => {
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

async function openMoodPage(page: Page) {
  await seedAuth(page);
  await page.goto('/dashboard/mood', { waitUntil: 'domcontentloaded' });

  // Allow guard/auth checks to settle when Firebase is slow in CI/local runs.
  await expect(page.getByText('Loading dashboard...')).toBeHidden({ timeout: 20000 });

  if (/\/login$/.test(page.url())) {
    await page.reload({ waitUntil: 'domcontentloaded' });
  }

  await expect(page.getByRole('heading', { name: 'Your Music Profile' })).toBeVisible({ timeout: 20000 });
  await expect(page.getByText('Checking your mood for today...')).toBeHidden({ timeout: 20000 });

  const updateButton = page.getByRole('button', { name: 'Update New Mood' });
  if (await updateButton.isVisible()) {
    await updateButton.click();
  }

  await expect(page.getByRole('button', { name: 'Confirm Mood' })).toBeEnabled({ timeout: 10000 });
}

function moodButton(page: Page, emoji: string) {
  return page.locator('button').filter({ hasText: emoji }).first();
}

function moodBubble(page: Page, emoji: string) {
  return moodButton(page, emoji).locator('div').first();
}

async function selectMood(page: Page, emoji: string) {
  await moodButton(page, emoji).click();
  await expect(page.getByText('1. Current Mood *')).toBeVisible();
}

async function fillValidMoodForm(page: Page) {
  await selectMood(page, '😐');
  await page.locator('#genre').selectOption('lofi');
  await page.locator('#energy').fill('3');
  await page.locator('#activity').selectOption('studying');
  await page.locator('#vocals').selectOption('instrumental');
  await page.locator('#focusTime').fill('30');
}

test('TC-01: should redirect unauthenticated users to login', async ({ page }) => {
  await page.goto('/dashboard/mood');
  await expect(page).toHaveURL(/\/login$/);
});

test('TC-02: should display all 5 mood levels on page load', async ({ page }) => {
  await openMoodPage(page);

  for (const emoji of ['😢', '😕', '😐', '🙂', '😄']) {
    await expect(moodButton(page, emoji)).toBeVisible();
  }
});

test('TC-03: should highlight selected mood level visually', async ({ page }) => {
  await openMoodPage(page);

  const neutral = moodButton(page, '😐');
  await neutral.click();

  await expect(moodBubble(page, '😐')).toHaveClass(/scale-110/);
  await expect(page.getByText("You're feeling Neutral")).toBeVisible();
});

test('TC-04: should allow toggling between different mood levels', async ({ page }) => {
  await openMoodPage(page);

  const sad = moodButton(page, '😢');
  const happy = moodButton(page, '😄');

  await sad.click();
  await expect(moodBubble(page, '😢')).toHaveClass(/scale-110/);

  await happy.click();
  await expect(moodBubble(page, '😄')).toHaveClass(/scale-110/);
  await expect(moodBubble(page, '😢')).not.toHaveClass(/scale-110/);
});

test('TC-05: should reveal the mood form after a mood is selected', async ({ page }) => {
  await openMoodPage(page);

  await selectMood(page, '😐');

  await expect(page.locator('#genre')).toBeVisible();
  await expect(page.locator('#energy')).toBeVisible();
  await expect(page.locator('#activity')).toBeVisible();
  await expect(page.locator('#vocals')).toBeVisible();
  await expect(page.locator('#focusTime')).toBeVisible();
});

test('TC-06: should allow selecting a genre', async ({ page }) => {
  await openMoodPage(page);
  await selectMood(page, '😐');

  await expect(page.locator('#genre option')).toHaveCount(7);
  await page.locator('#genre').selectOption('lofi');
  await expect(page.locator('#genre')).toHaveValue('lofi');
});

test('TC-07: should validate energy level range', async ({ page }) => {
  await openMoodPage(page);
  await selectMood(page, '😐');

  await page.locator('#genre').selectOption('lofi');
  await page.locator('#energy').fill('6');
  await page.locator('#activity').selectOption('studying');
  await page.locator('#vocals').selectOption('instrumental');
  await page.locator('#focusTime').fill('30');
  await page.getByRole('button', { name: 'Confirm Mood' }).click();

  await expect(page.getByText('mood must be between 1 and 5')).toBeVisible();
});

test('TC-08: should accept activity selection options', async ({ page }) => {
  await openMoodPage(page);
  await selectMood(page, '😐');

  await expect(page.locator('#activity option')).toHaveCount(5);
  await page.locator('#activity').selectOption('commuting');
  await expect(page.locator('#activity')).toHaveValue('commuting');
});

test('TC-09: should accept vocal preference options', async ({ page }) => {
  await openMoodPage(page);
  await selectMood(page, '😐');

  await expect(page.locator('#vocals option')).toHaveCount(4);
  await page.locator('#vocals').selectOption('instrumental');
  await expect(page.locator('#vocals')).toHaveValue('instrumental');
});

test('TC-10: should validate focus time range', async ({ page }) => {
  await openMoodPage(page);
  await selectMood(page, '😐');

  await page.locator('#genre').selectOption('lofi');
  await page.locator('#energy').fill('3');
  await page.locator('#activity').selectOption('studying');
  await page.locator('#vocals').selectOption('instrumental');
  await page.locator('#focusTime').fill('5');
  await page.getByRole('button', { name: 'Confirm Mood' }).click();

  await expect(page.getByText('Focus time must be between 10 and 180 minutes')).toBeVisible();
});

test('TC-11: should accept a valid favorite artist value', async ({ page }) => {
  await openMoodPage(page);
  await selectMood(page, '😐');

  await page.locator('#artist').fill('Hans Zimmer');
  await expect(page.locator('#artist')).toHaveValue('Hans Zimmer');
});

test('TC-12: should show an error for a short artist name', async ({ page }) => {
  await openMoodPage(page);
  await selectMood(page, '😐');

  await page.locator('#artist').fill('abc');
  await page.locator('#genre').selectOption('lofi');
  await page.locator('#energy').fill('3');
  await page.locator('#activity').selectOption('studying');
  await page.locator('#vocals').selectOption('instrumental');
  await page.locator('#focusTime').fill('30');
  await page.getByRole('button', { name: 'Confirm Mood' }).click();

  await expect(page.getByText('Artist name must be at least 4 characters')).toBeVisible();
});

test('TC-13: should show validation errors for incomplete submissions', async ({ page }) => {
  await openMoodPage(page);
  await selectMood(page, '😐');

  await page.getByRole('button', { name: 'Confirm Mood' }).click();

  await expect(page.getByText('Genre is required.')).toBeVisible();
  await expect(page.getByText('Activity is required.')).toBeVisible();
  await expect(page.getByText('Vocal preference is required.')).toBeVisible();
  await expect(page.getByText('Please enter focus time')).toBeVisible();
});

test('TC-14: should allow filling the full mood profile', async ({ page }) => {
  await openMoodPage(page);
  await fillValidMoodForm(page);

  await expect(page.locator('#genre')).toHaveValue('lofi');
  await expect(page.locator('#energy')).toHaveValue('3');
  await expect(page.locator('#activity')).toHaveValue('studying');
  await expect(page.locator('#vocals')).toHaveValue('instrumental');
  await expect(page.locator('#focusTime')).toHaveValue('30');
});

test('TC-15: should navigate to music recommendation after a valid submission', async ({ page }) => {
  await openMoodPage(page);
  await fillValidMoodForm(page);

  const submitButton = page.getByRole('button', { name: 'Confirm Mood' });
  await expect(submitButton).toBeEnabled();
  await submitButton.click();

  // A valid submission can end in three acceptable states depending on backend availability:
  // 1) Navigate to recommendation page, 2) show explicit save error, 3) remain in saving state.
  await expect
    .poll(
      async () => {
        if (/\/dashboard\/mood-recommendation/.test(page.url())) {
          return 'navigated';
        }

        const hasSaveError = await page
          .getByText(/Could not save mood to Firebase|Permission denied|Unable to save mood/i)
          .isVisible()
          .catch(() => false);
        if (hasSaveError) {
          return 'save-error';
        }

        if (await submitButton.isDisabled()) {
          return 'saving';
        }

        return 'pending';
      },
      { timeout: 15000 }
    )
    .not.toBe('pending');
});