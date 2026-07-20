import { test, expect, applySlowNetwork, clearAllClientState, expectAppShellVisible } from './helpers';

test.describe('Landing / onboarding', () => {
  test('renders instantly on a cold cache', async ({ page, context }) => {
    await clearAllClientState(page);
    const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(400);
    await expectAppShellVisible(page);
    // Onboarding copy from src/routes/index.tsx
    await expect(page.getByText(/Sua Cidade, Seu Bairro/i)).toBeVisible();
    // No hard errors in the console
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.waitForTimeout(500);
    expect(errors, errors.join('\n')).toHaveLength(0);
  });

  test('remains usable under slow 3G', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'CDP throttling requires chromium');
    await applySlowNetwork(context);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Even if session check is stalled, onboarding heading must appear
    await expect(page.getByText(/Sua Cidade, Seu Bairro/i)).toBeVisible({ timeout: 20_000 });
  });

  test('exposes the CTA to sign in', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /explorar|começar agora/i })).toBeVisible();
  });
});
