# 24-Hour Vertical Slice Plan (Android-first)

## Hour 0–2 — Boot + Skeletons

**Repos & tools**

- Create two repos: `app/` (Expo RN) and `backend/` (edge funcs + inference gateway).
    
- Install: Node LTS, Expo CLI, Supabase CLI.
    

**App scaffold**

```bash
npx create-expo-app nexus
cd nexus && npx expo install expo-router react-native-gesture-handler react-native-reanimated \
@tanstack/react-query zustand
```

Tabs: Home, Learn, Playground, Community, Profile, Wallet (use `expo-router`).

**Supabase project**

- Spin project, grab anon/service keys.
    
- `supabase init && supabase start` (for local dev)
    

## Hour 2–4 — Ledger Core (SQL you actually need)

Create schema (trimmed to essentials; add more later):

```sql
-- users are managed by supabase auth; mirror profile row on signup
create table public.wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  tc_balance bigint not null default 0,
  constraint non_negative check (tc_balance >= 0)
);

create type tx_type as enum ('purchase','usage','refund','reward','grant');

create table public.tc_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  run_id uuid,
  kind tx_type not null,
  amount bigint not null,         -- positive numbers; use kind to interpret
  receipt_id text unique,         -- idempotency key
  created_at timestamptz not null default now()
);

create table public.runs (
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

-- RLS
alter table wallets enable row level security;
alter table tc_transactions enable row level security;
alter table runs enable row level security;

create policy "own wallet" on wallets for select using (auth.uid() = user_id);
create policy "own tx"     on tc_transactions for select using (auth.uid() = user_id);
create policy "own runs"   on runs for select using (auth.uid() = user_id);
```

## Hour 4–6 — Edge Functions (pricing + reserve/settle)

**/pricing** (fast estimate; return `{estimatedTC}`):

- Text: `est = a*inputTokens + b*templateBias`; clamp ±15%.
    
- Image: `est = k * (resolutionFactor * steps)`
    

**/runs/reserve**

- Begin transaction:
    
    - insert `runs(status='pending', est_tc=est, reserved_tc=r)`
        
    - decrement `wallets.tc_balance` by `r` (check constraint enforces non-negative)
        
    - insert `tc_transactions(kind='usage', amount=r, receipt_id)`
        
- Commit. Return `{runId, reservedTC: r}`
    

**/runs/settle**

- Compute `s` from provider usage blob.
    
- In txn: update run (`status`, `settled_tc=s`).
    
- If `s < r`: refund `(r - s)` via `tc_transactions(kind='refund')` and increment wallet.
    
- Commit. Return final receipt line.
    

> keep these as tiny TypeScript functions in Supabase Edge so they sit near the DB and stay snappy.

## Hour 6–9 — Inference Gateway (one file, two adapters)

- Start with **Adapter A: “MockEcho”** (returns trimmed/cleaned version) so UI works without spend.
    
- Add **Adapter B** to a real provider you already have credits for (OpenAI/Anthropic/Together). Stream text; return usage counts so `/settle` can be honest.
    
- Contract:
    

```ts
POST /v1/run { runId, provider, templateId?, prompt, opts }
-> SSE stream of tokens
-> final usage: {inputTokens, outputTokens, latencyMs}
```

## Hour 9–12 — Android App Wiring

**Auth**

- Supabase Auth (email/pass) screen; store session; hydrate user.
    

**Wallet**

- Header shows `🪙 {tc}` from `/wallets`.
    
- Wallet screen lists last 10 `tc_transactions`.
    

**Playground**

- Single input, **live TC meter**:
    
    - on change → call `/pricing` (debounce 250ms) → show `Estimated cost: {value} TC`
        
- On Send:
    
    - call `/runs/reserve` → open SSE to gateway → stream to screen
        
    - on end → call `/runs/settle` and push receipt to Wallet list
        
- Receipt microcopy:  
    `Reserved {r} TC → Settled {s} TC • Saved {r-s} TC`
    

## Hour 12–16 — Learn A1–A3 + Gate Playground

- A1 static content (no inference).
    
- A2 runs **T-001 Outcome Prompt** (≤250 in / ≤150 out).
    
- A3 runs **T-002 Summarize & Style** (≤250 in / ≤180 out).
    
- After A3 complete → `unlocked.playground = true` (client-side flag in profile doc for now).
    

## Hour 16–19 — B4–B6 + Gate Community

- B4: run with meter + receipt display.
    
- B5: compare free-text vs template; show TC savings (log both receipts).
    
- B6: TC explainer + fake-run sandbox (no spend).
    
- After B6 → `unlocked.community = true`.
    

## Hour 19–21 — Community MVP + Profile/Whiteboard

- Feed: list of public posts from `posts` (just text for now).
    
- Post action from a saved run (caption + toggle public).
    
- Reactions: ❤️ only.
    
- Profile: avatar (emoji/color), streak counter.
    
- **Whiteboard**: pin up to 6 items (IDs of posts) to a 3×2 grid.
    

## Hour 21–23 — Challenge Strip + Flags + Rate Limits

- One **Weekly Challenge** banner on Community.
    
- Submit flow = choose an existing post as entry; store in `challenge_entries`.
    
- Edge rate limits (per-user, per-IP). Add a **“busy mode”** banner toggle.
    

## Hour 23–24 — Build & Closed Test

- Add **Google Play Billing** stubbed UI (actual purchase wiring tomorrow if needed).
    
- Expo EAS build (Android):
    

```bash
npx expo install expo-dev-client
eas build -p android --profile preview
```

- Upload to **Internal testing** track in Play Console; invite your emails.
    

---

## If you run out of time

- Keep **Adapter A (MockEcho)** and ship UI with working reserve/settle against fixed estimates.
    
- Hard-code **challenge theme**; allow entries from existing posts only.
    
- Defer image flows; stick to text for day-one.
    

---

## Parallel (2–3 hours total) — Funding sprint setup

- Draft a **30-day Kickstarter** outline:
    
    - 60-sec screen-capture demo (A2 run, cost meter, B5 savings, post to feed).
        
    - Rewards: **Supporter ($10)** badge+TC, **Core ($29)** Premium Sprint bundle+TC, **Founder ($79)** larger TC + “Challenge Sponsor” of a week.
        
- “Notify me on launch” pre-page (free momentum), while Closed Test invites go out.
    

---

## Success criteria by end of day

- You can: sign in, see TC balance, run a prompt with a **live estimate**, get a **streamed result**, and read a **reserve→settle** receipt.
    
- A1–A3 complete → Playground tab appears; B4–B6 complete → Community appears.
    
- You can post one result to the feed and react.
    
- There’s a Challenge banner, and you can nominate a post as an entry.
    

you move fast; this plan won’t slow you down. if you want, I can drop the **exact Edge Function stubs** and a **minimal Expo Playground screen** in the next message so you can paste-and-go while you wire the adapters.