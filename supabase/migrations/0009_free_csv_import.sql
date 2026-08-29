-- Free users get exactly one CSV import (to properly evaluate the app
-- with their real data) before the feature goes fully Premium. Null =
-- not used yet; set once their first successful import completes.

alter table profiles add column if not exists free_csv_import_used_at timestamptz;
