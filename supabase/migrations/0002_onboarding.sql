-- Tracks whether a user has been shown the Getting Started page once.
-- Null = new user, hasn't been onboarded yet.
alter table profiles add column onboarded_at timestamptz;
