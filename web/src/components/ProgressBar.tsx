import React from "react";

export type ProgressBarProps = {
  totalSteps: number;
  activeStep: number; // 0..totalSteps
};

function getSegmentClass(isFilled: boolean, isActive: boolean): string {
  if (isActive) return "bg-gradient-to-r from-[#00BFA5] to-[#00D4B8]";
  if (isFilled) return "bg-[#00BFA5]";
  return "bg-black/10";
}

export function ProgressBar({
  totalSteps,
  activeStep,
}: ProgressBarProps): React.ReactElement {
  const steps = Array.from({ length: totalSteps }, (_, idx) => idx + 1);

  return (
    <div className="w-full" aria-label="Прогресс опроса">
      <div className="flex h-2 gap-2">
        {steps.map((step) => {
          const isFilled = step < activeStep;
          const isActive = step === activeStep;

          return (
            <div
              key={step}
              className={`h-2 flex-1 rounded-full ${getSegmentClass(
                isFilled,
                isActive
              )}`}
              role="progressbar"
              aria-valuenow={Math.min(activeStep, totalSteps)}
              aria-valuemin={0}
              aria-valuemax={totalSteps}
            />
          );
        })}
      </div>
    </div>
  );
}

