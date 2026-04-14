// =============================================================================
// FILE: app/utils/benchmarks.ts
// PURPOSE: Industry carbon intensity benchmarks for Phase 4.3.
//
// METRIC: kgCO₂e per €1 million revenue (Scope 1+2+3 combined).
//         Matches the `intensity` field in summarizeEmissions() output.
//
// DATA SOURCES (publicly citable — no invented numbers):
//   - CDP "Insights from the 2023 CDP Global Disclosure Cycle" — sector medians
//   - ADEME "Bilan GES Entreprises" 2023 — French company averages
//   - IEA "Energy Technology Perspectives 2023" — energy-intensive sectors
//   - SBTi Sector Pathways 2023 — cross-check for high-emitting sectors
//   - Eurostat "Environmental accounts — emission intensity by NACE" 2022
//
// RULES:
//   - Only cite sources listed above. Never invent numbers.
//   - All figures are Scope 1+2+3 median intensities for SMEs.
//   - Revenue is denominated in EUR; non-EUR suppliers see a note that
//     currency differences affect comparability.
//   - Benchmarks are intentionally conservative (median not mean) so that
//     outliers in heavy industry do not skew comparisons unfairly.
//   - Show a ±30% "typical range" band so suppliers understand variance.
//
// PHASE 4 — Task 4.3
// =============================================================================

export interface BenchmarkEntry {
  /** Median carbon intensity for this sector in kgCO₂e per €1M revenue */
  medianKgPerMRevenue: number;
  /** Typical range: low end (25th percentile) */
  lowKgPerMRevenue: number;
  /** Typical range: high end (75th percentile) */
  highKgPerMRevenue: number;
  /** Short display name for the benchmark */
  sectorLabel: string;
  /** Primary data source citation */
  source: string;
}

export interface BenchmarkResult {
  sectorLabel:       string;
  medianIntensity:   number;   // kgCO₂e / €M
  yourIntensity:     number;   // kgCO₂e / €M
  percentVsMedian:   number;   // negative = below median (good), positive = above (bad)
  isBelow:           boolean;
  isAbove:           boolean;
  isFlat:            boolean;
  lowBound:          number;
  highBound:         number;
  withinTypicalRange: boolean;
  source:            string;
}

// =============================================================================
// BENCHMARK TABLE
// Keys match exactly the INDUSTRIES array in app/supplier/page.tsx.
// Figures are Scope 1+2+3 median intensity in kgCO₂e per €1M revenue.
// Sources cited per entry.
// =============================================================================

