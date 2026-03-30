"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GerchikovStep2Data } from "@/lib/gerchikov/step2Types";
import {
  createEmptyKotStep1Data,
  type KotStep1Data,
} from "@/lib/kot/step1Types";
import { clientSessionRef, screeningClientLog } from "@/lib/logging/screeningClientLog";
import {
  getStep1AnsweredCount,
  getStep2AnsweredCount,
  getStep3AnsweredCount,
  getStep4AnsweredCount,
} from "@/lib/progress";
import { isFullScreeningPayloadComplete } from "@/lib/validation/stepCompletion";
import { generateSessionId } from "@/lib/sessionId";

/** Шаг 1: официальный КОТ (50 заданий), ответы строками. */
export type Step1Data = KotStep1Data;

/** Опросник мотивации (методика Герчикова), шаг 2. */
export type Step2Data = GerchikovStep2Data;

export type LikertAnswer =
  | "fully_agree"
  | "agree"
  | "neutral"
  | "disagree"
  | "fully_disagree";

export type Step3Data = {
  q1: LikertAnswer | null;
  q2: LikertAnswer | null;
  q3: LikertAnswer | null;
  q4: LikertAnswer | null;
  q5: LikertAnswer | null;
  q6: LikertAnswer | null;
  q7: LikertAnswer | null;
  q8: LikertAnswer | null;
  q9: LikertAnswer | null;
  q10: LikertAnswer | null;
};

export type Step4Data = {
  city: string;
  familyStatus: string;
  children: string;
  education: string;
  favoriteBook: string;
  favoriteFilm: string;
  /** Доп. поля профиля (свободный ответ). */
  hobby: string;
  favoriteMusic: string;
  leisureTime: string;
  lifeMotto: string;
};

export type SubmissionStatus = "idle" | "submitting" | "submitted" | "error";

export type SubmitPayload = {
  sessionId: string;
  profileName: string;
  personalDataConsent: boolean;
  /** ISO 8601 (UTC), момент установки галочки согласия на intro. */
  consentRecordedAt: string;
  step1Data: Step1Data;
  step2Data: Step2Data;
  step3Data: Step3Data;
  step4Data: Step4Data;
};

type FormStore = {
  /** Активная сессия прохождения теста; создаётся при переходе с intro на шаг 1. */
  sessionId: string | null;
  profileName: string;
  personalDataConsent: boolean;
  /** ISO 8601 (UTC), выставляется при personalDataConsent === true, сбрасывается при снятии галочки. */
  consentRecordedAt: string | null;
  step1Data: Step1Data;
  step2Data: Step2Data;
  step3Data: Step3Data;
  step4Data: Step4Data;

  submissionStatus: SubmissionStatus;
  submitError: string | null;

  setProfileName: (name: string) => void;
  setPersonalDataConsent: (consent: boolean) => void;
  setStep1Data: (data: Step1Data) => void;
  setStep2Data: (data: Step2Data) => void;
  setStep3Data: (data: Step3Data) => void;
  setStep4Data: (data: Step4Data) => void;

  /** Удаляет ответы анкеты из памяти и persisted state (после успешной отправки). */
  clearSensitiveFormData: () => void;

  /** Новая сессия и сброс ответов — при нажатии «Продолжить» на intro. */
  beginTestSession: () => void;
  /** Завершить сессию на клиенте после успешной отправки (ответы остаются для экрана «Спасибо»). */
  closeSessionAfterSubmit: () => void;
  /** Выход из теста: сброс сессии и ответов; имя и согласие сохраняются. */
  leaveTestSession: () => void;
  /** Полный сброс после завершения (кнопка «На главную»). */
  resetAfterTestFlow: () => void;

  submitData: () => Promise<void>;
};

const defaultStep1Data: Step1Data = createEmptyKotStep1Data();

const defaultStep2Data: Step2Data = {
  q1: [],
  q2: null,
  q3: [],
  q4: [],
  q5: [],
  q6: null,
  q7: null,
  q8: null,
  q9: null,
  q10: null,
  q11: null,
  q12: null,
  q13: null,
  q14: null,
  q15: null,
  q16: [],
  q17: [],
  q18: [],
  q19: [],
  q20: [],
  q21: [],
  isLeader: null,
  q22: [],
  q23: [],
};

const defaultStep3Data: Step3Data = {
  q1: null,
  q2: null,
  q3: null,
  q4: null,
  q5: null,
  q6: null,
  q7: null,
  q8: null,
  q9: null,
  q10: null,
};

const defaultStep4Data: Step4Data = {
  city: "",
  familyStatus: "",
  children: "",
  education: "",
  favoriteBook: "",
  favoriteFilm: "",
  hobby: "",
  favoriteMusic: "",
  leisureTime: "",
  lifeMotto: "",
};

function resetStepAnswers(): Pick<
  FormStore,
  "step1Data" | "step2Data" | "step3Data" | "step4Data"
> {
  return {
    step1Data: { ...defaultStep1Data },
    step2Data: { ...defaultStep2Data },
    step3Data: { ...defaultStep3Data },
    step4Data: { ...defaultStep4Data },
  };
}

