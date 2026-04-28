import { existsSync, readFileSync } from "fs";
import path from "path";
import { PDFDocument, type PDFFont, type PDFPage, rgb } from "pdf-lib";

import {
  KOT_OFFICIAL_QUESTIONS_ORDERED,
  type KotOfficialSpec,
} from "@/lib/kot/kotOfficial50Questions";
import { isKotOfficialAnswerCorrect } from "@/lib/kot/kotOfficial50Scoring";
import { buildGerchikovReportRows } from "@/lib/gerchikov/gerchikovReportRows";
import {
  computeGerchikovMotivationScores,
  getGerchikovMotivationLabels,
  type GerchikovMotivationKey,
} from "@/lib/gerchikov/gerchikovMotivationProfile";
import type { GerchikovStep2Data } from "@/lib/gerchikov/step2Types";
import {
  computeStep3MeanScore,
  describeStep3MeanLevel,
  likertAnswerToScore,
} from "@/lib/step3/step3LikertScore";
import type { LikertAnswer, Step1Data, Step3Data, Step4Data } from "@/store/useFormStore";

export type ScreeningPdfInput = {
  profileName: string;
  sessionId: string;
  rawScore: number;
  maxScore: number;
  kotIp: number;
  kotIpLevelLabel: string;
  kotIpNormNote: string;
  step1: Step1Data;
  step2: GerchikovStep2Data;
  step3: Step3Data;
  step4: Step4Data;
  conclusionText: string | null;
  hiringRecommendations: string | null;
};

const A4_W = 595.28;
const A4_H = 841.89;
const M = 48;
const FOOTER_H = 36;
const HEADER_STRIP = 44;

/** Фирменный акцент (#00B596) */
const BRAND = rgb(0 / 255, 181 / 255, 150 / 255);
const BRAND_DEEP = rgb(0 / 255, 140 / 255, 118 / 255);
const PAGE_BG = rgb(0.97, 0.97, 0.97);
const CARD_BG = rgb(1, 1, 1);
const TEXT = rgb(0.2, 0.2, 0.2);
const TEXT_MUTED = rgb(0.45, 0.45, 0.45);
const BORDER = rgb(0.88, 0.88, 0.88);

const STEP3_TEXTS: { id: keyof Step3Data; title: string }[] = [
  { id: "q1", title: "Я обычно сохраняю позитивный настрой на работе." },
  { id: "q2", title: "Мне легко адаптироваться к изменениям." },
  { id: "q3", title: "Я спокойно отношусь к критике и улучшениям." },
  { id: "q4", title: "Я способен(на) поддерживать фокус на задачах." },
  { id: "q5", title: "Я умею восстанавливаться после стресса." },
  { id: "q6", title: "Я проявляю эмпатию к людям вокруг." },
  { id: "q7", title: "Я стремлюсь к ясности и понимаю приоритеты." },
  { id: "q8", title: "Я чувствую контроль над тем, что происходит." },
  { id: "q9", title: "Мне комфортно работать в команде." },
  { id: "q10", title: "Я избегаю конфликтов и умею их разруливать." },
];

function resolveReportFontsDir(): string {
  const cwd = process.cwd();
  const direct = path.join(cwd, "src", "assets", "report-fonts");
  if (existsSync(path.join(direct, "NotoSans-Regular.ttf"))) {
    return direct;
  }
  const parent = path.join(cwd, "..", "src", "assets", "report-fonts");
  if (existsSync(path.join(parent, "NotoSans-Regular.ttf"))) {
    return parent;
  }
  return direct;
}

function fontPath(file: string): string {
  return path.join(resolveReportFontsDir(), file);
}

function likertLabel(a: LikertAnswer): string {
  switch (a) {
    case "fully_agree":
      return "Полностью согласен";
    case "agree":
      return "Согласен";
    case "neutral":
      return "Скорее нейтрально";
    case "disagree":
      return "Скорее не согласен";
    case "fully_disagree":
      return "Полностью не согласен";
    default:
      return String(a);
  }
}

function truncate(s: string, max: number): string {
  if (s.length <= max) {
    return s;
  }
  return `${s.slice(0, max - 1)}…`;
}

