"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { ProgressBar } from "@/components/ProgressBar";
import { QuestionCard } from "@/components/QuestionCard";
import { StepLayout } from "@/components/StepLayout";
import { TestMotivation } from "@/components/TestMotivation";
import {
  GERCHIKOV_INTRO_PARAGRAPHS,
  INCOME_BLOCK_HINT,
  INCOME_BLOCK_TITLE,
  INCOME_SCALE,
  INCOME_SUBQUESTIONS,
  Q1,
  Q15,
  Q16,
  Q17,
  Q18,
  Q19,
  Q2,
  Q20,
  Q21,
  Q22,
  Q23,
  Q3,
  Q4,
  Q5,
  type GerchikovOption,
} from "@/lib/gerchikov/questions";
import type { IncomeImportance } from "@/lib/gerchikov/step2Types";
import {
  toggleOptionIdUnlimited,
  toggleOptionIdWithMax,
} from "@/lib/gerchikov/toggleOptionIds";
import { isGerchikovStep2Complete } from "@/lib/gerchikov/validation";
import {
  questionCardSurfaceClass,
  stepNavPrimaryButtonClass,
  stepPageContentClass,
  stepSecondaryTextClass,
} from "@/lib/stepPageTheme";
import { TOTAL_QUESTIONS_COUNT, getAllAnsweredCount, isProfileReady } from "@/lib/progress";
import { setScreeningMaxStepCookie } from "@/lib/screeningProgressCookie";
import { isStep1Complete } from "@/lib/validation/stepCompletion";
import { getContinueButtonLabel } from "@/lib/testMotivation";
import { Step2Data, useFormStore } from "@/store/useFormStore";

type Multi12Props = {
  heading: string;
  hint: string;
  options: GerchikovOption[];
  selected: string[];
  onChange: (next: string[]) => void;
};

