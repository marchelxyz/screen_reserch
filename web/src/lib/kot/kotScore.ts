import { KOT_ANSWER_KEYS } from "@/lib/kot/kotAnswerKeys";
import {
  KOT_OFFICIAL_NORM_NOTE,
  lookupKotOfficialIq,
} from "@/lib/kot/kotOfficialNorms";
import type { KotQuestionKey } from "@/lib/kot/step1Types";
import { KOT_STEP_QUESTION_COUNT } from "@/lib/kot/step1Types";
import type { Step1Data } from "@/store/useFormStore";

/**
 * Возвращает число верных ответов по ключу.
 */
export function countKotRawScore(step1: Step1Data): number {
  let correct = 0;
  for (let i = 1; i <= KOT_STEP_QUESTION_COUNT; i += 1) {
    const key = `q${String(i)}` as KotQuestionKey;
    const chosen = step1[key];
    if (chosen !== null && chosen === KOT_ANSWER_KEYS[key]) {
      correct += 1;
    }
  }
  return correct;
}

/**
 * Линейное отображение сырого балла (0…max) в диапазон IQ 70–130 (середина 100 при половине верных).
 * Оставлено для обратной совместимости; для отчётов используйте {@link getKotOfficialIq}.
 */
export function estimateKotIq(rawScore: number, maxScore: number): number {
  if (maxScore <= 0) {
    return 100;
  }
  const iq = 70 + (rawScore / maxScore) * 60;
  return Math.round(Math.min(130, Math.max(70, iq)));
}

/**
 * IQ по таблице норм КОТ (`kotOfficialNorms.ts`) для сырого балла и максимума заданий.
 */
export function getKotOfficialIq(rawScore: number, maxScore: number): number {
  if (maxScore <= 0) {
    return 100;
  }
  return lookupKotOfficialIq(rawScore, maxScore);
}

export function getKotIqNormNote(): string {
  return KOT_OFFICIAL_NORM_NOTE;
}
