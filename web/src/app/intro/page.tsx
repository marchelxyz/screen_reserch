"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { StepLayout } from "@/components/StepLayout";
import { isProfileReady } from "@/lib/progress";
import { useFormStore } from "@/store/useFormStore";

export default function IntroPage(): React.ReactElement {
  const router = useRouter();
  const profileName = useFormStore((s) => s.profileName);
  const personalDataConsent = useFormStore((s) => s.personalDataConsent);
  const setProfileName = useFormStore((s) => s.setProfileName);
  const setPersonalDataConsent = useFormStore((s) => s.setPersonalDataConsent);
  const canStart = isProfileReady(profileName, personalDataConsent);

  return (
    <StepLayout>
      <div className="flex flex-1 items-center justify-center px-4 pb-10 pt-2">
        <div className="w-full max-w-[760px] rounded-[34px] bg-[#DCDCDC] shadow-[0px_4px_55px_0px_rgba(0,0,0,0.16)] px-8 py-8">
          <p className="text-[#5F5E5E] text-[22px] leading-[1.35] font-extrabold">
            Перед началом опроса укажите, как к вам обращаться. Это поможет сделать
            диалог более персональным и удобным для вас.
          </p>

          <div className="mt-6">
            <label htmlFor="profile-name" className="block text-sm font-bold text-[#5F5E5E]">
              Ваше имя
            </label>
            <input
              id="profile-name"
              value={profileName}
              onChange={(event) => setProfileName(event.target.value)}
              placeholder="Например, Алексей"
              className="mt-1 h-12 w-full rounded-2xl border border-black/15 bg-white/85 px-4 text-[18px] font-semibold text-[#4F4F4F] outline-none focus:ring-2 focus:ring-[#00B596]/35"
            />
          </div>

          <label className="mt-3 inline-flex items-start gap-3 text-xs text-[#5F5E5E]">
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

          <div className="mt-6 flex items-center justify-between gap-3">
            <Button variant="secondary" onClick={() => router.push("/")} className="w-[160px]">
              Назад
            </Button>
            <Button
              onClick={() => router.push("/step-1")}
              disabled={!canStart}
              className="h-[58px] w-[280px] text-[32px] font-extrabold leading-none"
            >
              ПРОДОЛЖИТЬ
            </Button>
          </div>
        </div>
      </div>
    </StepLayout>
  );
}

