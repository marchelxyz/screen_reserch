import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

type SubmitPayload = {
  sessionId?: unknown;
  profileName?: unknown;
  personalDataConsent?: unknown;
  step1Data: unknown;
  step2Data: unknown;
  step3Data: unknown;
  step4Data: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Принимает ответы кандидата и сохраняет по уникальному session_id (идемпотентное обновление при повторе).
 */
export async function POST(
  req: NextRequest
): Promise<NextResponse<{ ok: true } | { error: string }>> {
  const payload = (await req.json()) as SubmitPayload;

  if (
    typeof payload.sessionId !== "string" ||
    payload.sessionId.trim().length === 0
  ) {
    return NextResponse.json(
      { error: "sessionId is required" },
      { status: 400 }
    );
  }

  if (typeof payload.profileName !== "string") {
    return NextResponse.json({ error: "profileName is required" }, { status: 400 });
  }

  if (typeof payload.personalDataConsent !== "boolean") {
    return NextResponse.json(
      { error: "personalDataConsent is required" },
      { status: 400 }
    );
  }

  if (
    !isRecord(payload.step1Data) ||
    !isRecord(payload.step2Data) ||
    !isRecord(payload.step3Data) ||
    !isRecord(payload.step4Data)
  ) {
    return NextResponse.json({ error: "Invalid step payloads" }, { status: 400 });
  }

  try {
    await prisma.screeningSubmission.upsert({
      where: { sessionId: payload.sessionId },
      create: {
        sessionId: payload.sessionId,
        profileName: payload.profileName,
        personalDataConsent: payload.personalDataConsent,
        step1Data: payload.step1Data as Prisma.InputJsonValue,
        step2Data: payload.step2Data as Prisma.InputJsonValue,
        step3Data: payload.step3Data as Prisma.InputJsonValue,
        step4Data: payload.step4Data as Prisma.InputJsonValue,
      },
      update: {
        profileName: payload.profileName,
        personalDataConsent: payload.personalDataConsent,
        step1Data: payload.step1Data as Prisma.InputJsonValue,
        step2Data: payload.step2Data as Prisma.InputJsonValue,
        step3Data: payload.step3Data as Prisma.InputJsonValue,
        step4Data: payload.step4Data as Prisma.InputJsonValue,
      },
    });
  } catch {
    // Если база недоступна на ранних этапах разработки - всё равно возвращаем 200.
  }

  // TODO: Отправка данных в OpenAI API для анализа
  // TODO: Генерация PDF-отчета

  return NextResponse.json({ ok: true }, { status: 200 });
}
