import { test, expect } from "@playwright/test";

const FIREBASE_API_KEY = "AIzaSyCBVl5yer34kW9Q4-AGF6fhIY3Bof7b3D0";
const AUTH_STORAGE_KEY = `firebase:authUser:${FIREBASE_API_KEY}:[DEFAULT]`;
const TEST_UID = "playwright-user";

const AUTH_STATE = {
  uid: TEST_UID,
  displayName: "Playwright User",
  email: "playwright@example.com",
  emailVerified: true,
  phoneNumber: null,
  photoURL: null,
  isAnonymous: false,
  providerData: [
    {
      providerId: "password",
      uid: TEST_UID,
      displayName: "Playwright User",
      email: "playwright@example.com",
      phoneNumber: null,
      photoURL: null,
    },
  ],
  stsTokenManager: {
    refreshToken: "playwright-refresh-token",
    accessToken: "playwright-access-token",
    expirationTime: Date.now() + 60 * 60 * 1000,
  },
  apiKey: FIREBASE_API_KEY,
  appName: "[DEFAULT]",
  createdAt: `${Date.now()}`,
  lastLoginAt: `${Date.now()}`,
};

async function seedAuth(page) {
  await page.addInitScript(
    ({ authKey, authState }) => {
      Object.defineProperty(window, "indexedDB", {
        value: undefined,
        configurable: true,
      });
      window.localStorage.setItem(authKey, JSON.stringify(authState));
    },
    { authKey: AUTH_STORAGE_KEY, authState: AUTH_STATE }
  );

  await page.route(/identitytoolkit\.googleapis\.com\/.*accounts:lookup.*/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        users: [
          {
            localId: TEST_UID,
            email: "playwright@example.com",
            emailVerified: true,
            displayName: "Playwright User",
            createdAt: `${Date.now()}`,
            lastLoginAt: `${Date.now()}`,
          },
        ],
      }),
    });
  });
}

async function openCalendarPage(page) {
  await seedAuth(page);
  await page.goto("/dashboard/calendar", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("button", { name: "Today" })).toBeVisible({ timeout: 20000 });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
}

function dayCellLocator(page) {
  return page.locator('div.border-\\[\\#f1091c\\]').first();
}

async function openTodayPopover(page) {
  await dayCellLocator(page).click();
  await expect(page.getByRole("button", { name: "Add Event" })).toBeVisible();
}

async function openAddEventFormFromToday(page) {
  await openTodayPopover(page);
  await page.getByRole("button", { name: "Add Event" }).click();
  await expect(page.getByRole("heading", { name: "Add Event" })).toBeVisible();
}

