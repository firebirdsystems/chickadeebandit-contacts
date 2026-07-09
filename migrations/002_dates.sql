-- Add optional birthday / anniversary to each contact. Stored as plaintext (see
-- manifest.db_plaintext_columns) so they can be projected into the
-- `contact_dates` export and sorted/compared in SQL; they are ordinary calendar
-- dates, not secrets. Values are free-form date strings ("YYYY-MM-DD",
-- "--MM-DD", "MM-DD"); consumers (e.g. the Occasions app) normalize them.
ALTER TABLE app_contacts__contacts ADD COLUMN birthday TEXT DEFAULT '';
ALTER TABLE app_contacts__contacts ADD COLUMN anniversary TEXT DEFAULT '';
