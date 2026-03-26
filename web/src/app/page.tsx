'use client';

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { ProgressBar } from "@/components/ProgressBar";
import { StepLayout } from "@/components/StepLayout";
import { TOTAL_QUESTIONS_COUNT, isProfileReady } from "@/lib/progress";
import { useFormStore } from "@/store/useFormStore";

export default function WelcomePage(): React.ReactElement {
  const router = useRouter();
  const profileName = useFormStore((s) => s.profileName);
  const personalDataConsent = useFormStore((s) => s.personalDataConsent);
  const setProfileName = useFormStore((s) => s.setProfileName);
  const setPersonalDataConsent = useFormStore((s) => s.setPersonalDataConsent);
  const canStart = isProfileReady(profileName, personalDataConsent);

  return (
    <StepLayout>
      <div className="flex flex-1 items-center justify-center px-4 pb-8 pt-3 sm:pt-6">
        <div className="w-full max-w-[1037px] rounded-[34px] bg-[#DCDCDC] shadow-[0px_10px_75px_0px_rgba(0,0,0,0.24)] px-6 py-6 sm:px-10 sm:py-8 lg:px-12 lg:py-10">
          <ProgressBar answeredQuestions={0} totalQuestions={TOTAL_QUESTIONS_COUNT} />

          <div className="mt-5 text-[#5F5E5E] text-[26px] font-extrabold leading-[1.35]">
            <p>
              Мы ценим ваше время и хотим, чтобы наше дальнейшее общение было
              максимально предметным и полезным для обеих сторон.
            </p>
            <p className="mt-5">
              Просим вас уделить около 30 минут на этот интерактивный опрос.
              <br />
              Он состоит из 4 коротких шагов, которые помогут нам:
            </p>
            <ul className="mt-1 list-disc pl-9">
              <li>Оценить ваш подход к решению нестандартных задач.</li>
              <li>Понять, что вас по-настоящему мотивирует и драйвит.</li>
              <li>Предложить вам позицию и условия, которые идеально подойдут именно вам.</li>
            </ul>
            <p className="mt-5">
              Здесь нет правильных или неправильных ответов - нам важен ваш
              реальный профессиональный стиль. Выделите спокойное время,
              налейте кофе и давайте начнем!
            </p>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <label htmlFor="profile-name" className="block text-sm font-bold text-[#5F5E5E]">
                Ваше имя
              </label>
              <input
                id="profile-name"
                value={profileName}
                onChange={(event) => setProfileName(event.target.value)}
                placeholder="Введите имя"
                className="mt-1 h-12 w-full rounded-2xl border border-black/15 bg-white/85 px-4 text-[18px] font-semibold text-[#4F4F4F] outline-none focus:ring-2 focus:ring-[#00B596]/35"
              />
            </div>
            <div className="sm:pb-[2px]">
              <Button
                onClick={() => router.push("/step-1")}
                disabled={!canStart}
                className="h-[58px] w-full sm:w-[340px] text-[40px] font-extrabold tracking-[0.02em] leading-none"
              >
                НАЧАТЬ ЗНАКОМСТВО
              </Button>
            </div>
          </div>

          <label className="mt-4 inline-flex items-start gap-3 text-sm text-[#5F5E5E]">
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
        </div>
      </div>
    </StepLayout>
  );
}
