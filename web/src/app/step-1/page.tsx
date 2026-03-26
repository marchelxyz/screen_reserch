"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { ProgressBar } from "@/components/ProgressBar";
import { QuestionCard } from "@/components/QuestionCard";
import { SessionHint } from "@/components/SessionHint";
import { StepLayout } from "@/components/StepLayout";
import {
  stepNavPrimaryButtonClass,
  stepPageContentClass,
  stepSectionTitleClass,
} from "@/lib/stepPageTheme";
import { TOTAL_QUESTIONS_COUNT, getAllAnsweredCount, isProfileReady } from "@/lib/progress";
import { Step1Data, useFormStore } from "@/store/useFormStore";
import { useEffect } from "react";

type RadioOption = {
  value: string;
  label: string;
};

type Step1Question = {
  id: keyof Pick<Step1Data, "q1" | "q2" | "q3" | "q4" | "q5">;
  title: string;
  options: RadioOption[];
};

function isStep1Complete(data: Step1Data): boolean {
  return Boolean(data.q1 && data.q2 && data.q3 && data.q4 && data.q5);
}

export default function Step1Page(): React.ReactElement {
  const router = useRouter();
  const profileName = useFormStore((s) => s.profileName);
  const personalDataConsent = useFormStore((s) => s.personalDataConsent);
  const consentRecordedAt = useFormStore((s) => s.consentRecordedAt);
  const sessionId = useFormStore((s) => s.sessionId);
  const leaveTestSession = useFormStore((s) => s.leaveTestSession);
  const step1Data = useFormStore((s) => s.step1Data);
  const step2Data = useFormStore((s) => s.step2Data);
  const step3Data = useFormStore((s) => s.step3Data);
  const step4Data = useFormStore((s) => s.step4Data);
  const setStep1Data = useFormStore((s) => s.setStep1Data);

  useEffect(() => {
    if (!isProfileReady(profileName, personalDataConsent, consentRecordedAt)) {
      router.replace("/intro");
      return;
    }
    if (!sessionId) {
      router.replace("/intro");
    }
  }, [consentRecordedAt, personalDataConsent, profileName, router, sessionId]);

  const questions: Step1Question[] = [
    {
      id: "q1",
      title: "Насколько легко вам даются логические задачи?",
      options: [
        { value: "easy", label: "Легко" },
        { value: "medium", label: "Средне" },
        { value: "hard", label: "Сложно" },
      ],
    },
    {
      id: "q2",
      title: "Вы быстро находите закономерности в данных?",
      options: [
        { value: "often", label: "Часто" },
        { value: "sometimes", label: "Иногда" },
        { value: "rarely", label: "Редко" },
      ],
    },
    {
      id: "q3",
      title: "Вам нравится разбирать причины проблем?",
      options: [
        { value: "yes", label: "Да, нравится" },
        { value: "depends", label: "Иногда" },
        { value: "no", label: "Нет" },
      ],
    },
    {
      id: "q4",
      title: "Вы сохраняете спокойствие при сложных сценариях?",
      options: [
        { value: "usually", label: "Обычно" },
        { value: "mixed", label: "По-разному" },
        { value: "rare", label: "С трудом" },
      ],
    },
    {
      id: "q5",
      title: "Вы умеете структурировать информацию перед решением?",
      options: [
        { value: "strong", label: "Хорошо" },
        { value: "ok", label: "Нормально" },
        { value: "weak", label: "Пока трудно" },
      ],
    },
  ];

  const complete = isStep1Complete(step1Data);
  const answeredCount = getAllAnsweredCount(step1Data, step2Data, step3Data, step4Data);

  function setField(field: Step1Question["id"], value: string): void {
    setStep1Data({ ...step1Data, [field]: value } as Step1Data);
  }

  return (
    <StepLayout showExitTest>
      <div className={stepPageContentClass}>
        <div className="mb-5">
          <ProgressBar answeredQuestions={answeredCount} totalQuestions={TOTAL_QUESTIONS_COUNT} />
          <div className="mt-2">
            <SessionHint sessionId={sessionId} />
          </div>
        </div>

        <h1 className={stepSectionTitleClass}>
          {profileName.trim().length > 0 ? `${profileName}, ` : ""}
          IQ тест - Когнитивные способности
        </h1>

        <div className="space-y-4">
          {questions.map((q) => (
            <QuestionCard key={q.id} title={q.title}>
              <div className="space-y-2">
                {q.options.map((opt) => {
                  const inputId = `step1-${q.id}-${opt.value}`;
                  const checked = step1Data[q.id] === opt.value;
                  return (
                    <label
                      key={opt.value}
                      htmlFor={inputId}
                      className="flex items-start gap-3 cursor-pointer select-none"
                    >
                      <input
                        id={inputId}
                        type="radio"
                        name={q.id}
                        value={opt.value}
                        checked={checked}
                        onChange={() => setField(q.id, opt.value)}
                        className="mt-1"
                      />
                      <span>{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            </QuestionCard>
          ))}
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              leaveTestSession();
              router.push("/");
            }}
            className="w-[160px]"
          >
            Назад
          </Button>

          <Button
            disabled={!complete}
            onClick={() => router.push("/step-2")}
            className={stepNavPrimaryButtonClass}
          >
            Далее
          </Button>
        </div>
      </div>
    </StepLayout>
  );
}

