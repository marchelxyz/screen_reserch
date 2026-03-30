import nodemailer from "nodemailer";

import { screeningServerLog } from "@/lib/logging/screeningServerLog";
import { escapeHtmlForPdf } from "@/lib/pdf/escapeHtml";

export type ScreeningReportEmailPayload = {
  sessionId: string;
  /** Для логов, без ПДн. */
  sessionRef: string;
  profileName: string;
  rawScore: number;
  maxScore: number;
  estimatedIq: number;
  iqNormNote: string;
  conclusionText: string | null;
};

/**
 * Парсит список получателей из переменной окружения (через запятую).
 */
export function parseRecipientEmailsFromEnv(): string[] {
  const raw = process.env.REPORT_RECIPIENT_EMAILS?.trim();
  if (!raw) {
    return [];
  }
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function isSmtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST?.trim() && process.env.SMTP_USER?.trim());
}

/**
 * Отправляет письмо с результатами КОТ и заключением. Возвращает true при успехе.
 */
export async function sendScreeningReportEmail(
  payload: ScreeningReportEmailPayload
): Promise<boolean> {
  const recipients = parseRecipientEmailsFromEnv();
  if (recipients.length === 0) {
    screeningServerLog("email", "skipped_no_recipients", { sessionRef: payload.sessionRef });
    return false;
  }
  if (!isSmtpConfigured()) {
    screeningServerLog("email", "skipped_no_smtp", { sessionRef: payload.sessionRef });
    return false;
  }

  const from = process.env.EMAIL_FROM?.trim() || process.env.SMTP_USER?.trim();
  if (!from) {
    screeningServerLog("email", "skipped_no_from", { sessionRef: payload.sessionRef });
    return false;
  }

  const port = Number(process.env.SMTP_PORT || "587");
  const secure =
    process.env.SMTP_SECURE === "true" || process.env.SMTP_SECURE === "1";

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  screeningServerLog("email", "send_start", {
    sessionRef: payload.sessionRef,
    recipientCount: recipients.length,
    port,
    secure,
  });

  const safeName = escapeHtmlForPdf(payload.profileName);
  const safeSession = escapeHtmlForPdf(payload.sessionId);
  const conclusionBlock =
    payload.conclusionText !== null
      ? `<pre style="white-space:pre-wrap;font-family:inherit;">${escapeHtmlForPdf(
          payload.conclusionText
        )}</pre>`
      : "<p>Заключение не сгенерировано (нет OPENAI_API_KEY или ошибка модели).</p>";

  const html = `
    <h1>Новая анкета «Профиль Успеха»</h1>
    <p><strong>Сессия:</strong> ${safeSession}</p>
    <p><strong>Профиль:</strong> ${safeName}</p>
    <p><strong>Сырой балл КОТ:</strong> ${String(payload.rawScore)} / ${String(
      payload.maxScore
    )}</p>
    <p><strong>Ориентировочный IQ:</strong> ${String(payload.estimatedIq)}</p>
    <p><em>${escapeHtmlForPdf(payload.iqNormNote)}</em></p>
    <h2>Заключение</h2>
    ${conclusionBlock}
  `;

  const textLines = [
    `Сессия: ${payload.sessionId}`,
    `Профиль: ${payload.profileName}`,
    `Сырой балл КОТ: ${String(payload.rawScore)} / ${String(payload.maxScore)}`,
    `Ориентировочный IQ: ${String(payload.estimatedIq)}`,
    payload.iqNormNote,
    "",
    "Заключение:",
    payload.conclusionText ?? "(не сгенерировано)",
  ];

  const sendStarted = Date.now();
  try {
    await transporter.sendMail({
      from,
      to: recipients,
      subject: `Профиль Успеха: анкета (${payload.profileName})`,
      text: textLines.join("\n"),
      html,
    });
  } catch (err) {
    screeningServerLog("email", "send_failed", {
      sessionRef: payload.sessionRef,
      durationMs: Date.now() - sendStarted,
      errorName: err instanceof Error ? err.name : "unknown",
    });
    throw err;
  }

  screeningServerLog("email", "send_ok", {
    sessionRef: payload.sessionRef,
    durationMs: Date.now() - sendStarted,
  });

  return true;
}
