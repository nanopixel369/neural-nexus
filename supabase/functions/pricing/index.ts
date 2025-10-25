// Supabase Edge Function (Deno)
// Route: /functions/v1/pricing
// Purpose: fast, stateless TC estimate for text/image jobs.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

type TextBody = {
  kind: "text";
  inputTokens?: number;     // estimated tokenized length of input
  templateBias?: number;    // 0.8..1.2 factor depending on template efficiency
  temperature?: number;     // used to slightly widen estimate
  top_p?: number;
  stops?: number;           // number of stop sequences
};

type ImageBody = {
  kind: "image";
  resolution?: number;      // 256, 512, 768, 1024
  steps?: number;           // 10..50
  guidance?: number;        // 1..20
  tiling?: boolean;
};

type ReqBody = (TextBody | ImageBody) & { safetyMarginPct?: number };

function estimateTextTC(b: TextBody): number {
  const input = Math.max(0, Math.floor(b.inputTokens ?? 0));
  const bias = Math.min(1.4, Math.max(0.6, b.templateBias ?? 1));
  const temp = b.temperature ?? 0.7;
  const stops = Math.max(0, Math.min(4, b.stops ?? 0));
  // Base: tiny constant + very small per-token
  let est = 2 + input * 0.002 * bias;
  // Slight spread for sampling entropy and stop handling
  est *= 1 + (temp - 0.7) * 0.08 + stops * 0.02;
  return Math.max(1, Math.ceil(est));
}

function estimateImageTC(b: ImageBody): number {
  const res = Math.max(256, Math.min(2048, b.resolution ?? 512));
  const steps = Math.max(8, Math.min(100, b.steps ?? 20));
  const guidance = Math.max(1, Math.min(25, b.guidance ?? 7.5));
  const tiling = !!b.tiling;

  const resFactor = Math.max(1, res / 512);
  let est = 5 * resFactor * (steps / 20) * (guidance / 7.5);
  if (tiling) est *= 1.15;
  return Math.max(1, Math.ceil(est));
}

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }
    const body = (await req.json()) as ReqBody;

    let base = 1;
    if (body?.kind === "text") base = estimateTextTC(body);
    else if (body?.kind === "image") base = estimateImageTC(body);
    else return new Response("bad body", { status: 400 });

    // Add server-side safety margin (client can still clamp UI)
    const safety = Math.max(0, Math.min(0.5, (body.safetyMarginPct ?? 0.2)));
    const estimatedTC = Math.max(1, Math.ceil(base * (1 + safety)));

    return new Response(JSON.stringify({ estimatedTC }), {
      headers: { "content-type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
});
