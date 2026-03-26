/**
 * Типы ответов для опросника мотивации (методика Герчикова).
 * Варианты хранятся как строковые id опций ("1", "2", …).
 */

export type IncomeImportance = "very" | "somewhat" | "not_at_all";

/** Полный набор ответов шага 2 (JSON в БД). */
export type GerchikovStep2Data = {
  q1: string[];
  q2: string | null;
  q3: string[];
  q4: string[];
  q5: string[];
  q6: IncomeImportance | null;
  q7: IncomeImportance | null;
  q8: IncomeImportance | null;
  q9: IncomeImportance | null;
  q10: IncomeImportance | null;
  q11: IncomeImportance | null;
  q12: IncomeImportance | null;
  q13: IncomeImportance | null;
  q14: IncomeImportance | null;
  q15: string | null;
  q16: string[];
  q17: string[];
  q18: string[];
  q19: string[];
  q20: string[];
  q21: string[];
  /** Руководитель ли респондент — определяет ветку вопросов 22 или 23. */
  isLeader: boolean | null;
  q22: string[];
  q23: string[];
};
