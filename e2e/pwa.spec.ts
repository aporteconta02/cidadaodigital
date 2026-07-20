import { test, expect } from './helpers';

/**
 * PWA / installed-app simulation. The project intentionally has NO service worker
 * (see src/routes/__root.tsx cleanup script). These tests guard that invariant
 * and confirm the app still boots when launched in standalone display-mode.
 */

test('no service worker is registered after visiting the app', async ({ page }) => {
  await page.goto('/', { waitUntil: 'load' });
  const regs = await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return 0;
    const r = await navigator.serviceWorker.getRegistrations();
    return r.length;
  });
  expect(regs).toBe(0);
});

test('boots correctly in standalone (installed PWA) display-mode', async ({ page }) => {
  await page.emulateMedia({ media: 'screen', colorScheme: 'dark' });
  // Force display-mode: standalone matchMedia to mimic installed PWA
  await page.addInitScript(() => {
    const orig = window.matchMedia.bind(window);
    window.matchMedia = ((q: string) => {
      if (q.includes('display-mode: standalone')) {
        return { matches: true, media: q, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false } as any;
      }
      return orig(q);
    }) as typeof window.matchMedia;
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).not.toBeEmpty();
  await expect(page.getByText(/Sua Cidade, Seu Bairro/i)).toBeVisible({ timeout: 15_000 });
});

test('manifest is served', async ({ request, baseURL }) => {
  const res = await request.get(`${baseURL}/manifest.webmanifest`);
  expect(res.ok()).toBeTruthy();
});

test('reopening app after clearing caches still renders', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
    localStorage.clear();
    sessionStorage.clear();
  });
  await context.clearCookies();
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText(/Sua Cidade, Seu Bairro/i)).toBeVisible({ timeout: 15_000 });
});
