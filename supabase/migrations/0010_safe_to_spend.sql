-- Safe-to-Spend Today + Surplus Sweep support.
--
-- 1. categories.spending_type distinguishes committed spending (rent,
--    bills, sinking fund / goal contributions) from flexible/discretionary
--    spending. Defaults to 'flexible' so existing categories keep behaving
--    exactly as before until a user (or this migration, for the shared
--    defaults) marks one as fixed.
-- 2. budget_carryovers records a Surplus Sweep "roll into next month's fun
--    money" choice as a real, queryable row rather than a silent bump to
--    a budget number — Safe-to-Spend Today adds these into a month's
--    flexible budget total.

alter table categories
  add column spending_type text not null default 'flexible'
  check (spending_type in ('fixed', 'flexible'));

update categories
  set spending_type = 'fixed'
  where user_id is null and name in ('Rent/Mortgage', 'Utilities');

create table budget_carryovers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month text not null, -- 'YYYY-MM' the carryover is added to
  source_month text not null, -- 'YYYY-MM' the leftover was swept from
  amount numeric(12,2) not null,
  note text,
  created_at timestamptz not null default now(),
  unique (user_id, month, source_month)
);

alter table budget_carryovers enable row level security;
create policy "own rows only" on budget_carryovers
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
