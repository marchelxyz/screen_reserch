import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

type SubmitPayload = {
  step1Data: unknown;
  step2Data: unknown;
  step3Data: unknown;
  step4Data: unknown;
};

export async function POST(
  req: NextRequest
): Promise<NextResponse<{ ok: true }>> {
  const payload = (await req.json()) as SubmitPayload;

  try {
    await prisma.screeningSubmission.create({
      data: {
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

