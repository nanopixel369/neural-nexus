// Supabase Edge Function (Deno): Reserve TC for a run
// Route: /functions/v1/runs-reserve
// Auth: requires either (A) Bearer <JWT> of a signed-in user, or (B) header x-user-id (local dev only)

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Body = {
  estTC: number;                 // estimated TC to reserve (int >= 1)
  provider?: string;             // e.g., 'mock' | 'openai' | 'anthropic'
  templateId?: string | null;    // optional template id
  receiptId: string;             // unique string for idempotency (e.g., rcpt_<timestamp>)
};

serve(async (req) => {
  try {
    if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = Deno.env.toObject();
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response("Server misconfigured", { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Resolve user id: prefer dev header, then JWT
    const auth = req.headers.get("Authorization") ?? "";
    const uidHeader = req.headers.get("x-user-id");
    let uid: string | null = null;

    if (uidHeader) {
    uid = uidHeader; // local/dev override
    } else if (auth.startsWith("Bearer ")) {
    const jwt = auth.slice(7);
    const { data, error } = await supabase.auth.getUser(jwt);
    if (error || !data?.user?.id) return new Response("Unauthorized", { status: 401 });
    uid = data.user.id;
    } else {
    return new Response("Unauthorized (no user)", { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as Body | null;
    if (!body || !body.receiptId) return new Response("Bad body", { status: 400 });

    const estTC = Math.max(1, Math.floor(body.estTC ?? 0));
    const provider = body.provider ?? "mock";
    const templateId = body.templateId ?? null;
    const receiptId = body.receiptId;

    // 1) Create a pending run
    const { data: runRow, error: runErr } = await supabase
      .from("runs")
      .insert({
        user_id: uid,
        provider,
        template_id: templateId,
        est_tc: estTC,
        status: "pending",
      })
      .select("id")
      .single();

    if (runErr) return new Response(runErr.message, { status: 500 });
    const runId = runRow.id as string;

    // 2) Debit wallet atomically
    const { data: deb, error: debErr } = await supabase.rpc("debit_wallet", {
      p_user_id: uid,
      p_amount: estTC,
    });
    if (debErr) {
      // revert run row if debit fails
      await supabase.from("runs").delete().eq("id", runId);
      return new Response(`Wallet error: ${debErr.message}`, { status: 400 });
    }

    // 3) Record the usage tx (idempotent via unique receipt_id)
    const { error: txErr } = await supabase.from("tc_transactions").insert({
      user_id: uid,
      run_id: runId,
      kind: "usage",
      amount: estTC,
      receipt_id: receiptId,
    });
    if (txErr) {
      // on conflict, restore wallet and delete run
      await supabase.rpc("credit_wallet", { p_user_id: uid, p_amount: estTC });
      await supabase.from("runs").delete().eq("id", runId);
      return new Response(`Tx error: ${txErr.message}`, { status: 409 });
    }

    // 4) Mark run reserved/running
    await supabase.from("runs").update({ reserved_tc: estTC, status: "running" }).eq("id", runId);

    return new Response(JSON.stringify({ runId, reservedTC: estTC }), {
      headers: { "content-type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
});