function GerchikovMulti12Block({
  heading,
  hint,
  options,
  selected,
  onChange,
}: Multi12Props): React.ReactElement {
  return (
    <QuestionCard title={heading} description={hint}>
      <ul className="space-y-3">
        {options.map((opt) => {
          const checked = selected.includes(opt.id);
          const atMax = selected.length >= 2 && !checked;
          return (
            <li key={opt.id}>
              <label
                className={`flex cursor-pointer items-start gap-3 ${atMax ? "opacity-45" : ""}`}
              >
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 shrink-0 accent-[#00B596]"
                  checked={checked}
                  disabled={atMax}
                  onChange={() => onChange(toggleOptionIdWithMax(selected, opt.id, 2))}
                />
                <span className="leading-snug">{opt.text}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </QuestionCard>
  );
}

type SingleProps = {
  heading: string;
  hint: string;
  name: string;
  options: GerchikovOption[];
  value: string | null;
  onChange: (id: string) => void;
};

function GerchikovSingleBlock({
  heading,
  hint,
  name,
  options,
  value,
  onChange,
}: SingleProps): React.ReactElement {
  return (
    <QuestionCard title={heading} description={hint}>
      <ul className="space-y-3">
        {options.map((opt) => (
          <li key={opt.id}>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="radio"
                className="mt-1 h-4 w-4 shrink-0 accent-[#00B596]"
                name={name}
                checked={value === opt.id}
                onChange={() => onChange(opt.id)}
              />
              <span className="leading-snug">{opt.text}</span>
            </label>
          </li>
        ))}
      </ul>
    </QuestionCard>
  );
}

type IncomeBlockProps = {
  values: Record<
    "q6" | "q7" | "q8" | "q9" | "q10" | "q11" | "q12" | "q13" | "q14",
    IncomeImportance | null
  >;
  onIncomeChange: (
    key: "q6" | "q7" | "q8" | "q9" | "q10" | "q11" | "q12" | "q13" | "q14",
    value: IncomeImportance
  ) => void;
};

function GerchikovIncomeBlock({ values, onIncomeChange }: IncomeBlockProps): React.ReactElement {
  return (
    <QuestionCard title="Вопросы 6–14" description={INCOME_BLOCK_HINT}>
      <p className="mb-5 font-semibold leading-snug text-[#5F5E5E]">{INCOME_BLOCK_TITLE}</p>
      <ul className="space-y-6">
        {INCOME_SUBQUESTIONS.map((row) => (
          <li key={row.key}>
            <p className="mb-2 font-semibold leading-snug text-[#5F5E5E]">{row.title}</p>
            <div className="flex flex-wrap gap-4">
              {INCOME_SCALE.map((opt) => (
                <label key={opt.value} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    className="h-4 w-4 accent-[#00B596]"
                    name={`income-${row.key}`}
                    checked={values[row.key] === opt.value}
                    onChange={() => onIncomeChange(row.key, opt.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </QuestionCard>
  );
}

type MultiUnlimitedProps = {
  heading: string;
  hint: string;
  options: GerchikovOption[];
  selected: string[];
  onChange: (next: string[]) => void;
};

function GerchikovMultiUnlimitedBlock({
  heading,
  hint,
  options,
  selected,
  onChange,
}: MultiUnlimitedProps): React.ReactElement {
  return (
    <QuestionCard title={heading} description={hint}>
      <ul className="space-y-3">
        {options.map((opt) => {
          const checked = selected.includes(opt.id);
          return (
            <li key={opt.id}>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 shrink-0 accent-[#00B596]"
                  checked={checked}
                  onChange={() => onChange(toggleOptionIdUnlimited(selected, opt.id))}
                />
                <span className="leading-snug">{opt.text}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </QuestionCard>
  );
}

type LeaderBranchProps = {
  step2Data: Step2Data;
  setStep2Data: (data: Step2Data) => void;
};

function GerchikovLeaderBranch({ step2Data, setStep2Data }: LeaderBranchProps): React.ReactElement {
  return (
    <>
      <QuestionCard
        title="Вопросы 22 и 23"
        description="Ответьте только на один из двух вопросов ниже — в зависимости от того, являетесь ли Вы руководителем."
      >
        <fieldset className="space-y-3">
          <legend className={`mb-3 ${stepSecondaryTextClass}`}>
            Вы руководитель (руководите людьми или подразделением)?
          </legend>
          <div className="flex flex-wrap gap-6">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                className="h-4 w-4 accent-[#00B596]"
                name="gerchikov-leader"
                checked={step2Data.isLeader === true}
                onChange={() =>
                  setStep2Data({
                    ...step2Data,
                    isLeader: true,
                    q23: [],
                  })
                }
              />
              <span>Да</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                className="h-4 w-4 accent-[#00B596]"
                name="gerchikov-leader"
                checked={step2Data.isLeader === false}
                onChange={() =>
                  setStep2Data({
                    ...step2Data,
                    isLeader: false,
                    q22: [],
                  })
                }
              />
              <span>Нет</span>
            </label>
          </div>
        </fieldset>
      </QuestionCard>

      {step2Data.isLeader === true ? (
        <GerchikovMulti12Block
          heading={`Вопрос 22. ${Q22.title}`}
          hint={Q22.hint}
          options={Q22.options}
          selected={step2Data.q22}
          onChange={(next) => setStep2Data({ ...step2Data, q22: next })}
        />
      ) : null}

      {step2Data.isLeader === false ? (
        <GerchikovMulti12Block
          heading={`Вопрос 23. ${Q23.title}`}
          hint={Q23.hint}
          options={Q23.options}
          selected={step2Data.q23}
          onChange={(next) => setStep2Data({ ...step2Data, q23: next })}
        />
      ) : null}
    </>
  );
}

export default function Step2Page(): React.ReactElement {
  const router = useRouter();
  const profileName = useFormStore((s) => s.profileName);
  const personalDataConsent = useFormStore((s) => s.personalDataConsent);
  const consentRecordedAt = useFormStore((s) => s.consentRecordedAt);
  const sessionId = useFormStore((s) => s.sessionId);
  const step1Data = useFormStore((s) => s.step1Data);
  const step2Data = useFormStore((s) => s.step2Data);
  const step3Data = useFormStore((s) => s.step3Data);
  const step4Data = useFormStore((s) => s.step4Data);
  const setStep2Data = useFormStore((s) => s.setStep2Data);

  useEffect(() => {
    if (!isProfileReady(profileName, personalDataConsent, consentRecordedAt)) {
      router.replace("/intro");
      return;
    }
    if (!sessionId) {
      router.replace("/briefing");
      return;
    }
    if (!isStep1Complete(step1Data)) {
      router.replace("/step-1");
    }
  }, [consentRecordedAt, personalDataConsent, profileName, router, sessionId, step1Data]);

  useEffect(() => {
    setScreeningMaxStepCookie(2);
  }, []);

  const complete = isGerchikovStep2Complete(step2Data);
  const answeredCount = getAllAnsweredCount(step1Data, step2Data, step3Data, step4Data);
  const continueLabel = getContinueButtonLabel(answeredCount);

  function patchIncome(
    key: "q6" | "q7" | "q8" | "q9" | "q10" | "q11" | "q12" | "q13" | "q14",
    value: IncomeImportance
  ): void {
    setStep2Data({ ...step2Data, [key]: value });
  }

  return (
    <StepLayout>
      <div className={stepPageContentClass}>
        <div className="mb-2">
          <ProgressBar answeredQuestions={answeredCount} totalQuestions={TOTAL_QUESTIONS_COUNT} />
          <TestMotivation profileName={profileName} answeredCount={answeredCount} />
        </div>

        <section className={`${questionCardSurfaceClass} mb-4 p-6 sm:px-8 sm:py-6`}>
          <div className={`space-y-2 ${stepSecondaryTextClass}`}>
            {GERCHIKOV_INTRO_PARAGRAPHS.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </section>

        <div className="space-y-4">
          <GerchikovMulti12Block
            heading={`Вопрос 1. ${Q1.title}`}
            hint={Q1.hint}
            options={Q1.options}
            selected={step2Data.q1}
            onChange={(next) => setStep2Data({ ...step2Data, q1: next })}
          />

          <GerchikovSingleBlock
            heading={`Вопрос 2. ${Q2.title}`}
            hint={Q2.hint}
            name="gerchikov-q2"
            options={Q2.options}
            value={step2Data.q2}
            onChange={(id) => setStep2Data({ ...step2Data, q2: id })}
          />

          <GerchikovMulti12Block
            heading={`Вопрос 3. ${Q3.title}`}
            hint={Q3.hint}
            options={Q3.options}
            selected={step2Data.q3}
            onChange={(next) => setStep2Data({ ...step2Data, q3: next })}
          />

          <GerchikovMulti12Block
            heading={`Вопрос 4. ${Q4.title}`}
            hint={Q4.hint}
            options={Q4.options}
            selected={step2Data.q4}
            onChange={(next) => setStep2Data({ ...step2Data, q4: next })}
          />

          <GerchikovMulti12Block
            heading={`Вопрос 5. ${Q5.title}`}
            hint={Q5.hint}
            options={Q5.options}
            selected={step2Data.q5}
            onChange={(next) => setStep2Data({ ...step2Data, q5: next })}
          />

          <GerchikovIncomeBlock
            values={{
              q6: step2Data.q6,
              q7: step2Data.q7,
              q8: step2Data.q8,
              q9: step2Data.q9,
              q10: step2Data.q10,
              q11: step2Data.q11,
              q12: step2Data.q12,
              q13: step2Data.q13,
              q14: step2Data.q14,
            }}
            onIncomeChange={patchIncome}
          />

          <GerchikovSingleBlock
            heading={`Вопрос 15. ${Q15.title}`}
            hint={Q15.hint}
            name="gerchikov-q15"
            options={Q15.options}
            value={step2Data.q15}
            onChange={(id) => setStep2Data({ ...step2Data, q15: id })}
          />

          <GerchikovMulti12Block
            heading={`Вопрос 16. ${Q16.title}`}
            hint={Q16.hint}
            options={Q16.options}
            selected={step2Data.q16}
            onChange={(next) => setStep2Data({ ...step2Data, q16: next })}
          />

          <GerchikovMulti12Block
            heading={`Вопрос 17. ${Q17.title}`}
            hint={Q17.hint}
            options={Q17.options}
            selected={step2Data.q17}
            onChange={(next) => setStep2Data({ ...step2Data, q17: next })}
          />

          <GerchikovMulti12Block
            heading={`Вопрос 18. ${Q18.title}`}
            hint={Q18.hint}
            options={Q18.options}
            selected={step2Data.q18}
            onChange={(next) => setStep2Data({ ...step2Data, q18: next })}
          />

          <GerchikovMulti12Block
            heading={`Вопрос 19. ${Q19.title}`}
            hint={Q19.hint}
            options={Q19.options}
            selected={step2Data.q19}
            onChange={(next) => setStep2Data({ ...step2Data, q19: next })}
          />

          <GerchikovMulti12Block
            heading={`Вопрос 20. ${Q20.title}`}
            hint={Q20.hint}
            options={Q20.options}
            selected={step2Data.q20}
            onChange={(next) => setStep2Data({ ...step2Data, q20: next })}
          />

          <GerchikovMultiUnlimitedBlock
            heading={`Вопрос 21. ${Q21.title}`}
            hint={Q21.hint}
            options={Q21.options}
            selected={step2Data.q21}
            onChange={(next) => setStep2Data({ ...step2Data, q21: next })}
          />

          <GerchikovLeaderBranch step2Data={step2Data} setStep2Data={setStep2Data} />
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="secondary"
            onClick={() => router.push("/step-1")}
            className="w-[160px]"
          >
            Назад
          </Button>

          <Button
            disabled={!complete}
            onClick={() => {
              setScreeningMaxStepCookie(3);
              router.push("/step-3");
            }}
            className={stepNavPrimaryButtonClass}
          >
            {continueLabel}
          </Button>
        </div>
      </div>
    </StepLayout>
  );
}
