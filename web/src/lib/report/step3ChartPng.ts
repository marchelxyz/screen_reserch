import sharp from "sharp";

import type { Step3Data } from "@/store/useFormStore";

import { likertAnswerToScore } from "@/lib/step3/step3LikertScore";

const W = 640;
const H = 260;
const PAD_L = 48;
const PAD_R = 24;
const PAD_T = 28;
const PAD_B = 36;

/**
 * Линейный график ответов шага 3 (балл 1–5) → PNG для Word.
 * В SVG нет текстовых элементов: при растеризации (Sharp/librsvg) без шрифтов даже цифры и «Q1» отображаются квадратиками.
 * Подписи осей и заголовок — в документе Word под рисунком.
 */
export async function renderStep3LikertChartPng(data: Step3Data): Promise<Buffer> {
  const keys: (keyof Step3Data)[] = [
    "q1",
    "q2",
    "q3",
    "q4",
    "q5",
    "q6",
    "q7",
    "q8",
    "q9",
    "q10",
  ];
  const values = keys.map((k) => {
    const a = data[k];
    return a ? likertAnswerToScore(a) : 0;
  });

  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;
  const n = values.length;
  const stepX = n > 1 ? innerW / (n - 1) : 0;

  const points: string[] = [];
  for (let i = 0; i < n; i += 1) {
    const x = PAD_L + i * stepX;
    const v = values[i];
    const y =
      v > 0 ? PAD_T + innerH - ((v - 1) / 4) * innerH : PAD_T + innerH;
    points.push(`${String(Math.round(x))},${String(Math.round(y))}`);
  }
  const polylinePoints = points.join(" ");

  const gridLines = [1, 2, 3, 4, 5]
    .map((lvl) => {
      const y = PAD_T + innerH - ((lvl - 1) / 4) * innerH;
      return `<line x1="${String(PAD_L)}" y1="${String(y)}" x2="${String(W - PAD_R)}" y2="${String(y)}" stroke="#e8e8e8" stroke-width="1"/>`;
    })
    .join("\n  ");

  const yTicks = [1, 2, 3, 4, 5]
    .map((lvl) => {
      const y = PAD_T + innerH - ((lvl - 1) / 4) * innerH;
      return `<line x1="${String(PAD_L - 5)}" y1="${String(y)}" x2="${String(PAD_L)}" y2="${String(y)}" stroke="#999999" stroke-width="1.5"/>`;
    })
    .join("\n  ");

  const xTicks = keys
    .map((_, i) => {
      const x = PAD_L + i * stepX;
      return `<line x1="${String(x)}" y1="${String(PAD_T + innerH)}" x2="${String(x)}" y2="${String(PAD_T + innerH + 6)}" stroke="#999999" stroke-width="1.5"/>`;
    })
    .join("\n  ");

  const circles = values
    .map((v, i) => {
      if (v <= 0) {
        return "";
      }
      const x = PAD_L + i * stepX;
      const y = PAD_T + innerH - ((v - 1) / 4) * innerH;
      return `<circle cx="${String(x)}" cy="${String(y)}" r="4" fill="#F6D34A" stroke="#5F5E5E" stroke-width="1"/>`;
    })
    .join("\n  ");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${String(W)}" height="${String(H)}">
  <rect width="100%" height="100%" fill="#ffffff"/>
  ${gridLines}
  <rect x="${String(PAD_L)}" y="${String(PAD_T)}" width="${String(innerW)}" height="${String(innerH)}" fill="none" stroke="#cccccc" stroke-width="1"/>
  ${yTicks}
  ${xTicks}
  <polyline fill="none" stroke="#00B596" stroke-width="2.5" points="${polylinePoints}" />
  ${circles}
</svg>`;

  return sharp(Buffer.from(svg)).png().toBuffer();
}
