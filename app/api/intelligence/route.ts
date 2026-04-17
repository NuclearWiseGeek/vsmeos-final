// =============================================================================
// FILE: app/api/intelligence/route.ts
// PURPOSE: Unified Claude-powered intelligence endpoint for Phase 4.3 + 4.4.
//
// TWO MODES (single endpoint, mode selected by request body):
//
//   mode: "benchmark"
//     → Country-aware + industry-specific carbon intensity benchmark.
//     → Cached in Supabase by (industry, country, year) — most suppliers
//       hit the cache instantly after the first call for that combination.
//     → Claude cites the correct national authority per country (ADEME for
//       France, UBA for Germany, DEFRA for UK, etc.) using the same
//       primaryCalculator data already in calculations.ts.
//
//   mode: "recommendations"
//     → 3 specific, personalised reduction actions for THIS supplier.
//     → NOT cached — every supplier's breakdown is unique.
//     → Claude receives the full scope breakdown, biggest single source,
//       country grid factor, and industry context.
//
// SECURITY:
//   - Clerk auth required on all requests
//   - Supabase cache uses service role (no RLS needed for a read cache table)
//     but user_id is logged so we can audit usage
//
// MODEL: claude-sonnet-4-20250514 (as specified in Phase 4 handover doc)
//
// COST ESTIMATE:
//   Benchmark:       ~$0.006/unique (industry×country×year) combination
//   Recommendations: ~$0.012/supplier
//   Both are negligible vs €199/supplier revenue.
//
// PHASE 4 — Tasks 4.3 + 4.4
// =============================================================================

import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

// Admin Supabase client for cache table (no user RLS needed here)
function adminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// ─── Claude API call ──────────────────────────────────────────────────────────

async function callClaude(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model:      MODEL,
      max_tokens: 1024,
      system:     systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text = data.content?.find((b: any) => b.type === 'text')?.text || '';
  return text.trim();
}

// ─── JSON extraction helper ───────────────────────────────────────────────────

function extractJSON(raw: string): any {
  // Strip markdown fences if present
  const clean = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  return JSON.parse(clean);
}

// =============================================================================
// MODE: RECOMMENDATIONS
// =============================================================================

const RECOMMENDATIONS_SYSTEM = `You are a senior carbon reduction consultant specialising in
SME decarbonisation. You give specific, quantified, actionable advice — not generic platitudes.

CRITICAL RULES:
1. Return ONLY valid JSON — no preamble, no markdown, no explanation outside the JSON.
2. Every recommendation must include a specific estimated reduction in kgCO₂e AND percentage.
3. Recommendations must be achievable within 12 months for an SME.
4. Be country-specific: reference local schemes, tariffs, regulations where relevant.
5. Prioritise the highest-impact sources first (based on the scope breakdown provided).
6. Never recommend something that isn't relevant to this company's actual emission sources.
   If they have zero flights, do not mention flights.
7. The payback_period must be realistic for an SME (not "immediate" for capital investments).
8. difficulty: "low" = behaviour/policy change, "medium" = procurement change,
   "high" = capital investment required.`;

