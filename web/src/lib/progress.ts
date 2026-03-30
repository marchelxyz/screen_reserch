import { getGerchikovStep2AnsweredCount } from "@/lib/gerchikov/validation";
import { KOT_STEP_QUESTION_COUNT } from "@/lib/kot/step1Types";
import { Step1Data, Step2Data, Step3Data, Step4Data } from "@/store/useFormStore";

/** 30 (КОТ, сокр.) + 23 (Герчиков) + 10 (шаг 3) + 10 (шаг 4). */
export const TOTAL_QUESTIONS_COUNT = 73;

export function getStep1AnsweredCount(data: Step1Data): number {
  let n = 0;
  for (let i = 1; i <= KOT_STEP_QUESTION_COUNT; i += 1) {
    const key = `q${String(i)}` as keyof Step1Data;
    if (data[key] !== null && data[key] !== undefined) {
      n += 1;
    }
  }
  return n;
}

export function getStep2AnsweredCount(data: Step2Data): number {
  return getGerchikovStep2AnsweredCount(data);
}

export function getStep3AnsweredCount(data: Step3Data): number {
  const values = [
    data.q1,
    data.q2,
    data.q3,
    data.q4,
    data.q5,
    data.q6,
    data.q7,
    data.q8,
    data.q9,
    data.q10,
  ];
  return values.filter(Boolean).length;
}

export function getStep4AnsweredCount(data: Step4Data): number {
  const values = [
    data.city,
    data.familyStatus,
    data.children,
    data.education,
    data.favoriteBook,
    data.favoriteFilm,
    data.hobby,
    data.favoriteMusic,
    data.leisureTime,
    data.lifeMotto,
  ];
  return values.filter((value) => value.trim().length > 0).length;
}

export function getAllAnsweredCount(
  step1Data: Step1Data,
  step2Data: Step2Data,
  step3Data: Step3Data,
  step4Data: Step4Data
): number {
  return (
    getStep1AnsweredCount(step1Data) +
    getStep2AnsweredCount(step2Data) +
    getStep3AnsweredCount(step3Data) +
    getStep4AnsweredCount(step4Data)
  );
}

/**
 * Профиль готов к тесту: имя, согласие и зафиксированное время согласия (юридический учёт).
 */
export function isProfileReady(
  profileName: string,
  personalDataConsent: boolean,
  consentRecordedAt: string | null
): boolean {
  return (
    profileName.trim().length > 0 &&
    personalDataConsent &&
    consentRecordedAt !== null &&
    consentRecordedAt.trim().length > 0
  );
}

