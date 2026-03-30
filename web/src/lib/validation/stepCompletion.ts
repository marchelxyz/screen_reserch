import { KOT_STEP_QUESTION_COUNT } from "@/lib/kot/step1Types";
import { isGerchikovStep2Complete } from "@/lib/gerchikov/validation";
import type {
  Step1Data,
  Step2Data,
  Step3Data,
  Step4Data,
} from "@/store/useFormStore";

export function isStep1Complete(data: Step1Data): boolean {
  for (let i = 1; i <= KOT_STEP_QUESTION_COUNT; i += 1) {
    const key = `q${String(i)}` as keyof Step1Data;
    const v = data[key];
    if (v === null || v === undefined || String(v).trim() === "") {
      return false;
    }
  }
  return true;
}

export function isStep3Complete(data: Step3Data): boolean {
  return Boolean(
    data.q1 &&
      data.q2 &&
      data.q3 &&
      data.q4 &&
      data.q5 &&
      data.q6 &&
      data.q7 &&
      data.q8 &&
      data.q9 &&
      data.q10
  );
}

export function isStep4Complete(data: Step4Data): boolean {
  return (
    data.city.trim().length > 0 &&
    data.familyStatus.trim().length > 0 &&
    data.children.trim().length > 0 &&
    data.education.trim().length > 0 &&
    data.favoriteBook.trim().length > 0 &&
    data.favoriteFilm.trim().length > 0 &&
    data.hobby.trim().length > 0 &&
    data.favoriteMusic.trim().length > 0 &&
    data.leisureTime.trim().length > 0 &&
    data.lifeMotto.trim().length > 0
  );
}

/**
 * Все шаги заполнены по правилам UI — можно отправлять на сервер.
 */
export function isFullScreeningPayloadComplete(
  step1: Step1Data,
  step2: Step2Data,
  step3: Step3Data,
  step4: Step4Data
): boolean {
  return (
    isStep1Complete(step1) &&
    isGerchikovStep2Complete(step2) &&
    isStep3Complete(step3) &&
    isStep4Complete(step4)
  );
}
