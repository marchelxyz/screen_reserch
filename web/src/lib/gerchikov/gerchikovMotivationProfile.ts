import type { GerchikovStep2Data } from "@/lib/gerchikov/step2Types";

export type GerchikovMotivationKey =
  | "material"
  | "professional"
  | "autonomy"
  | "organizational"
  | "stability";

const LABELS: Record<GerchikovMotivationKey, string> = {
  material: "Материальная мотивация (доход, вознаграждение)",
  professional: "Профессиональная самореализация, компетентность",
  autonomy: "Самостоятельность, ответственность за решения",
  organizational: "Вовлечённость в организацию, коллектив, «свой дом»",
  stability: "Стабильность, привычная среда, предсказуемость",
};

/**
 * Возвращает подписи измерений мотивации (для отчётов и ИИ).
 */
export function getGerchikovMotivationLabels(): Record<GerchikovMotivationKey, string> {
  return { ...LABELS };
}

/**
 * Эвристический профиль мотивации по ответам опросника Герчикова (для сводки и графиков).
 * Не заменяет экспертную интерпретацию по полной методике издательства.
 */
export function computeGerchikovMotivationScores(
  data: GerchikovStep2Data
): Record<GerchikovMotivationKey, number> {
  const scores: Record<GerchikovMotivationKey, number> = {
    material: 0,
    professional: 0,
    autonomy: 0,
    organizational: 0,
    stability: 0,
  };

  addQ1ToQ5(data, scores);
  addIncomeBlock(data, scores);
  addQ15ToQ23(data, scores);

  return normalizeScores(scores);
}

function addQ1ToQ5(data: GerchikovStep2Data, s: Record<GerchikovMotivationKey, number>): void {
  bumpMulti(Q1_MAP, data.q1, s);
  bumpSingle(Q2_MAP, data.q2, s);
  bumpMulti(Q3_MAP, data.q3, s);
  bumpMulti(Q4_MAP, data.q4, s);
  bumpMulti(Q5_MAP, data.q5, s);
}

const Q1_MAP: Record<string, Partial<Record<GerchikovMotivationKey, number>>> = {
  "1": { autonomy: 3 },
  "2": { professional: 3 },
  "3": { organizational: 3 },
  "4": { material: 3 },
  "5": { stability: 3 },
};

const Q2_MAP: Record<string, Partial<Record<GerchikovMotivationKey, number>>> = {
  "1": { material: 3 },
  "2": { autonomy: 3 },
  "3": { professional: 3 },
  "4": { organizational: 3 },
  "5": { stability: 2 },
};

const Q3_MAP: Record<string, Partial<Record<GerchikovMotivationKey, number>>> = {
  "1": { stability: 2 },
  "2": { professional: 3 },
  "3": { material: 2 },
  "4": { autonomy: 3 },
  "5": { organizational: 2 },
};

const Q4_MAP: Record<string, Partial<Record<GerchikovMotivationKey, number>>> = {
  "1": { material: 3 },
  "2": { professional: 2 },
  "3": { autonomy: 3 },
  "4": { organizational: 2 },
  "5": { stability: 3 },
};

const Q5_MAP: Record<string, Partial<Record<GerchikovMotivationKey, number>>> = {
  "1": { material: 2 },
  "2": { professional: 2 },
  "3": { organizational: 2 },
  "4": { stability: 3 },
  "5": { autonomy: 2 },
};

function addIncomeBlock(data: GerchikovStep2Data, s: Record<GerchikovMotivationKey, number>): void {
  const keys = [
    "q6",
    "q7",
    "q8",
    "q9",
    "q10",
    "q11",
    "q12",
    "q13",
    "q14",
  ] as const;
  for (const k of keys) {
    const v = data[k];
    if (v === "very") {
      s.material += 2;
    } else if (v === "somewhat") {
      s.material += 1;
    }
  }
}

const Q15_MAP: Record<string, Partial<Record<GerchikovMotivationKey, number>>> = {
  "1": { organizational: 4 },
  "2": { material: 3, autonomy: 1 },
  "3": { professional: 4 },
  "4": { material: 2, stability: 2 },
};

function addQ15ToQ23(data: GerchikovStep2Data, s: Record<GerchikovMotivationKey, number>): void {
  bumpSingle(Q15_MAP, data.q15, s);
  bumpMulti(Q16_MAP, data.q16, s);
  bumpMulti(Q17_MAP, data.q17, s);
  bumpMulti(Q18_MAP, data.q18, s);
  bumpMulti(Q19_MAP, data.q19, s);
  bumpMulti(Q20_MAP, data.q20, s);
  bumpMulti(Q21_MAP, data.q21, s);
  if (data.isLeader === true) {
    bumpMulti(Q22_MAP, data.q22, s);
  } else if (data.isLeader === false) {
    bumpMulti(Q23_MAP, data.q23, s);
  }
}

