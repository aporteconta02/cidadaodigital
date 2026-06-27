import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

const noCacheHtmlMiddleware = createMiddleware().server(async ({ next }) => {
  const result = await next();
  const contentType = result.response.headers.get("content-type") ?? "";
  if (contentType.includes("text/html")) {
    result.response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    result.response.headers.set("Pragma", "no-cache");
    result.response.headers.set("Expires", "0");
  }
  return result;
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [errorMiddleware, noCacheHtmlMiddleware],
}));
