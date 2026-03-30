/**
 * Сохраняемый в БД результат автоподсчёта КОТ и заключения (LLM).
 */
export type KotReportJson = {
  version: 3;
  /** Число верных ответов (Ип). */
  rawScore: number;
  maxScore: number;
  kotIp: number;
  kotIpLevelLabel: string;
  kotIpNormNote: string;
  conclusionText: string | null;
  hiringRecommendations: string | null;
  conclusionGeneratedAt: string | null;
  /** Успешная отправка письма на адреса из REPORT_RECIPIENT_EMAILS. */
  emailSent: boolean;
  /** Вложение Word сформировано и приложено к письму. */
  docxAttached: boolean;
};