export const useFormStore = create<FormStore>()(
  persist(
    (set, get) => ({
      sessionId: null,
      profileName: "",
      personalDataConsent: false,
      consentRecordedAt: null,
      step1Data: defaultStep1Data,
      step2Data: defaultStep2Data,
      step3Data: defaultStep3Data,
      step4Data: defaultStep4Data,

      submissionStatus: "idle",
      submitError: null,

      setProfileName: (name) => set({ profileName: name }),
      setPersonalDataConsent: (consent) =>
        set({
          personalDataConsent: consent,
          consentRecordedAt: consent ? new Date().toISOString() : null,
        }),
      setStep1Data: (data) => set({ step1Data: data }),
      setStep2Data: (data) => set({ step2Data: data }),
      setStep3Data: (data) => set({ step3Data: data }),
      setStep4Data: (data) => set({ step4Data: data }),

      clearSensitiveFormData: () =>
        set({
          step1Data: { ...defaultStep1Data },
          step2Data: { ...defaultStep2Data },
          step3Data: { ...defaultStep3Data },
          step4Data: { ...defaultStep4Data },
        }),

      beginTestSession: () => {
        const sessionId = generateSessionId();
        screeningClientLog("session_begin", {
          sessionRef: clientSessionRef(sessionId) ?? "none",
        });
        set({
          sessionId,
          ...resetStepAnswers(),
          submissionStatus: "idle",
          submitError: null,
        });
      },

      closeSessionAfterSubmit: () => set({ sessionId: null }),

      leaveTestSession: () => {
        const prevId = get().sessionId;
        screeningClientLog("session_leave", {
          sessionRef: clientSessionRef(prevId) ?? "none",
        });
        set({
          sessionId: null,
          ...resetStepAnswers(),
          submissionStatus: "idle",
          submitError: null,
        });
      },

      resetAfterTestFlow: () => {
        const prevId = get().sessionId;
        screeningClientLog("session_reset_after_flow", {
          sessionRef: clientSessionRef(prevId) ?? "none",
        });
        set({
          sessionId: null,
          ...resetStepAnswers(),
          submissionStatus: "idle",
          submitError: null,
        });
      },

      submitData: async () => {
        const state = get();
        const sessionRef = clientSessionRef(state.sessionId) ?? "none";
        if (
          state.submissionStatus === "submitting" ||
          state.submissionStatus === "submitted"
        ) {
          screeningClientLog("submit_skipped_already_final", {
            sessionRef,
            status: state.submissionStatus,
          });
          return;
        }

        if (!state.sessionId) {
          screeningClientLog("submit_blocked_no_session", { sessionRef: "none" });
          set({
            submissionStatus: "error",
            submitError: "Сессия не найдена. Начните тест с экрана ввода имени.",
          });
          return;
        }

        if (
          !state.consentRecordedAt ||
          state.consentRecordedAt.trim().length === 0
        ) {
          screeningClientLog("submit_blocked_no_consent", { sessionRef });
          set({
            submissionStatus: "error",
            submitError:
              "Не зафиксировано согласие с политикой. Вернитесь на экран ввода имени и примите политику.",
          });
          return;
        }

        if (
          !isFullScreeningPayloadComplete(
            state.step1Data,
            state.step2Data,
            state.step3Data,
            state.step4Data
          )
        ) {
          screeningClientLog("submit_blocked_incomplete", {
            sessionRef,
            step1Answered: getStep1AnsweredCount(state.step1Data),
            step2Answered: getStep2AnsweredCount(state.step2Data),
            step3Answered: getStep3AnsweredCount(state.step3Data),
            step4Answered: getStep4AnsweredCount(state.step4Data),
          });
          set({
            submissionStatus: "error",
            submitError: "Анкета заполнена не полностью.",
          });
          return;
        }

        set({ submissionStatus: "submitting", submitError: null });

        const payload: SubmitPayload = {
          sessionId: state.sessionId,
          profileName: state.profileName,
          personalDataConsent: state.personalDataConsent,
          consentRecordedAt: state.consentRecordedAt,
          step1Data: state.step1Data,
          step2Data: state.step2Data,
          step3Data: state.step3Data,
          step4Data: state.step4Data,
        };

        screeningClientLog("submit_fetch_start", {
          sessionRef,
        });

        const fetchStarted =
          typeof performance !== "undefined" ? performance.now() : Date.now();

        try {
          const response = await fetch("/api/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          const durationMs =
            typeof performance !== "undefined"
              ? Math.round(performance.now() - fetchStarted)
              : 0;

          screeningClientLog("submit_fetch_done", {
            sessionRef,
            httpStatus: response.status,
            ok: response.ok,
            durationMs,
          });

          if (!response.ok) {
            let message = `Ошибка ${String(response.status)}`;
            try {
              const body = (await response.json()) as { error?: string };
              if (body.error) {
                message = body.error;
              }
            } catch {
              /* игнорируем невалидный JSON */
            }
            screeningClientLog("submit_server_error", {
              sessionRef,
              httpStatus: response.status,
            });
            throw new Error(message);
          }

          screeningClientLog("submit_success_client", { sessionRef, durationMs });
          set({ submissionStatus: "submitted" });
          get().clearSensitiveFormData();
          get().closeSessionAfterSubmit();
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Неизвестная ошибка";
          screeningClientLog("submit_client_exception", {
            sessionRef,
            errorName: error instanceof Error ? error.name : "unknown",
          });
          set({ submissionStatus: "error", submitError: message });
        }
      },
    }),
    {
      name: "profile-uspese-form-v10-kot50",
      partialize: (state) => ({
        sessionId: state.sessionId,
        profileName: state.profileName,
        personalDataConsent: state.personalDataConsent,
        consentRecordedAt: state.consentRecordedAt,
        step1Data: state.step1Data,
        step2Data: state.step2Data,
        step3Data: state.step3Data,
        step4Data: state.step4Data,
        submissionStatus: state.submissionStatus,
        submitError: state.submitError,
      }),
      skipHydration: true,
    }
  )
);