async function getRecommendations(payload: any): Promise<any> {
  const {
    industry, country, year,
    scope1Kg, scope2Kg, scope3Kg, totalKg,
    intensityKgPerMRevenue,
    gridFactor, primaryCalculator,
    topSources,   // array of { activity, emissionsKg, pctOfTotal }
    activityData, // raw inputs for context
    currency,
  } = payload;

  const scope1Pct = totalKg > 0 ? ((scope1Kg / totalKg) * 100).toFixed(1) : '0';
  const scope2Pct = totalKg > 0 ? ((scope2Kg / totalKg) * 100).toFixed(1) : '0';
  const scope3Pct = totalKg > 0 ? ((scope3Kg / totalKg) * 100).toFixed(1) : '0';

  const topSourcesText = topSources
    .slice(0, 5)
    .map((s: any, i: number) =>
      `${i + 1}. ${s.activity}: ${Math.round(s.emissionsKg)} kgCO₂e (${s.pctOfTotal.toFixed(1)}% of total)`
    ).join('\n');

  const userPrompt = `
Company profile:
- Industry: ${industry}
- Country: ${country}
- Reporting year: ${year}
- Currency: ${currency}

Emissions breakdown:
- Scope 1 (direct): ${Math.round(scope1Kg)} kgCO₂e (${scope1Pct}%)
- Scope 2 (electricity/heat): ${Math.round(scope2Kg)} kgCO₂e (${scope2Pct}%)
- Scope 3 (travel/commute): ${Math.round(scope3Kg)} kgCO₂e (${scope3Pct}%)
- Total: ${Math.round(totalKg)} kgCO₂e
- Carbon intensity: ${Math.round(intensityKgPerMRevenue)} kgCO₂e/€M revenue

Country context:
- Grid factor: ${gridFactor} kgCO₂e/kWh (${primaryCalculator})

Top 5 emission sources (ranked by size):
${topSourcesText}

Raw activity inputs for context:
${JSON.stringify(activityData, null, 2)}

Provide exactly 3 reduction recommendations, prioritised by impact.
Focus ONLY on sources that actually appear in this company's data (non-zero values).

Return this exact JSON structure:
{
  "recommendations": [
    {
      "rank": 1,
      "title": "<short action title, max 8 words>",
      "target_source": "<which emission category this addresses>",
      "action": "<specific action to take — what exactly to do, be concrete>",
      "estimated_reduction_kg": <number — kgCO₂e saved per year>,
      "estimated_reduction_pct": <number — % of total emissions reduced>,
      "how_calculated": "<one sentence explaining the reduction estimate methodology>",
      "country_specific_tip": "<country-specific advice, scheme, or resource for ${country}>",
      "difficulty": "low|medium|high",
      "payback_period": "<e.g. 'Immediate', '6-12 months', '2-3 years'>",
      "csrd_relevance": "<which ESRS E1 disclosure point this supports>"
    }
  ],
  "total_potential_reduction_kg": <sum of all three>,
  "total_potential_reduction_pct": <pct of current total>,
  "priority_note": "<one sentence on which scope to tackle first and why>"
}`;

  const raw = await callClaude(RECOMMENDATIONS_SYSTEM, userPrompt);
  return extractJSON(raw);
}

// =============================================================================
// ROUTE HANDLER
// =============================================================================

export async function POST(request: Request) {
  // 1. Auth check
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { mode } = body;
  if (!mode || !['benchmark', 'recommendations'].includes(mode)) {
    return NextResponse.json({ error: 'mode must be "benchmark" or "recommendations"' }, { status: 400 });
  }

  // ── BENCHMARK MODE — zero cost, reads from pre-computed JSON ──────────────
  // No Claude API call. Data from Eurostat 2022 + CDP 2024 + DEFRA 2025.
  if (mode === 'benchmark') {
    const { industry, country, yourIntensity } = body;

    if (!industry || !country || !yourIntensity) {
      return NextResponse.json({ error: 'Missing required fields for benchmark' }, { status: 400 });
    }

    try {
      // Dynamic import so the JSON is only loaded when needed
      const { lookupBenchmark } = await import('@/utils/benchmarkLookup');
      const result = lookupBenchmark(industry, country, Number(yourIntensity));

      if (!result) {
        return NextResponse.json({ error: 'No benchmark data for this industry/country combination' }, { status: 404 });
      }

      return NextResponse.json({ ...result, cached: false });

    } catch (err: any) {
      console.error('[Intelligence API] Benchmark lookup error:', err);
      return NextResponse.json({ error: 'Benchmark lookup failed', detail: err.message }, { status: 500 });
    }
  }

  // ── RECOMMENDATIONS MODE ───────────────────────────────────────────────────
  if (mode === 'recommendations') {
    const required = ['industry', 'country', 'year', 'scope1Kg', 'scope2Kg', 'scope3Kg', 'totalKg', 'topSources'];
    for (const field of required) {
      if (body[field] === undefined) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    try {
      const result = await getRecommendations(body);

      // Cache per (userId, year) with stable key so dashboard can load it
      const supabase = adminSupabase();
      await supabase.from('intelligence_cache').upsert({
        cache_key:  `rec__${userId}__${body.year}`,
        mode:       'recommendations',
        result,
        created_by: userId,
        created_at: new Date().toISOString(),
      }, { onConflict: 'cache_key, mode' }).then(() => {}); // fire and forget

      return NextResponse.json(result);

    } catch (err: any) {
      console.error('[Intelligence API] Recommendations error:', err);
      return NextResponse.json({ error: 'Recommendations generation failed', detail: err.message }, { status: 500 });
    }
  }
}