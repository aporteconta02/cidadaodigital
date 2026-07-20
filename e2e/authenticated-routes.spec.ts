import { test, expect, clearAllClientState } from './helpers';

/**
 * Authenticated routes must redirect unauthenticated visitors to /auth
 * (see src/routes/_authenticated.tsx beforeLoad).
 */
const PROTECTED = ['/dashboard', '/perfil', '/comercio', '/carrinho', '/transporte', '/sos'];

for (const path of PROTECTED) {
  test(`redirects ${path} to /auth when signed out`, async ({ page }) => {
    await clearAllClientState(page);
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/auth(\?|$)/, { timeout: 15_000 });
    await expect(page.locator('body')).not.toBeEmpty();
  });
}

test('auth screen renders with email field', async ({ page }) => {
  await page.goto('/auth');
  await expect(page.getByPlaceholder(/e-?mail/i).first()).toBeVisible();
});
