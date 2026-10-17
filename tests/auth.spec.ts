import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const institution = {
  id: '3ab566dc-b460-548a-8c04-888bef7dbdd2',
  name: 'University of Lagos, Lagos',
  type: 'university',
  state: 'Lagos',
  source_url: 'https://enuc.nuc.edu.ng/nus',
};
const details = {
  display_name: 'Alex Morgan',
  username: 'alex_morgan',
  email: 'alex@example.com',
  password: 'CampusTest123!',
};
const profile = {
  id: 'student-1',
  ...details,
  is_verified: true,
  role: 'student',
  student_verification_status: 'pending',
};
test.beforeEach(async ({ page }) => {
  await page.route('**/auth/refresh', (r) => r.fulfill({ status: 401 }));
  await page.route('**/institutions?**', (r) =>
    r.fulfill({ json: { data: [institution], next_after: null } }),
  );
  await page.route('**/auth/resend-verification', (r) =>
    r.fulfill({ json: { message: 'Verification sent' } }),
  );
  await page.route('**/auth/verify-email', (r) =>
    r.fulfill({ json: { message: 'Email verified' } }),
  );
});
async function institutionStep(page: Page) {
  await page.goto('/register');
  await page
    .getByRole('combobox', { name: 'Institution', exact: true })
    .fill('Lagos');
  await page.getByRole('option', { name: institution.name }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByText('Step 2 of 5')).toBeVisible();
}
async function facultyStep(page: Page) {
  await page
    .getByRole('combobox', { name: 'Faculty', exact: true })
    .fill('Sciences');
  await page.getByRole('option', { name: 'Sciences', exact: true }).click();
  await page
    .getByRole('combobox', { name: 'Department', exact: true })
    .fill('Computer Science');
  await page.getByRole('heading', { level: 1 }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByText('Step 3 of 5')).toBeVisible();
}
async function detailsStep(page: Page) {
  await page
    .getByLabel('Display name', { exact: true })
    .fill(details.display_name);
  await page.getByLabel('Username', { exact: true }).fill(details.username);
  await page.getByLabel('Email', { exact: true }).fill(details.email);
  await page.getByLabel('Password', { exact: true }).fill(details.password);
  await page
    .getByLabel('Confirm password', { exact: true })
    .fill(details.password);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByText('Step 4 of 5')).toBeVisible();
}
async function verifiedStep(page: Page) {
  await page.getByLabel('Verification code', { exact: true }).fill('123456');
  await page.getByRole('button', { name: 'Verify email', exact: true }).click();
  await expect(page.getByText('Step 5 of 5')).toBeVisible();
}

test('five-step signup submits real institution ID and omits optional student ID when skipped', async ({
  page,
}) => {
  const requests: { path: string; body: unknown }[] = [];
  for (const path of ['resend-verification', 'verify-email', 'register'])
    await page.route(`**/auth/${path}`, async (r) => {
      requests.push({ path, body: r.request().postDataJSON() });
      await r.fulfill({ json: { message: 'OK' } });
    });
  await institutionStep(page);
  await facultyStep(page);
  await detailsStep(page);
  await verifiedStep(page);
  await page.getByRole('button', { name: 'Skip for now' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('status')).toContainText('Your account is ready');
  expect(requests).toEqual([
    { path: 'resend-verification', body: { email: details.email } },
    { path: 'verify-email', body: { email: details.email, code: '123456' } },
    {
      path: 'register',
      body: {
        institution_id: institution.id,
        faculty: 'Sciences',
        department: 'Computer Science',
        ...details,
      },
    },
  ]);
  expect(
    await page.evaluate(() => Object.values(localStorage).join(' ')),
  ).not.toContain(details.password);
  await page.goto('/register/student-id');
  await expect(page).toHaveURL(/\/register$/);
});

test('validates every signup step and keeps draft in memory across back navigation', async ({
  page,
}) => {
  await page.goto('/register');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Choose an institution');
  await page
    .getByRole('combobox', { name: 'Institution', exact: true })
    .fill('Lagos');
  await expect(
    page.getByRole('option', { name: institution.name }),
  ).toBeVisible();
  await page
    .getByRole('combobox', { name: 'Institution', exact: true })
    .press('ArrowDown');
  await page
    .getByRole('combobox', { name: 'Institution', exact: true })
    .press('Enter');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByText('Step 2 of 5')).toBeVisible();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByText('Enter your faculty.')).toBeVisible();
  await expect(page.getByText('Enter your department.')).toBeVisible();
  await facultyStep(page);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByText('Enter your display name.')).toBeVisible();
  await page
    .getByLabel('Display name', { exact: true })
    .fill(details.display_name);
  await page.getByLabel('Username', { exact: true }).fill('not a username');
  await page.getByLabel('Email', { exact: true }).fill('invalid');
  await page.getByLabel('Password', { exact: true }).fill('short');
  await page.getByLabel('Confirm password', { exact: true }).fill('different');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(
    page.getByText('Use letters, numbers and underscores only.'),
  ).toBeVisible();
  await expect(page.getByText('Enter a valid email address.')).toBeVisible();
  await expect(page.getByText('Use at least 8 characters.')).toBeVisible();
  await expect(page.getByText('Passwords do not match.')).toBeVisible();
  await detailsStep(page);
  await page.getByRole('link', { name: 'Back', exact: true }).click();
  await expect(page.getByLabel('Email', { exact: true })).toHaveValue(
    details.email,
  );
  await page.reload();
  await expect(page).toHaveURL(/\/register$/);
});

