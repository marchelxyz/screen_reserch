"use client";

import React from "react";
import Image from "next/image";
import { TestExitControl } from "@/components/TestExitControl";

export type StepLayoutProps = {
  children: React.ReactNode;
  hideHeaderTitle?: boolean;
  /** Показать кнопку выхода из теста (шаги 1–4). */
  showExitTest?: boolean;
};

/**
 * Общая оболочка экранов.
 * Контент по ширине ограничен max-w в шапке; фон тянется на всю ширину.
 * Высота по контенту: длинные шаги опроса прокручиваются страницей.
 */
export function StepLayout({
  children,
  hideHeaderTitle = false,
  showExitTest = false,
}: StepLayoutProps): React.ReactElement {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#F2F2F2]">
      <div className="pointer-events-none absolute right-[-70px] bottom-[-80px] h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,_rgba(0,181,150,0.92)_0%,_rgba(0,181,150,0.28)_55%,_rgba(0,181,150,0)_100%)] blur-[22px]" />
      <div className="pointer-events-none absolute left-[20px] top-[40px] h-[200px] w-[420px] bg-white/50 blur-[52px]" />

      <header className="relative z-10 w-full shrink-0">
        <div className="mx-auto w-full max-w-[1512px] px-[24px] pt-[20px] flex items-start justify-between">
          <div className="h-[60px] w-[74px] relative shrink-0">
            <Image
              src="/branding/logo-placeholder.svg"
              alt="Логотип"
              fill
              sizes="74px"
              className="object-contain"
              priority
            />
          </div>

          {!hideHeaderTitle ? (
            <h1 className="absolute left-1/2 top-[28px] -translate-x-1/2 whitespace-nowrap text-[38px] leading-none font-extrabold text-[#8C8C8C]">
              Профиль Успеха
            </h1>
          ) : null}

          <div className="flex shrink-0 items-start gap-2">
            {showExitTest ? <TestExitControl /> : null}
            <div className="relative h-[72px] w-[72px]">
              <Image
                src="/branding/faq-icon.svg"
                alt="FAQ"
                fill
                sizes="72px"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex w-full flex-1 flex-col">{children}</main>
    </div>
  );
}