function formatKotAnswerForReport(spec: KotOfficialSpec, value: string | null): string {
  if (value === null || value.trim() === "") {
    return "—";
  }
  if (spec.kind === "mc") {
    const opt = spec.options.find((o) => o.id === value);
    return opt ? `${opt.id}. ${opt.label}` : value;
  }
  return value;
}

function kotPromptForReport(spec: KotOfficialSpec): string {
  if (spec.kind === "text" && spec.pairColumnRows !== undefined && spec.pairColumnRows.length > 0) {
    const lines = spec.pairColumnRows.map((r) => `${r.left}  ${r.right}`).join("\n");
    return `${spec.prompt}\n${lines}`;
  }
  return spec.prompt;
}

function wrapLines(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    return [];
  }
  const paragraphs = normalized.split("\n");
  const out: string[] = [];
  for (const para of paragraphs) {
    const words = para.split(/\s+/).filter(Boolean);
    let line = "";
    for (const w of words) {
      const test = line.length > 0 ? `${line} ${w}` : w;
      if (font.widthOfTextAtSize(test, fontSize) <= maxWidth) {
        line = test;
      } else {
        if (line.length > 0) {
          out.push(line);
        }
        line = w;
      }
    }
    if (line.length > 0) {
      out.push(line);
    }
  }
  return out;
}

class PdfWriter {
  readonly doc: PDFDocument;
  readonly font: PDFFont;
  readonly fontBold: PDFFont;
  page!: PDFPage;
  pageNum = 0;
  y = 0;

  constructor(doc: PDFDocument, font: PDFFont, fontBold: PDFFont) {
    this.doc = doc;
    this.font = font;
    this.fontBold = fontBold;
  }

  addPage(continuation: boolean): void {
    this.page = this.doc.addPage([A4_W, A4_H]);
    this.pageNum += 1;
    this.drawPageBackground();
    this.drawHeader(continuation);
    this.y = A4_H - M - HEADER_STRIP - 14;
  }

  private drawPageBackground(): void {
    this.page.drawRectangle({
      x: 0,
      y: 0,
      width: A4_W,
      height: A4_H,
      color: PAGE_BG,
    });
    this.page.drawRectangle({
      x: M - 12,
      y: M - 12,
      width: A4_W - 2 * (M - 12),
      height: A4_H - 2 * (M - 12),
      color: CARD_BG,
      borderColor: BORDER,
      borderWidth: 0.5,
    });
    this.page.drawRectangle({
      x: M - 12,
      y: M - 12,
      width: 5,
      height: A4_H - 2 * (M - 12),
      color: BRAND,
    });
  }

  private drawHeader(continuation: boolean): void {
    this.page.drawRectangle({
      x: M - 12,
      y: A4_H - (M - 12) - HEADER_STRIP,
      width: A4_W - 2 * (M - 12),
      height: HEADER_STRIP,
      color: BRAND,
    });
    const title = continuation
      ? "Профиль Успеха — отчёт по скринингу (продолжение)"
      : "Профиль Успеха — отчёт по скринингу";
    this.page.drawText(title, {
      x: M + 8,
      y: A4_H - (M - 12) - HEADER_STRIP + 14,
      size: 13,
      font: this.fontBold,
      color: rgb(1, 1, 1),
    });
    const sub = "HR-скрининг кандидата";
    this.page.drawText(sub, {
      x: M + 8,
      y: A4_H - (M - 12) - HEADER_STRIP + 2,
      size: 8.5,
      font: this.font,
      color: rgb(0.92, 0.98, 0.96),
    });
  }

  drawFooter(): void {
    const t = `стр. ${String(this.pageNum)}`;
    const w = this.font.widthOfTextAtSize(t, 9);
    this.page.drawText(t, {
      x: (A4_W - w) / 2,
      y: M - 22,
      size: 9,
      font: this.font,
      color: TEXT_MUTED,
    });
  }

  needSpace(pts: number): void {
    if (this.y - pts < M + FOOTER_H) {
      this.drawFooter();
      this.addPage(true);
    }
  }

  heading(text: string, size = 13): void {
    this.needSpace(size + 10);
    this.page.drawText(text, {
      x: M,
      y: this.y - size,
      size,
      font: this.fontBold,
      color: BRAND_DEEP,
    });
    this.y -= size + 12;
  }

