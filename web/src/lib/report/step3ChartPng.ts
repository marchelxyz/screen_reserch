import sharp from "sharp";

import type { Step3Data } from "@/store/useFormStore";

import { likertAnswerToScore } from "@/lib/step3/step3LikertScore";

const W = 640;
const H = 260;
const PAD_L = 48;
const PAD_R = 24;
const PAD_T = 24;
const PAD_B = 44;

/**
 * Строит простой линейный график ответов шага 3 (1–5) и возвращает PNG-буфер для вставки в Word.
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

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${String(W)}" height="${String(H)}">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <text x="${String(PAD_L)}" y="20" font-size="14" fill="#333333" font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif">Step 3: Likert scale (1-5)</text>
  ${[1, 2, 3, 4, 5]
    .map((lvl) => {
      const y = PAD_T + innerH - ((lvl - 1) / 4) * innerH;
      return `<line x1="${String(PAD_L - 6)}" y1="${String(y)}" x2="${String(W - PAD_R)}" y2="${String(y)}" stroke="#dddddd" stroke-width="1"/>`;
    })
    .join("\n  ")}
  ${[1, 2, 3, 4, 5]
    .map((lvl) => {
      const y = PAD_T + innerH - ((lvl - 1) / 4) * innerH;
      return `<text x="8" y="${String(y + 4)}" font-size="11" fill="#666666">${String(lvl)}</text>`;
    })
    .join("\n  ")}
  <polyline fill="none" stroke="#00B596" stroke-width="2.5" points="${polylinePoints}" />
  ${values
    .map((v, i) => {
      if (v <= 0) {
        return "";
      }
      const x = PAD_L + i * stepX;
      const y = PAD_T + innerH - ((v - 1) / 4) * innerH;
      return `<circle cx="${String(x)}" cy="${String(y)}" r="4" fill="#F6D34A" stroke="#5F5E5E" stroke-width="1"/>`;
    })
    .join("\n  ")}
  ${keys
    .map((_, i) => {
      const x = PAD_L + i * stepX;
      return `<text x="${String(x - 4)}" y="${String(H - 12)}" font-size="10" fill="#666666">Q${String(i + 1)}</text>`;
    })
    .join("\n  ")}
</svg>`;

  return sharp(Buffer.from(svg)).png().toBuffer();
}
