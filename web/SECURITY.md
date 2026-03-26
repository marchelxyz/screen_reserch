# Защита приложения «Профиль Успеха»: соответствие требованиям

Краткая привязка мер к пунктам чек-листа безопасности.

## 1. API и валидация (Next.js backend)

| Требование | Реализация |
|------------|------------|
| Строгая схема `step1Data`…`step4Data` | `src/lib/validation/submitPayloadSchema.ts` (Zod, `.strict()`), разбор в `POST /api/submit` |
| Только `POST` для `/api/submit` | `GET` / `PUT` / `DELETE` / `PATCH` → **405** в `src/app/api/submit/route.ts` |
| Rate limiting (3 успешные отправки с IP за час) | `src/lib/api/submitRateLimit.ts` (in-memory; для нескольких инстансов — Upstash Redis) |
| Ошибки БД без утечки деталей | `catch` → `{ error: "Internal Server Error" }`, статус **500** |
| Не логировать тело анкеты | В роуте нет `console.log` с данными кандидата |

## 2. Интеграция с AI (OpenAI)

| Требование | Реализация |
|------------|------------|
| Ключ только на сервере | Использовать `process.env.OPENAI_API_KEY` без префикса `NEXT_PUBLIC_` при подключении API |
| Prompt injection | Текст системной политики: `src/lib/ai/openaiPromptPolicy.ts` (`OPENAI_SYSTEM_PROMPT_SCREENING`) |
| Санитизация полей шага 4 перед LLM | `src/lib/ai/sanitizeForAi.ts` (`sanitizeForAiInput`, до 200 символов, `\p{L}\p{N}`) |
| JSON-ответ | Константа `OPENAI_JSON_RESPONSE_FORMAT` для `response_format: { type: "json_object" }` при вызове API |

Генерация PDF и вызов OpenAI в коде пока не подключены (см. TODO в `route.ts`); утилиты и политика готовы к встраиванию.

## 3. Клиент (React / Next.js)

| Требование | Реализация |
|------------|------------|
| Запрет прямого доступа к шагам 2–4 | `src/middleware.ts` + cookie `sr_max_step` (`src/lib/screeningProgressCookie.ts`), выставление на шагах 1–4 |
| Очистка чувствительных данных | `clearSensitiveFormData()` в `useFormStore` после успешной отправки |
| Валидация перед `fetch` | `isFullScreeningPayloadComplete` + проверка Turnstile при наличии site key |
| Чувствительные экраны без утечки в статический HTML | Страницы шагов и анкеты — `'use client'` |

## 4. PDF и внешние ресурсы

| Требование | Реализация |
|------------|------------|
| XSS в PDF/HTML | `src/lib/pdf/escapeHtml.ts` — `escapeHtmlForPdf` для будущих шаблонов |
| SSRF / внешние URL в headless | При появлении Puppeteer: отключить сеть или `requestInterception` для не-локальных URL |
| Временные файлы | При появлении записи PDF на диск: `fs.unlink` в `finally` |

## 5. Инфраструктура Next.js

| Требование | Реализация |
|------------|------------|
| Security headers | `next.config.js`: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` |
| Source maps в проде | `productionBrowserSourceMaps: false` в `next.config.js` |

## Переменные окружения (рекомендуемые)

- `TURNSTILE_SECRET_KEY` — секрет Cloudflare Turnstile (сервер).
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` — публичный ключ виджета (клиент).
- `OPENAI_API_KEY` — только на сервере, без `NEXT_PUBLIC_`.

В production без `TURNSTILE_SECRET_KEY` проверка капчи на сервере отклоняет отправку (в dev без секрета проверка ослаблена для локальной разработки).
