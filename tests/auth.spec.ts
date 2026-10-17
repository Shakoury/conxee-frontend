import { test, expect, type Page } from '@playwright/test';
const institution = {
  id: '3ab566dc-b460-548a-8c04-888bef7dbdd2',
  name: 'University of Lagos, Lagos',
  type: 'university',
};
const faculty = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Faculty of Science',
  programmes: [
    { id: '22222222-2222-4222-8222-222222222222', name: 'Computer Science' },
  ],
};
const password = 'Valid-test-password-123';
const profile = {
  id: 'user-1',
  username: 'test.student',
  display_name: 'Test Student',
  role: 'student',
};
test.beforeEach(async ({ page }) => {
  await page.route('**/api/**', async (r) => {
    const path = new URL(r.request().url()).pathname;
    if (path === '/api/auth/refresh' || path === '/api/users/me')
      return r.fulfill({ status: 401, json: { code: 'SESSION_EXPIRED' } });
    if (path === '/api/institutions')
      return r.fulfill({ json: { data: [institution], next_after: null } });
    if (path === '/api/academics')
      return r.fulfill({ json: { faculties: [faculty] } });
    return r.fulfill({ status: 404, json: { code: 'NOT_AVAILABLE' } });
  });
});
async function choose(page: Page, label: string, option: string) {
  await page.getByRole('combobox', { name: label, exact: true }).click();
  await page.getByRole('option', { name: option, exact: true }).click();
}
async function step1(page: Page) {
  await page.goto('/register');
  await expect(
    page.getByRole('heading', { name: 'Choose your institution', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('combobox', { name: 'Institution', exact: true })
    .click();
  await page.getByLabel('Search institutions', { exact: true }).fill('Lagos');
  await page
    .getByRole('option', { name: /University of Lagos, Lagos/ })
    .click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Your faculty', exact: true }),
  ).toBeVisible();
}
async function academics(page: Page) {
  await choose(page, 'Faculty selection', 'Faculty of Science');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await choose(page, 'Department / programme selection', 'Computer Science');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Student ID (optional)', exact: true }),
  ).toBeVisible();
}
async function details(page: Page) {
  await page.getByLabel('Display name', { exact: true }).fill('Test Student');
  await page.getByLabel('Username', { exact: true }).fill('test.student');
  await page.getByLabel('Email', { exact: true }).fill('student@example.com');
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByLabel('Confirm password', { exact: true }).fill(password);
}
test('BUKCZ five-step signup submits academic_context before token verification', async ({
  page,
}) => {
  let submitted: any;
  await page.route('**/api/auth/register', async (r) => {
    submitted = r.request().postDataJSON();
    await r.fulfill({
      json: { email: 'student@example.com', catalogue_status: 'approved' },
    });
  });
  await step1(page);
  await academics(page);
  await page
    .getByRole('button', { name: 'Continue without ID', exact: true })
    .click();
  await details(page);
  await page
    .getByRole('button', { name: 'Create account', exact: true })
    .click();
  await expect(page).toHaveURL(/\/verify-email$/);
  expect(submitted).toEqual({
    account_type: 'student',
    display_name: 'Test Student',
    username: 'test.student',
    email: 'student@example.com',
    password,
    academic_context: {
      institution_id: institution.id,
      faculty_id: faculty.id,
      programme_id: faculty.programmes[0].id,
    },
  });
  await expect(
    page.getByText('student@example.com', { exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => Object.values(localStorage).join(' ')),
  ).not.toContain(password);
  await page.route('**/api/auth/resend-verification', (r) =>
    r.fulfill({
      json: {
        message: 'If your account needs verification, a link will be sent',
      },
    }),
  );
  await page.getByRole('button', { name: 'Resend verification email' }).click();
  await expect(page.getByRole('status')).toContainText('a link will be sent');
});
test('wizard preserves entered values going back and rejects mismatched and oversized passwords', async ({
  page,
}) => {
  let requests = 0;
  await page.route('**/api/auth/register', (r) => {
    requests++;
    return r.fulfill({ json: { email: 'student@example.com' } });
  });
  await step1(page);
  await academics(page);
  await page.getByLabel('Student ID', { exact: true }).fill('SCI/2026/001');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await details(page);
  await page
    .getByLabel('Confirm password', { exact: true })
    .fill('different-test-password');
  await page
    .getByRole('button', { name: 'Create account', exact: true })
    .click();
  await expect(page.getByRole('alert')).toContainText('Passwords do not match');
  expect(requests).toBe(0);
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.getByLabel('Student ID', { exact: true })).toHaveValue(
    'SCI/2026/001',
  );
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByLabel('Email', { exact: true })).toHaveValue(
    'student@example.com',
  );
  await page.getByLabel('Password', { exact: true }).fill('é'.repeat(40));
  await page
    .getByLabel('Confirm password', { exact: true })
    .fill('é'.repeat(40));
  await page
    .getByRole('button', { name: 'Create account', exact: true })
    .click();
  await expect(page.getByRole('alert')).toContainText('72 UTF-8 bytes');
  expect(requests).toBe(0);
});
test('missing academic names and aspirant signup use the source review contract', async ({
  page,
}) => {
  let submitted: any;
  await page.route('**/api/auth/register', async (r) => {
    submitted = r.request().postDataJSON();
    await r.fulfill({
      json: {
        email: 'student@example.com',
        catalogue_status: 'pending_review',
      },
    });
  });
  await page.goto('/register');
  await choose(page, 'Account type selection', 'Aspirant — seeking admission');
  await page.getByRole('button', { name: 'My institution is missing' }).click();
  await page
    .getByLabel('Institution name', { exact: true })
    .fill('New Nigerian University');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page
    .getByLabel('Missing faculty / school name', { exact: true })
    .fill('Faculty of New Studies');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page
    .getByLabel('Missing department / programme name', { exact: true })
    .fill('Future Computing');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(
    page.getByText('Aspirants do not need a student ID.', { exact: false }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Continue without ID', exact: true })
    .click();
  await details(page);
  await page
    .getByRole('button', { name: 'Create account', exact: true })
    .click();
  await expect(page).toHaveURL(/verify-email$/);
  expect(submitted.account_type).toBe('aspirant');
  expect(submitted).not.toHaveProperty('student_id');
  expect(submitted.academic_context).toEqual({
    institution_name: 'New Nigerian University',
    institution_type: 'university',
    faculty_name: 'Faculty of New Studies',
    programme_name: 'Future Computing',
  });
  await expect(
    page.getByText(
      'Your missing academic details have been submitted for catalogue review.',
      { exact: false },
    ),
  ).toBeVisible();
});
test('login uses the backend success message and fetches the real profile', async ({
  page,
}) => {
  await page.route('**/api/auth/login', (r) =>
    r.fulfill({ status: 401, json: { code: 'SIGN_IN_FAILED' } }),
  );
  await page.goto('/login');
  await page.getByLabel('Email', { exact: true }).fill('student@example.com');
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText(
    'We could not sign you in',
  );
  await page.route('**/api/auth/login', (r) =>
    r.fulfill({ json: { message: 'Signed in' } }),
  );
  await page.route('**/api/users/me', (r) => r.fulfill({ json: profile }));
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL('http://127.0.0.1:5173/');
  await expect(
    page.getByRole('heading', { name: 'Feed (Home)' }),
  ).toBeVisible();
});
test('unverified login redirects to verification and link verification sends only token', async ({
  page,
}) => {
  await page.route('**/api/auth/login', (r) =>
    r.fulfill({ status: 403, json: { code: 'EMAIL_VERIFICATION_REQUIRED' } }),
  );
  await page.goto('/login');
  await page.getByLabel('Email', { exact: true }).fill('student@example.com');
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL(/verify-email$/);
  const token = 'a'.repeat(43);
  await page.route('**/api/auth/verification-details', (r) =>
    r.fulfill({ json: { email: 'student@example.com' } }),
  );
  await page.route('**/api/auth/verify-email', async (r) => {
    expect(r.request().postDataJSON()).toEqual({ token });
    await r.fulfill({ json: { message: 'Email verified' } });
  });
  await page.goto('/verify-email?token=' + token);
  await page.getByRole('button', { name: 'Verify email', exact: true }).click();
  await expect(page).toHaveURL(/\/auth$/);
  await expect(
    page.getByText('Email verified. You can now log in.', { exact: true }),
  ).toBeVisible();
});
test('source password recovery accepts backend confirmations and the reset link token', async ({
  page,
}) => {
  await page.route('**/api/auth/forgot-password', (r) =>
    r.fulfill({ json: { message: 'Check your email for a reset link' } }),
  );
  await page.goto('/forgot-password');
  await page
    .getByLabel('Email address', { exact: true })
    .fill('student@example.com');
  await page.getByRole('button', { name: 'Send reset link' }).click();
  await expect(page.getByRole('status')).toHaveText(
    'Check your email for a reset link',
  );
  await page.goto('/reset-password');
  await expect(page.getByRole('alert')).toContainText('Open the reset link');
  const token = 'b'.repeat(43);
  await page.route('**/api/auth/reset-password', async (r) => {
    expect(r.request().postDataJSON()).toEqual({ token, password });
    await r.fulfill({ json: { message: 'Password reset. Sign in again' } });
  });
  await page.goto('/reset-password?token=' + token);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByLabel('Confirm new password', { exact: true }).fill(password);
  await page
    .getByRole('button', { name: 'Reset password', exact: true })
    .click();
  await expect(page).toHaveURL(/auth$/);
  await expect(page.getByRole('status')).toContainText('Password updated');
});
for (const width of [375, 768, 1440])
  test(`scoped BUKCZ auth previews ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 960 });
    await page.goto('/login');
    await expect(
      page.getByRole('heading', { name: 'Welcome to CONXEE.' }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `artifacts/bukcz-auth-login-${width}.png`,
      fullPage: true,
      animations: 'disabled',
    });
    await step1(page);
    await page.screenshot({
      path: `artifacts/bukcz-auth-signup-${width}.png`,
      fullPage: true,
      animations: 'disabled',
    });
    await academics(page);
    await page
      .getByRole('button', { name: 'Continue without ID', exact: true })
      .click();
    await page.screenshot({
      path: `artifacts/bukcz-auth-details-${width}.png`,
      fullPage: true,
      animations: 'disabled',
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
