-- Track the Un-Spent: lets a user log a moment they chose NOT to spend
-- (skipped a coffee, abandoned a cart) as a positive, motivational entry.
-- Reuses financial_decisions rather than a parallel table, since the shape
-- is a near-exact match (title, amount, date already exist there).
--
-- Hard rule: this is emotional, not financial, and must never be summed
-- alongside real transactions/budgets/goals/net worth. Enforced at the
-- query layer — getDecisions() filters to entry_type = 'reflection',
-- getUnspentWins() filters to entry_type = 'walked_away' — and neither
-- query is ever joined against transactions, goals, sinking_funds, or
-- net_worth_snapshots.

alter table financial_decisions
  add column entry_type text not null default 'reflection'
    check (entry_type in ('reflection', 'walked_away')),
  add column amount numeric(12,2),
  add column category_name text;
