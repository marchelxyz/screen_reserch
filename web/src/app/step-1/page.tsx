"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { ProgressBar } from "@/components/ProgressBar";
import { QuestionCard } from "@/components/QuestionCard";
import { StepLayout } from "@/components/StepLayout";
import { TestMotivation } from "@/components/TestMotivation";
import { KotPairColumns } from "@/components/kot/KotPairColumns";
import { KotQuestionFigure } from "@/components/kot/KotQuestionFigures";
import { useScreeningStepLog } from "@/lib/logging/useScreeningStepLog";
import { KOT_OFFICIAL_QUESTIONS_ORDERED } from "@/lib/kot/kotOfficial50Questions";
import type { KotQuestionKey } from "@/lib/kot/step1Types";
import {
  questionCardSurfaceClass,
  stepNavPrimaryButtonClass,
  stepPageContentClass,
  stepQuestionTitleClass,
  stepSecondaryTextClass,
} from "@/lib/stepPageTheme";
import { TOTAL_QUESTIONS_COUNT, getAllAnsweredCount, isProfileReady } from "@/lib/progress";
import { setScreeningMaxStepCookie } from "@/lib/screeningProgressCookie";
import { getContinueButtonLabel } from "@/lib/testMotivation";
import { isStep1Complete } from "@/lib/validation/stepCompletion";
import { useFormStore } from "@/store/useFormStore";

/** Длительность выполнения КОТ по настройке интерфейса (20 минут). */
const KOT_DURATION_MS = 20 * 60 * 1000;

const KOT_INTRO_PARAGRAPHS: string[] = [
  "Краткий ориентировочный тест (КОТ, Бузин / Вандерлик): 50 заданий по учебному пособию (Пашукова и др., 1996).",
  "На выполнение теста отводится 20 минут (таймер запускается после нажатия «СТАРТ»). Отвечайте на столько пунктов, на сколько успеваете; не задерживайтесь долго на одном задании.",
  "Порядок заданий как в бланке: с 1 по 50. Задания с чертежами (17, 29, 32, 50) показаны по сканам из методички.",
];

