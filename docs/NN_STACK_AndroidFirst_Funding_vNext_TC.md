# Neural Nexus – Tech Stack & Launch Funding Note (Android-first, TC)

## Platform stance

- **Primary target:** **Android** (Google Play first).
    
- **Deferrals:** Web and iOS later. Apple’s developer program is a paid annual membership; we’ll add iOS when funds exist.
    
- **Philosophy:** Ship a tight Android build, prove the loop (**Learn → Use → Share → Reward**), then scale.
    

---

## Stack overview (designed for $0–low burn, quick iteration)

### Client (Android)

- **React Native (Expo)** with `expo-router`
    
    - Why: fastest “vibe-code” cycle, OTA updates, one codebase that can later stretch to iOS/web if needed.
        
- **State:**
    
    - **Zustand** for local/UI state (tiny, simple).
        
    - **React Query** for server state (runs, receipts, feed).
        
- **Styling:** Tailwind-RN (or Panda); dark theme baseline.
    
- **Billing:** **Google Play Billing** for TC packs + subscriptions.
    

### Backend (data & auth)

- **Supabase (Postgres + Auth + Storage)**
    
    - Why: **TC is a ledger.** Postgres gives ACID transactions, constraints, and auditability; Auth is JWT-based and mobile-friendly; Storage handles media.
        
    - Row-Level Security (RLS) lets us protect multi-tenant data at the DB layer.
        

> **Why not Firebase/Firestore?** Firestore is great for sync and docs, but ledgers want SQL invariants (no negative balances, idempotent receipts, atomic “reserve→settle”). Postgres lands this cleanly with constraints & transactions; it’s also portable if we outgrow Supabase.

### Edge & services

- **Edge Functions** (Supabase) _or_ **Cloudflare Workers**
    
    - **Pricing Oracle:** computes live TC estimates (fast).
        
    - **Rate-limit & bot friction:** stops abuse at the perimeter.
        
    - **KV cache:** identical prompt → cached result (spam becomes margin).
        
- **Inference Gateway** (Node/TypeScript, lightweight)
    
    - Single place to call providers (start with 2 + fallback).
        
    - Streams output to the app; emits a signed usage blob (input tokens, output tokens/latency) back to the ledger to finalize **reserve → settle**.
        
- **Observability**
    
    - **Sentry:** app + gateway errors.
        
    - **OpenTelemetry traces:** track “reserve→run→settle” across services.
        
    - **PostHog** (or similar): product analytics (lesson→run activation, challenge participation).
        

### Security defaults (MVP)

- Short-lived access tokens; server-verified receipts.
    
- Playground runs **not retained** unless user opts in; course jobs store **derived assets only**.
    
- Minimal PII; payments via Play Billing (web Stripe later).
    

---

## DB sketch (ledger-friendly, minimal)

- `users(id, email, display_name, streak, level)`
    
- `wallets(user_id PK/FK, tc_balance CHECK (tc_balance >= 0))`
    
- `tc_transactions(id, user_id, type ENUM('purchase','usage','refund','reward','grant'), amount, run_id NULL, created_at, UNIQUE(receipt_id))`
    
- `runs(id, user_id, template_id NULL, provider, input_tokens, est_tc, reserved_tc, settled_tc, status, created_at)`
    
- `lessons / progress / templates` (as per MVP spec)
    
- `posts / reactions / challenges / challenge_entries`
    

**Atomic flow:**

1. begin; create `run`; **reserve** `r` TC (debit with check);
    
2. call model;
    
3. compute actual `s`; **settle** (adjust down/up to `s`); write receipt; commit;
    
4. on retry, same `receipt_id` → no double charge.
    

---

## Android-first release mechanics

- **Tracks:** internal testing → closed testing (invite 50–200) → open testing → production.
    
- **In-app billing:** TC packs + subs wired _before_ open testing.
    
- **Gates:**
    
    - After **A3**, unlock **Playground** tab.
        
    - After **B6**, unlock **Community** tab.
        
- **Feature flags:** `ff_challenges`, `ff_whiteboard`, `ff_comments` to modulate load.
    

---

## Handling a sudden influx (without dying)

**Protect the ledger, then degrade gracefully:**

- **Hard per-user rate limits** (per minute/hour/day) at edge.
    
- **Global circuit breaker:** if p95 latency/cost spikes, automatically:
    
    1. route to smaller/cheaper model,
        
    2. clamp max output tokens,
        
    3. turn on **queue mode** with wait estimates.
        
- **KV result cache:** exact prompt → free win.
    
- **“Busy mode”** UI: friendly banner + free TC drip for queued runs to keep goodwill.
    
- **Cohort rollouts:** expand daily cap for new users gradually via flags.
    
- **Provider diversity:** at least two inference backends behind the gateway.
    

---

## Funding paths (fast, realistic, non-delusional)

### A) **Kickstarter/Indiegogo-style prelaunch**

**When it helps:** you can demo the Android app on video (real flows), show before/after outputs, and offer digital rewards that cost near-zero to fulfill.

**What to offer (no equity, no gambling):**

- **Founders Badge** on profile + Whiteboard frame.
    
- **Premium Sprints bundle** (P1–P3) included.
    
- **TC packs** (delivered as in-app credit).
    
- **Name in Credits** (app “About” page).
    
- **Challenge Sponsor** for a week (name on banner).
    

**30-day run works.** Use the closed beta to capture real testimonials & screenshots to seed the page.

**Pros:** cash up front, community energy, marketing halo.  
**Cons:** time sink; you must hit delivery timelines clearly.

### B) **Angel / micro-preseed after working MVP**

**When it helps:** app runs, early metrics exist (activation %, MAU, TC ARPPU, cost per settled TC).  
**Pros:** bigger runway, fewer fulfillment headaches.  
**Cons:** pitch grind, likely ask for a Delaware C-Corp, basic bookkeeping.

### C) **Bootstrapped + rolling crowdfunding**

- Combine **Google Play open testing** + a **Ko-fi/Patreon** style page for ongoing support (monthly).
    
- Use **TC sales + Premium Sprints** to keep lights on; keep monthly server burn tiny via strict caps and caching.
    

**Practical take:** run **A and C** in parallel. If A lands, great; if not, you still have the app earning.

---

## Cost containment (day-one tactics)

- Free courses mostly offline; micro-exercises ≤ 250 input / ≤ 180 output tokens; deterministic settings.
    
- Cheapest viable models for free flows; bigger models only in Premium templates.
    
- Pre-generated image examples for challenges (generate once, reuse).
    
- Tight daily/weekly TC earn caps; reserve→settle refunds delta to build trust _and_ reduce complaints.
    
- Observability from day one to catch cost leaks.
    

---

## Copy canon (shared strings)

- **Balance:** `🪙 {value} TC`
    
- **Cost meter:** `Estimated cost: {value} TC`
    
- **Receipt:** `Reserved {r} TC → Settled {s} TC • Saved {r-s} TC`
    
- **Locked Playground:** `Finish A1–A3 to unlock the Playground`
    
- **Locked Community:** `Finish B4–B6 to unlock Community`
    
- **Challenge banner:** `Weekly Challenge: {THEME} • Submit by {DATE}`