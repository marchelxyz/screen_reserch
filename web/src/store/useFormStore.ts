"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Step1Data = {
  q1: string | null;
  q2: string | null;
  q3: string | null;
  q4: string | null;
  q5: string | null;
};

export type Step2Data = {
  s1: boolean | null;
  s2: boolean | null;
  s3: boolean | null;
  s4: boolean | null;
  s5: boolean | null;
  s6: boolean | null;
  s7: boolean | null;
  s8: boolean | null;
};

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
};

export type SubmissionStatus = "idle" | "submitting" | "submitted" | "error";

export type SubmitPayload = {
  profileName: string;
  personalDataConsent: boolean;
  step1Data: Step1Data;
  step2Data: Step2Data;
  step3Data: Step3Data;
  step4Data: Step4Data;
};

type FormStore = {
  profileName: string;
  personalDataConsent: boolean;
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

  submitData: () => Promise<void>;
};

const defaultStep1Data: Step1Data = {
  q1: null,
  q2: null,
  q3: null,
  q4: null,
  q5: null,
};

const defaultStep2Data: Step2Data = {
  s1: null,
  s2: null,
  s3: null,
  s4: null,
  s5: null,
  s6: null,
  s7: null,
  s8: null,
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
};

export const useFormStore = create<FormStore>()(
  persist(
    (set, get) => ({
      profileName: "",
      personalDataConsent: false,
      step1Data: defaultStep1Data,
      step2Data: defaultStep2Data,
      step3Data: defaultStep3Data,
      step4Data: defaultStep4Data,

      submissionStatus: "idle",
      submitError: null,

      setProfileName: (name) => set({ profileName: name }),
      setPersonalDataConsent: (consent) => set({ personalDataConsent: consent }),
      setStep1Data: (data) => set({ step1Data: data }),
      setStep2Data: (data) => set({ step2Data: data }),
      setStep3Data: (data) => set({ step3Data: data }),
      setStep4Data: (data) => set({ step4Data: data }),

      submitData: async () => {
        const state = get();
        if (
          state.submissionStatus === "submitting" ||
          state.submissionStatus === "submitted"
        ) {
          return;
        }

        set({ submissionStatus: "submitting", submitError: null });

        const payload: SubmitPayload = {
          profileName: state.profileName,
          personalDataConsent: state.personalDataConsent,
          step1Data: state.step1Data,
          step2Data: state.step2Data,
          step3Data: state.step3Data,
          step4Data: state.step4Data,
        };

        try {
          const response = await fetch("/api/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          // TODO: обработка результата (например, id кандидата).
          set({ submissionStatus: "submitted" });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          set({ submissionStatus: "error", submitError: message });
        }
      },
    }),
    {
      name: "profile-uspese-form",
      partialize: (state) => ({
        profileName: state.profileName,
        personalDataConsent: state.personalDataConsent,
        step1Data: state.step1Data,
        step2Data: state.step2Data,
        step3Data: state.step3Data,
        step4Data: state.step4Data,
      }),
      skipHydration: true,
    }
  )
);

