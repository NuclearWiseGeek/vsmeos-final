// =============================================================================
// FILE: app/utils/benchmarkLookup.ts
// PURPOSE: Fast, zero-cost benchmark lookup from pre-computed JSON dataset.
//          Replaces the Claude API call for industry benchmarks.
//
// DATA SOURCE: benchmarks_2025.json — built from:
//   - Eurostat ENV_AC_AINAH_R2 2022 (EU GHG by NACE sector)
//   - CDP 2024 Global Disclosure (SME sector medians)
//   - DEFRA 2025 / ADEME 2024 / national grid agencies (country grid factors)
//   - World Bank WDI 2022 (GDP per capita ratios)
//
// METRIC: kgCO₂e per EUR 1 million revenue (Scope 1+2+3 combined)
//
// COVERAGE:
//   - 22 industries (all VSME OS industries from supplier/page.tsx)
//   - 56 countries (32 EU + 24 global including US, UK, India, China, etc.)
//   - Fallback to global_median for any country not in the dataset
//
// COST: Zero. No API call. Reads from a static JSON file.
//
// PHASE 4 — replaces Claude benchmark API call
// =============================================================================

import benchmarkData from '@/data/benchmarks_2025.json';

export interface BenchmarkLookupResult {
  // The supplier's own intensity
  yourIntensity:     number;   // kgCO₂e / €M revenue

  // Benchmarks (kgCO₂e / €M revenue)
  median:            number;
  p25:               number;   // 25th percentile — good performers
  p75:               number;   // 75th percentile — poor performers

  // Derived
  percentVsMedian:   number;   // negative = below = better
  yourPercentile:    number;   // 1–99, approximate
  isBelow:           boolean;
  isAbove:           boolean;
  isFlat:            boolean;

  // Display
  headline:          string;
  contextNote:       string;
  sectorLabel:       string;
  countryUsed:       string;   // either exact country or 'global average'

  // Sources
  primarySource:     string;
  version:           string;
}

// ─── Internal types matching JSON structure ────────────────────────────────────

interface CountryBenchmark {
  median: number;
  p25:    number;
  p75:    number;
}

interface IndustryBenchmark {
  global_median: number;
  global_p25:    number;
  global_p75:    number;
  eu_median:     number;
  countries:     Record<string, CountryBenchmark>;
}

// ─── Country context notes ─────────────────────────────────────────────────────
// These appear in the benchmark card to explain WHY a country is above/below median

const COUNTRY_NOTES: Record<string, string> = {
  'France':         'France benefits from one of Europe\'s lowest-carbon electricity grids (0.052 kgCO₂e/kWh), driven by nuclear power — a structural Scope 2 advantage.',
  'Germany':        'Germany\'s ongoing coal phase-out means its grid (0.364 kgCO₂e/kWh) is still above the EU average, raising Scope 2 intensity vs cleaner-grid peers.',
  'Poland':         'Poland\'s coal-heavy grid (0.695 kgCO₂e/kWh) is among Europe\'s most carbon-intensive, significantly lifting Scope 2 emissions for most sectors.',
  'Sweden':         'Sweden\'s near-zero-carbon grid (0.013 kgCO₂e/kWh, hydro + nuclear) gives Swedish companies a major structural Scope 2 advantage.',
  'Norway':         'Norway\'s almost entirely hydroelectric grid (0.017 kgCO₂e/kWh) produces the lowest grid intensity in Europe.',
  'Netherlands':    'The Netherlands grid (0.298 kgCO₂e/kWh) is above the EU average, though offshore wind is rapidly lowering this.',
  'Italy':          'Italy\'s mixed grid (0.251 kgCO₂e/kWh) sits near the EU average, with regional variation across the north-south divide.',
  'Spain':          'Spain benefits from significant renewables penetration (0.181 kgCO₂e/kWh), keeping Scope 2 below the EU average.',
  'Belgium':        'Belgium\'s nuclear-heavy grid (0.144 kgCO₂e/kWh) is one of the cleanest in Western Europe.',
  'United Kingdom': 'The UK grid (0.196 kgCO₂e/kWh, DEFRA 2025) has improved significantly due to offshore wind, now well below the EU average.',
  'United States':  'The US grid (0.352 kgCO₂e/kWh, EPA eGRID 2023) varies significantly by state — renewables-heavy states like California are much lower.',
  'India':          'India\'s coal-dominated grid (0.716 kgCO₂e/kWh, CEA 2024) is among the most carbon-intensive globally, significantly lifting Scope 2 intensity.',
  'China':          'China\'s grid (0.557 kgCO₂e/kWh, CEPCI 2024) is improving as renewables expand, but coal still dominates in most provinces.',
  'Australia':      'Australia\'s grid (0.610 kgCO₂e/kWh, NGA 2024) is coal-heavy, though a rapid renewables transition is underway.',
  'Brazil':         'Brazil benefits from a hydro-dominated grid (0.100 kgCO₂e/kWh, SEEG 2024), one of the cleanest in the Americas.',
  'Japan':          'Japan\'s grid (0.462 kgCO₂e/kWh) remains coal-reliant following the post-Fukushima nuclear phase-down.',
  'South Korea':    'South Korea\'s grid (0.415 kgCO₂e/kWh) is coal and LNG heavy, with nuclear providing some low-carbon balance.',
  'South Africa':   'South Africa\'s grid (0.928 kgCO₂e/kWh, ESKOM 2024) is one of the world\'s most carbon-intensive, almost entirely coal-based.',
};

