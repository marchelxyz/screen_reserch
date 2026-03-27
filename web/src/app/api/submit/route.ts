import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/api/clientIp";
import {
  isSubmitRateLimitExceeded,
  recordSuccessfulSubmit,
} from "@/lib/api/submitRateLimit";
import { verifyTurnstileToken } from "@/lib/api/verifyTurnstile";
import { buildKotConclusionContext } from "@/lib/ai/buildKotConclusionContext";
import { generateKotScreeningConclusion } from "@/lib/ai/kotConclusion";
import { sendScreeningReportEmail } from "@/lib/email/sendScreeningReportEmail";
import type { KotReportJson } from "@/lib/kot/kotReportTypes";
import {
  countKotRawScore,
  estimateKotIq,
  getKotIqNormNote,
} from "@/lib/kot/kotScore";
import { KOT_STEP_QUESTION_COUNT } from "@/lib/kot/step1Types";
import { prisma } from "@/lib/prisma";
import { isFullScreeningPayloadComplete } from "@/lib/validation/stepCompletion";
import { submitApiBodySchema } from "@/lib/validation/submitPayloadSchema";
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
 * Не логирует тело запроса и не отдаёт клиенту внутренние тексты ошибок.
 */
export async function POST(
  req: NextRequest
): Promise<NextResponse<{ ok: true } | { error: string }>> {
  let jsonBody: unknown;
  try {
    jsonBody = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = submitApiBodySchema.safeParse(jsonBody);
  if (!parsed.success) {
    return jsonError("Invalid request body", 400);
  }

  const payload = parsed.data;

  if (!payload.personalDataConsent) {
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
    return jsonError("Incomplete payload", 400);
  }

  const clientIp = getClientIp(req);

  if (isSubmitRateLimitExceeded(clientIp)) {
    return jsonError("Too Many Requests", 429);
  }

  const turnstileOk = await verifyTurnstileToken(payload.turnstileToken);
  if (!turnstileOk) {
    return jsonError("Invalid captcha", 400);
  }

  const step1 = payload.step1Data as Step1Data;
  const rawScore = countKotRawScore(step1);
  const maxScore = KOT_STEP_QUESTION_COUNT;
  const iqNormNote = getKotIqNormNote();
  const estimatedIq = estimateKotIq(rawScore, maxScore);
  const profileContext = buildKotConclusionContext(payload.profileName, payload.step4Data);

  let conclusionText: string | null = null;
  let conclusionGeneratedAt: string | null = null;
  try {
    conclusionText = await generateKotScreeningConclusion({
      rawScore,
      maxScore,
      estimatedIq,
      iqNormNote,
      profileContext,
    });
    if (conclusionText !== null) {
      conclusionGeneratedAt = new Date().toISOString();
    }
  } catch {
    conclusionText = null;
  }

  let emailSent = false;
  try {
    emailSent = await sendScreeningReportEmail({
      sessionId: payload.sessionId,
      profileName: payload.profileName,
      rawScore,
      maxScore,
      estimatedIq,
      iqNormNote,
      conclusionText,
    });
  } catch {
    emailSent = false;
  }

  const kotReport: KotReportJson = {
    version: 1,
    rawScore,
    maxScore,
    estimatedIq,
    iqNormNote,
    conclusionText,
    conclusionGeneratedAt,
    emailSent,
  };

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
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