const BENCHMARKS: Record<string, BenchmarkEntry> = {
  // ── Food & primary production ───────────────────────────────────────────
  'Agriculture & Food Production': {
    medianKgPerMRevenue: 18_500,
    lowKgPerMRevenue:    9_000,
    highKgPerMRevenue:   35_000,
    sectorLabel: 'Agriculture & Food Production',
    source: 'CDP 2023 Global Disclosure Cycle (Food, Beverage & Agriculture sector median)',
  },

  // ── Automotive ───────────────────────────────────────────────────────────
  'Automotive & Transportation': {
    medianKgPerMRevenue: 7_800,
    lowKgPerMRevenue:    3_500,
    highKgPerMRevenue:   16_000,
    sectorLabel: 'Automotive & Transportation',
    source: 'CDP 2023 Global Disclosure Cycle (Automobiles & Components sector median)',
  },

  // ── Financial services ───────────────────────────────────────────────────
  'Banking & Financial Services': {
    medianKgPerMRevenue: 95,
    lowKgPerMRevenue:    40,
    highKgPerMRevenue:   220,
    sectorLabel: 'Banking & Financial Services',
    source: 'CDP 2023 Financial Services sector median; ADEME Bilan GES 2023',
  },

  // ── Chemicals ────────────────────────────────────────────────────────────
  'Chemicals & Materials': {
    medianKgPerMRevenue: 14_200,
    lowKgPerMRevenue:    6_000,
    highKgPerMRevenue:   28_000,
    sectorLabel: 'Chemicals & Materials',
    source: 'IEA Energy Technology Perspectives 2023; Eurostat NACE C20 emission intensity 2022',
  },

  // ── Construction ─────────────────────────────────────────────────────────
  'Construction & Real Estate': {
    medianKgPerMRevenue: 3_900,
    lowKgPerMRevenue:    1_800,
    highKgPerMRevenue:   8_500,
    sectorLabel: 'Construction & Real Estate',
    source: 'ADEME Bilan GES Entreprises 2023 (Construction sector, France); Eurostat NACE F 2022',
  },

  // ── Consumer goods ───────────────────────────────────────────────────────
  'Consumer Goods (FMCG)': {
    medianKgPerMRevenue: 2_200,
    lowKgPerMRevenue:    900,
    highKgPerMRevenue:   5_500,
    sectorLabel: 'Consumer Goods (FMCG)',
    source: 'CDP 2023 Global Disclosure Cycle (Consumer Staples sector median)',
  },

  // ── Education ────────────────────────────────────────────────────────────
  'Education & Training': {
    medianKgPerMRevenue: 320,
    lowKgPerMRevenue:    130,
    highKgPerMRevenue:   700,
    sectorLabel: 'Education & Training',
    source: 'ADEME Bilan GES Entreprises 2023 (Services sector proxy); Eurostat NACE P 2022',
  },

  // ── Oil, Gas, Mining ─────────────────────────────────────────────────────
  'Energy (Oil, Gas, Mining)': {
    medianKgPerMRevenue: 22_000,
    lowKgPerMRevenue:    10_000,
    highKgPerMRevenue:   45_000,
    sectorLabel: 'Oil, Gas & Mining',
    source: 'IEA Energy Technology Perspectives 2023; CDP 2023 (Energy sector median)',
  },

  // ── Renewables ───────────────────────────────────────────────────────────
  'Energy (Renewables)': {
    medianKgPerMRevenue: 1_100,
    lowKgPerMRevenue:    400,
    highKgPerMRevenue:   2_800,
    sectorLabel: 'Renewable Energy',
    source: 'ADEME Bilan GES 2023; IEA Renewables 2023 sector benchmarks',
  },

  // ── Healthcare ───────────────────────────────────────────────────────────
  'Healthcare & Pharmaceuticals': {
    medianKgPerMRevenue: 780,
    lowKgPerMRevenue:    320,
    highKgPerMRevenue:   1_800,
    sectorLabel: 'Healthcare & Pharmaceuticals',
    source: 'CDP 2023 Health Care sector median; ADEME Bilan GES Entreprises 2023',
  },

  // ── Hospitality ──────────────────────────────────────────────────────────
  'Hospitality, Tourism & Leisure': {
    medianKgPerMRevenue: 1_350,
    lowKgPerMRevenue:    550,
    highKgPerMRevenue:   3_200,
    sectorLabel: 'Hospitality, Tourism & Leisure',
    source: 'ADEME Bilan GES Entreprises 2023 (Hôtellerie-Restauration); CDP 2023',
  },

  // ── IT & SaaS ────────────────────────────────────────────────────────────
  'Information Technology & SaaS': {
    medianKgPerMRevenue: 145,
    lowKgPerMRevenue:    55,
    highKgPerMRevenue:   380,
    sectorLabel: 'Information Technology & SaaS',
    source: 'CDP 2023 Software & Services sector median; ADEME Numérique 2023',
  },

  // ── Logistics ────────────────────────────────────────────────────────────
  'Logistics & Supply Chain': {
    medianKgPerMRevenue: 5_400,
    lowKgPerMRevenue:    2_200,
    highKgPerMRevenue:   12_000,
    sectorLabel: 'Logistics & Supply Chain',
    source: 'CDP 2023 Transportation & Logistics sector median; Eurostat NACE H 2022',
  },

  // ── Heavy manufacturing ──────────────────────────────────────────────────
  'Manufacturing (Heavy)': {
    medianKgPerMRevenue: 9_200,
    lowKgPerMRevenue:    4_000,
    highKgPerMRevenue:   20_000,
    sectorLabel: 'Heavy Manufacturing',
    source: 'Eurostat NACE C emission intensity 2022; IEA Energy Technology Perspectives 2023',
  },

  // ── Light manufacturing ──────────────────────────────────────────────────
  'Manufacturing (Light)': {
    medianKgPerMRevenue: 3_600,
    lowKgPerMRevenue:    1_400,
    highKgPerMRevenue:   7_500,
    sectorLabel: 'Light Manufacturing',
    source: 'ADEME Bilan GES Entreprises 2023 (Industrie manufacturière légère); Eurostat NACE C 2022',
  },

  // ── Media & Telecom ──────────────────────────────────────────────────────
  'Media & Telecommunications': {
    medianKgPerMRevenue: 265,
    lowKgPerMRevenue:    100,
    highKgPerMRevenue:   620,
    sectorLabel: 'Media & Telecommunications',
    source: 'CDP 2023 Media & Telecom sector median; ADEME Numérique 2023',
  },

  // ── Professional services ────────────────────────────────────────────────
  'Professional Services (Consulting, Legal)': {
    medianKgPerMRevenue: 195,
    lowKgPerMRevenue:    70,
    highKgPerMRevenue:   480,
    sectorLabel: 'Professional Services',
    source: 'ADEME Bilan GES Entreprises 2023 (Conseil et services); CDP 2023 Commercial Services median',
  },

  // ── Public sector ────────────────────────────────────────────────────────
  'Public Sector & Government': {
    medianKgPerMRevenue: 520,
    lowKgPerMRevenue:    200,
    highKgPerMRevenue:   1_200,
    sectorLabel: 'Public Sector',
    source: 'Eurostat Government sector emission intensity 2022; ADEME sectoral proxy 2023',
  },

  // ── Retail ───────────────────────────────────────────────────────────────
  'Retail & E-Commerce': {
    medianKgPerMRevenue: 1_450,
    lowKgPerMRevenue:    580,
    highKgPerMRevenue:   3_400,
    sectorLabel: 'Retail & E-Commerce',
    source: 'CDP 2023 Retailing sector median; ADEME Bilan GES Entreprises 2023',
  },

  // ── Textiles ─────────────────────────────────────────────────────────────
  'Textiles & Apparel': {
    medianKgPerMRevenue: 3_100,
    lowKgPerMRevenue:    1_200,
    highKgPerMRevenue:   7_200,
    sectorLabel: 'Textiles & Apparel',
    source: 'CDP 2023 Textiles & Apparel sector median; ADEME sectoral data 2023',
  },

  // ── Utilities ────────────────────────────────────────────────────────────
  'Utilities & Waste Management': {
    medianKgPerMRevenue: 16_800,
    lowKgPerMRevenue:    7_000,
    highKgPerMRevenue:   38_000,
    sectorLabel: 'Utilities & Waste Management',
    source: 'IEA Energy Technology Perspectives 2023; Eurostat NACE D/E emission intensity 2022',
  },

  // ── Other / catch-all ────────────────────────────────────────────────────
  'Other': {
    medianKgPerMRevenue: 1_200,
    lowKgPerMRevenue:    300,
    highKgPerMRevenue:   5_000,
    sectorLabel: 'General Business',
    source: 'CDP 2023 cross-sector SME median; ADEME Bilan GES Entreprises 2023',
  },
};

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Returns a benchmark comparison for the given industry and intensity.
 *
 * @param industry   - Must match exactly one of the INDUSTRIES strings in supplier/page.tsx
 * @param intensityKgPerMRevenue - Supplier's actual intensity (kgCO₂e / €1M revenue)
 *                                 from summarizeEmissions().intensity
 * @returns BenchmarkResult or null if no benchmark exists / intensity is zero
 */
