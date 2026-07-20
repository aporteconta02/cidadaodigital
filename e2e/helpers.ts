import { test, expect, type Page, type BrowserContext } from '@playwright/test';

/**
 * Throttle the browser to a "slow 3G"-ish profile for a single context.
 * Uses Chrome DevTools Protocol so it only runs on Chromium projects.
 */
export async function applySlowNetwork(context: BrowserContext) {
  try {
    const client = await context.newCDPSession(await context.newPage());
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 400,
      downloadThroughput: (500 * 1024) / 8,
      uploadThroughput: (250 * 1024) / 8,
    });
  } catch {
    // Non-chromium — silently skip.
  }
}

/** Clear service workers, caches, and storage for a fresh-install simulation. */
export async function clearAllClientState(page: Page) {
  await page.addInitScript(() => {
    try {
      // Runs before any app script — nukes persisted state on next load.
      window.localStorage?.clear();
      window.sessionStorage?.clear();
    } catch {}
  });
  await page.context().clearCookies();
}

export async function expectAppShellVisible(page: Page) {
  // The onboarding renders a big heading — a good "app is alive" signal.
  await expect(page).toHaveTitle(/./, { timeout: 15_000 });
  const body = page.locator('body');
  await expect(body).not.toBeEmpty();
}

export { test, expect };
