import React from "react";
import Image from "next/image";

export type StepLayoutProps = {
  children: React.ReactNode;
  hideHeaderTitle?: boolean;
};

/**
 * Shared shell for every screen.
 * All content is capped at 1512px (≈16" MacBook) — only the
 * background area grows beyond that.  Logo, title, FAQ icon and the
 * green blob keep fixed pixel sizes regardless of viewport.
 */
export function StepLayout({
  children,
  hideHeaderTitle = false,
}: StepLayoutProps): React.ReactElement {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#F2F2F2] overflow-hidden">
      {/* ── green gradient blob (bottom-right, partially off-screen) ── */}
      <div className="pointer-events-none absolute right-[-90px] bottom-[-100px] h-[672px] w-[672px] rounded-full bg-[radial-gradient(circle,_rgba(0,181,150,0.92)_0%,_rgba(0,181,150,0.28)_55%,_rgba(0,181,150,0)_100%)] blur-[22px]" />

      {/* ── subtle white glow (upper area, glass feel) ── */}
      <div className="pointer-events-none absolute left-[30px] top-[60px] h-[260px] w-[520px] bg-white/50 blur-[52px]" />

      {/* ── header ── */}
      <header className="relative z-10 w-full">
        <div className="mx-auto w-full max-w-[1512px] px-[31px] pt-[39px] flex items-start justify-between">
          {/* logo */}
          <div className="h-[81px] w-[100px] relative shrink-0">
            <Image
              src="/branding/logo-placeholder.svg"
              alt="Логотип"
              fill
              sizes="100px"
              className="object-contain"
              priority
            />
          </div>

          {/* title — centred in viewport */}
          {!hideHeaderTitle ? (
            <h1 className="absolute left-1/2 top-[63px] -translate-x-1/2 whitespace-nowrap text-[49px] leading-none font-extrabold text-[#8C8C8C]">
              Профиль Успеха
            </h1>
          ) : null}

          {/* FAQ icon */}
          <div className="relative mt-0 h-[105px] w-[105px] shrink-0">
            <Image
              src="/branding/faq-icon.svg"
              alt="FAQ"
              fill
              sizes="105px"
              className="object-contain"
            />
          </div>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 w-full">{children}</main>
    </div>
  );
}
