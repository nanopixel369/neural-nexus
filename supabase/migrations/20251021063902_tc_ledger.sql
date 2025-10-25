-- === TC LEDGER MINIMAL SCHEMA ===

-- 1) ENUM for tx kinds
do $$ begin
  create type tx_type as enum ('purchase','usage','refund','reward','grant');
exception when duplicate_object then null; end $$;

-- 2) Wallets (one per user)
create table if not exists public.wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  tc_balance bigint not null default 0,
  constraint wallets_non_negative check (tc_balance >= 0)
);

-- 3) Runs (one row per model call)
create table if not exists public.runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  template_id text,
  provider text not null,
  input_tokens int not null default 0,
  est_tc int not null default 0,
  reserved_tc int not null default 0,
  settled_tc int not null default 0,
  status text not null check (status in ('pending','running','done','failed')),
  created_at timestamptz not null default now()
);

-- 4) Transactions (append-only)
create table if not exists public.tc_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  run_id uuid,
  kind tx_type not null,
  amount bigint not null,
  receipt_id text unique,
  created_at timestamptz not null default now()
);

-- 5) RLS
alter table public.wallets enable row level security;
alter table public.runs enable row level security;
alter table public.tc_transactions enable row level security;

-- Only see your own rows
drop policy if exists wallets_select_own on public.wallets;
create policy wallets_select_own on public.wallets
  for select using (auth.uid() = user_id);

drop policy if exists runs_select_own on public.runs;
create policy runs_select_own on public.runs
  for select using (auth.uid() = user_id);

drop policy if exists tx_select_own on public.tc_transactions;
create policy tx_select_own on public.tc_transactions
  for select using (auth.uid() = user_id);

-- Allow server-side mutations via RPC. (No direct insert/update from client.)
revoke all on public.wallets from public;
revoke all on public.runs from public;
revoke all on public.tc_transactions from public;

-- 6) Atomic debit/credit helpers (server-executed)

-- debit_wallet: subtract amount if balance stays >= 0
create or replace function public.debit_wallet(p_user_id uuid, p_amount bigint)
returns table (new_balance bigint)
language plpgsql
security definer
as $$
begin
  update wallets
     set tc_balance = tc_balance - p_amount
   where user_id = p_user_id
   returning tc_balance into new_balance;

  if not found then
    raise exception 'wallet not found for user %', p_user_id;
  end if;

  if new_balance < 0 then
    -- undo and error
    update wallets
       set tc_balance = tc_balance + p_amount
     where user_id = p_user_id;
    raise exception 'insufficient balance for user %', p_user_id;
  end if;

  return;
end;
$$;

-- credit_wallet: add amount
create or replace function public.credit_wallet(p_user_id uuid, p_amount bigint)
returns table (new_balance bigint)
language plpgsql
security definer
as $$
begin
  update wallets
     set tc_balance = tc_balance + p_amount
   where user_id = p_user_id
   returning tc_balance into new_balance;

  if not found then
    raise exception 'wallet not found for user %', p_user_id;
  end if;

  return;
end;
$$;

-- Permit authenticated calls to the RPCs
revoke all on function public.debit_wallet(uuid, bigint) from public;
revoke all on function public.credit_wallet(uuid, bigint) from public;
grant execute on function public.debit_wallet(uuid, bigint) to authenticated;
grant execute on function public.credit_wallet(uuid, bigint) to authenticated;

-- 7) Helpful indexes
create index if not exists idx_runs_user_created on public.runs(user_id, created_at desc);
create index if not exists idx_tx_user_created on public.tc_transactions(user_id, created_at desc);
