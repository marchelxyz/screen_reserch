/**
 * Проверка токена Cloudflare Turnstile на сервере.
 * Без TURNSTILE_SECRET_KEY в production запросы с анкетой отклоняются.
 */

type SiteverifyResponse = {
  success?: boolean;
  "error-codes"?: string[];
};

export async function verifyTurnstileToken(token: string | undefined): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret || secret.trim().length === 0) {
    return process.env.NODE_ENV !== "production";
  }
  if (!token || token.length < 10) {
    return false;
  }

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    return false;
  }

  const data = (await res.json()) as SiteverifyResponse;
  return data.success === true;
}
