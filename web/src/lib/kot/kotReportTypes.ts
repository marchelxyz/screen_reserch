/**
 * Сохраняемый в БД результат автоподсчёта КОТ и заключения (LLM).
 */
export type KotReportJson = {
  version: 1;
  rawScore: number;
  maxScore: number;
  /** Ориентировочный IQ по линейной шкале 70–130 для сокращённой батареи; не заменяет официальные нормы КОТ. */
  estimatedIq: number;
  iqNormNote: string;
  conclusionText: string | null;
  /** ISO 8601 (UTC), если заключение сгенерировано. */
  conclusionGeneratedAt: string | null;
  /** Успешная отправка письма на адреса из REPORT_RECIPIENT_EMAILS. */
  emailSent: boolean;
};
