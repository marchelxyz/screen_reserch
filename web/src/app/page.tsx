'use client';

import React from "react";
import { useRouter } from "next/navigation";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/Button";
import { ProgressBar } from "@/components/ProgressBar";
import { StepLayout } from "@/components/StepLayout";

export default function WelcomePage(): React.ReactElement {
  const router = useRouter();

  return (
    <StepLayout>
      <div className="flex flex-1 items-center justify-center px-4 pb-10">
        <div className="w-full max-w-xl rounded-3xl border border-black/5 bg-white/70 backdrop-blur shadow-sm p-6 sm:p-8">
          <ProgressBar totalSteps={4} activeStep={0} />

          <div className="mt-6">
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-foreground">
              Профиль Успеха
            </h1>
            <p className="mt-3 text-sm sm:text-base text-foreground/75 leading-relaxed">
              Мы ценим ваше время и хотим, чтобы наше дальнейшее общение было
              максимально предметным и полезным для вас.
            </p>
            <p className="mt-3 text-sm sm:text-base text-foreground/75 leading-relaxed">
              Выполните 4 коротких шага - ответы помогут HR быстрее понять ваш
              стиль работы и мотивацию.
            </p>
          </div>

          <div className="mt-7">
            <Button
              onClick={() => router.push("/step-1")}
              className="w-full sm:w-auto px-10"
            >
              НАЧАТЬ ЗНАКОМСТВО
            </Button>
          </div>

          <div className="mt-6 text-center text-xs text-foreground/60">
            <div className="inline-flex items-center gap-2">
              <HelpCircle size={14} />
              Нет "правильных" или "неправильных" ответов - важен ваш
              реальный профессиональный стиль.
            </div>
          </div>
        </div>
      </div>
    </StepLayout>
  );
}