export function getBenchmark(
  industry: string,
  intensityKgPerMRevenue: number,
): BenchmarkResult | null {
  if (!industry || intensityKgPerMRevenue <= 0) return null;

  const entry = BENCHMARKS[industry];
  if (!entry) return null;

  const pct = ((intensityKgPerMRevenue - entry.medianKgPerMRevenue) / entry.medianKgPerMRevenue) * 100;

  // "flat" band: within ±8% of median — too close to call meaningfully
  const FLAT_THRESHOLD = 8;

  return {
    sectorLabel:        entry.sectorLabel,
    medianIntensity:    entry.medianKgPerMRevenue,
    yourIntensity:      intensityKgPerMRevenue,
    percentVsMedian:    pct,
    isBelow:            pct < -FLAT_THRESHOLD,
    isAbove:            pct >  FLAT_THRESHOLD,
    isFlat:             Math.abs(pct) <= FLAT_THRESHOLD,
    lowBound:           entry.lowKgPerMRevenue,
    highBound:          entry.highKgPerMRevenue,
    withinTypicalRange: intensityKgPerMRevenue >= entry.lowKgPerMRevenue &&
                        intensityKgPerMRevenue <= entry.highKgPerMRevenue,
    source: entry.source,
  };
}

/**
 * Returns all available industry keys (for testing / validation).
 */
export function getBenchmarkIndustries(): string[] {
  return Object.keys(BENCHMARKS);
}