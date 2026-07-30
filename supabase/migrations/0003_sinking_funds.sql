-- Sinking funds: monthly savings targets for known future expenses
-- (e.g. an annual insurance bill). Structurally similar to goals, but
-- kept in a separate table so it doesn't get tangled with the
-- Free/Premium goal-count limit, and lives in the Budget tab rather
-- than the Goals tab since the framing is defensive, not aspirational.

create table sinking_funds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric(12,2) not null,
  target_date date,
  starting_amount numeric(12,2) not null default 0,
  manual_current_amount numeric(12,2),
  current_amount numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table sinking_fund_contributions (
  id uuid primary key default gen_random_uuid(),
  fund_id uuid not null references sinking_funds(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(12,2) not null,
  contrib_date date not null,
  note text,
  created_at timestamptz not null default now()
);

alter table sinking_funds enable row level security;
alter table sinking_fund_contributions enable row level security;

create policy "own rows only" on sinking_funds
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own rows only" on sinking_fund_contributions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