test('invalid OTP stays on verification, resend cooldown works, registration failure can retry', async ({
  page,
}) => {
  await page.clock.install();
  await institutionStep(page);
  await facultyStep(page);
  await detailsStep(page);
  await page.getByRole('button', { name: 'Verify email', exact: true }).click();
  await expect(
    page.getByText('Enter the 6-digit code from your email.'),
  ).toBeVisible();
  await page.route('**/auth/verify-email', (r) =>
    r.fulfill({ status: 400, json: { message: 'Invalid code' } }),
  );
  await page.getByLabel('Verification code', { exact: true }).fill('999999');
  await page.getByRole('button', { name: 'Verify email', exact: true }).click();
  await expect(
    page.getByText(
      'That code is invalid or expired. Try again or request a new one.',
    ),
  ).toBeVisible();
  await page.clock.fastForward(61000);
  await page.getByRole('button', { name: 'Resend code', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('A new code');
  await page.route('**/auth/verify-email', (r) =>
    r.fulfill({ json: { message: 'OK' } }),
  );
  await verifiedStep(page);
  await page.route('**/auth/register', (r) =>
    r.fulfill({ status: 409, json: { message: 'Duplicate' } }),
  );
  await page
    .getByLabel('Student ID / registration number (optional)', { exact: true })
    .fill('SCI/2026/001');
  await page
    .getByRole('button', { name: 'Create account', exact: true })
    .click();
  await expect(page.getByRole('alert')).toContainText('already in use');
  await page.route('**/auth/register', async (r) => {
    expect(r.request().postDataJSON().student_id).toBe('SCI/2026/001');
    await r.fulfill({ json: { message: 'Registered' } });
  });
  await page
    .getByRole('button', { name: 'Create account', exact: true })
    .click();
  await expect(page).toHaveURL(/\/login$/);
});

test('login validates, recovers from rejected credentials, and loads profile after cookie login', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByText('Enter a valid email address.')).toBeVisible();
  await expect(page.getByText('Enter your password.')).toBeVisible();
  await page.route('**/auth/login', (r) => r.fulfill({ status: 401 }));
  await page.getByLabel('Email', { exact: true }).fill(details.email);
  await page.getByLabel('Password', { exact: true }).fill(details.password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Unable to sign in');
  await page.route('**/auth/login', (r) =>
    r.fulfill({ json: { message: 'Signed in' } }),
  );
  await page.route('**/users/me', (r) => r.fulfill({ json: profile }));
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL('http://127.0.0.1:5173/');
  await expect(
    page.getByRole('heading', { name: 'Feed (Home)', exact: true }),
  ).toBeVisible();
});

test('forgot password validates and reset submits URL token with matching new password', async ({
  page,
}) => {
  let forgotCalls = 0;
  await page.route('**/auth/forgot-password', async (r) => {
    forgotCalls++;
    expect(r.request().postDataJSON()).toEqual({ email: details.email });
    await r.fulfill({ json: { message: 'Sent' } });
  });
  await page.goto('/forgot-password');
  await page.getByRole('button', { name: 'Send reset link' }).click();
  await expect(page.getByText('Enter a valid email address.')).toBeVisible();
  expect(forgotCalls).toBe(0);
  await page.getByLabel('Email', { exact: true }).fill(details.email);
  await page.getByRole('button', { name: 'Send reset link' }).click();
  await expect(
    page.getByRole('heading', { name: 'Check your email' }),
  ).toBeVisible();
  await page.goto('/reset-password');
  await expect(page.getByRole('alert')).toContainText('missing its token');
  let resetCalls = 0;
  await page.route('**/auth/reset-password', async (r) => {
    resetCalls++;
    expect(r.request().postDataJSON()).toEqual({
      token: 'test-reset-token',
      password: details.password,
    });
    await r.fulfill({ json: { message: 'Updated' } });
  });
  await page.goto('/reset-password?token=test-reset-token');
  await page.getByLabel('New password', { exact: true }).fill(details.password);
  await page.getByLabel('Confirm password', { exact: true }).fill('mismatch');
  await page.getByRole('button', { name: 'Reset password' }).click();
  await expect(page.getByText('Passwords do not match.')).toBeVisible();
  expect(resetCalls).toBe(0);
  await page
    .getByLabel('Confirm password', { exact: true })
    .fill(details.password);
  await page.getByRole('button', { name: 'Reset password' }).click();
  await expect(
    page.getByRole('heading', { name: 'Password updated' }),
  ).toBeVisible();
  expect(resetCalls).toBe(1);
});

test('institution search failure is recoverable without submitting invented IDs', async ({
  page,
}) => {
  await page.route('**/institutions?**', (r) => r.fulfill({ status: 503 }));
  await page.goto('/register');
  await page
    .getByRole('combobox', { name: 'Institution', exact: true })
    .fill('Lagos');
  await expect(page.getByRole('alert')).toContainText('search is unavailable');
  await page.route('**/institutions?**', (r) =>
    r.fulfill({ json: { data: [institution] } }),
  );
  await page.getByRole('button', { name: 'Retry search' }).click();
  await page.getByRole('option', { name: institution.name }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByText('Step 2 of 5')).toBeVisible();
});

for (const width of [375, 768, 1440])
  test(`Batch 1 responsive previews and accessibility ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 960 });
    await page.goto('/landing');
    await page.screenshot({
      path: `artifacts/batch1-landing-${width}.png`,
      fullPage: true,
      animations: 'disabled',
    });
    await page.getByRole('link', { name: 'Login', exact: true }).click();
    await expect(
      page.getByRole('heading', { name: 'Login', exact: true }),
    ).toBeVisible();
    await page.screenshot({
      path: `artifacts/batch1-login-${width}.png`,
      fullPage: true,
      animations: 'disabled',
    });
    await page.goto('/register');
    await page.screenshot({
      path: `artifacts/batch1-institution-${width}.png`,
      fullPage: true,
      animations: 'disabled',
    });
    await institutionStep(page);
    await page.screenshot({
      path: `artifacts/batch1-faculty-${width}.png`,
      fullPage: true,
      animations: 'disabled',
    });
    await facultyStep(page);
    await page.screenshot({
      path: `artifacts/batch1-signup-${width}.png`,
      fullPage: true,
      animations: 'disabled',
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    for (const theme of ['light', 'dark']) {
      await page.evaluate(async (t) => {
        document.documentElement.className = t;
        void document.documentElement.offsetHeight;
        await Promise.allSettled(
          document.getAnimations().map((a) => a.finished),
        );
      }, theme);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      expect(results.violations).toEqual([]);
    }
    await page.evaluate(() => {
      document.documentElement.className = 'light';
    });
    await detailsStep(page);
    await page.screenshot({
      path: `artifacts/batch1-verification-${width}.png`,
      fullPage: true,
      animations: 'disabled',
    });
    await verifiedStep(page);
    await page.screenshot({
      path: `artifacts/batch1-student-id-${width}.png`,
      fullPage: true,
      animations: 'disabled',
    });
    await page.goto('/forgot-password');
    await page.screenshot({
      path: `artifacts/batch1-forgot-password-${width}.png`,
      fullPage: true,
      animations: 'disabled',
    });
    await page.goto('/reset-password?token=preview-only');
    await page.screenshot({
      path: `artifacts/batch1-reset-password-${width}.png`,
      fullPage: true,
      animations: 'disabled',
    });
  });