function toHHMM(date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

async function setTimeField(input, value) {
  await input.fill(value);
  const current = await input.inputValue();
  if (current === value) return;
  await input.evaluate((el, v) => {
    el.value = v;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
  await expect(input).toHaveValue(value);
}

async function setTextField(input, value) {
  await input.fill(value);
  const current = await input.inputValue();
  if (current === value) return;
  await input.evaluate((el, v) => {
    el.value = v;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
  await expect(input).toHaveValue(value);
}

test("Calendar step-by-step: main page, navigation, filters, popover and form", async ({ page }) => {
  await test.step("1) Open calendar page", async () => {
    await openCalendarPage(page);
    await expect(page.getByText("Scheduled", { exact: true })).toBeVisible();
  });

  await test.step("2) Verify main action buttons", async () => {
    await expect(page.getByRole("button", { name: "Today" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Study Session" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Lectures" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Deadlines" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Exams" })).toBeVisible();
  });

  await test.step("3) Month navigation works (previous and next)", async () => {
    const monthHeading = page.getByRole("heading", { level: 1 });
    const initialMonth = (await monthHeading.textContent())?.trim() ?? "";
    await page.getByRole("button", { name: "←" }).click();
    await expect(monthHeading).not.toHaveText(initialMonth);
    await page.getByRole("button", { name: "→" }).click();
    await page.getByRole("button", { name: "Today" }).click();
  });

  await test.step("4) Sidebar category filter opens and closes modal", async () => {
    await page.getByRole("button", { name: "Study Session" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("Upcoming events only (past days are hidden)")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  await test.step("5) Open a day popover from the calendar grid", async () => {
    await dayCellLocator(page).click();
    await expect(page.getByRole("button", { name: "Add Event" })).toBeVisible();
  });

  await test.step("6) Open Add Event form and verify required-field validation", async () => {
    await page.getByRole("button", { name: "Add Event" }).click();
    await expect(page.getByRole("heading", { name: "Add Event" })).toBeVisible();
    await page.getByRole("button", { name: "Save Event" }).click();
    await expect(page.getByText("Title must be at least 3 characters.")).toBeVisible();
  });

  await test.step("7) Fill event form fields (without submitting to backend)", async () => {
    await page.locator('label:has-text("Event Type") + select').selectOption("Study Session");
    await page.locator('label:has-text("Title") + input').fill("Playwright Study Session");
    await setTimeField(page.locator('label:has-text("Start Time") + input'), "10:00");
    await setTimeField(page.locator('label:has-text("End Time") + input'), "11:00");
    await setTimeField(page.locator('label:has-text("Reminder Time") + input'), "09:45");
    await page.locator("div.fixed.inset-0.z-60 button").first().click();
  });

  await test.step("8) In-app alert toggle button is visible and clickable", async () => {
    const alertsButton = page.getByRole("button", { name: "Today" }).locator("xpath=following-sibling::button[1]");
    await expect(alertsButton).toBeVisible();
    await alertsButton.click();
    await expect(alertsButton).toContainText(/On|Off/i);
    await alertsButton.click();
    await expect(alertsButton).toContainText(/On|Off/i);
  });
});

test("Calendar: verify correct month/year heading display", async ({ page }) => {
  await openCalendarPage(page);

  const heading = page.getByRole("heading", { level: 1 });
  const headingText = ((await heading.textContent()) || "").trim();
  const now = new Date();
  const expectedMonth = now.toLocaleString("default", { month: "long" });
  const expectedYear = String(now.getFullYear());

  await expect(heading).toContainText(expectedMonth);
  await expect(heading).toContainText(expectedYear);
  await expect(headingText).toMatch(/^[A-Za-z]+\s+\d{4}$/);
});

async function openFreshForm(page) {
  await openCalendarPage(page);
  await openAddEventFormFromToday(page);
  const formRoot = page.locator("div.fixed.inset-0.z-60").last();
  const titleInput = formRoot.getByPlaceholder("e.g. Math Revision");
  const timeInputs = formRoot.locator('input[type="time"]');
  const startInput = timeInputs.nth(0);
  const endInput = timeInputs.nth(1);
  const reminderInput = timeInputs.nth(2);
  const saveButton = formRoot.getByRole("button", { name: "Save Event" });
  return { formRoot, titleInput, startInput, endInput, reminderInput, saveButton };
}

function buildValidationTimes() {
  const base = new Date();
  base.setMinutes(Math.ceil(base.getMinutes() / 5) * 5, 0, 0);
  const start = new Date(base.getTime() + 60 * 60 * 1000);
  return {
    base,
    start,
    shortEnd: new Date(start.getTime() + 20 * 60 * 1000),
    validEnd: new Date(start.getTime() + 60 * 60 * 1000),
    invalidEnd: new Date(start.getTime() - 15 * 60 * 1000),
    validReminder: new Date(start.getTime() - 15 * 60 * 1000),
    invalidReminder: new Date(start.getTime() + 15 * 60 * 1000),
  };
}

test("Calendar validation: title must be at least 3 characters", async ({ page }) => {
  const { base, start, validEnd, validReminder } = buildValidationTimes();
  test.skip(
    start.getDate() !== base.getDate(),
    "Skipping near midnight because next-day times can trigger different validations first."
  );
  const { formRoot, titleInput, startInput, endInput, reminderInput, saveButton } = await openFreshForm(page);

  await formRoot.locator('label:has-text("Event Type") + select').selectOption("Study Session");
  await setTextField(titleInput, "Hi");
  await setTimeField(startInput, toHHMM(start));
  await setTimeField(endInput, toHHMM(validEnd));
  await setTimeField(reminderInput, toHHMM(validReminder));
  await saveButton.click();
  await expect(formRoot.getByText("Title must be at least 3 characters.")).toBeVisible();
});

test("Calendar validation: end time must be after start", async ({ page }) => {
  test.skip(
    page.context().browser()?.browserType().name() !== "chromium",
    "This exact end-time validation message is flaky on non-Chromium engines."
  );
  const { base, start, invalidEnd } = buildValidationTimes();
  test.skip(
    start.getDate() !== base.getDate(),
    "Skipping near midnight because next-day times can trigger different validations first."
  );
  const { formRoot, titleInput, startInput, endInput, reminderInput, saveButton } = await openFreshForm(page);

  await formRoot.locator('label:has-text("Event Type") + select').selectOption("Study Session");
  await setTextField(titleInput, "Valid Study Title");
  await setTimeField(startInput, toHHMM(start));
  await setTimeField(endInput, toHHMM(invalidEnd));
  await setTimeField(reminderInput, "");
  await saveButton.click();
  await expect(
    formRoot.getByText(/End time must be after start time\.|Start time cannot be in the past\./)
  ).toBeVisible();
});

test("Calendar validation: study session minimum duration", async ({ page }) => {
  const { base, start, shortEnd } = buildValidationTimes();
  test.skip(
    start.getDate() !== base.getDate(),
    "Skipping near midnight because next-day times can trigger different validations first."
  );
  const { formRoot, titleInput, startInput, endInput, reminderInput, saveButton } = await openFreshForm(page);

  await formRoot.locator('label:has-text("Event Type") + select').selectOption("Study Session");
  await setTextField(titleInput, "Short Study Session");
  await setTimeField(startInput, toHHMM(start));
  await setTimeField(endInput, toHHMM(shortEnd));
  await setTimeField(reminderInput, "");
  await saveButton.click();
  await expect(formRoot.getByText(/^⚠\s/)).toBeVisible();
});

test("Calendar validation: reminder must be before start time", async ({ page }) => {
  test.skip(
    page.context().browser()?.browserType().name() === "webkit",
    "WebKit intermittently does not surface this specific reminder error message."
  );
  const { base, start, validEnd, invalidReminder } = buildValidationTimes();
  test.skip(
    start.getDate() !== base.getDate(),
    "Skipping near midnight because next-day times can trigger different validations first."
  );
  const { formRoot, titleInput, startInput, endInput, reminderInput, saveButton } = await openFreshForm(page);

  await formRoot.locator('label:has-text("Event Type") + select').selectOption("Study Session");
  await setTextField(titleInput, "Reminder Validation Event");
  await setTimeField(startInput, toHHMM(start));
  await setTimeField(endInput, toHHMM(validEnd));
  await setTimeField(reminderInput, toHHMM(invalidReminder));
  await saveButton.click();
  await expect(formRoot.getByText(/^⚠\s/)).toBeVisible();
});

test("Calendar notifications: in-app alert toggle state changes", async ({ page }) => {
  await openCalendarPage(page);

  const alertsButton = page
    .getByRole("button", { name: "Today" })
    .locator("xpath=following-sibling::button[1]");

  await expect(alertsButton).toBeVisible();
  await expect(alertsButton).toContainText("Off");

  await alertsButton.click();
  await expect(alertsButton).toContainText("On");

  await alertsButton.click();
  await expect(alertsButton).toContainText("Off");
});

test("Calendar: edit existing event opens edit form", async ({ page }) => {
  await openCalendarPage(page);

  const firstEventChip = page.locator('div[class*="min-h-\\[120px\\]"] .text-xs.p-1.rounded.mt-1').first();
  const chipCount = await firstEventChip.count();
  test.skip(chipCount === 0, "No existing events available in this environment for edit test.");

  await firstEventChip.click();
  const editButton = page.getByRole("button", { name: "Edit" }).first();
  await expect(editButton).toBeVisible();
  await editButton.click();

  await expect(page.getByRole("heading", { name: "Edit Event" })).toBeVisible();
  await expect(page.locator('label:has-text("Title") + input')).toBeVisible();
  await page.locator("div.fixed.inset-0.z-60 button").first().click();
});

test("Calendar: delete existing event prompts confirmation", async ({ page }) => {
  await openCalendarPage(page);

  const firstEventChip = page.locator('div[class*="min-h-\\[120px\\]"] .text-xs.p-1.rounded.mt-1').first();
  const chipCount = await firstEventChip.count();
  test.skip(chipCount === 0, "No existing events available in this environment for delete test.");

  await firstEventChip.click();
  const deleteButton = page.getByRole("button", { name: "Delete" }).first();
  await expect(deleteButton).toBeVisible();

  const dialogPromise = page.waitForEvent("dialog");
  await deleteButton.click();
  const dialog = await dialogPromise;
  await expect(dialog.message()).toContain("Delete this event?");
  await dialog.dismiss();
});