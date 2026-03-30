"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { ProgressBar } from "@/components/ProgressBar";
import { StepLayout } from "@/components/StepLayout";
import { TestMotivation } from "@/components/TestMotivation";
import {
  questionCardSurfaceClass,
  stepInputClass,
  stepLabelClass,
  stepNavPrimaryButtonClass,
  stepPageContentClass,
} from "@/lib/stepPageTheme";
import { useScreeningStepLog } from "@/lib/logging/useScreeningStepLog";
import { TOTAL_QUESTIONS_COUNT, getAllAnsweredCount, isProfileReady } from "@/lib/progress";
import { setScreeningMaxStepCookie } from "@/lib/screeningProgressCookie";
import { getContinueButtonLabel } from "@/lib/testMotivation";
import { isStep4Complete } from "@/lib/validation/stepCompletion";
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

export default function Step4Page(): React.ReactElement {
  const router = useRouter();
  const profileName = useFormStore((s) => s.profileName);
  const personalDataConsent = useFormStore((s) => s.personalDataConsent);
  const consentRecordedAt = useFormStore((s) => s.consentRecordedAt);
  const sessionId = useFormStore((s) => s.sessionId);
  useScreeningStepLog("step-4", sessionId);
  const step1Data = useFormStore((s) => s.step1Data);
  const step2Data = useFormStore((s) => s.step2Data);
  const step3Data = useFormStore((s) => s.step3Data);
  const step4Data = useFormStore((s) => s.step4Data);
  const setStep4Data = useFormStore((s) => s.setStep4Data);

  useEffect(() => {
    if (!isProfileReady(profileName, personalDataConsent, consentRecordedAt)) {
      router.replace("/intro");
      return;
    }
    if (!sessionId) {
      router.replace("/briefing");
      return;
    }
    if (!isStep3Complete(step3Data)) {
      router.replace("/step-3");
    }
  }, [consentRecordedAt, personalDataConsent, profileName, router, sessionId, step3Data]);

  useEffect(() => {
    setScreeningMaxStepCookie(4);
  }, []);

  const complete = isStep4Complete(step4Data);
  const answeredCount = getAllAnsweredCount(step1Data, step2Data, step3Data, step4Data);
  const continueLabel = getContinueButtonLabel(answeredCount);
  const primaryLabel = complete ? "Завершить" : continueLabel;

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
      <div className={stepPageContentClass}>
        <div className="mb-2">
          <ProgressBar answeredQuestions={answeredCount} totalQuestions={TOTAL_QUESTIONS_COUNT} />
          <TestMotivation profileName={profileName} answeredCount={answeredCount} />
        </div>

        <div className={`${questionCardSurfaceClass} p-6 sm:px-8 sm:py-6`}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={stepLabelClass}>
                Город
              </label>
              <input
                value={step4Data.city}
                onChange={(e) => setField("city", e.target.value)}
                className={stepInputClass}
                placeholder="Например, Москва"
              />
            </div>

            <div>
              <label className={stepLabelClass}>
                Семейное положение
              </label>
              <select
                value={step4Data.familyStatus}
                onChange={(e) => setField("familyStatus", e.target.value)}
                className={stepInputClass}
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
              <label className={stepLabelClass}>
                Дети
              </label>
              <select
                value={step4Data.children}
                onChange={(e) => setField("children", e.target.value)}
                className={stepInputClass}
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
              <label className={stepLabelClass}>
                Образование
              </label>
              <select
                value={step4Data.education}
                onChange={(e) => setField("education", e.target.value)}
                className={stepInputClass}
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
              <label className={stepLabelClass}>
                Любимая книга
              </label>
              <input
                value={step4Data.favoriteBook}
                onChange={(e) => setField("favoriteBook", e.target.value)}
                className={stepInputClass}
                placeholder="Название книги"
              />
            </div>

            <div className="sm:col-span-2">
              <label className={stepLabelClass}>
                Любимый фильм
              </label>
              <input
                value={step4Data.favoriteFilm}
                onChange={(e) => setField("favoriteFilm", e.target.value)}
                className={stepInputClass}
                placeholder="Название фильма"
              />
            </div>

            <div className="sm:col-span-2">
              <label className={stepLabelClass}>
                Хобби или увлечение
              </label>
              <input
                value={step4Data.hobby}
                onChange={(e) => setField("hobby", e.target.value)}
                className={stepInputClass}
                placeholder="Чем увлекаетесь вне работы"
              />
            </div>

            <div className="sm:col-span-2">
              <label className={stepLabelClass}>
                Любимая музыка
              </label>
              <input
                value={step4Data.favoriteMusic}
                onChange={(e) => setField("favoriteMusic", e.target.value)}
                className={stepInputClass}
                placeholder="Жанр, исполнитель или группа"
              />
            </div>

            <div className="sm:col-span-2">
              <label className={stepLabelClass}>
                Как проводите свободное время
              </label>
              <input
                value={step4Data.leisureTime}
                onChange={(e) => setField("leisureTime", e.target.value)}
                className={stepInputClass}
                placeholder="Кратко, в свободной форме"
              />
            </div>

            <div className="sm:col-span-2">
              <label className={stepLabelClass}>
                Любимая цитата или личный девиз
              </label>
              <input
                value={step4Data.lifeMotto}
                onChange={(e) => setField("lifeMotto", e.target.value)}
                className={stepInputClass}
                placeholder="Необязательно дословно"
              />
            </div>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="secondary"
            onClick={() => router.push("/step-3")}
            className="w-[160px]"
          >
            Назад
          </Button>

          <Button
            disabled={!complete}
            onClick={() => router.push("/finish")}
            className={stepNavPrimaryButtonClass}
          >
            {primaryLabel}
          </Button>
        </div>
      </div>
    </StepLayout>
  );
}
