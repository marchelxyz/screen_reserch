-- SQL-скрипт для автоматического создания таблиц Postgres.
-- Используется на старте деплоя (Railway / Timeweb) до первого запуска приложения.

CREATE TABLE IF NOT EXISTS screening_submission (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  step1_data JSONB NOT NULL,
  step2_data JSONB NOT NULL,
  step3_data JSONB NOT NULL,
  step4_data JSONB NOT NULL
);

