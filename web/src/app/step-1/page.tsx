"use client";

import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { ProgressBar } from "@/components/ProgressBar";
import { QuestionCard } from "@/components/QuestionCard";
import { StepLayout } from "@/components/StepLayout";
import { TestMotivation } from "@/components/TestMotivation";
import { KOT_QUESTIONS } from "@/lib/kot/questions";
import type { KotChoiceId, KotQuestionKey } from "@/lib/kot/step1Types";
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

const KOT_INTRO_PARAGRAPHS: string[] = [
  "Перед вами сокращённый блок в духе методики КОТ (краткий ориентировочный тест) и теста Вандерлика (Wonderlic): аналогии, числовые задачи, смысл высказываний, ряды и логика.",
  "В оригинале таких заданий 50; здесь — 30, чтобы сохранить структуру опроса без чрезмерной длины. Выберите один ответ в каждом пункте.",
  "Формулировки подобраны для экранного прохождения и не являются дословной копией издания методики.",
];

export default function Step1Page(): React.ReactElement {
  const router = useRouter();
  const profileName = useFormStore((s) => s.profileName);
  const personalDataConsent = useFormStore((s) => s.personalDataConsent);
  const consentRecordedAt = useFormStore((s) => s.consentRecordedAt);
  const sessionId = useFormStore((s) => s.sessionId);
  const step1Data = useFormStore((s) => s.step1Data);
  const step2Data = useFormStore((s) => s.step2Data);
  const step3Data = useFormStore((s) => s.step3Data);
  const step4Data = useFormStore((s) => s.step4Data);
  const setStep1Data = useFormStore((s) => s.setStep1Data);

  const questionsBySection = useMemo(() => {
    const map = new Map<string, typeof KOT_QUESTIONS>();
    for (const q of KOT_QUESTIONS) {
      const list = map.get(q.section) ?? [];
      list.push(q);
      map.set(q.section, list);
    }
    return Array.from(map.entries());
  }, []);

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

  function setChoice(key: KotQuestionKey, value: KotChoiceId): void {
    setStep1Data({ ...step1Data, [key]: value });
  }

  return (
    <StepLayout>
      <div className={stepPageContentClass}>
        <div className="mb-2">
          <ProgressBar answeredQuestions={answeredCount} totalQuestions={TOTAL_QUESTIONS_COUNT} />
          <TestMotivation profileName={profileName} answeredCount={answeredCount} />
        </div>

        <section className={`${questionCardSurfaceClass} mb-4 p-6 sm:px-8 sm:py-6`}>
          <h2 className={stepQuestionTitleClass}>Интеллектуальный блок (сокращённый КОТ)</h2>
          <div className={`mt-3 space-y-2 ${stepSecondaryTextClass}`}>
            {KOT_INTRO_PARAGRAPHS.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          {questionsBySection.map(([section, items]) => (
            <div key={section}>
              <p className="mb-3 text-[15px] font-extrabold uppercase tracking-wide text-[#8C8C8C]">
                {section}
              </p>
              <div className="space-y-4">
                {items.map((q) => {
                  const globalIndex = KOT_QUESTIONS.indexOf(q) + 1;
                  const title = `${String(globalIndex)}. ${q.prompt}`;
                  return (
                    <QuestionCard key={q.key} title={title}>
                      <div className="space-y-2">
                        {q.options.map((opt) => {
                          const inputId = `kot-${q.key}-${opt.id}`;
                          const checked = step1Data[q.key] === opt.id;
                          return (
                            <label
                              key={opt.id}
                              htmlFor={inputId}
                              className="flex cursor-pointer select-none items-start gap-3"
                            >
                              <input
                                id={inputId}
                                type="radio"
                                name={q.key}
                                value={opt.id}
                                checked={checked}
                                onChange={() => setChoice(q.key, opt.id)}
                                className="mt-1 accent-[#00B596]"
                              />
                              <span>{opt.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </QuestionCard>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="secondary"
            onClick={() => router.push("/briefing")}
            className="w-[160px]"
          >
            Назад
          </Button>

          <Button
            disabled={!complete}
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
