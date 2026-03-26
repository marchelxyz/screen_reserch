import React from "react";
import { StepLayout } from "@/components/StepLayout";

export default function PolicyPage(): React.ReactElement {
  return (
    <StepLayout hideHeaderTitle>
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <div className="rounded-3xl bg-[#DCDCDC] px-6 py-6 sm:px-8">
          <h1 className="text-2xl font-extrabold text-[#5F5E5E]">
            Политика обработки персональных данных
          </h1>
          <p className="mt-4 text-[#5F5E5E] text-base leading-relaxed font-semibold">
            Здесь разместите официальный текст политики. Этот экран добавлен как
            точка перехода с welcome-формы и может быть заменен на вашу полную
            юридическую страницу.
          </p>
        </div>
      </div>
    </StepLayout>
  );
}