  textLine(text: string, size = 10, bold = false, color = TEXT): void {
    const f = bold ? this.fontBold : this.font;
    const lines = wrapLines(text, f, size, A4_W - 2 * M);
    for (const ln of lines) {
      this.needSpace(size + 3);
      this.page.drawText(ln, {
        x: M,
        y: this.y - size,
        size,
        font: f,
        color,
      });
      this.y -= size + 4;
    }
  }

  paragraph(text: string, size = 10): void {
    const lines = wrapLines(text, this.font, size, A4_W - 2 * M);
    for (const ln of lines) {
      this.needSpace(size + 3);
      this.page.drawText(ln, {
        x: M,
        y: this.y - size,
        size,
        font: this.font,
        color: TEXT,
      });
      this.y -= size + 4;
    }
    this.y -= 4;
  }

  spacer(pts = 8): void {
    this.y -= pts;
  }
}

function drawMotivationBars(
  w: PdfWriter,
  scores: Record<GerchikovMotivationKey, number>
): void {
  const labels = getGerchikovMotivationLabels();
  const keys = Object.keys(scores) as GerchikovMotivationKey[];
  const chartW = A4_W - 2 * M;
  const chartH = 150;
  const barGap = 10;
  const n = keys.length;
  const barW = (chartW - barGap * (n + 1)) / n;
  const maxH = 95;
  const baseY = w.y - chartH;

  w.needSpace(chartH + 50);
  w.page.drawRectangle({
    x: M,
    y: baseY,
    width: chartW,
    height: chartH,
    color: rgb(0.99, 0.99, 0.99),
    borderColor: BORDER,
    borderWidth: 0.6,
  });

  w.page.drawText("Профиль мотивации (0–100, эвристическая оценка)", {
    x: M + 6,
    y: baseY + chartH - 16,
    size: 9,
    font: w.fontBold,
    color: TEXT,
  });

  for (let i = 0; i < n; i += 1) {
    const k = keys[i];
    const v = scores[k] ?? 0;
    const x = M + barGap + i * (barW + barGap);
    const h = (v / 100) * maxH;
    const y0 = baseY + 28;
    w.page.drawRectangle({
      x,
      y: y0,
      width: barW,
      height: h,
      color: BRAND,
    });
    const valStr = String(Math.round(v));
    w.page.drawText(valStr, {
      x: x + barW / 2 - w.font.widthOfTextAtSize(valStr, 9) / 2,
      y: y0 + h + 4,
      size: 9,
      font: w.fontBold,
      color: TEXT,
    });
    const rawLabel = labels[k];
    const shortLines = wrapLines(rawLabel, w.font, 7, barW + 6);
    const linesToShow = shortLines.slice(0, 2);
    let ly = baseY + 8 + (linesToShow.length - 1) * 8;
    for (const line of linesToShow) {
      const tw = w.font.widthOfTextAtSize(line, 7);
      w.page.drawText(line, {
        x: x + barW / 2 - tw / 2,
        y: ly,
        size: 7,
        font: w.font,
        color: TEXT_MUTED,
      });
      ly -= 8;
    }
  }

  w.y = baseY - 16;
}

