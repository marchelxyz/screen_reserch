import React from "react";

import type { KotFigureSlot } from "@/lib/kot/kotOfficial50Questions";

/**
 * Схематичные рисунки к заданиям КОТ с пространственными фигурами (по смыслу бланка методички).
 * Пиксель-в-пиксель с вашим PDF может не совпадать; номера ответов на экране согласованы с ключом в коде.
 */
export function KotQuestionFigure(props: { readonly kind: KotFigureSlot }): React.ReactElement {
  switch (props.kind) {
    case "q17":
      return <KotFig17 />;
    case "q29":
      return <KotFig29 />;
    case "q32":
      return <KotFig32 />;
    case "q50":
      return <KotFig50 />;
    default: {
      const _e: never = props.kind;
      return _e;
    }
  }
}

/** Задание 17: четыре одинаковых круга и один квадрат (ключ пособия — 4). */
function KotFig17(): React.ReactElement {
  return (
    <div className="mb-4 overflow-x-auto rounded-lg border border-black/10 bg-white p-4">
      <p className="mb-3 text-center text-xs text-black/50">Рисунок к заданию 17</p>
      <svg viewBox="0 0 400 100" className="mx-auto h-auto w-full max-w-xl" aria-hidden>
        <title>Пять фигур: четыре круга и один квадрат</title>
        {[0, 1, 2, 3, 4].map((i) => {
          const x = 40 + i * 72;
          const y = 40;
          return (
            <g key={i}>
              {i === 3 ? (
                <rect x={x - 22} y={y - 22} width="44" height="44" fill="none" stroke="#1a1a1a" strokeWidth="2" />
              ) : (
                <circle cx={x} cy={y} r="22" fill="none" stroke="#1a1a1a" strokeWidth="2" />
              )}
              <text x={x} y="88" textAnchor="middle" fill="#1a1a1a" fontSize="14" fontWeight={500}>
                {String(i + 1)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/**
 * Задание 29: L-образный пентомино; 13 точек по контуру (в ключе пособия — разрез 2–13 между
 * соответствующими номерами на оригинальном рисунке).
 */
function KotFig29(): React.ReactElement {
  const pts: { x: number; y: number; n: number }[] = [
    { n: 1, x: 20, y: 140 },
    { n: 2, x: 40, y: 140 },
    { n: 3, x: 60, y: 140 },
    { n: 4, x: 60, y: 120 },
    { n: 5, x: 60, y: 100 },
    { n: 6, x: 60, y: 80 },
    { n: 7, x: 60, y: 60 },
    { n: 8, x: 100, y: 60 },
    { n: 9, x: 140, y: 60 },
    { n: 10, x: 140, y: 40 },
    { n: 11, x: 140, y: 20 },
    { n: 12, x: 80, y: 20 },
    { n: 13, x: 20, y: 20 },
  ];
  return (
    <div className="mb-4 overflow-x-auto rounded-lg border border-black/10 bg-white p-4">
      <p className="mb-3 text-center text-xs text-black/50">Рисунок к заданию 29 (точки на контуре)</p>
      <svg viewBox="0 0 160 160" className="mx-auto h-auto w-full max-w-sm" aria-hidden>
        <title>L-образная фигура из пяти квадратов с пронумерованными точками 1–13</title>
        <path
          d="M 20 20 L 140 20 L 140 60 L 60 60 L 60 140 L 20 140 Z"
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="2"
          strokeLinejoin="miter"
        />
        {pts.map((p) => (
          <g key={p.n}>
            <circle cx={p.x} cy={p.y} r="5" fill="#fff" stroke="#00B596" strokeWidth="1.5" />
            <text
              x={p.x}
              y={p.y + 4}
              textAnchor="middle"
              fill="#1a1a1a"
              fontSize="9"
              fontWeight={600}
            >
              {String(p.n)}
            </text>
          </g>
        ))}
      </svg>
      <p className="mt-2 text-center text-xs text-black/45">
        Укажите разрез, как в бланке: две точки через дефис (например: 2-13).
      </p>
    </div>
  );
}

/** Задание 32: пять элементов для составления трапеции (ключ — 1, 2, 4). */
function KotFig32(): React.ReactElement {
  return (
    <div className="mb-4 overflow-x-auto rounded-lg border border-black/10 bg-white p-4">
      <p className="mb-3 text-center text-xs text-black/50">Рисунок к заданию 32</p>
      <svg viewBox="0 0 320 90" className="mx-auto h-auto w-full max-w-xl" aria-hidden>
        <title>Пять фигур для составления трапеции</title>
        {[0, 1, 2, 3, 4].map((i) => {
          const x = 20 + i * 60;
          return (
            <g key={i}>
              {i === 0 && (
                <polygon
                  points={`${x},15 ${x + 40},15 ${x + 30},55 ${x + 10},55`}
                  fill="none"
                  stroke="#1a1a1a"
                  strokeWidth="2"
                />
              )}
              {i === 1 && (
                <polygon
                  points={`${x},55 ${x + 40},55 ${x + 35},15 ${x + 5},15`}
                  fill="none"
                  stroke="#1a1a1a"
                  strokeWidth="2"
                />
              )}
              {i === 2 && <rect x={x + 8} y="20" width="24" height="35" fill="none" stroke="#1a1a1a" strokeWidth="2" />}
              {i === 3 && (
                <polygon
                  points={`${x},50 ${x + 40},50 ${x + 32},20 ${x + 8},20`}
                  fill="none"
                  stroke="#1a1a1a"
                  strokeWidth="2"
                />
              )}
              {i === 4 && (
                <polygon
                  points={`${x + 10},55 ${x + 45},55 ${x + 35},18 ${x + 20},18`}
                  fill="none"
                  stroke="#1a1a1a"
                  strokeWidth="2"
                />
              )}
              <text
                x={x + 28}
                y="82"
                textAnchor="middle"
                fill="#1a1a1a"
                fontSize="13"
                fontWeight={500}
              >
                {String(i + 1)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/** Задание 50: пять фигур; третья отличается по типу (ключ в пособии для печатного бланка может отличаться). */
function KotFig50(): React.ReactElement {
  return (
    <div className="mb-4 overflow-x-auto rounded-lg border border-black/10 bg-white p-4">
      <p className="mb-3 text-center text-xs text-black/50">Рисунок к заданию 50</p>
      <svg viewBox="0 0 400 100" className="mx-auto h-auto w-full max-w-xl" aria-hidden>
        <title>Пять фигур, одна отличается</title>
        {[0, 1, 2, 3, 4].map((i) => {
          const x = 40 + i * 72;
          const y = 42;
          return (
            <g key={i}>
              {i === 2 ? (
                <polygon
                  points={`${x},${y - 20} ${x + 18},${y + 16} ${x - 18},${y + 16}`}
                  fill="none"
                  stroke="#1a1a1a"
                  strokeWidth="2"
                />
              ) : (
                <rect x={x - 20} y={y - 20} width="40" height="40" fill="none" stroke="#1a1a1a" strokeWidth="2" />
              )}
              <text x={x} y="88" textAnchor="middle" fill="#1a1a1a" fontSize="14" fontWeight={500}>
                {String(i + 1)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
