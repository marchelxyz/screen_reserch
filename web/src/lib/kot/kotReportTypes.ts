/**
 * Сохраняемый в БД результат автоподсчёта КОТ и заключения (LLM).
 */
export type KotReportJson = {
  version: 2;
  rawScore: number;
  maxScore: number;
  /** IQ по таблице норм КОТ (см. `kotOfficialNorms.ts`). */
  kotOfficialIq: number;
  iqNormNote: string;
  conclusionText: string | null;
  hiringRecommendations: string | null;
  conclusionGeneratedAt: string | null;
  /** Успешная отправка письма на адреса из REPORT_RECIPIENT_EMAILS. */
  emailSent: boolean;
  /** Вложение Word сформировано и приложено к письму. */
  docxAttached: boolean;
};
