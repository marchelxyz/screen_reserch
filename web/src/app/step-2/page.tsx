"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { ProgressBar } from "@/components/ProgressBar";
import { QuestionCard } from "@/components/QuestionCard";
import { StepLayout } from "@/components/StepLayout";
import { TestMotivation } from "@/components/TestMotivation";
import {
  stepNavPrimaryButtonClass,
  stepPageContentClass,
} from "@/lib/stepPageTheme";
import { TOTAL_QUESTIONS_COUNT, getAllAnsweredCount, isProfileReady } from "@/lib/progress";
import { getContinueButtonLabel } from "@/lib/testMotivation";
import {
  Step1Data,
  Step2Data,
  useFormStore,
} from "@/store/useFormStore";

type Step2Question = {
  id: keyof Step2Data;
  title: string;
};

function isStep1Complete(data: Step1Data): boolean {
  return Boolean(data.q1 && data.q2 && data.q3 && data.q4 && data.q5);
}

function isStep2Complete(data: Step2Data): boolean {
  return [data.s1, data.s2, data.s3, data.s4, data.s5, data.s6, data.s7, data.s8].every(
    (item) => item !== null
  );
}

export default function Step2Page(): React.ReactElement {
  const router = useRouter();
  const profileName = useFormStore((s) => s.profileName);
  const personalDataConsent = useFormStore((s) => s.personalDataConsent);
  const consentRecordedAt = useFormStore((s) => s.consentRecordedAt);
  const sessionId = useFormStore((s) => s.sessionId);
  const step1Data = useFormStore((s) => s.step1Data);
  const step2Data = useFormStore((s) => s.step2Data);
  const step3Data = useFormStore((s) => s.step3Data);
  const step4Data = useFormStore((s) => s.step4Data);
  const setStep2Data = useFormStore((s) => s.setStep2Data);

  useEffect(() => {
    if (!isProfileReady(profileName, personalDataConsent, consentRecordedAt)) {
      router.replace("/intro");
      return;
    }
    if (!sessionId) {
      router.replace("/briefing");
      return;
    }
    if (!isStep1Complete(step1Data)) {
      router.replace("/step-1");
    }
  }, [consentRecordedAt, personalDataConsent, profileName, router, sessionId, step1Data]);

  const complete = isStep2Complete(step2Data);
  const answeredCount = getAllAnsweredCount(step1Data, step2Data, step3Data, step4Data);
  const continueLabel = getContinueButtonLabel(answeredCount);

  const questions: Step2Question[] = [
    { id: "s1", title: "Мне важны стабильность и понятность процессов." },
    { id: "s2", title: "Я стремлюсь к признанию результатов и заметности." },
    { id: "s3", title: "Для меня важны автономность и возможность решать самому." },
    { id: "s4", title: "Я мотивируюсь возможностью влиять на решения команды." },
    { id: "s5", title: "Мне комфортны роли, где есть четкие цели и критерии." },
    { id: "s6", title: "Мне нравится развиваться через сложные и нестандартные задачи." },
    { id: "s7", title: "Я лучше работаю, когда вижу прямую связь с ценностью для клиента." },
    { id: "s8", title: "Я отношусь к работе как к проекту с измеримыми результатами." },
  ];

  function setField(field: Step2Question["id"], value: boolean): void {
    setStep2Data({ ...step2Data, [field]: value });
  }

  return (
    <StepLayout>
      <div className={stepPageContentClass}>
        <div className="mb-2">
          <ProgressBar answeredQuestions={answeredCount} totalQuestions={TOTAL_QUESTIONS_COUNT} />
          <TestMotivation profileName={profileName} answeredCount={answeredCount} />
        </div>

        <div className="space-y-4">
          {questions.map((q) => {
            const inputId = `step2-${q.id}`;
            const checked = step2Data[q.id];
            return (
              <QuestionCard key={q.id} title={q.title}>
                <div className="flex flex-wrap gap-4">
                  <label htmlFor={`${inputId}-yes`} className="flex items-center gap-2">
                    <input
                      id={`${inputId}-yes`}
                      type="radio"
                      name={inputId}
                      checked={checked === true}
                      onChange={() => setField(q.id, true)}
                    />
                    <span>Да</span>
                  </label>
                  <label htmlFor={`${inputId}-no`} className="flex items-center gap-2">
                    <input
                      id={`${inputId}-no`}
                      type="radio"
                      name={inputId}
                      checked={checked === false}
                      onChange={() => setField(q.id, false)}
                    />
                    <span>Нет</span>
                  </label>
                </div>
              </QuestionCard>
            );
          })}
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="secondary"
            onClick={() => router.push("/step-1")}
            className="w-[160px]"
          >
            Назад
          </Button>

          <Button
            disabled={!complete}
            onClick={() => router.push("/step-3")}
            className={stepNavPrimaryButtonClass}
          >
            {continueLabel}
          </Button>
        </div>
      </div>
    </StepLayout>
  );
}
