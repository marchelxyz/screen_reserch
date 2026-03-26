import React from "react";
import Image from "next/image";

export type StepLayoutProps = {
  children: React.ReactNode;
  hideHeaderTitle?: boolean;
};

/**
 * Shared shell for every screen.
 * Content capped at 1512px (16" MacBook) — only the background grows beyond.
 * Welcome page must fit entirely in viewport without scrolling on 14–16".
 */
export function StepLayout({
  children,
  hideHeaderTitle = false,
}: StepLayoutProps): React.ReactElement {
  return (
    <div className="relative h-screen flex flex-col bg-[#F2F2F2] overflow-hidden">
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

      <main className="relative z-10 flex flex-1 w-full min-h-0">{children}</main>
    </div>
  );
}
