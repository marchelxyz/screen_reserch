"use client";

import React from "react";
import { formatSessionCode } from "@/lib/sessionId";

export type SessionHintProps = {
  sessionId: string | null;
};

/**
 * Показывает короткий код активной сессии прохождения теста.
 */
export function SessionHint({ sessionId }: SessionHintProps): React.ReactElement | null {
  if (!sessionId) {
    return null;
  }

  return (
    <p className="text-[13px] font-normal leading-snug text-[#8C8C8C]">
      Код сессии: {formatSessionCode(sessionId)}
    </p>
  );
}
