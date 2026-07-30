-- Financial Decisions Journal: log significant financial decisions,
-- with a review date for a later Yes/No "did this work" check-in.
-- Logging itself is Free; the insights built on top (Best Decision /
-- Biggest Regret stats, Life Wins timeline) are Premium.

create table financial_decisions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  reasoning text,
  expected_outcome text,
  estimated_amount numeric(12,2), -- positive = expected saving/gain, negative = expected cost
  decision_date date not null,
  review_date date,
  outcome text, -- 'worked' | 'did_not_work' | null (not yet reviewed)
  outcome_recorded_at timestamptz,
  created_at timestamptz not null default now()
);
create index idx_decisions_user_review on financial_decisions (user_id, review_date);

alter table financial_decisions enable row level security;
create policy "own rows only" on financial_decisions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
