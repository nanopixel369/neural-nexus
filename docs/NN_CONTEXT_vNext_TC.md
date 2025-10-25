# NN_CONTEXT_vNext_TC.md

> Canon for Neural Nexus (vNext). Android-first. TC economy. Three hubs evolve together. Use this as the assistant’s long-term memory.

---

## CANON.PRODUCT

- AUDIENCE: everyday users who want to _use_ AI, not be ML engineers.
    
- CORE_LOOP: **Learn → Use → Share → Reward.**
    
- THREE_HUBS: **Education Hub**, **Playground**, **Community** (ship all three in MVP).
    
- VALUE: task-oriented learning, instant application, light social proof, transparent costs.
    

---

## CANON.PLATFORM

- PRIMARY: **Android first** (Google Play).
    
- DEFERRED: iOS (Apple Dev $99/yr), Web.
    
- FORM: mobile-first UI; no desktop-only features in MVP.
    

---

## ONBOARDING.CURRICULUM_FREE_9

- TIERS: **A (Education)** → **B (Playground)** → **C (Community)**.
    
- Each course 5–8 min; **tiny, cheap exercise** only where needed.
    

**A1. AI, Plainly** → explainer + quiz (no inference).  
**A2. Prompting for Outcomes** → run **T-001 Outcome Prompt** (≤250 in / ≤150 out).  
**A3. Summarize & Transform** → run **T-002 Summarize & Style** (≤250 in / ≤180 out).  
→ After A3: `unlocked.playground = true`.

**B4. Playground 101** → live **TC meter**, streamed output, receipt display.  
**B5. Templates Save TC** → compare free-text vs **T-001**, show lower settle.  
**B6. Meet TC** → estimates, reserve→settle, caps; optional tiny run or fake sandbox.  
→ After B6: `unlocked.community = true`.

**C7. Share the Win** → pick saved run, caption, post to feed (no inference).  
**C8. Weekly Challenge** → submit 1 entry; voting basics (image/text flows; can simulate images).  
**C9. Profile & Whiteboard** → avatar/accent; pin up to **6** items on 3×2 grid (no inference).

---

## CURRICULUM.PREMIUM_3 (REVENUE)

- **P1: AI Writing Sprint** → T-101 Email, T-102 Brief, T-103 Blog Draft→Polish.
    
- **P2: Image Creation Sprint** → I-101 Base Prompt, I-102 Variation Trio, I-103 Upscale+Caption (512², 20–28 steps).
    
- **P3: Creator Kit** → C-101 Portfolio Story, C-102 “How I did it”, C-103 CTA Finisher.
    
- PRICING: in **TC** (or included in Lite/Premium subs). Ends with reusable templates.
    

---

## TEMPLATES.INDEX

- **T-001** Outcome Prompt (A2)
    
- **T-002** Summarize & Style (A3)
    
- **T-003** Clean & Rephrase (B5)
    
- **T-101/102/103** (P1) · **I-101/102/103** (P2) · **C-101/102/103** (P3)
    

---

## UNLOCKS.FLAGS

- After **A3** → `unlocked.playground = true`
    
- After **B6** → `unlocked.community = true`
    
- After **C9** → premium upsell card; Whiteboard visible on profile
    
- FEATURE_FLAGS: `ff_challenges`, `ff_whiteboard`, `ff_comments`, `ff_cost_meter`, `ff_playground_templates`.
    

---

## ECONOMY.TC

- UNIT: **TC** everywhere (no “tokens/coins”, no pluralization; e.g., “500 TC”).
    
- FLOW: **estimate → reserve → run → settle**; refund delta if `settle < reserve`.
    
- PRICING:
    
    - SUBS: Free / Lite / Premium → **monthly TC allowances** + gates.
        
    - PER-RUN: all variable costs in TC.
        
    - CHALLENGES: TC drips + prize pools; **hard daily/weekly caps** (anti-farm).
        
- ANTI-ABUSE: per-user/ip rate limits, device fingerprint buckets, **KV cache for identical prompts**, anomaly flags on bursty spend, duplicate-prompt wins margin.
    

---

## COST.GUARDRAILS

- Free exercises aim ≤ **250 input / 180 output tokens**; deterministic settings; small models.
    
- Clamp contexts; prefer templates; pre-generate demo images; aggressive caching for onboarding prompts.
    

---

## COMMUNITY.MVP

- FEED: simple card stream; **❤️** reactions (comments behind flag).
    
- WEEKLY_CHALLENGE: one theme word, voting UI, Top-3 payout in TC.
    
- PROFILE+WHITEBOARD: avatar/accent; **3×2** pin board for runs/images/links.
    

---

## STACK.DECISIONS

- CLIENT: **React Native (Expo)**, `expo-router`; **Android-first** build outputs.
    
    - State: **Zustand** (UI/local), **React Query** (server).
        
    - Styling: Tailwind-RN/Panda; dark-first theme.
        
    - Billing: **Google Play Billing** (TC packs + subs).
        
- BACKEND: **Supabase (Postgres + Auth + Storage)**
    
    - Motivation: **ledger needs SQL** (ACID, constraints, audits).
        
    - RLS at DB layer; migrations via Drizzle/Prisma OK.
        
- EDGE: Supabase **Edge Functions** (or Cloudflare Workers)
    
    - **Pricing Oracle**, **rate-limit**, **KV cache**, **receipt signing**.
        
- INFERENCE_GATEWAY: Node/TS microservice
    
    - Adapters: start with **2 providers + fallback**; stream; emit usage blob.
        
    - Later can route to Spark/Station hosts for **course jobs** only.
        
