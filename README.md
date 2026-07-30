# Granny May's Ledger

Next.js 16 + Supabase budget tracker and goal planner. Free tier is fully
wired up (transactions, categories, monthly budgets, sinking funds,
decision journal logging, up to 2 goals). Premium adds investment
projections, debt payoff planning, net worth tracking with a Time to
Freedom projection, CSV import, decision journal insights, and up to 5
goals.

## 1. Create a Supabase project

1. Go to https://supabase.com/dashboard and create a new project.
2. In **Project Settings → API**, copy:
   - Project URL
   - `anon` public key
   - `service_role` key (keep this secret — server-side only)

## 2. Run the schema migration

In the Supabase dashboard, go to **SQL Editor**, paste the contents of
`supabase/migrations/0001_init.sql`, and run it. This creates every table,
enables RLS, sets up the auto-profile-on-signup trigger, and seeds the
default categories.

## 3. Configure email auth

This app uses magic-link (passwordless) sign-in. In **Authentication →
URL Configuration**, set:
- Site URL: `http://localhost:3000` (update to your real domain later)
- Redirect URLs: add `http://localhost:3000/auth/callback` (and your
  production equivalent once deployed)

## 4. Environment variables

Copy `.env.local.example` to `.env.local` and fill in the three Supabase
values from step 1. Leave the Stripe variables blank for now — that's the
next phase.

```
cp .env.local.example .env.local
```

## 5. Install and run

```
npm install
npm run dev
```

Visit http://localhost:3000, sign in via the magic link, and you should
land on `/dashboard/overview`.

## Project structure notes

- **No `[id]`-style dynamic route folders anywhere** — square-bracket
  folder names have caused Git issues on Windows before, so edits go
  through forms and query params (`?month=YYYY-MM`) instead of a
  `/goals/[id]` page.
- **`src/lib/supabase/admin.ts`** is used for all server-side data
  access instead of the session-scoped client, to avoid a known Supabase
  gotcha where embedded joins (`.select('*, goals(*)')`) silently return
  empty results under RLS. Every function that uses it takes the user's
  id explicitly and filters by it in code — RLS stays on in Postgres as
  a second layer of defense, but the app never depends on it alone.
- **`src/proxy.ts`** (not `middleware.ts` — that convention is deprecated
  as of Next 16) refreshes the Supabase session and gates `/dashboard/*`.

## Deploying

Push to a Git repo and import it in Vercel, or run `vercel` from this
directory. Add the same environment variables from `.env.local` to the
Vercel project settings, and update the Supabase Site URL/Redirect URLs
to your real domain once you have one.
