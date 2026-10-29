-- Index the nullable import batch foreign key for efficient joins and deletes.
create index if not exists cbt_questions_import_batch_id_idx
  on public.cbt_questions (import_batch_id)
  where import_batch_id is not null;
