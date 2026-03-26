import { Step1Data, Step2Data, Step3Data, Step4Data } from "@/store/useFormStore";

export const TOTAL_QUESTIONS_COUNT = 29;

export function getStep1AnsweredCount(data: Step1Data): number {
  const values = [data.q1, data.q2, data.q3, data.q4, data.q5];
  return values.filter(Boolean).length;
}

export function getStep2AnsweredCount(data: Step2Data): number {
  const values = [data.s1, data.s2, data.s3, data.s4, data.s5, data.s6, data.s7, data.s8];
  return values.filter((value) => value !== null).length;
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

