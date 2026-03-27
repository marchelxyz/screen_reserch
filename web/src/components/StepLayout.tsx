"use client";

import React from "react";
import Image from "next/image";

export type StepLayoutProps = {
  children: React.ReactNode;
  hideHeaderTitle?: boolean;
};

/**
 * Общая оболочка экранов.
 * Контент по ширине ограничен max-w в шапке; фон тянется на всю ширину.
 * Высота по контенту: длинные шаги опроса прокручиваются страницей.
 */
export function StepLayout({
  children,
  hideHeaderTitle = false,
}: StepLayoutProps): React.ReactElement {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#F2F2F2]">
      <div className="pointer-events-none absolute right-[-70px] bottom-[-80px] h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,_rgba(0,181,150,0.92)_0%,_rgba(0,181,150,0.28)_55%,_rgba(0,181,150,0)_100%)] blur-[22px]" />
      <div className="pointer-events-none absolute left-[20px] top-[40px] h-[200px] w-[420px] bg-white/50 blur-[52px]" />

      <header className="relative z-10 w-full shrink-0">
        <div className="mx-auto flex w-full max-w-[1512px] items-start justify-between px-[24px] pt-[20px]">
          <div className="relative h-[60px] w-[74px] shrink-0">
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
            <h1 className="absolute left-1/2 top-[28px] -translate-x-1/2 whitespace-nowrap text-[38px] font-extrabold leading-none text-[#8C8C8C]">
              Профиль Успеха
            </h1>
          ) : null}

          <div className="relative h-[72px] w-[72px] shrink-0">
            <Image
              src="/branding/faq-icon.svg"
              alt="FAQ"
              fill
              sizes="72px"
              className="object-contain"
            />
          </div>
        </div>
      </header>

      <main className="relative z-10 flex w-full flex-1 flex-col">{children}</main>
    </div>
  );
}
