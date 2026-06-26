// Guarded service-worker registration. Only registers in published production builds.
// In any refused context (dev, Lovable preview, iframe, ?sw=off), unregisters existing /sw.js.

export async function registerServiceWorker() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  const host = window.location.hostname;
  const inIframe = window.self !== window.top;
  const swOff = new URLSearchParams(window.location.search).has("sw") &&
    new URLSearchParams(window.location.search).get("sw") === "off";

  const isPreview =
    host.startsWith("id-preview--") ||
    host.startsWith("preview--") ||
    host === "lovableproject.com" ||
    host.endsWith(".lovableproject.com") ||
    host === "lovableproject-dev.com" ||
    host.endsWith(".lovableproject-dev.com") ||
    host === "beta.lovable.dev" ||
    host.endsWith(".beta.lovable.dev");

  const refuse = !import.meta.env.PROD || inIframe || isPreview || swOff;

  if (refuse) {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        regs
          .filter((r) => {
            const url = r.active?.scriptURL || r.installing?.scriptURL || r.waiting?.scriptURL || "";
            return url.endsWith("/sw.js");
          })
          .map((r) => r.unregister()),
      );
    } catch {
      // ignore
    }
    return;
  }

  try {
    await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  } catch (err) {
    console.error("SW registration failed", err);
  }
}
