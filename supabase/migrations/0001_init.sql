-- Financial Dashboard & Goal Tracker — initial schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Profile / billing state
-- ---------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  currency text not null default 'USD',
  date_format text not null default 'YYYY-MM-DD',
  start_of_week smallint not null default 1,
  plan text not null default 'free', -- 'free' | 'premium'
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text, -- 'active' | 'past_due' | 'canceled' | null
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------
-- Categories (nullable user_id = shared default categories)
-- ---------------------------------------------------------------------
create table categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  type text not null default 'expense', -- 'income' | 'expense' | 'both'
  color text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Transactions
-- ---------------------------------------------------------------------
create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null, -- 'income' | 'expense'
  amount numeric(12,2) not null,
  category_id uuid references categories(id),
  tx_date date not null,
  note text,
  created_at timestamptz not null default now()
);
create index idx_transactions_user_date on transactions (user_id, tx_date);
create index idx_transactions_user_category on transactions (user_id, category_id);

-- ---------------------------------------------------------------------
-- Monthly budget plan
-- ---------------------------------------------------------------------
create table budget_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references categories(id),
  month text not null, -- 'YYYY-MM'
  planned_amount numeric(12,2) not null default 0,
  unique (user_id, category_id, month)
);

-- ---------------------------------------------------------------------
-- Goals + contributions
-- ---------------------------------------------------------------------
create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  goal_type text not null default 'custom', -- savings | emergency_fund | purchase | custom
  target_amount numeric(12,2) not null,
  target_date date,
  starting_amount numeric(12,2) not null default 0,
  manual_current_amount numeric(12,2),
  current_amount numeric(12,2) not null default 0,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table goal_contributions (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references goals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(12,2) not null,
  contrib_date date not null,
  note text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Premium: debts
-- ---------------------------------------------------------------------
create table debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  balance numeric(12,2) not null,
  apr numeric(5,2) not null default 0,
  min_payment numeric(12,2) not null,
  due_day smallint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table debt_plans (
  user_id uuid primary key references auth.users(id) on delete cascade,
  strategy text not null default 'avalanche', -- 'snowball' | 'avalanche' | 'fixed_extra'
  extra_monthly_payment numeric(12,2) not null default 0,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Premium: net worth
-- ---------------------------------------------------------------------
create table net_worth_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  snapshot_date date not null,
  note text,
  created_at timestamptz not null default now(),
  unique (user_id, snapshot_date)
);

create table net_worth_items (
  id uuid primary key default gen_random_uuid(),
  snapshot_id uuid not null references net_worth_snapshots(id) on delete cascade,
  kind text not null, -- 'asset' | 'liability'
  category text not null,
  label text not null,
  value numeric(12,2) not null
);

-- ---------------------------------------------------------------------
-- Premium: saved investment projection scenarios (optional; the
-- calculation itself is always computed live, never stored as output)
-- ---------------------------------------------------------------------
create table investment_scenarios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  inputs jsonb not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Premium: CSV import audit trail
-- ---------------------------------------------------------------------
create table csv_import_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending', -- pending | done | failed
  row_count int not null default 0,
  imported_count int not null default 0,
  skipped_count int not null default 0,
  errors jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Row Level Security
-- (App code uses the service-role client and filters by user_id itself
-- — see lib/supabase/admin.ts — but RLS stays on as a second layer of
-- defense in case a session-scoped client is ever used directly.)
-- ---------------------------------------------------------------------
alter table profiles enable row level security;
alter table categories enable row level security;
alter table transactions enable row level security;
alter table budget_plans enable row level security;
alter table goals enable row level security;
alter table goal_contributions enable row level security;
alter table debts enable row level security;
alter table debt_plans enable row level security;
alter table net_worth_snapshots enable row level security;
alter table net_worth_items enable row level security;
alter table investment_scenarios enable row level security;
alter table csv_import_jobs enable row level security;

create policy "own profile" on profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

create policy "own or default categories read" on categories
  for select using (user_id = auth.uid() or user_id is null);
create policy "own categories write" on categories
  for insert with check (user_id = auth.uid());
create policy "own categories update" on categories
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own categories delete" on categories
  for delete using (user_id = auth.uid());

create policy "own rows only" on transactions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own rows only" on budget_plans
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own rows only" on goals
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own rows only" on goal_contributions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own rows only" on debts
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own rows only" on debt_plans
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own rows only" on net_worth_snapshots
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own rows only" on investment_scenarios
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own rows only" on csv_import_jobs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own snapshot items" on net_worth_items
  for all using (
    exists (
      select 1 from net_worth_snapshots s
      where s.id = net_worth_items.snapshot_id and s.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------
-- Default categories (shared, user_id is null)
-- ---------------------------------------------------------------------
insert into categories (user_id, name, type) values
  (null, 'Groceries', 'expense'),
  (null, 'Rent/Mortgage', 'expense'),
  (null, 'Utilities', 'expense'),
  (null, 'Transport', 'expense'),
  (null, 'Dining Out', 'expense'),
  (null, 'Entertainment', 'expense'),
  (null, 'Healthcare', 'expense'),
  (null, 'Salary', 'income'),
  (null, 'Freelance', 'income'),
  (null, 'Other', 'both');