function drawLikertChart(w: PdfWriter, data: Step3Data): void {
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

  const chartW = A4_W - 2 * M;
  const chartH = 140;
  const padL = 44;
  const padR = 24;
  const padT = 32;
  const padB = 36;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;

  w.needSpace(chartH + 56);
  const baseY = w.y - chartH;

  w.page.drawRectangle({
    x: M,
    y: baseY,
    width: chartW,
    height: chartH,
    color: rgb(0.99, 0.99, 0.99),
    borderColor: BORDER,
    borderWidth: 0.6,
  });

  w.page.drawText("Эмоциональный фон и ресурсность (шкала Ликерта, баллы 1–5)", {
    x: M + 6,
    y: baseY + chartH - 16,
    size: 9,
    font: w.fontBold,
    color: TEXT,
  });

  const ox = M + padL;
  const oy = baseY + padB;
  w.page.drawRectangle({
    x: ox,
    y: oy,
    width: innerW,
    height: innerH,
    borderColor: BORDER,
    borderWidth: 0.8,
  });

  for (const lvl of [1, 2, 3, 4, 5]) {
    const t = String(lvl);
    const gy = oy + ((lvl - 1) / 4) * innerH;
    w.page.drawLine({
      start: { x: ox, y: gy },
      end: { x: ox + innerW, y: gy },
      thickness: 0.4,
      color: rgb(0.93, 0.93, 0.93),
    });
    w.page.drawText(t, {
      x: M + 12,
      y: gy - 3,
      size: 8,
      font: w.font,
      color: TEXT_MUTED,
    });
  }

  w.page.drawText("Балл", {
    x: M + 8,
    y: baseY + chartH - padT - innerH / 2,
    size: 8,
    font: w.fontBold,
    color: TEXT_MUTED,
  });

  const n = values.length;
  const stepX = n > 1 ? innerW / (n - 1) : 0;
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i += 1) {
    const x = ox + i * stepX;
    const v = values[i];
    const yy = v > 0 ? oy + ((v - 1) / 4) * innerH : oy;
    pts.push({ x, y: yy });
    w.page.drawLine({
      start: { x, y: oy },
      end: { x, y: oy + innerH },
      thickness: 0.3,
      color: rgb(0.94, 0.94, 0.94),
    });
    const xl = `П.${String(i + 1)}`;
    w.page.drawText(xl, {
      x: x - w.font.widthOfTextAtSize(xl, 7) / 2,
      y: oy - 18,
      size: 7,
      font: w.font,
      color: TEXT_MUTED,
    });
  }

  for (let i = 0; i < pts.length - 1; i += 1) {
    w.page.drawLine({
      start: pts[i],
      end: pts[i + 1],
      thickness: 2,
      color: BRAND,
    });
  }
  for (let i = 0; i < pts.length; i += 1) {
    const p = pts[i];
    if (values[i] > 0) {
      w.page.drawCircle({
        x: p.x,
        y: p.y,
        size: 8,
        borderColor: TEXT,
        borderWidth: 0.8,
        color: rgb(0.96, 0.83, 0.29),
      });
    }
  }

  w.y = baseY - 16;
}

function drawKotTableRow(
  w: PdfWriter,
  cols: [string, string, string, string],
  header: boolean
): void {
  const fs = header ? 8.5 : 7.5;
  const f = header ? w.fontBold : w.font;
  const widths = [28, 220, 130, 36];
  const cellsLines = cols.map((cell, i) => wrapLines(cell, f, fs, widths[i] - 4));
  const maxLines = Math.min(
    Math.max(...cellsLines.map((lines) => Math.max(lines.length, 1))),
    header ? 1 : 6
  );
  const rowHeight = maxLines * (fs + 2) + 6;
  w.needSpace(rowHeight + 10);
  const rowTop = w.y;
  let x = M;
  for (let i = 0; i < 4; i += 1) {
    const cw = widths[i];
    const lines = cellsLines[i];
    let cy = rowTop - fs;
    for (const ln of lines.slice(0, header ? 1 : 6)) {
      w.page.drawText(ln, {
        x: x + 2,
        y: cy,
        size: fs,
        font: f,
        color: TEXT,
      });
      cy -= fs + 2;
    }
    x += cw;
  }
  const bottomY = rowTop - rowHeight + 4;
  w.page.drawLine({
    start: { x: M, y: bottomY },
    end: { x: A4_W - M, y: bottomY },
    thickness: 0.3,
    color: BORDER,
  });
  w.y = bottomY - 6;
}

