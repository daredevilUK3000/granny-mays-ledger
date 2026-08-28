-- Premium is a one-time purchase, not a subscription. The original
-- profiles.stripe_subscription_id / subscription_status columns (0001_init)
-- were built for recurring billing and are unused by the app now — left
-- in place rather than dropped, but nothing reads or writes them.
--
-- stripe_checkout_session_id records which Checkout Session paid for the
-- upgrade, for support/lookup purposes.

alter table profiles add column if not exists stripe_checkout_session_id text;
