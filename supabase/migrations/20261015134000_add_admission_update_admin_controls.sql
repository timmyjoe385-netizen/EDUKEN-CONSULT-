ALTER TABLE public.admissions
  ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS urgent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS notify_on_publish boolean NOT NULL DEFAULT false;

ALTER TABLE public.updates
  ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS urgent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS notify_on_publish boolean NOT NULL DEFAULT false;
