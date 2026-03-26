"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { ProgressBar } from "@/components/ProgressBar";
import { StepLayout } from "@/components/StepLayout";
import {
  stepPageContentClass,
  stepSecondaryTextClass,
  stepSurfaceCardClass,
} from "@/lib/stepPageTheme";
import { TOTAL_QUESTIONS_COUNT, getAllAnsweredCount, isProfileReady } from "@/lib/progress";
import { Step4Data, SubmissionStatus, useFormStore } from "@/store/useFormStore";

function isStep4Complete(data: Step4Data): boolean {
  return (
    data.city.trim().length > 0 &&
    data.familyStatus.trim().length > 0 &&
    data.children.trim().length > 0 &&
    data.education.trim().length > 0 &&
    data.favoriteBook.trim().length > 0 &&
    data.favoriteFilm.trim().length > 0
  );
}

function getStatusText(status: SubmissionStatus): string {
  switch (status) {
    case "submitting":
      return "Отправляем данные...";
    case "submitted":
      return "Данные отправлены.";
    case "error":
      return "Не удалось отправить данные. Попробуйте еще раз.";
    case "idle":
    default:
      return "";
  }
}

export default function FinishPage(): React.ReactElement {
  const router = useRouter();
  const profileName = useFormStore((s) => s.profileName);
  const personalDataConsent = useFormStore((s) => s.personalDataConsent);
  const consentRecordedAt = useFormStore((s) => s.consentRecordedAt);
  const step1Data = useFormStore((s) => s.step1Data);
  const step2Data = useFormStore((s) => s.step2Data);
  const step3Data = useFormStore((s) => s.step3Data);
  const step4Data = useFormStore((s) => s.step4Data);
  const submissionStatus = useFormStore((s) => s.submissionStatus);
  const submitError = useFormStore((s) => s.submitError);
  const submitData = useFormStore((s) => s.submitData);
  const resetAfterTestFlow = useFormStore((s) => s.resetAfterTestFlow);
  const answeredCount = getAllAnsweredCount(step1Data, step2Data, step3Data, step4Data);

  useEffect(() => {
    if (!isProfileReady(profileName, personalDataConsent, consentRecordedAt)) {
      router.replace("/intro");
      return;
    }
    if (!isStep4Complete(step4Data) && submissionStatus !== "submitted") {
      router.replace("/step-4");
    }
  }, [consentRecordedAt, personalDataConsent, profileName, router, step4Data, submissionStatus]);

  useEffect(() => {
    if (submissionStatus === "idle") {
      void submitData();
    }
  }, [submitData, submissionStatus]);

  return (
    <StepLayout>
      <div className={stepPageContentClass}>
        <div className={`${stepSurfaceCardClass} px-6 py-8 text-center sm:px-10 sm:py-10`}>
          <div className="mb-6">
            <ProgressBar answeredQuestions={answeredCount} totalQuestions={TOTAL_QUESTIONS_COUNT} />
          </div>
          <h1 className="mb-4 text-balance text-[28px] font-extrabold leading-tight text-[#8C8C8C] sm:text-[32px]">
            {profileName.trim().length > 0 ? `${profileName}, ` : ""}
            большое спасибо, с вами свяжется HR в течение суток
          </h1>

          <p className={`mt-4 ${stepSecondaryTextClass}`}>
            Мы уже отправили ваши ответы на сервер. Если вы видите сообщение
            об ошибке, попробуйте отправить еще раз.
          </p>

          {getStatusText(submissionStatus) ? (
            <p className={`mt-5 ${stepSecondaryTextClass} opacity-90`}>
              {getStatusText(submissionStatus)}
            </p>
          ) : null}

          {submissionStatus === "error" && submitError ? (
            <p className={`mt-2 text-xs ${stepSecondaryTextClass} opacity-75`}>{submitError}</p>
          ) : null}

          {submissionStatus === "error" ? (
            <div className="mt-7 flex justify-center">
              <Button onClick={() => void submitData()} className="w-full sm:w-auto px-10">
                Повторить отправку
              </Button>
            </div>
          ) : null}

          {submissionStatus === "submitted" ? (
            <div className="mt-8 flex justify-center">
              <Button
                variant="secondary"
                onClick={() => {
                  resetAfterTestFlow();
                  router.push("/");
                }}
                className="px-10"
              >
                На главную
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </StepLayout>
  );
}

