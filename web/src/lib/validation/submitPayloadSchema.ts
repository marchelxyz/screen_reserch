import { z } from "zod";

const likertAnswerSchema = z.enum([
  "fully_agree",
  "agree",
  "neutral",
  "disagree",
  "fully_disagree",
]);

/** Шаг 1 — значения радиокнопок из UI. */
export const step1DataSchema = z
  .object({
    q1: z.enum(["easy", "medium", "hard"]),
    q2: z.enum(["often", "sometimes", "rarely"]),
    q3: z.enum(["yes", "depends", "no"]),
    q4: z.enum(["usually", "mixed", "rare"]),
    q5: z.enum(["strong", "ok", "weak"]),
  })
  .strict();

const incomeImportanceSchema = z.enum(["very", "somewhat", "not_at_all"]);

const optionIdSchema = z.string().min(1).max(8);

/** Шаг 2 — опросник Герчикова (структура JSON). */
export const step2DataSchema = z
  .object({
    q1: z.array(optionIdSchema).min(0).max(5),
    q2: optionIdSchema.nullable(),
    q3: z.array(optionIdSchema).min(0).max(5),
    q4: z.array(optionIdSchema).min(0).max(5),
    q5: z.array(optionIdSchema).min(0).max(5),
    q6: incomeImportanceSchema.nullable(),
    q7: incomeImportanceSchema.nullable(),
    q8: incomeImportanceSchema.nullable(),
    q9: incomeImportanceSchema.nullable(),
    q10: incomeImportanceSchema.nullable(),
    q11: incomeImportanceSchema.nullable(),
    q12: incomeImportanceSchema.nullable(),
    q13: incomeImportanceSchema.nullable(),
    q14: incomeImportanceSchema.nullable(),
    q15: optionIdSchema.nullable(),
    q16: z.array(optionIdSchema).min(0).max(8),
    q17: z.array(optionIdSchema).min(0).max(8),
    q18: z.array(optionIdSchema).min(0).max(8),
    q19: z.array(optionIdSchema).min(0).max(8),
    q20: z.array(optionIdSchema).min(0).max(8),
    q21: z.array(optionIdSchema).min(0).max(8),
    isLeader: z.boolean().nullable(),
    q22: z.array(optionIdSchema).min(0).max(8),
    q23: z.array(optionIdSchema).min(0).max(8),
  })
  .strict();

export const step3DataSchema = z
  .object({
    q1: likertAnswerSchema.nullable(),
    q2: likertAnswerSchema.nullable(),
    q3: likertAnswerSchema.nullable(),
    q4: likertAnswerSchema.nullable(),
    q5: likertAnswerSchema.nullable(),
    q6: likertAnswerSchema.nullable(),
    q7: likertAnswerSchema.nullable(),
    q8: likertAnswerSchema.nullable(),
    q9: likertAnswerSchema.nullable(),
    q10: likertAnswerSchema.nullable(),
  })
  .strict();

const step4FieldSchema = z.string().min(1).max(2000);

export const step4DataSchema = z
  .object({
    city: step4FieldSchema,
    familyStatus: z.string().min(1).max(64),
    children: z.string().min(1).max(64),
    education: z.string().min(1).max(64),
    favoriteBook: step4FieldSchema,
    favoriteFilm: step4FieldSchema,
  })
  .strict();

const isoDateStringSchema = z
  .string()
  .min(10)
  .max(64)
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "consentRecordedAt must be a valid ISO date string",
  });

/**
 * Тело POST /api/submit. Дополнительные поля запрещены (.strict()).
 * Токен Turnstile обязателен в production (проверка на сервере).
 */
export const submitApiBodySchema = z
  .object({
    sessionId: z.string().min(8).max(128),
    profileName: z.string().min(1).max(200).trim(),
    personalDataConsent: z.boolean(),
    consentRecordedAt: isoDateStringSchema,
    step1Data: step1DataSchema,
    step2Data: step2DataSchema,
    step3Data: step3DataSchema,
    step4Data: step4DataSchema,
    /** Cloudflare Turnstile response token. */
    turnstileToken: z.string().min(10).max(4096).optional(),
  })
  .strict();

export type SubmitApiBody = z.infer<typeof submitApiBodySchema>;
