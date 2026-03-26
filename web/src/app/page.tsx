'use client';

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { StepLayout } from "@/components/StepLayout";

export default function WelcomePage(): React.ReactElement {
  const router = useRouter();

  return (
    <StepLayout>
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-[860px] rounded-[34px] bg-[#DDDDDD] shadow-[0px_4px_75px_0px_rgba(0,0,0,0.20)] px-[48px] py-[24px]">
          <div className="text-[#5F5E5E] text-[20px] font-extrabold leading-[1.4]">
            <p>
              Мы ценим ваше время и хотим, чтобы наше дальнейшее общение
              было максимально предметным и полезным для обеих сторон.
            </p>
            <br />
            <p>
              Просим вас уделить около 30 минут на этот интерактивный опрос.{" "}
              Он состоит из 4 коротких шагов, которые помогут нам:
            </p>
            <ul className="list-disc pl-[32px]">
              <li>Оценить ваш подход к решению нестандартных задач.</li>
              <li>Понять, что вас по-настоящему мотивирует и драйвит.</li>
              <li>
                Предложить вам позицию и условия, которые идеально подойдут
                именно вам.
              </li>
            </ul>
            <br />
            <p>
              Здесь нет правильных или неправильных ответов &mdash; нам важен
              ваш реальный профессиональный стиль. Выделите спокойное время,
              налейте кофе и давайте начнем!
            </p>
          </div>

          <div className="mt-[20px] flex justify-center">
            <Button
              onClick={() => router.push("/intro")}
              className="h-[56px] px-[36px] whitespace-nowrap text-[22px] font-extrabold leading-none"
            >
              НАЧАТЬ ЗНАКОМСТВО
            </Button>
          </div>
        </div>
      </div>
    </StepLayout>
  );
}