const DEFAULT_COUNTRY_NOTE = 'Carbon intensity benchmarks are influenced by your country\'s electricity grid carbon intensity and economic structure. Using global sector average as reference.';

// ─── Main lookup function ─────────────────────────────────────────────────────

export function lookupBenchmark(
  industry: string,
  country: string,
  yourIntensity: number,
): BenchmarkLookupResult | null {
  if (!industry || !country || yourIntensity <= 0) return null;

  const data = benchmarkData as { metadata: any; benchmarks: Record<string, IndustryBenchmark> };
  const industryData = data.benchmarks[industry];
  if (!industryData) return null;

  // Try exact country match first, then fall back to global
  const countryData = industryData.countries[country] || null;
  const countryUsed = countryData ? country : 'global average';

  const median = countryData?.median ?? industryData.global_median;
  const p25    = countryData?.p25    ?? industryData.global_p25;
  const p75    = countryData?.p75    ?? industryData.global_p75;

  // Percentage vs median (negative = below = good)
  const percentVsMedian = median > 0
    ? ((yourIntensity - median) / median) * 100
    : 0;

  const FLAT_THRESHOLD = 8;
  const isBelow = percentVsMedian < -FLAT_THRESHOLD;
  const isAbove = percentVsMedian >  FLAT_THRESHOLD;
  const isFlat  = !isBelow && !isAbove;

  // Approximate percentile from p25/p75
  let yourPercentile: number;
  if (yourIntensity <= p25) {
    yourPercentile = Math.round(25 * (yourIntensity / p25));
  } else if (yourIntensity <= median) {
    yourPercentile = Math.round(25 + 25 * ((yourIntensity - p25) / (median - p25)));
  } else if (yourIntensity <= p75) {
    yourPercentile = Math.round(50 + 25 * ((yourIntensity - median) / (p75 - median)));
  } else {
    yourPercentile = Math.min(99, Math.round(75 + 24 * ((yourIntensity - p75) / p75)));
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n);

  const absPct = Math.abs(percentVsMedian).toFixed(1);
  const locationLabel = countryData ? country : 'globally';

  const headline = isBelow
    ? `Your intensity is ${absPct}% below the ${industry} median ${locationLabel} ↓`
    : isAbove
    ? `Your intensity is ${absPct}% above the ${industry} median ${locationLabel} ↑`
    : `Your intensity is in line with the ${industry} median ${locationLabel}`;

  const contextNote = COUNTRY_NOTES[country] || DEFAULT_COUNTRY_NOTE;

  return {
    yourIntensity,
    median,
    p25,
    p75,
    percentVsMedian,
    yourPercentile,
    isBelow,
    isAbove,
    isFlat,
    headline,
    contextNote,
    sectorLabel:  industry,
    countryUsed,
    primarySource: `Eurostat ENV_AC_AINAH_R2 2022 + CDP 2024 Global Disclosure · ${data.metadata.version}`,
    version:       data.metadata.version,
  };
}

// ─── Helper: check if a country is in the dataset ─────────────────────────────

export function isCoveredCountry(country: string): boolean {
  const data = benchmarkData as { benchmarks: Record<string, IndustryBenchmark> };
  const first = Object.values(data.benchmarks)[0];
  return country in (first?.countries ?? {});
}

// ─── Helper: get all covered countries ────────────────────────────────────────

export function getCoveredCountries(): string[] {
  const data = benchmarkData as { benchmarks: Record<string, IndustryBenchmark> };
  const first = Object.values(data.benchmarks)[0];
  return Object.keys(first?.countries ?? {});
}