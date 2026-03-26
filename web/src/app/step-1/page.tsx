"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { ProgressBar } from "@/components/ProgressBar";
import { QuestionCard } from "@/components/QuestionCard";
import { StepLayout } from "@/components/StepLayout";
import { Step1Data, useFormStore } from "@/store/useFormStore";

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
  const step1Data = useFormStore((s) => s.step1Data);
  const setStep1Data = useFormStore((s) => s.setStep1Data);

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

  function setField(field: Step1Question["id"], value: string): void {
    setStep1Data({ ...step1Data, [field]: value } as Step1Data);
  }

  return (
    <StepLayout>
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <div className="mb-5">
          <ProgressBar totalSteps={4} activeStep={1} />
        </div>

        <h1 className="text-xl sm:text-2xl font-bold mb-4 text-foreground">
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
                      <span className="text-sm text-foreground/90">
                        {opt.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </QuestionCard>
          ))}
        </div>

        <div className="mt-7 flex items-center justify-between gap-3">
          <Button
            variant="secondary"
            onClick={() => router.push("/")}
            className="w-32"
          >
            Назад
          </Button>

          <Button
            disabled={!complete}
            onClick={() => router.push("/step-2")}
            className="w-40"
          >
            Далее
          </Button>
        </div>
      </div>
    </StepLayout>
  );
}

