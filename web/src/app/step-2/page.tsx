"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { ProgressBar } from "@/components/ProgressBar";
import { QuestionCard } from "@/components/QuestionCard";
import { StepLayout } from "@/components/StepLayout";
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
  return (
    data.s1 ||
    data.s2 ||
    data.s3 ||
    data.s4 ||
    data.s5 ||
    data.s6 ||
    data.s7 ||
    data.s8
  );
}

export default function Step2Page(): React.ReactElement {
  const router = useRouter();
  const step1Data = useFormStore((s) => s.step1Data);
  const step2Data = useFormStore((s) => s.step2Data);
  const setStep2Data = useFormStore((s) => s.setStep2Data);

  useEffect(() => {
    if (!isStep1Complete(step1Data)) {
      router.replace("/step-1");
    }
  }, [router, step1Data]);

  const complete = isStep2Complete(step2Data);

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
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <div className="mb-5">
          <ProgressBar totalSteps={4} activeStep={2} />
        </div>

        <h1 className="text-xl sm:text-2xl font-bold mb-4 text-foreground">
          Тест Герчикова - Внутренняя мотивация
        </h1>

        <div className="space-y-4">
          {questions.map((q) => {
            const inputId = `step2-${q.id}`;
            const checked = step2Data[q.id];
            return (
              <QuestionCard key={q.id} title={q.title}>
                <label
                  htmlFor={inputId}
                  className="flex items-start gap-3 cursor-pointer select-none"
                >
                  <input
                    id={inputId}
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setField(q.id, e.target.checked)}
                    className="mt-1"
                  />
                  <span className="text-sm text-foreground/90">
                    Выбираю, это обо мне
                  </span>
                </label>
              </QuestionCard>
            );
          })}
        </div>

        <div className="mt-7 flex items-center justify-between gap-3">
          <Button
            variant="secondary"
            onClick={() => router.push("/step-1")}
            className="w-32"
          >
            Назад
          </Button>

          <Button
            disabled={!complete}
            onClick={() => router.push("/step-3")}
            className="w-40"
          >
            Далее
          </Button>
        </div>
      </div>
    </StepLayout>
  );
}

