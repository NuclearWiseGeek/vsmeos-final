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
// MODE: BENCHMARK
// =============================================================================

const BENCHMARK_SYSTEM = `You are a senior carbon accounting expert with deep knowledge of
sector-specific GHG emission intensities across different countries.

Your task: provide an accurate, country-aware carbon intensity benchmark for a given
industry and country combination.

CRITICAL RULES:
1. Return ONLY valid JSON — no preamble, no markdown, no explanation outside the JSON.
2. All intensity figures are in kgCO₂e per €1 million revenue (Scope 1+2+3 combined).
3. Use the correct national statistical authority for the country (e.g. ADEME for France,
   UBA for Germany, DEFRA for UK, EPA for USA, CPCB for India, etc.).
4. Account for country-specific factors: grid carbon intensity, industrial energy mix,
   regulatory context, typical fuel types used in that country.
5. Figures must be for SMEs (10–500 employees), not large corporates.
6. The percentile estimate is where a company with this exact intensity sits vs sector peers.
7. context_sentence must be 1-2 sentences explaining WHY this country's benchmark differs
   from the global average — be specific (cite grid factor, fuel mix, regulation).
8. Never invent sources. Only cite real national agencies and published datasets.`;

async function getBenchmark(payload: any): Promise<any> {
  const { industry, country, year, yourIntensity, gridFactor, primaryCalculator } = payload;

  const userPrompt = `
Industry: ${industry}
Country: ${country}
Reporting year: ${year}
Company's actual intensity: ${Math.round(yourIntensity)} kgCO₂e/€M revenue
Country electricity grid factor: ${gridFactor} kgCO₂e/kWh
Primary national emission authority: ${primaryCalculator}

Provide a benchmark for ${industry} SMEs in ${country} for ${year}.

Return this exact JSON structure:
{
  "median_intensity": <number — median kgCO₂e/€M for this industry+country>,
  "p25_intensity": <number — 25th percentile (good performers)>,
  "p75_intensity": <number — 75th percentile (poor performers)>,
  "your_percentile": <number 1-99 — where ${Math.round(yourIntensity)} sits vs peers>,
  "headline": "<one sentence: e.g. 'Your intensity is 23% below the median for Light Manufacturing in France'>",
  "context_sentence": "<1-2 sentences explaining country-specific factors affecting this benchmark>",
  "reduction_opportunity_pct": <number — estimated % reduction possible with best available practices>,
  "primary_source": "<exact citation: agency name + report + year>",
  "secondary_source": "<second citation or empty string>",
  "country_factor_note": "<one sentence on how ${country}'s grid/fuel mix affects this sector specifically>"
}`;

  const raw = await callClaude(BENCHMARK_SYSTEM, userPrompt);
  return extractJSON(raw);
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

  // ── BENCHMARK MODE ─────────────────────────────────────────────────────────
  if (mode === 'benchmark') {
    const { industry, country, year, yourIntensity, gridFactor, primaryCalculator } = body;

    if (!industry || !country || !year || !yourIntensity) {
      return NextResponse.json({ error: 'Missing required fields for benchmark' }, { status: 400 });
    }

    const supabase = adminSupabase();
    const cacheKey = `${industry}__${country}__${year}`;

    // Check cache first
    const { data: cached } = await supabase
      .from('intelligence_cache')
      .select('result')
      .eq('cache_key', cacheKey)
      .eq('mode', 'benchmark')
      .maybeSingle();

    if (cached?.result) {
      // Cache hit — return immediately, personalise headline with their intensity
      const result = { ...cached.result, cached: true, yourIntensity };
      return NextResponse.json(result);
    }

    // Cache miss — call Claude
    try {
      const result = await getBenchmark({ industry, country, year, yourIntensity, gridFactor, primaryCalculator });

      // Store in cache
      await supabase.from('intelligence_cache').upsert({
        cache_key:  cacheKey,
        mode:       'benchmark',
        result,
        created_by: userId,
        created_at: new Date().toISOString(),
      }, { onConflict: 'cache_key, mode' });

      return NextResponse.json({ ...result, cached: false, yourIntensity });

    } catch (err: any) {
      console.error('[Intelligence API] Benchmark error:', err);
      return NextResponse.json({ error: 'Benchmark generation failed', detail: err.message }, { status: 500 });
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

      // Log usage (not cached — each call is unique)
      const supabase = adminSupabase();
      await supabase.from('intelligence_cache').insert({
        cache_key:  `rec__${userId}__${body.year}__${Date.now()}`,
        mode:       'recommendations',
        result,
        created_by: userId,
        created_at: new Date().toISOString(),
      }).then(() => {}); // fire and forget

      return NextResponse.json(result);

    } catch (err: any) {
      console.error('[Intelligence API] Recommendations error:', err);
      return NextResponse.json({ error: 'Recommendations generation failed', detail: err.message }, { status: 500 });
    }
  }
}