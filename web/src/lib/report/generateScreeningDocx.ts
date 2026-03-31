import {
  AlignmentType,
  Document,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

import {
  KOT_OFFICIAL_QUESTIONS_ORDERED,
  type KotOfficialSpec,
} from "@/lib/kot/kotOfficial50Questions";
import { isKotOfficialAnswerCorrect } from "@/lib/kot/kotOfficial50Scoring";
import { buildGerchikovReportRows } from "@/lib/gerchikov/gerchikovReportRows";
import {
  computeGerchikovMotivationScores,
  getGerchikovMotivationChartLegendRu,
  type GerchikovMotivationKey,
} from "@/lib/gerchikov/gerchikovMotivationProfile";
import { renderGerchikovMotivationChartPng } from "@/lib/report/gerchikovMotivationChartPng";
import { renderStep3LikertChartPng } from "@/lib/report/step3ChartPng";
import {
  computeStep3MeanScore,
  describeStep3MeanLevel,
  likertAnswerToScore,
} from "@/lib/step3/step3LikertScore";
import type { GerchikovStep2Data } from "@/lib/gerchikov/step2Types";
import type { LikertAnswer, Step1Data, Step3Data, Step4Data } from "@/store/useFormStore";

export type ScreeningDocxInput = {
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

/**
 * Формирует буфер .docx с таблицами по тестам, ответами, графиками и текстами ИИ.
 */
export async function generateScreeningDocxBuffer(input: ScreeningDocxInput): Promise<Buffer> {
  const motScores = computeGerchikovMotivationScores(input.step2);
  const motPng = await renderGerchikovMotivationChartPng(motScores);
  const step3Png = await renderStep3LikertChartPng(input.step3);

  const children: (Paragraph | Table)[] = [];

  children.push(
    new Paragraph({
      text: "Профиль Успеха — отчёт по скринингу",
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Кандидат: ${truncate(input.profileName, 120)}` }),
      ],
    }),
    new Paragraph({
      children: [new TextRun({ text: `Идентификатор сессии: ${input.sessionId}` })],
    }),
    new Paragraph({ text: "" }),

    new Paragraph({
      text: "1. КОТ (интеллектуальный блок)",
      heading: HeadingLevel.HEADING_1,
    }),
    new Paragraph({
      children: [
        new TextRun(
          `Ип (число верных): ${String(input.kotIp)} / ${String(input.maxScore)}; уровень по методичке: ${input.kotIpLevelLabel}.`
        ),
      ],
    }),
    new Paragraph({
      children: [new TextRun({ italics: true, text: truncate(input.kotIpNormNote, 2000) })],
    }),
    buildKotAnswersTable(input.step1),
    new Paragraph({ text: "" }),

    new Paragraph({
      text: "2. Мотивация (опросник Герчикова)",
      heading: HeadingLevel.HEADING_1,
    }),
    new Paragraph({
      children: [
        new TextRun(
          `Сводка профиля (эвристика, 0–100): ${formatMotivationLine(motScores)}`
        ),
      ],
    }),
    new Paragraph({
      children: [
        new ImageRun({
          type: "png",
          data: motPng,
          transformation: { width: 620, height: 276 },
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          italics: true,
          text: `Расшифровка подписей на диаграмме (латинские коды из-за ограничений растеризации SVG): ${getGerchikovMotivationChartLegendRu()}`,
        }),
      ],
    }),
    buildGerchikovFullTable(input.step2),
    new Paragraph({ text: "" }),

    new Paragraph({
      text: "3. Эмоциональный фон и ресурсность (шкала Ликерта)",
      heading: HeadingLevel.HEADING_1,
    }),
    new Paragraph({
      children: [
        new TextRun(
          `Средний балл: ${String(computeStep3MeanScore(input.step3))}. ${describeStep3MeanLevel(
            computeStep3MeanScore(input.step3)
          )}`
        ),
      ],
    }),
    new Paragraph({
      children: [
        new ImageRun({
          type: "png",
          data: step3Png,
          transformation: { width: 620, height: 252 },
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          italics: true,
          text:
            "Диаграмма без текстовых подписей на изображении (ограничение растеризации SVG на сервере). Ось Y: снизу вверх баллы Ликерта 1–5; ось X: десять пунктов шага 3 слева направо (п. 1–10, соответствуют строкам таблицы ниже). Сетка: пять горизонтальных уровней = шкала 1–5.",
        }),
      ],
    }),
    buildStep3Table(input.step3),
    new Paragraph({ text: "" }),

    new Paragraph({
      text: "4. Анкетные данные",
      heading: HeadingLevel.HEADING_1,
    }),
    buildStep4Table(input.step4),
    new Paragraph({ text: "" }),

    new Paragraph({
      text: "5. Заключение (ИИ)",
      heading: HeadingLevel.HEADING_1,
    }),
    new Paragraph({
      children: [
        new TextRun(
          input.conclusionText ??
            "Заключение не сгенерировано (нет ключа OpenAI или ошибка модели)."
        ),
      ],
    }),
    new Paragraph({ text: "" }),

    new Paragraph({
      text: "6. Рекомендации по найму",
      heading: HeadingLevel.HEADING_1,
    }),
    ...buildHiringRecommendationsParagraphs(input.hiringRecommendations),
  );

  const doc = new Document({
    sections: [{ children }],
  });

  return Packer.toBuffer(doc);
}

function formatMotivationLine(scores: Record<GerchikovMotivationKey, number>): string {
  const keys = Object.keys(scores) as GerchikovMotivationKey[];
  return keys.map((k) => `${k}: ${String(scores[k])}`).join(", ");
}

/**
 * Разбивает многострочные рекомендации на абзацы Word; подзаголовки блоков выделяет полужирным.
 */
function buildHiringRecommendationsParagraphs(text: string | null): Paragraph[] {
  if (text === null || text.trim().length === 0) {
    return [
      new Paragraph({
        children: [
          new TextRun(
            "Рекомендации не сгенерированы (нет ключа OpenAI или ошибка модели)."
          ),
        ],
      }),
    ];
  }
  const lines = text.split(/\r?\n/);
  const out: Paragraph[] = [];
  for (const line of lines) {
    const trimmedEnd = line.trimEnd();
    if (trimmedEnd === "") {
      out.push(new Paragraph({ text: "" }));
      continue;
    }
    const bold = isHiringBlockHeading(trimmedEnd);
    out.push(
      new Paragraph({
        children: [
          new TextRun({
            text: trimmedEnd,
            bold,
          }),
        ],
      })
    );
  }
  return out;
}

function isHiringBlockHeading(line: string): boolean {
  const t = line.trim();
  if (t.startsWith("БЛОК ")) {
    return true;
  }
  if (t.length >= 8 && t.length <= 140 && t === t.toUpperCase() && /[А-ЯЁA-Z]/.test(t)) {
    return true;
  }
  return false;
}

function formatKotAnswerForDocx(spec: KotOfficialSpec, value: string | null): string {
  if (value === null || value.trim() === "") {
    return "—";
  }
  if (spec.kind === "mc") {
    const opt = spec.options.find((o) => o.id === value);
    return opt ? `${opt.id}. ${opt.label}` : value;
  }
  return value;
}

/** Полный текст задания для отчёта (в т. ч. пары в колонках для вопросов 8 и 13). */
function kotPromptForReport(spec: KotOfficialSpec): string {
  if (spec.kind === "text" && spec.pairColumnRows !== undefined && spec.pairColumnRows.length > 0) {
    const lines = spec.pairColumnRows.map((r) => `${r.left}  ${r.right}`).join("\n");
    return `${spec.prompt}\n${lines}`;
  }
  return spec.prompt;
}

function buildKotAnswersTable(step1: Step1Data): Table {
  const rows: TableRow[] = [
    new TableRow({
      children: [
        cell("№"),
        cell("Задание"),
        cell("Выбор"),
        cell("Верно"),
      ],
    }),
  ];

  for (const spec of KOT_OFFICIAL_QUESTIONS_ORDERED) {
    const key = spec.key;
    const chosen = step1[key];
    const chosenLabel = formatKotAnswerForDocx(spec, chosen);
    const ok = isKotOfficialAnswerCorrect(key, chosen) ? "да" : "нет";
    rows.push(
      new TableRow({
        children: [
          cell(key.replace("q", "")),
          cell(truncate(kotPromptForReport(spec), 400)),
          cell(truncate(chosenLabel, 120)),
          cell(ok),
        ],
      })
    );
  }

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows,
  });
}

function buildGerchikovFullTable(step2: GerchikovStep2Data): Table {
  const rowsData = buildGerchikovReportRows(step2);
  const rows: TableRow[] = [
    new TableRow({
      children: [cell("Блок"), cell("Вопрос"), cell("Ответ")],
    }),
  ];
  for (const r of rowsData) {
    rows.push(
      new TableRow({
        children: [
          cell(truncate(r.block, 80)),
          cell(truncate(r.title, 500)),
          cell(truncate(r.answerText, 1200)),
        ],
      })
    );
  }
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows,
  });
}

function buildStep3Table(step3: Step3Data): Table {
  const rows: TableRow[] = [
    new TableRow({
      children: [cell("Пункт"), cell("Утверждение"), cell("Балл 1–5"), cell("Ответ")],
    }),
  ];
  for (const r of STEP3_TEXTS) {
    const a = step3[r.id];
    const score = a ? likertAnswerToScore(a) : 0;
    rows.push(
      new TableRow({
        children: [
          cell(String(r.id)),
          cell(truncate(r.title, 400)),
          cell(score > 0 ? String(score) : "—"),
          cell(a ? likertLabel(a) : "—"),
        ],
      })
    );
  }
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows,
  });
}

function buildStep4Table(step4: Step4Data): Table {
  const pairs: [string, string][] = [
    ["Город", step4.city],
    ["Семейное положение", step4.familyStatus],
    ["Дети", step4.children],
    ["Образование", step4.education],
    ["Любимая книга", step4.favoriteBook],
    ["Любимый фильм", step4.favoriteFilm],
    ["Хобби", step4.hobby],
    ["Музыка", step4.favoriteMusic],
    ["Свободное время", step4.leisureTime],
    ["Девиз / цитата", step4.lifeMotto],
  ];
  const rows: TableRow[] = [
    new TableRow({ children: [cell("Поле"), cell("Значение")] }),
  ];
  for (const [k, v] of pairs) {
    rows.push(
      new TableRow({
        children: [cell(k), cell(truncate(v, 2000))],
      })
    );
  }
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows,
  });
}

function cell(text: string): TableCell {
  return new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text })] })],
  });
}

function truncate(s: string, max: number): string {
  if (s.length <= max) {
    return s;
  }
  return `${s.slice(0, max - 1)}…`;
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