- OBSERVABILITY: **Sentry**, **OpenTelemetry** (reserve→run→settle traces), **PostHog** (product).
    

---

## ENDPOINTS.API (CONTRACT)

- `POST /pricing` → `{estimatedTC}`
    
    - TEXT: `est = f(inputTokens, templateClass, temp, top_p, stops)` (clamp ±15%)
        
    - IMAGE: `est = k * (resolutionFactor * steps * guidanceFactor)`
        
- `POST /runs/reserve` → `{runId, reservedTC}`
    
    - Begin txn → insert `runs(pending, est, reserved)` → decrement wallet (check ≥0) → insert tx(kind='usage', amount=r, receipt_id) → commit.
        
- `POST /runs/settle` → `{settledTC, receipt}`
    
    - From usage blob → update run(done/failed, settled=s) → if `s<r` refund `(r-s)` via tx(kind='refund') → commit.
        
- GATEWAY `/v1/run` → SSE stream; final `{inputTokens, outputTokens, latencyMs}`.
    

---

## DATA.SCHEMA_MIN

`wallets(user_id PK/FK→auth.users, tc_balance BIGINT CHECK tc_balance>=0) tc_transactions(id UUID PK, user_id, run_id?, kind ENUM('purchase','usage','refund','reward','grant'),                 amount BIGINT, receipt_id UNIQUE, created_at) runs(id UUID PK, user_id, template_id?, provider, input_tokens, est_tc, reserved_tc, settled_tc,      status ENUM('pending','running','done','failed'), created_at) lessons(id, tier ENUM('A','B','C','P'), slug, title, premium BOOL) progress(user_id, lesson_id, status ENUM('locked','started','done'), updated_at) templates(id, lesson_id?, title, config JSONB) posts(id, user_id, run_id?, kind ENUM('text','image'), body_or_media_url, created_at) reactions(id, post_id, user_id, kind) challenges(id, theme, starts_at, ends_at, prize_pool_tc) challenge_entries(id, challenge_id, post_id, votes INT)`

---

## SECURITY.PRIVACY

- TOKENS: short-lived; server-verified receipts.
    
- PLAYGROUND: **no retention** by default; opt-in “save history.”
    
- COURSE: store **derived assets only** (not raw prompts/outputs).
    
- PII minimal; Android payments via **Play Billing**.
    

---

## STORE.COMPLIANCE

- ANDROID: Google Play Billing for TC/subscriptions; web Stripe later.
    
- iOS deferred (fee + review rules).
    

---

## ROLLOUT.ANDROID (TESTING TRACKS)

- Internal testing → Closed testing (50–200) → Open testing → Production.
    
- Billing wired **before** Open testing.
    
- Tabs show locked state with teaser copy (`Finish A1–A3…`, `Finish B4–B6…`).
    

---

## SCALING.GUARDRAILS

- PER-USER LIMITS at edge; **global circuit breaker**:
    
    1. route to cheaper model, 2) clamp max output tokens, 3) switch to **queue mode** (friendly banner + small free TC drip).
        
- KV cache for duplicate prompts; provider diversity (2+ backends).
    

---

## FUNDING.STRATEGY

- **Kickstarter 30-day** aligned with Closed Test: digital rewards only (Founders badge, Premium Sprints bundle, TC packs, “Challenge Sponsor” week).
    
- **Angels/micro-preseed** after early metrics (activation %, MAU, ARPPU in TC, settled/estimated delta < 15%, cost per settled TC).
    
- Parallel lightweight **Ko-fi/Patreon** acceptable.
    

---

## METRICS.CORE

- ACTIVATION: lesson→template run rate (first 24h).
    
- EFFICIENCY: avg `(reserved - settled) / reserved` < **15%**.
    
- ENGAGEMENT: 7-day streak %, challenge participation %.
    
- ECONOMY: TC earned/spent per active user; net TC outflow.
    
- QUALITY: upvotes per post; abuse flags per 1k runs.
    

---

## UI.COPY_CANON

- Balance → `🪙 {value} TC`
    
- Cost meter → `Estimated cost: {value} TC`
    
- Receipt → `Reserved {r} TC → Settled {s} TC • Saved {r-s} TC`
    
- Playground locked → `Finish A1–A3 to unlock the Playground`
    
- Community locked → `Finish B4–B6 to unlock Community`
    
- Challenge banner → `Weekly Challenge: {THEME} • Submit by {DATE}`
    

---

## BUILD.PLAN_24H (COMPRESSED)

1. **Scaffold** Expo app (6 tabs) + Supabase project (schema + RLS).
    
2. **Edge functions**: `/pricing`, `/runs/reserve`, `/runs/settle`.
    
3. **Gateway**: Adapter A (MockEcho) + Adapter B (real provider), SSE streaming.
    
4. **Playground**: live meter → reserve → stream → settle → wallet receipt.
    
5. **Lessons**: A1–A3 + gate Playground; B4–B6 + gate Community; C7–C9 basics.
    
6. **Community MVP**: feed, ❤️ reactions, challenge banner; profile + 3×2 whiteboard.
    
7. **Limits/flags**: rate limits, circuit breaker, `ff_*` toggles.
    
8. **Closed Test** build on Google Play.
    

---

## FUTURE.TRACKS (POST-MVP)

- Creator courses (rev-share) gated by quality.
    
- Model matrix + routing; OSS low-latency paths.
    
- Hosted compute (Spark/Station) **for course jobs only** initially.
    
- Leagues/tournaments (opt-in).
    
- Workflow builder after template adoption proven.
    

---
