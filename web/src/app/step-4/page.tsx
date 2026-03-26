"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { ProgressBar } from "@/components/ProgressBar";
import { StepLayout } from "@/components/StepLayout";
import { TOTAL_QUESTIONS_COUNT, getAllAnsweredCount, isProfileReady } from "@/lib/progress";
import { Step4Data, Step3Data, useFormStore } from "@/store/useFormStore";

type SelectOption = { value: string; label: string };

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

function isStep4Complete(data: Step4Data): boolean {
  return (
    data.city.trim().length > 0 &&
    data.familyStatus.trim().length > 0 &&
    data.children.trim().length > 0 &&
    data.education.trim().length > 0 &&
    data.favoriteBook.trim().length > 0 &&
    data.favoriteFilm.trim().length > 0
  );
}

export default function Step4Page(): React.ReactElement {
  const router = useRouter();
  const profileName = useFormStore((s) => s.profileName);
  const personalDataConsent = useFormStore((s) => s.personalDataConsent);
  const step1Data = useFormStore((s) => s.step1Data);
  const step2Data = useFormStore((s) => s.step2Data);
  const step3Data = useFormStore((s) => s.step3Data);
  const step4Data = useFormStore((s) => s.step4Data);
  const setStep4Data = useFormStore((s) => s.setStep4Data);

  useEffect(() => {
    if (!isProfileReady(profileName, personalDataConsent)) {
      router.replace("/intro");
      return;
    }
    if (!isStep3Complete(step3Data)) {
      router.replace("/step-3");
    }
  }, [personalDataConsent, profileName, router, step3Data]);

  const complete = isStep4Complete(step4Data);
  const answeredCount = getAllAnsweredCount(step1Data, step2Data, step3Data, step4Data);

  const familyOptions: SelectOption[] = [
    { value: "single", label: "Холост/Не замужем" },
    { value: "married", label: "Женат/Замужем" },
    { value: "partner", label: "В гражданском браке" },
    { value: "divorced", label: "Разведен/Разведена" },
    { value: "prefer_not", label: "Предпочитаю не отвечать" },
  ];

  const childrenOptions: SelectOption[] = [
    { value: "none", label: "Нет детей" },
    { value: "one", label: "1 ребенок" },
    { value: "two", label: "2 ребенка" },
    { value: "three_plus", label: "3+ детей" },
    { value: "prefer_not", label: "Предпочитаю не отвечать" },
  ];

  const educationOptions: SelectOption[] = [
    { value: "secondary", label: "Среднее" },
    { value: "secondary_special", label: "Среднее специальное" },
    { value: "higher", label: "Высшее" },
    { value: "postgraduate", label: "Магистратура/Аспирантура" },
    { value: "other", label: "Другое" },
  ];

  function setField<K extends keyof Step4Data>(
    field: K,
    value: Step4Data[K]
  ): void {
    setStep4Data({ ...step4Data, [field]: value });
  }

  return (
    <StepLayout>
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <div className="mb-5">
          <ProgressBar answeredQuestions={answeredCount} totalQuestions={TOTAL_QUESTIONS_COUNT} />
        </div>

        <h1 className="text-xl sm:text-2xl font-bold mb-4 text-foreground">
          {profileName.trim().length > 0 ? `${profileName}, ` : ""}
          Социальные якоря
        </h1>

        <div className="rounded-2xl border border-black/5 bg-white/70 backdrop-blur p-4 sm:p-5 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-foreground/80">
                Город
              </label>
              <input
                value={step4Data.city}
                onChange={(e) => setField("city", e.target.value)}
                className="mt-2 w-full rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-[#00BFA5]/30"
                placeholder="Например, Москва"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground/80">
                Семейное положение
              </label>
              <select
                value={step4Data.familyStatus}
                onChange={(e) => setField("familyStatus", e.target.value)}
                className="mt-2 w-full rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-[#00BFA5]/30"
              >
                <option value="" disabled>
                  Выберите значение
                </option>
                {familyOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground/80">
                Дети
              </label>
              <select
                value={step4Data.children}
                onChange={(e) => setField("children", e.target.value)}
                className="mt-2 w-full rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-[#00BFA5]/30"
              >
                <option value="" disabled>
                  Выберите значение
                </option>
                {childrenOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground/80">
                Образование
              </label>
              <select
                value={step4Data.education}
                onChange={(e) => setField("education", e.target.value)}
                className="mt-2 w-full rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-[#00BFA5]/30"
              >
                <option value="" disabled>
                  Выберите значение
                </option>
                {educationOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-semibold text-foreground/80">
                Любимая книга
              </label>
              <input
                value={step4Data.favoriteBook}
                onChange={(e) => setField("favoriteBook", e.target.value)}
                className="mt-2 w-full rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-[#00BFA5]/30"
                placeholder="Название книги"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-semibold text-foreground/80">
                Любимый фильм
              </label>
              <input
                value={step4Data.favoriteFilm}
                onChange={(e) => setField("favoriteFilm", e.target.value)}
                className="mt-2 w-full rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-[#00BFA5]/30"
                placeholder="Название фильма"
              />
            </div>
          </div>
        </div>

        <div className="mt-7 flex items-center justify-between gap-3">
          <Button
            variant="secondary"
            onClick={() => router.push("/step-3")}
            className="w-32"
          >
            Назад
          </Button>

          <Button
            disabled={!complete}
            onClick={() => router.push("/finish")}
            className="w-48"
          >
            Завершить
          </Button>
        </div>
      </div>
    </StepLayout>
  );
}

