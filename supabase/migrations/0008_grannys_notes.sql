-- Granny's Notes: rule-based, static-copy contextual nudges (budget pace,
-- over budget, goal milestones). No AI — lines come from lib/grannys-notes.ts.
-- This table just tracks which specific trigger instance a user has
-- already been shown + dismissed, so each threshold is a one-time nudge
-- rather than a recurring nag on every dashboard load.

create table granny_notes_seen (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trigger_key text not null,
  shown_at timestamptz not null default now(),
  unique (user_id, trigger_key)
);

alter table granny_notes_seen enable row level security;
create policy "own rows only" on granny_notes_seen
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
