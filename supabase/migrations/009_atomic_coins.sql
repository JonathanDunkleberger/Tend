-- Migration 009: Make coin mutations atomic (kill the read-then-write lost-update race).
--
-- WHY: /api/coins (delta path) and /api/inventory (purchase) both did
--   read balance → compute → write balance
-- in two round-trips. Two concurrent requests can both read the same balance and
-- clobber each other → a lost increment (grant vanishes) or a lost spend (item is
-- free). The correct fix is to do the mutation in a single UPDATE statement, which
-- Postgres executes under a row lock and re-evaluates the WHERE against the freshest
-- committed tuple, so concurrent writers serialize instead of racing.
--
-- The route code calls these via supabase.rpc(...) and FALLS BACK to the old
-- read-then-write path if the function is absent — so the app keeps working before
-- this migration is run. Running it simply upgrades those paths to atomic. Safe to
-- re-run (CREATE OR REPLACE).
--
-- Run this in the Supabase SQL Editor.

-- Atomic bounded increment for the /api/coins delta path.
-- p_delta is ALREADY clamped to [MIN_COIN_DELTA, MAX_COIN_DELTA] in the app
-- (src/lib/economy.ts) — this only applies it atomically and floors the result at 0,
-- mirroring applyCoinDelta(). Returns the new balance, or NULL if no such profile.
create or replace function public.tend_increment_coins(
  p_clerk_id text,
  p_delta    int
) returns int
language sql
volatile
as $$
  update public.profiles
     set coins = greatest(0, coins + p_delta),
         updated_at = now()
   where clerk_id = p_clerk_id
  returning coins;
$$;

-- Atomic conditional deduct for /api/inventory purchases. Deducts p_price only if
-- the balance can cover it, all in one statement — two concurrent purchases can no
-- longer both pass the affordability check and overdraw. Returns the new balance,
-- or NULL when the user can't afford it (or no such profile).
create or replace function public.tend_deduct_coins_if_afford(
  p_clerk_id text,
  p_price    int
) returns int
language sql
volatile
as $$
  update public.profiles
     set coins = coins - p_price,
         updated_at = now()
   where clerk_id = p_clerk_id
     and coins >= p_price
  returning coins;
$$;

grant execute on function public.tend_increment_coins(text, int)        to service_role, authenticated;
grant execute on function public.tend_deduct_coins_if_afford(text, int) to service_role, authenticated;
