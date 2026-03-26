"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { StepLayout } from "@/components/StepLayout";
import {
  stepNavPrimaryButtonClass,
  stepSecondaryTextClass,
  stepSurfaceCardClass,
} from "@/lib/stepPageTheme";
import { isProfileReady } from "@/lib/progress";
import { useFormStore } from "@/store/useFormStore";

/**
 * Инструктаж после ввода имени и согласия, перед стартом вопросов.
 */
export default function BriefingPage(): React.ReactElement {
  const router = useRouter();
  const profileName = useFormStore((s) => s.profileName);
  const personalDataConsent = useFormStore((s) => s.personalDataConsent);
  const consentRecordedAt = useFormStore((s) => s.consentRecordedAt);
  const sessionId = useFormStore((s) => s.sessionId);
  const beginTestSession = useFormStore((s) => s.beginTestSession);

  useEffect(() => {
    if (!isProfileReady(profileName, personalDataConsent, consentRecordedAt)) {
      router.replace("/intro");
    }
  }, [consentRecordedAt, personalDataConsent, profileName, router]);

  function handleContinue(): void {
    if (!sessionId) {
      beginTestSession();
    }
    router.push("/step-1");
  }

  return (
    <StepLayout>
      <div className="flex flex-1 items-center justify-center px-4 pb-10 pt-2">
        <div className={`w-full max-w-[860px] px-8 py-8 ${stepSurfaceCardClass}`}>
          <p className={`text-[20px] sm:text-[22px] ${stepSecondaryTextClass}`}>
            Перед вами серия коротких блоков с вопросами. Отвечайте так, как чувствуете
            сейчас: здесь нет оценки «правильно или неправильно» — нам важен ваш
            естественный стиль.
          </p>
          <p className={`mt-4 text-[20px] sm:text-[22px] ${stepSecondaryTextClass}`}>
            Вы сможете двигаться в своём темпе и вернуться назад в пределах опроса,
            если понадобится. Когда будете готовы, нажмите кнопку ниже — и мы начнём.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="secondary"
              onClick={() => router.push("/intro")}
              className="w-[160px]"
            >
              Назад
            </Button>
            <Button
              onClick={handleContinue}
              className={`${stepNavPrimaryButtonClass} min-w-[220px] sm:min-w-[280px] text-[18px] sm:text-[22px]`}
            >
              Идём дальше
            </Button>
          </div>
        </div>
      </div>
    </StepLayout>
  );
}
