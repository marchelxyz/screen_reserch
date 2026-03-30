/**
 * Проверка токена Cloudflare Turnstile на сервере.
 * Без TURNSTILE_SECRET_KEY в production запросы с анкетой отклоняются.
 */

import { screeningServerLog } from "@/lib/logging/screeningServerLog";

type SiteverifyResponse = {
  success?: boolean;
  "error-codes"?: string[];
};

export async function verifyTurnstileToken(
  token: string | undefined,
  sessionRef?: string
): Promise<boolean> {
  const ref = sessionRef ?? "unknown";
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret || secret.trim().length === 0) {
    screeningServerLog("turnstile", "secret_missing", {
      sessionRef: ref,
      devBypass: process.env.NODE_ENV !== "production",
    });
    return process.env.NODE_ENV !== "production";
  }
  if (!token || token.length < 10) {
    screeningServerLog("turnstile", "token_missing_or_short", { sessionRef: ref });
    return false;
  }

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);

  const verifyStarted = Date.now();
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    screeningServerLog("turnstile", "siteverify_http_error", {
      sessionRef: ref,
      status: res.status,
      durationMs: Date.now() - verifyStarted,
    });
    return false;
  }

  const data = (await res.json()) as SiteverifyResponse;
  const ok = data.success === true;
  screeningServerLog("turnstile", "siteverify_result", {
    sessionRef: ref,
    ok,
    durationMs: Date.now() - verifyStarted,
    errorCodes: data["error-codes"]?.join(",") ?? "",
  });
  return ok;
}
