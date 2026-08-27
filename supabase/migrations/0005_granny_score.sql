-- Granny's Money Corner: one-time migrated score from the anonymous
-- landing-page widget. Anonymous play lives entirely in localStorage;
-- this table only ever gets a single row per user, written once on
-- signup (see claimGrannyScore in lib/actions.ts). The game itself does
-- not continue in-app — this is a quiet historical record, shown once
-- as a small card on the dashboard.

create table granny_scores (
  user_id uuid primary key references auth.users(id) on delete cascade,
  score integer not null default 0,
  streak integer not null default 0,
  last_played_date date,
  savings_discipline integer not null default 0,
  impulse_control integer not null default 0,
  debt_management integer not null default 0,
  budgeting integer not null default 0,
  claimed_at timestamptz not null default now()
);

alter table granny_scores enable row level security;
create policy "own row only" on granny_scores
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
