'use client';

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { StepLayout } from "@/components/StepLayout";

export default function WelcomePage(): React.ReactElement {
  const router = useRouter();

  return (
    <StepLayout>
      <div className="flex flex-1 items-center justify-center px-4 pb-10 pt-2">
        <div className="w-full max-w-[1037px] rounded-[38px] bg-[#DCDCDC] shadow-[0px_4px_75px_0px_rgba(0,0,0,0.2)] px-8 py-8 sm:px-10 sm:py-9">
          <div className="text-[#5F5E5E] text-[26px] font-extrabold leading-[1.35]">
            <p>
              Мы ценим ваше время и хотим, чтобы наше дальнейшее общение было
              максимально предметным и полезным для обеих сторон.
            </p>
            <p className="mt-5">
              Просим вас уделить около 30 минут на этот интерактивный опрос.
              <br />
              Он состоит из 4 коротких шагов, которые помогут нам:
            </p>
            <ul className="mt-1 list-disc pl-9">
              <li>Оценить ваш подход к решению нестандартных задач.</li>
              <li>Понять, что вас по-настоящему мотивирует и драйвит.</li>
              <li>Предложить вам позицию и условия, которые идеально подойдут именно вам.</li>
            </ul>
            <p className="mt-5">
              Здесь нет правильных или неправильных ответов - нам важен ваш
              реальный профессиональный стиль. Выделите спокойное время,
              налейте кофе и давайте начнем!
            </p>
          </div>

          <div className="mt-7 flex justify-center">
            <Button
              onClick={() => router.push("/intro")}
              className="h-[64px] w-[340px] text-[40px] font-extrabold tracking-[0.01em] leading-none"
            >
              НАЧАТЬ ЗНАКОМСТВО
            </Button>
          </div>
        </div>
      </div>
    </StepLayout>
  );
}