const Q16_MAP: Record<string, Partial<Record<GerchikovMotivationKey, number>>> = {
  "1": { autonomy: 2, organizational: 1 },
  "2": { professional: 3 },
  "3": { organizational: 2 },
  "4": { autonomy: 1 },
  "5": { material: 2 },
};

const Q17_MAP: Record<string, Partial<Record<GerchikovMotivationKey, number>>> = {
  "1": { organizational: 3 },
  "2": { professional: 2 },
  "3": { autonomy: 2 },
  "4": { material: 2 },
  "5": { organizational: 2, stability: 1 },
};

const Q18_MAP: Record<string, Partial<Record<GerchikovMotivationKey, number>>> = {
  "1": { autonomy: 2, organizational: 1 },
  "2": { material: 3 },
  "3": { organizational: 2 },
  "4": { stability: 2 },
  "5": { stability: 3 },
};

const Q19_MAP: Record<string, Partial<Record<GerchikovMotivationKey, number>>> = {
  "1": { professional: 3 },
  "2": { autonomy: 3 },
  "3": { material: 3 },
  "4": { stability: 2 },
  "5": { organizational: 3 },
};

const Q20_MAP: Record<string, Partial<Record<GerchikovMotivationKey, number>>> = {
  "1": { material: 3 },
  "2": { professional: 3 },
  "3": { stability: 2 },
  "4": { organizational: 2 },
  "5": { autonomy: 2 },
};

const Q21_MAP: Record<string, Partial<Record<GerchikovMotivationKey, number>>> = {
  "1": { professional: 2 },
  "2": { stability: 2, material: 1 },
  "3": { organizational: 1 },
  "4": { professional: 2 },
  "5": { stability: 3 },
  "6": { autonomy: 2 },
};

const Q22_MAP: Record<string, Partial<Record<GerchikovMotivationKey, number>>> = {
  "1": { autonomy: 3 },
  "2": { organizational: 2 },
  "3": { material: 3 },
  "4": { organizational: 2 },
  "5": { professional: 3 },
  "6": { stability: 2 },
};

const Q23_MAP: Record<string, Partial<Record<GerchikovMotivationKey, number>>> = {
  "1": { autonomy: 3 },
  "2": { organizational: 2 },
  "3": { professional: 3 },
  "4": { material: 2 },
  "5": { autonomy: 2 },
  "6": { material: 2 },
  "7": { autonomy: 1 },
  "8": { stability: 2 },
};

function bumpSingle(
  map: Record<string, Partial<Record<GerchikovMotivationKey, number>>>,
  id: string | null,
  s: Record<GerchikovMotivationKey, number>
): void {
  if (!id) {
    return;
  }
  const part = map[id];
  if (!part) {
    return;
  }
  for (const k of Object.keys(part) as GerchikovMotivationKey[]) {
    const add = part[k];
    if (add !== undefined) {
      s[k] += add;
    }
  }
}

function bumpMulti(
  map: Record<string, Partial<Record<GerchikovMotivationKey, number>>>,
  ids: string[],
  s: Record<GerchikovMotivationKey, number>
): void {
  for (const id of ids) {
    bumpSingle(map, id, s);
  }
}

function normalizeScores(
  s: Record<GerchikovMotivationKey, number>
): Record<GerchikovMotivationKey, number> {
  const keys = Object.keys(s) as GerchikovMotivationKey[];
  const max = Math.max(1, ...keys.map((k) => s[k]));
  const out = { ...s };
  for (const k of keys) {
    out[k] = Math.round((out[k] / max) * 100);
  }
  return out;
}

/**
 * Краткая текстовая сводка для LLM (топ-2 измерения).
 */
export function summarizeGerchikovMotivationForAi(
  scores: Record<GerchikovMotivationKey, number>
): string {
  const ordered = (Object.keys(scores) as GerchikovMotivationKey[]).sort(
    (a, b) => scores[b] - scores[a]
  );
  const top = ordered.slice(0, 2);
  const lines = top.map((k) => `${LABELS[k]}: ${String(scores[k])}/100`);
  return `Доминирующие_линии_мотивации: ${lines.join("; ")}`;
}
