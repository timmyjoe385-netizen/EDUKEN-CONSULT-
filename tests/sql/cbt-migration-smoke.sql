DO $$
BEGIN
  IF to_regclass('public.cbt_questions') IS NULL THEN RAISE EXCEPTION 'CBT question bank table missing'; END IF;
  IF to_regclass('public.cbt_question_imports') IS NULL THEN RAISE EXCEPTION 'CBT import audit table missing'; END IF;
  IF to_regclass('public.cbt_attempt_sessions') IS NULL THEN RAISE EXCEPTION 'CBT attempt sessions table missing'; END IF;
  IF to_regclass('public.cbt_attempts') IS NULL THEN RAISE EXCEPTION 'CBT result history table missing'; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE oid='public.cbt_questions'::regclass AND relrowsecurity) THEN RAISE EXCEPTION 'CBT question bank RLS disabled'; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE oid='public.cbt_attempt_sessions'::regclass AND relrowsecurity) THEN RAISE EXCEPTION 'CBT attempt session RLS disabled'; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE oid='public.cbt_attempts'::regclass AND relrowsecurity) THEN RAISE EXCEPTION 'CBT attempt history RLS disabled'; END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='cbt_attempt_sessions' AND column_name='question_snapshot') THEN RAISE EXCEPTION 'Private question snapshot missing'; END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='cbt_attempts' AND column_name='attempt_session_id') THEN RAISE EXCEPTION 'Attempt history idempotency link missing'; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='cbt_attempts_attempt_session_id_uidx') THEN RAISE EXCEPTION 'Attempt history idempotency index missing'; END IF;
END $$;
