import sharp from "sharp";

import type { GerchikovMotivationKey } from "@/lib/gerchikov/gerchikovMotivationProfile";
import { getGerchikovMotivationLabels } from "@/lib/gerchikov/gerchikovMotivationProfile";

const W = 720;
const H = 320;
const PAD = 36;

/**
 * Столбиковая диаграмма профиля мотивации (0–100) для вставки в Word.
 */
export async function renderGerchikovMotivationChartPng(
  scores: Record<GerchikovMotivationKey, number>
): Promise<Buffer> {
  const labels = getGerchikovMotivationLabels();
  const keys = Object.keys(scores) as GerchikovMotivationKey[];
  const n = keys.length;
  const innerW = W - 2 * PAD;
  const barW = innerW / n - 12;
  const maxBarH = H - 2 * PAD - 40;

  const rects: string[] = [];
  for (let i = 0; i < n; i += 1) {
    const k = keys[i];
    const v = scores[k] ?? 0;
    const x = PAD + i * (innerW / n) + 6;
    const h = (v / 100) * maxBarH;
    const y = PAD + 32 + (maxBarH - h);
    rects.push(
      `<rect x="${String(x)}" y="${String(y)}" width="${String(barW)}" height="${String(h)}" fill="#00B596" rx="4"/>`
    );
    rects.push(
      `<text x="${String(x + barW / 2)}" y="${String(H - 14)}" font-size="9" fill="#333333" text-anchor="middle">${String(v)}</text>`
    );
    const short = labels[k].split("(")[0]?.trim() ?? k;
    const labelShort = short.length > 22 ? `${short.slice(0, 20)}…` : short;
    rects.push(
      `<text x="${String(x + barW / 2)}" y="${String(PAD + 22)}" font-size="9" fill="#555555" text-anchor="middle">${labelShort}</text>`
    );
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${String(W)}" height="${String(H)}">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <text x="${String(PAD)}" y="22" font-size="14" fill="#333333">Герчиков: профиль мотивации (эвристика, 0–100)</text>
  ${rects.join("\n  ")}
</svg>`;

  return sharp(Buffer.from(svg)).png().toBuffer();
}