function formatKotClock(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function Step1Page(): React.ReactElement {
  const router = useRouter();
  const profileName = useFormStore((s) => s.profileName);
  const personalDataConsent = useFormStore((s) => s.personalDataConsent);
  const consentRecordedAt = useFormStore((s) => s.consentRecordedAt);
  const sessionId = useFormStore((s) => s.sessionId);
  const kotTimerStartedAt = useFormStore((s) => s.kotTimerStartedAt);
  const startKotTimer = useFormStore((s) => s.startKotTimer);
  useScreeningStepLog("step-1", sessionId);
  const step1Data = useFormStore((s) => s.step1Data);
  const step2Data = useFormStore((s) => s.step2Data);
  const step3Data = useFormStore((s) => s.step3Data);
  const step4Data = useFormStore((s) => s.step4Data);
  const setStep1Data = useFormStore((s) => s.setStep1Data);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!kotTimerStartedAt) {
      return;
    }
    const id = window.setInterval(() => {
      setTick((n) => n + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [kotTimerStartedAt]);

  /** `tick` обновляется раз в секунду, чтобы пересчитать остаток времени. */
  void tick;
  const remainingMs = (() => {
    if (!kotTimerStartedAt) {
      return KOT_DURATION_MS;
    }
    const t0 = Date.parse(kotTimerStartedAt);
    if (Number.isNaN(t0)) {
      return KOT_DURATION_MS;
    }
    return Math.max(0, KOT_DURATION_MS - (Date.now() - t0));
  })();

  const kotStarted = kotTimerStartedAt !== null;
  const kotTimeExpired = kotStarted && remainingMs <= 0;
  const blockAnswers = !kotStarted || kotTimeExpired;

  useEffect(() => {
    if (!isProfileReady(profileName, personalDataConsent, consentRecordedAt)) {
      router.replace("/intro");
      return;
    }
    if (!sessionId) {
      router.replace("/briefing");
    }
  }, [consentRecordedAt, personalDataConsent, profileName, router, sessionId]);

  useEffect(() => {
    setScreeningMaxStepCookie(1);
  }, []);

  const complete = isStep1Complete(step1Data);
  const answeredCount = getAllAnsweredCount(step1Data, step2Data, step3Data, step4Data);
  const continueLabel = getContinueButtonLabel(answeredCount);

  function setAnswer(key: KotQuestionKey, value: string): void {
    setStep1Data({ ...step1Data, [key]: value });
  }

  return (
    <StepLayout>
      <div className={stepPageContentClass}>
        <div className="mb-2">
          <ProgressBar answeredQuestions={answeredCount} totalQuestions={TOTAL_QUESTIONS_COUNT} />
          <TestMotivation profileName={profileName} answeredCount={answeredCount} />
        </div>

        {kotStarted ? (
          <div
            className="sticky top-0 z-30 mb-4 flex flex-col items-center justify-center gap-1 border-b border-black/10 bg-[#F2F2F2]/95 py-3 backdrop-blur-sm"
            aria-live="polite"
          >
            <p className="text-sm font-medium text-[#1a1a1a]">
              КОТ — осталось времени:{" "}
              <span
                className={`inline-block min-w-[4.5rem] font-mono text-lg tabular-nums ${
                  kotTimeExpired ? "text-red-600" : "text-[#00B596]"
                }`}
              >
                {formatKotClock(remainingMs)}
              </span>
            </p>
            {kotTimeExpired ? (
              <p className="text-center text-xs text-red-600/90">Отведённое время истекло.</p>
            ) : null}
          </div>
        ) : null}

        <section className={`${questionCardSurfaceClass} mb-4 p-6 sm:px-8 sm:py-6`}>
          <h2 className={stepQuestionTitleClass}>Интеллектуальный блок (КОТ)</h2>
          <div className={`mt-3 space-y-2 ${stepSecondaryTextClass}`}>
            {KOT_INTRO_PARAGRAPHS.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          {!kotStarted ? (
            <div className="mt-8 flex justify-center">
              <Button
                type="button"
                onClick={() => startKotTimer()}
                className={`${stepNavPrimaryButtonClass} min-w-[200px] px-10 py-3 text-base font-semibold uppercase tracking-wide`}
              >
                СТАРТ
              </Button>
            </div>
          ) : null}
        </section>

        {kotStarted ? (
          <div className="space-y-4">
            {KOT_OFFICIAL_QUESTIONS_ORDERED.map((spec, index) => {
              const displayNum = index + 1;
              const title = `${String(displayNum)}. ${spec.prompt}`;
              const figure =
                spec.figure !== undefined ? <KotQuestionFigure kind={spec.figure} /> : null;
              const pairBlock =
                spec.kind === "text" && spec.pairColumnRows !== undefined ? (
                  <KotPairColumns rows={spec.pairColumnRows} />
                ) : null;
              if (spec.kind === "mc") {
                return (
                  <QuestionCard key={spec.key} title={title}>
                    {figure}
                    {pairBlock}
                    <div className="space-y-2">
                      {spec.options.map((opt) => {
                        const inputId = `kot-${spec.key}-${opt.id}`;
                        const checked = step1Data[spec.key] === opt.id;
                        return (
                          <label
                            key={opt.id}
                            htmlFor={inputId}
                            className="flex cursor-pointer select-none items-start gap-3"
                          >
                            <input
                              id={inputId}
                              type="radio"
                              name={spec.key}
                              value={opt.id}
                              checked={checked}
                              disabled={blockAnswers}
                              onChange={() => setAnswer(spec.key, opt.id)}
                              className="mt-1 accent-[#00B596] disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            <span>{opt.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </QuestionCard>
                );
              }
              const textVal = step1Data[spec.key] ?? "";
              return (
                <QuestionCard key={spec.key} title={title}>
                  {figure}
                  {pairBlock}
                  <label className="block">
                    <span className={`mb-1 block text-sm ${stepSecondaryTextClass}`}>
                      {spec.placeholder ?? "Ответ"}
                    </span>
                    <input
                      type="text"
                      name={spec.key}
                      value={textVal}
                      disabled={blockAnswers}
                      onChange={(e) => setAnswer(spec.key, e.target.value)}
                      className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[15px] text-[#1a1a1a] outline-none ring-[#00B596]/30 focus:border-[#00B596] focus:ring-2 disabled:cursor-not-allowed disabled:bg-black/[0.04] disabled:text-black/50"
                      autoComplete="off"
                    />
                  </label>
                </QuestionCard>
              );
            })}
          </div>
        ) : null}

        <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="secondary"
            onClick={() => router.push("/briefing")}
            className="w-[160px]"
          >
            Назад
          </Button>

          <Button
            disabled={!complete || !kotStarted}
            onClick={() => {
              setScreeningMaxStepCookie(2);
              router.push("/step-2");
            }}
            className={stepNavPrimaryButtonClass}
          >
            {continueLabel}
          </Button>
        </div>
      </div>
    </StepLayout>
  );
}
