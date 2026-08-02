-- Provenance for rows written by the hub automation engine (manifest
-- automation_actions.add_contact). Nullable: every contact typed in the form or
-- imported from a .vcf leaves it NULL, which is what distinguishes a
-- human-entered card from a machine-filed one.
--
-- The engine dedupes on this column (SELECT 1 ... WHERE source_event_id = ?),
-- so a retried or replayed delivery finds the existing row and skips instead of
-- filing the same person twice. The index keeps that pre-insert lookup off a
-- full scan of the address book.
ALTER TABLE app_contacts__contacts ADD COLUMN source_event_id TEXT;

CREATE INDEX IF NOT EXISTS app_contacts__idx_contacts_source_event_id
  ON app_contacts__contacts (source_event_id);
