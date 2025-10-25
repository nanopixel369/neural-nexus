// Supabase Edge Function (Deno): Settle a run (final charge & refund delta)
// Route: /functions/v1/runs-settle
// Auth: same dev header or JWT pattern as reserve

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Body = {
  runId: string;
  settledTC: number;    // final actual cost
  receiptId: string;    // same base receiptId used for reserve (we’ll suffix -refund if needed)
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
      uid = uidHeader;
    } else if (auth.startsWith("Bearer ")) {
      const jwt = auth.slice(7);
      const { data, error } = await supabase.auth.getUser(jwt);
      if (error || !data?.user?.id) return new Response("Unauthorized", { status: 401 });
      uid = data.user.id;
    } else {
      return new Response("Unauthorized (no user)", { status: 401 });
    }

    // Parse body
    const body = (await req.json().catch(() => null)) as Body | null;
    if (!body || !body.runId || body.settledTC == null || !body.receiptId) {
      return new Response("Bad body", { status: 400 });
    }

    const runId = body.runId;
    const settledTC = Math.max(0, Math.floor(body.settledTC));
    const receiptId = body.receiptId;

    // 1) Fetch run to know reserved
    const { data: run, error: rerr } = await supabase
      .from("runs")
      .select("reserved_tc, status")
      .eq("id", runId)
      .single();
    if (rerr || !run) return new Response("Run not found", { status: 404 });

    const reserved = run.reserved_tc as number;
    const delta = Math.max(0, reserved - settledTC);

    // 2) Finalize run
    await supabase
      .from("runs")
      .update({ settled_tc: settledTC, status: "done" })
      .eq("id", runId);

    // 3) If refund due, credit wallet and record refund tx
    if (delta > 0) {
      await supabase.rpc("credit_wallet", {
        p_user_id: uid,
        p_amount: delta,
      });

      await supabase.from("tc_transactions").insert({
        user_id: uid,
        run_id: runId,
        kind: "refund",
        amount: delta,
        receipt_id: `${receiptId}-refund`,
      });
    }

    const receipt = `Reserved ${reserved} TC → Settled ${settledTC} TC • Saved ${delta} TC`;
    return new Response(JSON.stringify({ receipt, reserved, settled: settledTC, refunded: delta }), {
      headers: { "content-type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
});
