# Onboarding Curriculum (Free 9) + Premium 3

## Tier A — Education (3 free) → Unlocks _Playground_

> Goal: give everyday users a working mental model of AI + one concrete win.

### A1. AI, Plainly: What It Is / Isn’t

**You’ll learn:** how LLMs “autocomplete thought,” where they shine, where they fail; quick safety rules.  
**Flow (5–7 min):** short explainer → “choose the right tool” mini-quiz → guardrails.  
**Micro-exercise:** _none (no inference)_ — the quiz is local.  
**Unlock:** shows **Lesson Badge A1**; nudges to A2.

---

### A2. Prompting for Outcomes (Patterns > Vibes)

**You’ll learn:** outcome-first prompting, constraints, examples, role/system hints.  
**Flow (6–8 min):** 4 archetype prompts → why they work → constraint checklist.  
**Micro-exercise (cheap inference):**

1. Paste a messy 3–5 sentence note block (≤ 200 input tokens).
    
2. Choose outcome: “brief / email / bullet list.”
    
3. Run **Template: Outcome Prompt (T-001)**.
    
    - **Model:** small, deterministic (temp 0.2, top_p 0.9).
        
    - **Target cost:** ≤ 250 input tokens, ≤ 150 output tokens.  
        **Unlock:** **Template T-001** in Playground.
        

---

### A3. Summarize & Transform (Fast Clarity)

**You’ll learn:** extractive vs abstractive summary, style transfer without fluff.  
**Flow (6–8 min):** 3 examples → “don’t over-ask” heuristics.  
**Micro-exercise (cheap inference):**

1. Provide a short paragraph (≤ 250 tokens).
    
2. Pick a tone: “neutral / friendly / executive.”
    
3. Run **Template: Summarize & Style (T-002)**.
    
    - **Model:** small, temp 0.2, max_tokens 180.
        
    - **Target cost:** small.  
        **Unlock:** set `unlocked.playground = true` (Playground tab appears).
        

---

## Tier B — Playground (3 free) → Reveals _Community_

> Goal: teach the meter, templates, TC basics; give one “aha” moment about saving TC.

### B4. Playground 101: One Box, One Meter

**You’ll learn:** live **TC** estimate → reserve → settle; streamed output; receipts.  
**Flow (5–7 min):** meter demo with a canned example.  
**Micro-exercise (cheap inference):**

1. Type a one-sentence ask (≤ 120 tokens).
    
2. Watch **Estimated cost: {value} TC** change live.
    
3. Submit; read the receipt line:  
    `Reserved {r} TC → Settled {s} TC • Saved {r-s} TC`.  
    **Unlock:** **Receipt view** in Wallet history.
    

---

### B5. Templates that Save TC (Beat the Meter)

**You’ll learn:** why templates are cheaper; prompt anatomy vs freeform.  
**Flow (6–8 min):** side-by-side free-text vs template demo.  
**Micro-exercise (cheap inference):**

1. Paste the same 3–5 sentence note as A2.
    
2. Run **Free-text** then **T-001 Outcome Prompt**.
    
3. Compare receipts; the template should settle lower TC.  
    **Unlock:** **Template T-003: Clean & Rephrase** (quick rewrite).
    

---

### B6. Meet TC (The Currency of Thought)

**You’ll learn:** what costs TC, how estimates are made, why reserve exists, daily earn caps.  
**Flow (5–7 min):** quick explainer + example receipt.  
**Micro-exercise (no/cheap inference):**

- Tap through a “fake run” sandbox that shows estimate/reserve/settle with numbers; _optional_ tiny real run (≤ 100 tokens).  
    **Unlock:** set `unlocked.community = true` (Community tab appears).
    

---

## Tier C — Community (3 free) → Social basics + personalization

> Goal: sharing without cringe, one live challenge, and a personal whiteboard.

### C7. Share the Win (Posting without Noise)

**You’ll learn:** pick worthwhile outputs, write a one-line caption, share settings.  
**Flow (5–7 min):** “what good looks like” gallery → caption dos/don’ts.  
**Micro-exercise (no inference):**

1. Choose one saved run (from B4/B5).
    
2. Write a 90-char caption.
    
3. Post to **My Feed** (visibility: public/unlisted).  
    **Unlock:** **Post formatting** helpers (caption hints).
    

---

### C8. Weekly Challenge (Theme → Entry → Vote)

