"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { StepLayout } from "@/components/StepLayout";
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
  const step4Data = useFormStore((s) => s.step4Data);
  const submissionStatus = useFormStore((s) => s.submissionStatus);
  const submitError = useFormStore((s) => s.submitError);
  const submitData = useFormStore((s) => s.submitData);

  useEffect(() => {
    if (!isStep4Complete(step4Data)) {
      router.replace("/step-4");
    }
  }, [router, step4Data]);

  useEffect(() => {
    if (submissionStatus === "idle") {
      void submitData();
    }
  }, [submitData, submissionStatus]);

  return (
    <StepLayout>
      <div className="mx-auto w-full max-w-2xl px-4 py-10">
        <div className="rounded-3xl border border-black/5 bg-white/70 backdrop-blur shadow-sm p-6 sm:p-10 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Большое спасибо, с вами свяжется HR в течение суток
          </h1>

          <p className="mt-4 text-sm sm:text-base text-foreground/70">
            Мы уже отправили ваши ответы на сервер. Если вы видите сообщение
            об ошибке, попробуйте отправить еще раз.
          </p>

          {getStatusText(submissionStatus) ? (
            <p className="mt-5 text-sm text-foreground/60">
              {getStatusText(submissionStatus)}
            </p>
          ) : null}

          {submissionStatus === "error" && submitError ? (
            <p className="mt-2 text-xs text-foreground/50">{submitError}</p>
          ) : null}

          {submissionStatus === "error" ? (
            <div className="mt-7 flex justify-center">
              <Button onClick={() => void submitData()} className="w-full sm:w-auto px-10">
                Повторить отправку
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </StepLayout>
  );
}

