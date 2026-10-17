import { test, expect, type Page } from '@playwright/test';
async function session(page: Page, role = 'student') {
  await page.route('**/auth/refresh', (route) =>
    route.fulfill({
      json: {
        user: {
          id: '1',
          username: 'alex',
          display_name: 'Alex Morgan',
          email: 'alex@example.com',
          is_verified: true,
          student_verification_status: 'verified',
          role,
        },
      },
    }),
  );
}
test('anonymous users are redirected and public pages remain accessible', async ({
  page,
}) => {
  await page.route('**/auth/refresh', (r) => r.fulfill({ status: 401 }));
  await page.goto('/communities/123/files');
  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole('heading', { name: 'Login', exact: true }),
  ).toBeVisible();
  for (const path of [
    '/register',
    '/register/institution',
    '/register/faculty',
    '/register/details',
    '/register/verify',
    '/forgot-password',
    '/landing',
    '/about',
    '/help',
    '/privacy',
    '/terms',
    '/404',
    '/error',
  ]) {
    await page.goto(path);
    await expect(page.locator('main h1')).toBeVisible();
  }
  await page.goto('/unknown');
  await expect(page).toHaveURL(/\/404$/);
});
test('all protected routes load, including static routes beside dynamic routes', async ({
  page,
}) => {
  await session(page);
  for (const path of [
    '/',
    '/explore',
    '/notifications',
    '/profile',
    '/profile/alex',
    '/communities',
    '/communities/1',
    '/communities/1/files',
    '/communities/1/announcements',
    '/watch',
    '/watch/reels',
    '/watch/playlists',
    '/marketplace',
    '/marketplace/1',
    '/marketplace/shop/1',
    '/marketplace/create',
    '/events',
    '/events/1',
    '/events/create',
    '/tutorials',
    '/tutorials/1',
    '/resources',
    '/messages',
    '/messages/1',
    '/settings',
    '/settings/profile',
    '/settings/privacy',
    '/settings/notifications',
    '/settings/appearance',
    '/settings/help',
  ]) {
    await page.goto(path);
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page).toHaveURL(new URL(path, 'http://127.0.0.1:5173').href);
  }
  await page.goto('/login');
  await expect(page).toHaveURL('http://127.0.0.1:5173/');
  await page.goto('/register');
  await expect(page).toHaveURL('http://127.0.0.1:5173/');
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login$/);
});
test('admin routes require an admin session', async ({ page }) => {
  await session(page, 'admin');
  for (const path of [
    '/admin',
    '/admin/users',
    '/admin/verification',
    '/admin/communities',
    '/admin/reports',
    '/admin/institutions',
    '/admin/announcements',
    '/admin/system',
  ]) {
    await page.goto(path);
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page).toHaveURL(new RegExp(path + '$'));
  }
});
for (const width of [375, 768, 1440])
  test(`responsive shell ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await session(page);
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Feed (Home)', exact: true }),
    ).toBeVisible();
    await expect(
      page
        .getByRole('navigation', { name: 'Main navigation' })
        .getByRole('link'),
    ).toHaveCount(width < 768 ? 5 : 11);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `artifacts/${width === 375 ? 'mobile' : width === 768 ? 'tablet' : 'desktop'}-${width}.png`,
      fullPage: true,
    });
    await page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'Communities', exact: true })
      .click();
    await expect(page).toHaveURL(/\/communities$/);
  });
test('theme defaults to light, persists dark, and follows system', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await session(page);
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass('light');
  await page.evaluate(() => localStorage.setItem('conxee-theme', 'dark'));
  await page.reload();
  await expect(page.locator('html')).toHaveClass('dark');
  await page.screenshot({
    path: 'artifacts/desktop-dark-1440.png',
    fullPage: true,
  });
  await page.evaluate(() => localStorage.setItem('conxee-theme', 'system'));
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.reload();
  await expect(page.locator('html')).toHaveClass('dark');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveClass('light');
});

test('light and dark shells pass automated WCAG AA checks', async ({
  page,
}) => {
  const { default: AxeBuilder } = await import('@axe-core/playwright');
  await session(page);
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ['light', 'dark']) {
      await page.goto('/');
      await page.evaluate(
        (t) => localStorage.setItem('conxee-theme', t),
        theme,
      );
      await page.reload();
      await expect(
        page.getByRole('heading', { name: 'Feed (Home)', exact: true }),
      ).toBeVisible();
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      expect(results.violations).toEqual([]);
    }
  }
});
