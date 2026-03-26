import React from "react";
import Image from "next/image";

export type StepLayoutProps = {
  children: React.ReactNode;
  hideHeaderTitle?: boolean;
};

export function StepLayout({
  children,
  hideHeaderTitle = false,
}: StepLayoutProps): React.ReactElement {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#F2F2F2] overflow-hidden">
      <div className="pointer-events-none absolute -right-28 bottom-[-130px] h-[520px] w-[760px] bg-[radial-gradient(circle,_rgba(0,181,150,0.95)_0%,_rgba(0,181,150,0.30)_56%,_rgba(0,181,150,0)_100%)] blur-[28px]" />
      <div className="pointer-events-none absolute left-24 top-20 h-[220px] w-[460px] bg-white/55 blur-[48px]" />

      <header className="relative z-10 w-full px-5 pt-5">
        <div className="mx-auto w-full max-w-[1512px] min-h-[76px] flex items-start justify-between">
          <div className="h-[58px] w-[72px] relative">
            <Image
              src="/branding/logo-placeholder.svg"
              alt="Логотип"
              fill
              sizes="72px"
              className="object-contain"
              priority
            />
          </div>

          {!hideHeaderTitle ? (
            <h1 className="absolute left-1/2 top-[14px] -translate-x-1/2 text-[42px] leading-none font-extrabold text-[#8B8B8B]">
              Профиль Успеха
            </h1>
          ) : null}

          <div className="h-[54px] w-[54px] relative">
            <Image
              src="/branding/faq-icon.svg"
              alt="FAQ"
              fill
              sizes="54px"
              className="object-contain"
            />
          </div>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 w-full">{children}</main>
    </div>
  );
}

