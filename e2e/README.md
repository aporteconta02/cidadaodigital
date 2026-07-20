# E2E Tests

Playwright suite covering:

- **`landing.spec.ts`** — cold-cache boot, slow-3G boot, CTA visibility.
- **`authenticated-routes.spec.ts`** — every protected route redirects to `/auth` when signed out.
- **`pwa.spec.ts`** — no stale service worker, installed-standalone display-mode, cache-clear reboot.

Projects (see `playwright.config.ts`):

- `desktop-chromium` — 1280×900 desktop Chrome
- `mobile-chromium` — Pixel 7
- `pwa-standalone` — Pixel 7 with SW allowed (simulates installed app)

## Run

```bash
bunx playwright install chromium   # once
bunx playwright test               # all projects
bunx playwright test --project=desktop-chromium
bunx playwright test --project=mobile-chromium
bunx playwright test --project=pwa-standalone
```

The config auto-starts `bun run dev` on port 8080 and reuses an existing server if one is running.
Set `PLAYWRIGHT_NO_SERVER=1` to skip auto-start, or `PLAYWRIGHT_BASE_URL=https://...` to target a deployed URL.
