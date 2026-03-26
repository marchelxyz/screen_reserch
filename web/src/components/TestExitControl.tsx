"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useFormStore } from "@/store/useFormStore";

/**
 * Кнопка выхода из теста: сбрасывает сессию и ответы, переход на главную.
 */
export function TestExitControl(): React.ReactElement {
  const router = useRouter();
  const leaveTestSession = useFormStore((s) => s.leaveTestSession);

  function handleExit(): void {
    leaveTestSession();
    router.push("/");
  }

  return (
    <button
      type="button"
      onClick={handleExit}
      className="rounded-full border border-black/10 bg-white/80 px-3 py-1.5 text-[13px] font-normal text-[#5F5E5E] shadow-sm backdrop-blur transition hover:bg-white"
    >
      Выйти из теста
    </button>
  );
}
