// =============================================================================
// FILE: app/api/intelligence/route.ts
// PURPOSE: Unified VESQ3 intelligence endpoint.
//
// TWO MODES:
//   mode: "benchmark"
//     → Country-aware + industry-specific carbon intensity benchmark.
//     → Claude Sonnet call, ~$0.006/call.
//     → Cached in intelligence_cache by (industry__country__year).
//
//   mode: "recommendations"
//     → 3 specific, personalised reduction actions for THIS supplier.
//     → Claude Sonnet call, ~$0.012/call.
//     → Cached in intelligence_cache by rec__{userId}__{year}.
//
// MODEL: claude-sonnet-4-20250514
// =============================================================================

import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

function adminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

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
  return (data.content?.find((b: any) => b.type === 'text')?.text || '').trim();
}

function extractJSON(raw: string): any {
  const clean = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  return JSON.parse(clean);
}

// =============================================================================
// MODE: BENCHMARK
// Returns industry intensity benchmarks for the supplier's sector + country.
// Uses Claude's knowledge of Eurostat, CDP SME data, IEA, DEFRA, ADEME.
// ~$0.006 per call. Cached per (industry, country, year).
// =============================================================================

const BENCHMARK_SYSTEM = `You are a carbon accounting expert with deep knowledge of
industry-specific GHG emission intensity benchmarks from Eurostat ENV_AC_AINAH_R2,
CDP Supply Chain reports, IEA sector data, ADEME, and DEFRA.

CRITICAL RULES:
1. Return ONLY valid JSON — no preamble, no markdown, no text outside the JSON.
2. All intensity figures are in kgCO₂e per million EUR of revenue (kgCO₂e/€M).
3. Base your figures on real published benchmark data for the industry and country.
4. p25_intensity = top performer threshold (lower is better for emissions).
5. p75_intensity = laggard threshold — 75% of companies are below this.
6. median_intensity is between p25 and p75.
7. your_percentile: where does yourIntensity fall? 1 = top performer, 99 = worst.
   Calculate: if yourIntensity < p25 → percentile 10-25.
              if yourIntensity between p25 and median → percentile 25-50.
              if yourIntensity between median and p75 → percentile 50-75.
              if yourIntensity > p75 → percentile 75-95.
8. headline: max 15 words, specific to their position.
9. country_factor_note: reference the actual grid emission factor for that country
   and explain its impact on Scope 2 emissions for this industry.
10. primary_source: cite the actual data source (e.g. "Eurostat ENV_AC_AINAH_R2 2022 · CDP SME Climate Report 2024").
11. reduction_opportunity_pct: realistic % reduction if they reached p25 from current position.`;