**You’ll learn:** how challenges work; voting; prize TC; fairness rules.  
**Flow (6–8 min):** current theme → examples → voting UI.  
**Micro-exercise (cheap inference or none):**

- **If Text Challenge:** transform a 2–3 sentence prompt with **T-003**; submit.
    
- **If Image Challenge:** select from pre-generated samples to simulate entry (no inference cost at launch).  
    **Unlock:** **Challenge badge** track; ability to submit one real entry this week.
    

---

### C9. Profile & Whiteboard (Pegboard)

**You’ll learn:** light personalization that actually helps discovery.  
**Flow (5–7 min):** avatar/accent → pin great work, not everything.  
**Micro-exercise (no inference):**

1. Pick avatar + accent color.
    
2. Pin up to **six** items (runs, images, links) on a **3×2 Whiteboard** grid.  
    **Unlock:** profile completeness badge; Whiteboard goes live on your profile.
    

---

## Premium Sprints (3 paid) — available immediately after C9

> Each sprint ends with reusable, higher-value templates. Price in **TC** or bundle in subs.

### P1. AI Writing Sprint — Email, Brief, Blog (90 min total)

**You’ll learn:** outcome-first briefs, tone ladders, structural prompts, revision loops.  
**Includes:**

- **Templates:** T-101 Email Polisher, T-102 Brief Scaffold, T-103 Blog Draft→Polish.
    
- **Exercises (modest cost):** 3 short runs per template (≤ 300 out tokens each); one “polish pass” at the end.  
    **Deliverable:** a ready-to-send email, a 1-page executive brief, a 600–800 word post.
    

---

### P2. Image Creation Sprint — Prompt→Refine→Upscale (60–75 min)

**You’ll learn:** prompt anatomy, style tags, variation passes, upscale/export.  
**Includes:**

- **Templates:** I-101 Base Prompt Builder, I-102 Variation Trio, I-103 Upscale + Caption.
    
- **Exercises:** generate base (512², 20–28 steps), make 3 variations, upscale one; final caption lines.  
    **Deliverable:** a 3-image set and one upscaled hero with caption—ready to post or enter in the challenge.
    

---

### P3. Creator Kit — Make a Portfolio Post that Hits (60 min)

**You’ll learn:** story framing, before/after, call-to-action, Whiteboard curation.  
**Includes:**

- **Templates:** C-101 Portfolio Story, C-102 “How I did it” Breakdown, C-103 CTA Finisher.
    
- **Exercises:** assemble one showcase post from previous outputs; finalize with CTA; pin to Whiteboard.  
    **Deliverable:** a polished portfolio post on your profile + pinned tile(s).
    

---

## Template Index (unlocked along the way)

- **T-001** Outcome Prompt (A2) — notes → brief/email/bullets
    
- **T-002** Summarize & Style (A3) — short extract/abstract + tone
    
- **T-003** Clean & Rephrase (B5) — clarity pass with TC-saving scaffold
    
- **T-101** Email Polisher (P1)
    
- **T-102** Brief Scaffold (P1)
    
- **T-103** Blog Draft→Polish (P1)
    
- **I-101** Base Prompt Builder (P2)
    
- **I-102** Variation Trio (P2)
    
- **I-103** Upscale + Caption (P2)
    
- **C-101** Portfolio Story (P3)
    
- **C-102** “How I did it” Breakdown (P3)
    
- **C-103** CTA Finisher (P3)
    

---

## Cost Guardrails (for these lessons)

- **Free tier exercises** aim for **≤ 250 input** and **≤ 180 output tokens**.
    
- **Models:** small/deterministic for A/B/C; bigger models reserved for P-courses/templates where users are paying.
    
- **Caching:** hash the prompt for A2/A3/B5 exercises to reuse results where identical.
    
- **Image settings (P2):** start at **512×512**, 20–28 steps; upscale once.
    

---

## Unlock Logic (explicit flags)

- After **A3** → `unlocked.playground = true`
    
- After **B6** → `unlocked.community = true`
    
- After **C9** → premium upsell card appears; Whiteboard becomes public
    

---

## Receipts & Microcopy (drop-in)

- Cost meter: `Estimated cost: {value} TC`
    
- Receipt: `Reserved {r} TC → Settled {s} TC • Saved {r-s} TC`
    
- Locked tab teaser (Playground): `Finish A1–A3 to unlock the Playground`
    
- Locked tab teaser (Community): `Finish B4–B6 to unlock Community`
    
- Challenge banner: `Weekly Challenge: {THEME} • Submit by {DATE}`