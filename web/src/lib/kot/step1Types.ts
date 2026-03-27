/**
 * Шаг 1: сокращённый блок в духе КОТ (краткий ориентировочный тест) /
 * Wonderlic — оригинальные формулировки, 30 пунктов вместо 50.
 */

export const KOT_STEP_QUESTION_COUNT = 30;

export type KotQuestionKey =
  | "q1"
  | "q2"
  | "q3"
  | "q4"
  | "q5"
  | "q6"
  | "q7"
  | "q8"
  | "q9"
  | "q10"
  | "q11"
  | "q12"
  | "q13"
  | "q14"
  | "q15"
  | "q16"
  | "q17"
  | "q18"
  | "q19"
  | "q20"
  | "q21"
  | "q22"
  | "q23"
  | "q24"
  | "q25"
  | "q26"
  | "q27"
  | "q28"
  | "q29"
  | "q30";

/** Выбранный вариант ответа: «1»…«4». */
export type KotChoiceId = "1" | "2" | "3" | "4";

export type KotStep1Data = Record<KotQuestionKey, KotChoiceId | null>;

export function createEmptyKotStep1Data(): KotStep1Data {
  const o = {} as Record<string, KotChoiceId | null>;
  for (let i = 1; i <= KOT_STEP_QUESTION_COUNT; i += 1) {
    o[`q${String(i)}`] = null;
  }
  return o as KotStep1Data;
}