/** Публичный API: единый PDF вместо Word, кириллица и фирменный макет. */
export async function generateScreeningPdfBuffer(input: ScreeningPdfInput): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const fontBytes = readFileSync(fontPath("NotoSans-Regular.ttf"));
  const fontBoldBytes = readFileSync(fontPath("NotoSans-Bold.ttf"));
  const font = await doc.embedFont(fontBytes, { subset: false });
  const fontBold = await doc.embedFont(fontBoldBytes, { subset: false });

  const w = new PdfWriter(doc, font, fontBold);
  w.addPage(false);

  w.textLine(`Кандидат: ${truncate(input.profileName, 120)}`, 11, true);
  w.textLine(`Идентификатор сессии: ${input.sessionId}`, 9, false, TEXT_MUTED);
  w.spacer(10);

  w.heading("1. КОТ (интеллектуальный блок)");
  w.paragraph(
    `Ип (число верных): ${String(input.kotIp)} / ${String(input.maxScore)}; уровень по методичке: ${input.kotIpLevelLabel}.`
  );
  w.paragraph(truncate(input.kotIpNormNote, 2000));
  w.spacer(6);

  drawKotTableRow(w, ["№", "Задание", "Выбор", "Верно"], true);
  for (const spec of KOT_OFFICIAL_QUESTIONS_ORDERED) {
    const key = spec.key;
    const chosen = input.step1[key];
    const chosenLabel = truncate(formatKotAnswerForReport(spec, chosen), 200);
    const ok = isKotOfficialAnswerCorrect(key, chosen) ? "да" : "нет";
    drawKotTableRow(
      w,
      [
        key.replace("q", ""),
        truncate(kotPromptForReport(spec), 320),
        chosenLabel,
        ok,
      ],
      false
    );
  }

  w.heading("2. Мотивация (опросник Герчикова)");
  const motScores = computeGerchikovMotivationScores(input.step2);
  const motLine = Object.entries(motScores)
    .map(([k, v]) => `${k}: ${String(Math.round(v))}`)
    .join(", ");
  w.paragraph(`Сводка (0–100): ${motLine}`);
  drawMotivationBars(w, motScores);

  const rowsG = buildGerchikovReportRows(input.step2);
  w.paragraph("Детализация ответов:");
  for (const r of rowsG) {
    w.needSpace(36);
    w.paragraph(`${r.block} — ${truncate(r.title, 200)}`);
    w.paragraph(truncate(r.answerText, 1500), 9);
    w.spacer(4);
  }

  w.heading("3. Эмоциональный фон (шкала Ликерта)");
  const mean = computeStep3MeanScore(input.step3);
  w.paragraph(`Средний балл: ${String(mean)}. ${describeStep3MeanLevel(mean)}`);
  drawLikertChart(w, input.step3);
  for (const r of STEP3_TEXTS) {
    const a = input.step3[r.id];
    const score = a ? likertAnswerToScore(a) : 0;
    w.paragraph(
      `${r.id}: ${truncate(r.title, 200)} — балл: ${score > 0 ? String(score) : "—"}, ${a ? likertLabel(a) : "—"}`,
      9
    );
  }

  w.heading("4. Анкетные данные");
  const pairs: [string, string][] = [
    ["Город", input.step4.city],
    ["Семейное положение", input.step4.familyStatus],
    ["Дети", input.step4.children],
    ["Образование", input.step4.education],
    ["Любимая книга", input.step4.favoriteBook],
    ["Любимый фильм", input.step4.favoriteFilm],
    ["Хобби", input.step4.hobby],
    ["Музыка", input.step4.favoriteMusic],
    ["Свободное время", input.step4.leisureTime],
    ["Девиз / цитата", input.step4.lifeMotto],
  ];
  for (const [k, v] of pairs) {
    w.paragraph(`${k}: ${truncate(v, 800)}`);
  }

  w.heading("5. Заключение (ИИ)");
  w.paragraph(
    input.conclusionText ??
      "Заключение не сгенерировано (нет ключа OpenAI или ошибка модели)."
  );

  w.heading("6. Рекомендации по найму");
  const hire = input.hiringRecommendations;
  if (hire !== null && hire.trim().length > 0) {
    for (const line of hire.split(/\r?\n/)) {
      const t = line.trimEnd();
      if (t === "") {
        w.spacer(6);
        continue;
      }
      const bold =
        t.startsWith("БЛОК ") ||
        (t.length >= 8 && t.length <= 140 && t === t.toUpperCase() && /[А-ЯЁA-Z]/.test(t));
      w.textLine(t, 10, bold);
    }
  } else {
    w.paragraph("Рекомендации не сгенерированы (нет ключа OpenAI или ошибка модели).");
  }

  w.drawFooter();

  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}
