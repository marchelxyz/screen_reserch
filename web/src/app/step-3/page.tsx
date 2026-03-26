"use client";

import React, { useEffect } from "react";
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
import {
  LikertAnswer,
  Step2Data,
  Step3Data,
  useFormStore,
} from "@/store/useFormStore";

type Step3Question = {
  id: keyof Step3Data;
  title: string;
};

type LikertOption = {
  value: LikertAnswer;
  label: string;
};

function isStep2Complete(data: Step2Data): boolean {
  return [data.s1, data.s2, data.s3, data.s4, data.s5, data.s6, data.s7, data.s8].every(
    (item) => item !== null
  );
}

function isStep3Complete(data: Step3Data): boolean {
  return Boolean(
    data.q1 &&
      data.q2 &&
      data.q3 &&
      data.q4 &&
      data.q5 &&
      data.q6 &&
      data.q7 &&
      data.q8 &&
      data.q9 &&
      data.q10
  );
}

export default function Step3Page(): React.ReactElement {
  const router = useRouter();
  const profileName = useFormStore((s) => s.profileName);
  const personalDataConsent = useFormStore((s) => s.personalDataConsent);
  const sessionId = useFormStore((s) => s.sessionId);
  const step1Data = useFormStore((s) => s.step1Data);
  const step2Data = useFormStore((s) => s.step2Data);
  const step3Data = useFormStore((s) => s.step3Data);
  const step4Data = useFormStore((s) => s.step4Data);
  const setStep3Data = useFormStore((s) => s.setStep3Data);

  useEffect(() => {
    if (!isProfileReady(profileName, personalDataConsent)) {
      router.replace("/intro");
      return;
    }
    if (!sessionId) {
      router.replace("/intro");
      return;
    }
    if (!isStep2Complete(step2Data)) {
      router.replace("/step-2");
    }
  }, [personalDataConsent, profileName, router, sessionId, step2Data]);

  const complete = isStep3Complete(step3Data);
  const answeredCount = getAllAnsweredCount(step1Data, step2Data, step3Data, step4Data);

  const likertOptions: LikertOption[] = [
    { value: "fully_agree", label: "Полностью согласен" },
    { value: "agree", label: "Согласен" },
    { value: "neutral", label: "Скорее нейтрально" },
    { value: "disagree", label: "Скорее не согласен" },
    { value: "fully_disagree", label: "Полностью не согласен" },
  ];

  const questions: Step3Question[] = [
    { id: "q1", title: "Я обычно сохраняю позитивный настрой на работе." },
    { id: "q2", title: "Мне легко адаптироваться к изменениям." },
    { id: "q3", title: "Я спокойно отношусь к критике и улучшениям." },
    { id: "q4", title: "Я способен(на) поддерживать фокус на задачах." },
    { id: "q5", title: "Я умею восстанавливаться после стресса." },
    { id: "q6", title: "Я проявляю эмпатию к людям вокруг." },
    { id: "q7", title: "Я стремлюсь к ясности и понимаю приоритеты." },
    { id: "q8", title: "Я чувствую контроль над тем, что происходит." },
    { id: "q9", title: "Мне комфортно работать в команде." },
    { id: "q10", title: "Я избегаю конфликтов и умею их разруливать." },
  ];

  function setField(field: Step3Question["id"], value: LikertAnswer): void {
    setStep3Data({ ...step3Data, [field]: value });
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
          Эмоциональный статус
        </h1>

        <div className="space-y-4">
          {questions.map((q) => (
            <QuestionCard key={q.id} title={q.title}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {likertOptions.map((opt) => {
                  const inputId = `step3-${q.id}-${opt.value}`;
                  const checked = step3Data[q.id] === opt.value;
                  return (
                    <label
                      key={opt.value}
                      htmlFor={inputId}
                      className="flex items-center gap-3"
                    >
                      <input
                        id={inputId}
                        type="radio"
                        name={q.id}
                        checked={checked}
                        onChange={() => setField(q.id, opt.value)}
                        className="mt-0"
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
            onClick={() => router.push("/step-2")}
            className="w-[160px]"
          >
            Назад
          </Button>

          <Button
            disabled={!complete}
            onClick={() => router.push("/step-4")}
            className={stepNavPrimaryButtonClass}
          >
            Далее
          </Button>
        </div>
      </div>
    </StepLayout>
  );
}

