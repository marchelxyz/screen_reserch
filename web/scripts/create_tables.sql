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

-- Legacy: таблица создана старой версией без session_id / полей профиля (см. prisma migration 20260330120000).
ALTER TABLE screening_submission ADD COLUMN IF NOT EXISTS session_id TEXT;
ALTER TABLE screening_submission ADD COLUMN IF NOT EXISTS profile_name TEXT;
ALTER TABLE screening_submission ADD COLUMN IF NOT EXISTS personal_data_consent BOOLEAN;

UPDATE screening_submission
SET
  session_id = COALESCE(session_id, id),
  profile_name = COALESCE(profile_name, ''),
  personal_data_consent = COALESCE(personal_data_consent, false);

ALTER TABLE screening_submission ALTER COLUMN session_id SET NOT NULL;
ALTER TABLE screening_submission ALTER COLUMN profile_name SET NOT NULL;
ALTER TABLE screening_submission ALTER COLUMN personal_data_consent SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS screening_submission_session_id_key
  ON screening_submission (session_id);

-- Legacy: нет consent_recorded_at и/или JSON полей шагов (см. migrate_add_consent_recorded_at.sql).
ALTER TABLE screening_submission ADD COLUMN IF NOT EXISTS consent_recorded_at TIMESTAMPTZ;
ALTER TABLE screening_submission ADD COLUMN IF NOT EXISTS step1_data JSONB;
ALTER TABLE screening_submission ADD COLUMN IF NOT EXISTS step2_data JSONB;
ALTER TABLE screening_submission ADD COLUMN IF NOT EXISTS step3_data JSONB;
ALTER TABLE screening_submission ADD COLUMN IF NOT EXISTS step4_data JSONB;

UPDATE screening_submission
SET
  consent_recorded_at = COALESCE(consent_recorded_at, created_at),
  step1_data = COALESCE(step1_data, '{}'::jsonb),
  step2_data = COALESCE(step2_data, '{}'::jsonb),
  step3_data = COALESCE(step3_data, '{}'::jsonb),
  step4_data = COALESCE(step4_data, '{}'::jsonb);

ALTER TABLE screening_submission ALTER COLUMN consent_recorded_at SET NOT NULL;
ALTER TABLE screening_submission ALTER COLUMN step1_data SET NOT NULL;
ALTER TABLE screening_submission ALTER COLUMN step2_data SET NOT NULL;
ALTER TABLE screening_submission ALTER COLUMN step3_data SET NOT NULL;
ALTER TABLE screening_submission ALTER COLUMN step4_data SET NOT NULL;
