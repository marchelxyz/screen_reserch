"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { StepLayout } from "@/components/StepLayout";
import {
  stepInputClass,
  stepLabelClass,
  stepNavPrimaryButtonClass,
  stepSecondaryTextClass,
  stepSurfaceCardClass,
} from "@/lib/stepPageTheme";
import { isProfileReady } from "@/lib/progress";
import { useFormStore } from "@/store/useFormStore";

export default function IntroPage(): React.ReactElement {
  const router = useRouter();
  const profileName = useFormStore((s) => s.profileName);
  const personalDataConsent = useFormStore((s) => s.personalDataConsent);
  const setProfileName = useFormStore((s) => s.setProfileName);
  const setPersonalDataConsent = useFormStore((s) => s.setPersonalDataConsent);
  const beginTestSession = useFormStore((s) => s.beginTestSession);
  const consentRecordedAt = useFormStore((s) => s.consentRecordedAt);
  const canStart = isProfileReady(profileName, personalDataConsent, consentRecordedAt);

  return (
    <StepLayout>
      <div className="flex flex-1 items-center justify-center px-4 pb-10 pt-2">
        <div className={`w-full max-w-[860px] px-8 py-8 ${stepSurfaceCardClass}`}>
          <p className={`text-[20px] sm:text-[22px] ${stepSecondaryTextClass}`}>
            Перед началом опроса укажите, как к вам обращаться. Это поможет сделать
            диалог более персональным и удобным для вас.
          </p>

          <div className="mt-6">
            <label htmlFor="profile-name" className={`block ${stepLabelClass}`}>
              Ваше имя
            </label>
            <input
              id="profile-name"
              value={profileName}
              onChange={(event) => setProfileName(event.target.value)}
              placeholder="Например, Алексей"
              className={`${stepInputClass} h-12 text-[18px]`}
            />
          </div>

          <label className={`mt-3 inline-flex items-start gap-3 text-xs ${stepSecondaryTextClass}`}>
            <input
              type="checkbox"
              checked={personalDataConsent}
              onChange={(event) => setPersonalDataConsent(event.target.checked)}
              className="mt-0.5 size-4"
            />
            <span>
              Я принимаю{" "}
              <a href="/policy" className="underline decoration-1 underline-offset-2">
                политику обработки персональных данных
              </a>
            </span>
          </label>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <Button variant="secondary" onClick={() => router.push("/")} className="w-[160px]">
              Назад
            </Button>
            <Button
              onClick={() => {
                beginTestSession();
                router.push("/step-1");
              }}
              disabled={!canStart}
              className={`${stepNavPrimaryButtonClass} min-w-[220px] sm:min-w-[280px] text-[18px] sm:text-[22px]`}
            >
              ПРОДОЛЖИТЬ
            </Button>
          </div>
        </div>
      </div>
    </StepLayout>
  );
}

