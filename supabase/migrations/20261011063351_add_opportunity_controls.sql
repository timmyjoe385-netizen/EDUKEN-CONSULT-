ALTER TABLE public.opportunities
  ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS urgent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS notify_on_publish boolean NOT NULL DEFAULT false;
UPDATE public.opportunities
SET verified = (official_source IS NOT NULL AND btrim(official_source) <> '')
WHERE verified = false;