async function getBenchmark(payload: any): Promise<any> {
  const { industry, country, year, yourIntensity, gridFactor, primaryCalculator } = payload;

  const userPrompt = `
Industry: ${industry}
Country: ${country}
Reporting year: ${year}
This company's current carbon intensity: ${Math.round(yourIntensity)} kgCO₂e/€M revenue
Country electricity grid factor: ${gridFactor} kgCO₂e/kWh (${primaryCalculator})

Provide an industry benchmark for this company's sector in their country.
Use real data from Eurostat, CDP, IEA, national energy agencies.
Consider country-specific factors (grid intensity, industrial structure, climate).

Return this EXACT JSON structure (no other text):
{
  "median_intensity": <number — kgCO₂e/€M for median company in this sector>,
  "p25_intensity": <number — intensity of top 25% performers (lower = better)>,
  "p75_intensity": <number — intensity of bottom 25% (laggards)>,
  "your_percentile": <number 1-99 — where this company falls>,
  "headline": "<max 15 words summarising their position vs peers>",
  "context_sentence": "<2-3 sentences: what drives intensity in this industry + country-specific factors>",
  "reduction_opportunity_pct": <number — % reduction needed to reach p25>,
  "primary_source": "<specific data sources used for this benchmark>",
  "secondary_source": "<secondary source or empty string>",
  "country_factor_note": "<1 sentence on how the country grid factor affects Scope 2 for this industry>"
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
    topSources,
    activityData,
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
//
// CACHE CONTRACT (applies to both modes):
//   1. Cache is checked FIRST using a deterministic key.
//   2. If a cached result exists AND body.force !== true → return cached, free.
//   3. Otherwise → call Claude → write result to cache → return fresh.
//   4. Every response includes a `cached` boolean so the UI can signal to users.
//
// CACHE KEYS (must stay in sync with actions/dashboard.ts):
//   benchmark       : `{industry}__{country}__{year}`
//   recommendations : `rec__{userId}__{year}`
//
// YEAR NORMALISATION:
//   Year is normalised to a number at the top of the handler. If missing,
//   we default to the current calendar year. This guarantees the cache key
//   produced when writing matches the cache key the dashboard uses when
//   reading — regardless of whether the caller sent a year or not.
//
// COST CONTROL:
//   - Initial generation on the results page: 1 Claude call (pays once).
//   - Every subsequent dashboard load: 0 Claude calls (cache hits).
//   - Explicit "Refresh" click from dashboard: 1 Claude call (user-initiated).
//   - Next reporting year: fresh cache key → 1 Claude call automatically.
// =============================================================================

export async function POST(request: Request) {
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

  // ── Normalise year + force flag for both modes ───────────────────────────
  // Year is coerced to a number so cache keys are deterministic regardless of
  // whether the caller sent "2024" (string) or 2024 (integer). Defaults to
  // the current calendar year if missing.
  const year  = Number(body.year) || new Date().getFullYear();
  const force = body.force === true;

  // ── BENCHMARK MODE ────────────────────────────────────────────────────────
  if (mode === 'benchmark') {
    const { industry, country, yourIntensity } = body;
    if (!industry || !country || yourIntensity === undefined) {
      return NextResponse.json({ error: 'Missing required fields for benchmark' }, { status: 400 });
    }

    const cacheKey = `${industry}__${country}__${year}`;

    try {
      const supabase = adminSupabase();

      // 1. Check cache unless caller explicitly requested a fresh result
      if (!force) {
        const { data: cached } = await supabase
          .from('intelligence_cache')
          .select('result')
          .eq('cache_key', cacheKey)
          .eq('mode', 'benchmark')
          .maybeSingle();

        if (cached?.result) {
          return NextResponse.json({
            ...cached.result,
            yourIntensity: Number(yourIntensity),
            cached: true,
          });
        }
      }

      // 2. Cache miss OR force=true → call Claude
      const result = await getBenchmark({ ...body, year });

      // 3. Persist
      await supabase.from('intelligence_cache').upsert({
        cache_key:  cacheKey,
        mode:       'benchmark',
        result,
        created_by: userId,
        created_at: new Date().toISOString(),
      }, { onConflict: 'cache_key, mode' });

      return NextResponse.json({
        ...result,
        yourIntensity: Number(yourIntensity),
        cached: false,
      });

    } catch (err: any) {
      console.error('[Intelligence API] Benchmark error:', err);
      return NextResponse.json({ error: 'Benchmark generation failed', detail: err.message }, { status: 500 });
    }
  }

  // ── RECOMMENDATIONS MODE ──────────────────────────────────────────────────
  if (mode === 'recommendations') {
    const required = ['industry', 'country', 'scope1Kg', 'scope2Kg', 'scope3Kg', 'totalKg', 'topSources'];
    for (const field of required) {
      if (body[field] === undefined) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    const cacheKey = `rec__${userId}__${year}`;

    try {
      const supabase = adminSupabase();

      // 1. Check cache unless caller explicitly requested a fresh result
      if (!force) {
        const { data: cached } = await supabase
          .from('intelligence_cache')
          .select('result')
          .eq('cache_key', cacheKey)
          .eq('mode', 'recommendations')
          .maybeSingle();

        if (cached?.result) {
          return NextResponse.json({
            ...cached.result,
            cached: true,
          });
        }
      }

      // 2. Cache miss OR force=true → call Claude
      const result = await getRecommendations({ ...body, year });

      // 3. Persist
      await supabase.from('intelligence_cache').upsert({
        cache_key:  cacheKey,
        mode:       'recommendations',
        result,
        created_by: userId,
        created_at: new Date().toISOString(),
      }, { onConflict: 'cache_key, mode' });

      return NextResponse.json({
        ...result,
        cached: false,
      });

    } catch (err: any) {
      console.error('[Intelligence API] Recommendations error:', err);
      return NextResponse.json({ error: 'Recommendations generation failed', detail: err.message }, { status: 500 });
    }
  }
}