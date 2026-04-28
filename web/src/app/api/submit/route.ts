import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/api/clientIp";
import {
  isSubmitRateLimitExceeded,
  recordSuccessfulSubmit,
} from "@/lib/api/submitRateLimit";
import { buildScreeningConclusionContext } from "@/lib/ai/buildScreeningConclusionContext";
import { generateScreeningConclusion } from "@/lib/ai/kotConclusion";
import {
  sendScreeningReportEmail,
  smtpErrorLogFields,
} from "@/lib/email/sendScreeningReportEmail";
import type { KotReportJson } from "@/lib/kot/kotReportTypes";
import { countKotRawScore, getKotIpLevelLabel, getKotIpNormNote } from "@/lib/kot/kotScore";
import { KOT_STEP_QUESTION_COUNT } from "@/lib/kot/step1Types";
import { maskClientIp } from "@/lib/logging/maskClientIp";
import { screeningServerLog, zodIssuesForLog } from "@/lib/logging/screeningServerLog";
import { shortSessionRef } from "@/lib/logging/screeningSessionRef";
import { prisma } from "@/lib/prisma";
import { isFullScreeningPayloadComplete } from "@/lib/validation/stepCompletion";
import { submitApiBodySchema } from "@/lib/validation/submitPayloadSchema";
import { generateScreeningPdfBuffer } from "@/lib/report/generateScreeningPdf";
import type { Step1Data } from "@/store/useFormStore";
import { Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

function jsonError(message: string, status: number): NextResponse<{ error: string }> {
  return NextResponse.json({ error: message }, { status });
}

function methodNotAllowed(): NextResponse<{ error: string }> {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}

export function GET(): NextResponse<{ error: string }> {
  return methodNotAllowed();
}

export function PUT(): NextResponse<{ error: string }> {
  return methodNotAllowed();
}

export function DELETE(): NextResponse<{ error: string }> {
  return methodNotAllowed();
}

export function PATCH(): NextResponse<{ error: string }> {
  return methodNotAllowed();
}

/**
 * Принимает ответы кандидата и сохраняет по session_id (upsert).
 * Логирует этапы без тела анкеты и без персональных данных (см. SECURITY.md).
 */
export async function POST(
  req: NextRequest
): Promise<NextResponse<{ ok: true } | { error: string }>> {
  const startedAt = Date.now();

  let jsonBody: unknown;
  try {
    jsonBody = await req.json();
  } catch {
    screeningServerLog("submit", "json_parse_failed", { sessionRef: "unknown" });
    return jsonError("Invalid JSON", 400);
  }

  const parsed = submitApiBodySchema.safeParse(jsonBody);
  if (!parsed.success) {
    const sessionHint =
      typeof jsonBody === "object" &&
      jsonBody !== null &&
      "sessionId" in jsonBody &&
      typeof (jsonBody as { sessionId?: unknown }).sessionId === "string"
        ? shortSessionRef((jsonBody as { sessionId: string }).sessionId)
        : "unknown";
    screeningServerLog("submit", "validation_failed", {
      sessionRef: sessionHint,
      issues: JSON.stringify(zodIssuesForLog(parsed.error)),
    });
    return jsonError("Invalid request body", 400);
  }

  const payload = parsed.data;
  const sessionRef = shortSessionRef(payload.sessionId);

  screeningServerLog("submit", "request_accepted", {
    sessionRef,
  });

  if (!payload.personalDataConsent) {
    screeningServerLog("submit", "consent_false", { sessionRef });
    return jsonError("Invalid request body", 400);
  }

  if (
    !isFullScreeningPayloadComplete(
      payload.step1Data as Step1Data,
      payload.step2Data,
      payload.step3Data,
      payload.step4Data
    )
  ) {
    screeningServerLog("submit", "payload_incomplete", { sessionRef });
    return jsonError("Incomplete payload", 400);
  }

  const clientIp = getClientIp(req);
  const ipMasked = maskClientIp(clientIp);

  if (isSubmitRateLimitExceeded(clientIp)) {
    screeningServerLog("submit", "rate_limited", { sessionRef, ipMasked });
    return jsonError("Too Many Requests", 429);
  }

  const step1 = payload.step1Data as Step1Data;
  const rawScore = countKotRawScore(step1);
  const maxScore = KOT_STEP_QUESTION_COUNT;
  const kotIpNormNote = getKotIpNormNote();
  const kotIpLevelLabel = getKotIpLevelLabel(rawScore);
  const screeningContext = buildScreeningConclusionContext({
    rawScore,
    maxScore,
    kotIpLevelLabel,
    kotIpNormNote,
    profileName: payload.profileName,
    step2: payload.step2Data,
    step3: payload.step3Data,
    step4: payload.step4Data,
  });

  screeningServerLog("submit", "kot_scored", {
    sessionRef,
    rawScore,
    maxScore,
    kotIpLevelLabel,
  });

  let conclusionText: string | null = null;
  let hiringRecommendations: string | null = null;
  let conclusionGeneratedAt: string | null = null;
  const aiStarted = Date.now();
  try {
    const aiResult = await generateScreeningConclusion({
      screeningContext,
      sessionRef,
    });
    conclusionText = aiResult.conclusion;
    hiringRecommendations = aiResult.hiringRecommendations;
    if (conclusionText !== null) {
      conclusionGeneratedAt = new Date().toISOString();
    }
    screeningServerLog("submit", "ai_conclusion_finished", {
      sessionRef,
      ok: conclusionText !== null,
      conclusionChars: conclusionText?.length ?? 0,
      hiringChars: hiringRecommendations?.length ?? 0,
      durationMs: Date.now() - aiStarted,
    });
  } catch (err) {
    screeningServerLog("submit", "ai_conclusion_exception", {
      sessionRef,
      durationMs: Date.now() - aiStarted,
      errorName: err instanceof Error ? err.name : "unknown",
    });
    conclusionText = null;
    hiringRecommendations = null;
  }

  let reportPdfBuffer: Buffer | null = null;
  const pdfStarted = Date.now();
  try {
    reportPdfBuffer = await generateScreeningPdfBuffer({
      profileName: payload.profileName,
      sessionId: payload.sessionId,
      rawScore,
      maxScore,
      kotIp: rawScore,
      kotIpLevelLabel,
      kotIpNormNote,
      step1: step1,
      step2: payload.step2Data,
      step3: payload.step3Data,
      step4: payload.step4Data,
      conclusionText,
      hiringRecommendations,
    });
    screeningServerLog("submit", "pdf_ok", {
      sessionRef,
      bytes: reportPdfBuffer.length,
      durationMs: Date.now() - pdfStarted,
    });
  } catch (err) {
    screeningServerLog("submit", "pdf_failed", {
      sessionRef,
      durationMs: Date.now() - pdfStarted,
      errorName: err instanceof Error ? err.name : "unknown",
    });
    reportPdfBuffer = null;
  }

  const emailStarted = Date.now();
  let emailSent = false;
  try {
    emailSent = await sendScreeningReportEmail({
      sessionId: payload.sessionId,
      profileName: payload.profileName,
      rawScore,
      maxScore,
      kotIp: rawScore,
      kotIpLevelLabel,
      kotIpNormNote,
      conclusionText,
      hiringRecommendations,
      reportPdfBuffer,
      sessionRef,
    });
    screeningServerLog("submit", "email_finished", {
      sessionRef,
      sent: emailSent,
      durationMs: Date.now() - emailStarted,
    });
  } catch (err) {
    const smtpFields = smtpErrorLogFields(err);
    screeningServerLog("submit", "email_exception", {
      sessionRef,
      durationMs: Date.now() - emailStarted,
      errorName: smtpFields.errorName,
      errorMessage: smtpFields.errorMessage,
      responseCode: smtpFields.responseCode ?? undefined,
    });
    emailSent = false;
  }

  const kotReport: KotReportJson = {
    version: 4,
    rawScore,
    maxScore,
    kotIp: rawScore,
    kotIpLevelLabel,
    kotIpNormNote,
    conclusionText,
    hiringRecommendations,
    conclusionGeneratedAt,
    emailSent,
    pdfAttached: reportPdfBuffer !== null,
  };

  const dbStarted = Date.now();
  try {
    const consentAt = new Date(payload.consentRecordedAt);
    await prisma.screeningSubmission.upsert({
      where: { sessionId: payload.sessionId },
      create: {
        sessionId: payload.sessionId,
        profileName: payload.profileName,
        personalDataConsent: payload.personalDataConsent,
        consentRecordedAt: consentAt,
        step1Data: payload.step1Data as Prisma.InputJsonValue,
        step2Data: payload.step2Data as Prisma.InputJsonValue,
        step3Data: payload.step3Data as Prisma.InputJsonValue,
        step4Data: payload.step4Data as Prisma.InputJsonValue,
        kotReport: kotReport as unknown as Prisma.InputJsonValue,
      },
      update: {
        profileName: payload.profileName,
        personalDataConsent: payload.personalDataConsent,
        consentRecordedAt: consentAt,
        step1Data: payload.step1Data as Prisma.InputJsonValue,
        step2Data: payload.step2Data as Prisma.InputJsonValue,
        step3Data: payload.step3Data as Prisma.InputJsonValue,
        step4Data: payload.step4Data as Prisma.InputJsonValue,
        kotReport: kotReport as unknown as Prisma.InputJsonValue,
      },
    });
    recordSuccessfulSubmit(clientIp);
    screeningServerLog("submit", "db_upsert_ok", {
      sessionRef,
      durationMs: Date.now() - dbStarted,
      ipMasked,
    });
  } catch (err) {
    screeningServerLog("submit", "db_upsert_failed", {
      sessionRef,
      durationMs: Date.now() - dbStarted,
      errorName: err instanceof Error ? err.name : "unknown",
    });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }

  screeningServerLog("submit", "success", {
    sessionRef,
    totalDurationMs: Date.now() - startedAt,
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
