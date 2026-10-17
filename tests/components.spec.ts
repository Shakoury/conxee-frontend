import { test, expect } from '@playwright/test';
import { readdirSync } from 'node:fs';
import path from 'node:path';
test.beforeEach(async ({ page }) => {
  await page.route('**/auth/refresh', (r) => r.fulfill({ status: 401 }));
});
test('dialogs trap focus, close with Escape, select and upload work, and toasts announce', async ({
  page,
}) => {
  await page.goto('/tests/harness.html');
  await page.getByRole('button', { name: 'Open modal', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Tab');
  expect(
    await page
      .getByRole('dialog')
      .evaluate((el) => el.contains(document.activeElement)),
  ).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(
    page.getByRole('button', { name: 'Open modal', exact: true }),
  ).toBeFocused();
  await page.getByRole('button', { name: 'Open sheet' }).click();
  await expect(
    page.getByRole('dialog', { name: 'Example sheet' }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('combobox', { name: 'Institution' }).click();
  await page.getByRole('option', { name: 'University two' }).click();
  await expect(page.getByRole('combobox')).toContainText('University two');
  await page.getByLabel('Upload files', { exact: true }).setInputFiles({
    name: 'notes.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('Notes'),
  });
  await expect(page.getByTestId('files')).toHaveText('notes.txt');
  await page.getByRole('button', { name: 'Show toast' }).click();
  await expect(
    page.getByText('Saved successfully', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Confirm deletion' }).click();
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(page.getByText('Deleted', { exact: true })).toBeVisible();
});
test('login and logout update context using cookies, theme choice persists', async ({
  page,
}) => {
  await page.route('**/auth/login', async (r) => {
    expect(r.request().method()).toBe('POST');
    expect(r.request().postDataJSON()).toEqual({
      email: 'alex@example.com',
      password: 'test-only',
    });
    await r.fulfill({
      json: {
        user: {
          id: '1',
          username: 'alex',
          display_name: 'Alex Morgan',
          email: 'alex@example.com',
          is_verified: true,
          student_verification_status: 'verified',
          role: 'student',
        },
      },
    });
  });
  await page.route('**/auth/logout', (r) => r.fulfill({ status: 204 }));
  await page.goto('/tests/harness.html');
  await expect(page.getByTestId('auth')).toHaveText('anonymous');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page.getByTestId('auth')).toHaveText('alex');
  await page.getByRole('button', { name: 'Log out', exact: true }).click();
  await expect(page.getByTestId('auth')).toHaveText('anonymous');
  expect(await page.evaluate(() => Object.keys(localStorage))).not.toContain(
    'token',
  );
  await page.getByRole('button', { name: 'Dark theme' }).click();
  await expect(page.locator('html')).toHaveClass('dark');
  await page.reload();
  await expect(page.locator('html')).toHaveClass('dark');
});
test('capture actual repository folder structure', async ({ page }) => {
  function tree(dir: string, prefix = ''): string {
    return readdirSync(dir, { withFileTypes: true })
      .filter(
        (e) =>
          ![
            '.git',
            'node_modules',
            'dist',
            'test-results',
            'artifacts',
          ].includes(e.name),
      )
      .sort(
        (a, b) =>
          Number(b.isDirectory()) - Number(a.isDirectory()) ||
          a.name.localeCompare(b.name),
      )
      .map(
        (e) =>
          prefix +
          e.name +
          (e.isDirectory()
            ? '/\n' + tree(path.join(dir, e.name), prefix + '  ')
            : ''),
      )
      .join('\n');
  }
  const text = tree(process.cwd());
  await page.setViewportSize({ width: 1000, height: 1200 });
  await page.setContent(
    '<html lang="en"><head><title>CONXEE repository structure</title></head><body style="margin:0;background:#0f172a;color:#f1f5f9;padding:40px;font:15px/1.6 monospace"><h1 style="font:700 28px system-ui">CONXEE / Repository structure</h1><pre></pre></body></html>',
  );
  await page.locator('pre').textContent();
  await page
    .locator('pre')
    .evaluate((el, value) => (el.textContent = value), text);
  await page.screenshot({
    path: 'artifacts/folder-structure.png',
    fullPage: true,
  });
});
