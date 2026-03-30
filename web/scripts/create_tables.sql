-- SQL-скрипт для автоматического создания таблиц Postgres.
-- Используется на старте деплоя (Railway / Timeweb) до первого запуска приложения.

CREATE TABLE IF NOT EXISTS screening_submission (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  session_id TEXT NOT NULL UNIQUE,
  profile_name TEXT NOT NULL,
  personal_data_consent BOOLEAN NOT NULL,
  consent_recorded_at TIMESTAMPTZ NOT NULL,

  step1_data JSONB NOT NULL,
  step2_data JSONB NOT NULL,
  step3_data JSONB NOT NULL,
  step4_data JSONB NOT NULL,
  kot_report JSONB
);

-- Уже существующие БД без столбца (старый скрипт без kot_report):
ALTER TABLE screening_submission ADD COLUMN IF NOT EXISTS kot_report JSONB;
