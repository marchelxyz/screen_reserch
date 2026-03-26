import React from "react";
import { HelpCircle } from "lucide-react";

export type StepLayoutProps = {
  children: React.ReactNode;
};

export function StepLayout({ children }: StepLayoutProps): React.ReactElement {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="w-full px-4 pt-6">
        <div className="mx-auto w-full max-w-3xl flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/70 backdrop-blur border border-black/5 shadow-sm flex items-center justify-center text-foreground font-bold">
              Л
            </div>
            <div className="hidden sm:block text-sm text-foreground/80">
              Логотип-заглушка
            </div>
          </div>

          <button
            type="button"
            className="rounded-full p-2 bg-white/70 backdrop-blur border border-black/5 shadow-sm transition hover:bg-white/90"
            aria-label="FAQ"
          >
            <HelpCircle className="text-foreground" size={20} />
          </button>
        </div>
      </header>

      <main className="flex flex-1 w-full">{children}</main>
    </div>
  );
}

