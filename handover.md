# VSME OS — Complete Handover Document

**Updated: April 23, 2026** (Phase A+B audit + Case 3 supplier name fix + Category A PDF audit complete)
Upload this file to Claude Project Knowledge for Phase 5.

---

## 0. Project Summary

| Field | Value |
|-------|-------|
| **Project** | VSME OS — B2B SaaS two-sided platform. Buyers collect Scope 3 carbon data from suppliers for CSRD compliance. Suppliers generate GHG Protocol-based PDF declarations in 15–30 minutes. |
| **Owner** | Sudeep Daggaonkar. Pre-incorporation. Pitching to companies before incorporating. |
| **Live URL** | https://vsmeos.fr — deployed on Vercel |
| **GitHub** | vsmeos-final (private) — NuclearWiseGeeks account ONLY |
| **Tech Stack** | Next.js 16.2.2 (Turbopack) · TypeScript 5 · Tailwind CSS v4 · Clerk v6 · Supabase (Frankfurt EU) · Vercel · React-PDF v4 · pako@1.0.11 · Resend v6 · React 19.2.3 · Chart.js v4 · Framer Motion v12 · Inter (next/font/google) |
| **Email** | Titan Mail via Hostinger. hello@vsmeos.fr active. DKIM verified. Resend domain VERIFIED. |
| **Stage** | Pre-revenue. Phases 1+3+4 complete + post-launch bug fixes + emission factor audit + April 2026 audit sprints (Phase A+B + Case 3 fix + Category A PDF audit). **Phase 5 is next.** |
| **AI Engine** | VESQ3 (Claude Sonnet `claude-sonnet-4-20250514`) — branding name for all AI features |

---

## 1. Complete History of Everything Done

### Phase 1 — Built Feb–March 2026
- Complete supplier flow: profile → scope 1/2/3 → results → PDF
- Complete buyer dashboard: KPIs, CSV upload, manual add, invite emails, status tracking
- Landing page, methodology, framework, alignment, terms, privacy pages
- 69-country emission factor database
- React-PDF 4-page GHG Protocol report
- Resend email integration
- Evidence vault with private Supabase Storage + 60-min signed URLs

### Phase 3 — Completed April 13–14, 2026
- Buyer data aggregation (getSupplierEmissions, EmissionsPanel, CSV export)
- Custom email editor (buyer_settings table)
- Role separation (buyer/supplier) with middleware route guards
- Emission factor updates (DEFRA 2025, UBA 2024, multiple national agencies)
- Legal copy audit (audit-ready, GHG Protocol-based, self-attested)
- Email redesign with real logo and 3-step how-it-works

### Phase 4 — Completed April 14–17, 2026

**4.1 Supplier Vault**
- `/supplier/vault` — all past reports by year, re-download any PDF
- Evidence document trail with re-signing (60-min signed URLs, `actions/resignEvidence.ts`)
- `intelligence_cache` table in Supabase for AI results

**4.2 Year-on-Year Comparison**
- Hub page: compact YoY badge below total (↓ 10.4% vs 2023)
- Results page: full banner between main grid and evidence vault
- Fetches prior year submitted assessment; only compares when data exists

**4.3 Industry Benchmarking (VESQ3-powered — Claude API)**
- `app/api/intelligence/route.ts` — unified endpoint (mode: benchmark | recommendations)
- Benchmark: Claude Sonnet call, ~$0.006/call, cached per (industry, country, year) in intelligence_cache
- `app/components/IntelligenceCards.tsx` — benchmark + recommendations UI with explicit Refresh buttons
- `app/data/benchmarks_2025.json` — retained as reference dataset, not used for live calls
- `app/utils/benchmarkLookup.ts` — retained but not used for live calls

**4.4 AI Reduction Recommendations (VESQ3)**
- Recommendations: Claude Sonnet, ~$0.012/call, cached per (userId, year)
- Cache key: `rec__{userId}__{year}` — dashboard reads same result on every load
- Both benchmark and recommendations persist across dashboard refreshes

**4.5 Reduction Target Setting**
- `actions/targets.ts` — saveTarget() / loadTarget() server actions
- `app/components/TargetSetter.tsx` — slider UI on results page
- Progress bar on hub page
- Stored in `profiles.targets jsonb`

**Supplier Dashboard**
- `app/supplier/dashboard/page.tsx` — permanent home for returning suppliers
- `actions/dashboard.ts` — single parallel fetch (profile + assessments + invites + cached AI)
- Sections: KPI row → VESQ3 Intelligence → Reports → Buyer Invites → Reduction Target → Carbon Passport teaser
- AI name constant: `const AI_NAME = 'VESQ3'` at top of dashboard file
- All supplier sign-in flows redirect to `/supplier/dashboard`

### Post-Launch Bug Fixes + Improvements — April 18, 2026

**Critical Build Fixes**
- `app/layout.tsx` — Root layout was corrupted (contained supplier layout code). Restored correctly with ClerkProvider + Inter font.
- `actions/buyer.ts` — Resend `new Resend()` was at module level, crashing Vercel build. Fixed with lazy `getResend()` function.
- `app/buyer/dashboard/page.tsx` — Added `export const dynamic = 'force-dynamic'` (Clerk prerender crash).
- `app/buyer/dashboard/settings/page.tsx` — Added `force-dynamic`.
- `app/buyer/dashboard/suppliers/page.tsx` — Added `force-dynamic`.
- `app/api/sync/route.ts` — **DELETED** (dead legacy code referencing wrong schema columns).

**Intelligence Cache Fix (Critical)**
- `actions/dashboard.ts` — Dashboard was reading `intelligence_cache` with user-authenticated Supabase client. RLS policy (`USING (false)`) blocked all user reads. Fixed by using service role client (`adminSupabase()`) for cache reads. Benchmark and roadmap now persist correctly across refreshes.

**Supplier UX Fixes**
- `app/supplier/page.tsx` — Returning suppliers were being kicked back to dashboard when clicking "New Declaration" or following a buyer invite link. Fixed: redirect now skipped when `?new=true` or `?year=XXXX` is in the URL.
- `app/supplier/dashboard/page.tsx` — "New declaration" button changed to `/supplier?new=true`.
- PDF download in dashboard Reports card: was linking to vault. Now downloads inline via `DashboardPdfButton` component (dynamic import of react-pdf).

**Buyer Portal Fixes**
- `app/components/buyer/ManualEntry.tsx` — Added Financial Year dropdown (defaults to previous year). Year written to `supplier_invites.financial_year`.
- `app/components/buyer/CSVUploader.tsx` — Added Financial Year selector before upload. Year appended to FormData and written to all imported supplier rows.
- `actions/buyer.ts` — `uploadSupplierCSV()` reads `financialYear` from FormData. `addManualSupplier()` accepts optional `financialYear` param.
- `app/components/buyer/EmissionsPanel.tsx` — Full rewrite with year filter. When same supplier appears for multiple years, toggle buttons filter the chart and table. KPI cards (Total tCO₂e, Avg Intensity) only count the most recent year to prevent double-counting.
- `app/buyer/dashboard/page.tsx` — `calculateEmissionKPIs()` now filters to latest year only.

**VESQ3 Branding**
- All "Claude" and "Claude Sonnet" visible text in UI replaced with "VESQ3".
- All `~$0.006` and `~$0.012` cost strings removed from dashboard buttons.

**Emission Factor Audit (April 18, 2026)**
All factors verified against latest published national databases:

| Factor | Value | Source |
|--------|-------|--------|
| Natural gas | 0.244 kgCO₂e/kWh | ADEME Base Carbone V23.6 |
| Heating oil | 3.200 kgCO₂e/L | ADEME Base Carbone V23.6 |
| Propane | 1.510 kgCO₂e/L | ADEME Base Carbone V23.6 |
| Diesel | 3.160 kgCO₂e/L | ADEME Base Carbone V23.6 |
| Petrol | 2.800 kgCO₂e/L | ADEME Base Carbone V23.6 |
| R410A | 2,088 kgCO₂e/kg | IPCC AR5 GWP100 |
| R32 | 675 kgCO₂e/kg | IPCC AR5 GWP100 |
| R134a | 1,430 kgCO₂e/kg | IPCC AR5 GWP100 |
| R404A | 3,922 kgCO₂e/kg | IPCC AR5 GWP100 |
| UK grid | 0.196 kgCO₂e/kWh | DEFRA 2025 (gen 0.177 + T&D 0.019) |
| Germany grid | 0.364 kgCO₂e/kWh | UBA 2024 |
| Spain grid | **0.108** kgCO₂e/kWh | REE / EMBER 2024 (updated — was 0.181) |
| Italy grid | 0.251 kgCO₂e/kWh | GSE Italy 2024 |
| Netherlands grid | 0.298 kgCO₂e/kWh | CBS Netherlands / IEA 2024 |
| Belgium grid | 0.144 kgCO₂e/kWh | CREG Belgium / IEA 2024 |
| Sweden grid | **0.041** kgCO₂e/kWh | Energimyndigheten 2023 (location-based — was 0.013 residual mix) |
| Poland grid | 0.695 kgCO₂e/kWh | URE Poland / IEA 2024 |
| France grid | 0.052 kgCO₂e/kWh | ADEME Base Carbone 2024 |
| US grid | 0.352 kgCO₂e/kWh | EPA eGRID2023 (Jan 2025) |
| Australia grid | 0.610 kgCO₂e/kWh | Australian NGA 2024 |
| India grid | 0.716 kgCO₂e/kWh | CEA India 2024 |
| China grid | 0.557 kgCO₂e/kWh | CEPCI / IEA 2024 / EMBER 2024 |
| South Africa grid | 0.928 kgCO₂e/kWh | DFFE / Eskom 2022 |
| IEA world fallback | **0.445** kgCO₂e/kWh | IEA Emissions Factors 2025 provisional 2024 (was 0.464) |
| Grey fleet | 0.216 kgCO₂e/km | DEFRA 2025 |
| Short-haul flights | 0.175 kgCO₂e/pkm | DEFRA 2025 + RF ×1.9 |
| Long-haul flights | 0.117 kgCO₂e/pkm | DEFRA 2025 + RF ×1.9 |
| Hotel nights | 28.0 kgCO₂e/night | Cornell/Greenview CHSB 2024 |
| Employee commuting | 0.138 kgCO₂e/km | DEFRA 2025 |
| Remote working | **2.67** kgCO₂e/day | DEFRA 2025 (0.334/hr × 8hr — was 2.84) |

**Methodology, Framework, Alignment pages** — All emission factor citations corrected to match `calculations.ts` exactly.

**Font — Apple Style**
- `app/layout.tsx` — Inter variable font via `next/font/google`. Self-hosted by Next.js, zero layout shift.
- `app/globals.css` — `-webkit-font-smoothing: antialiased`, `font-feature-settings: "cv02", "cv03", "cv04", "cv11", "ss01"` (SF Pro-matching alternate letterforms), tight tracking on headings.

### Phase 4b — April 2026 Audit Sprints (April 19–23, 2026)

Three separate audit batches landed in this window. All shipped to production.

**4b.1 Phase A+B audit (April 19, 2026)**
A code-level audit caught 12 issues spanning data-loss, caching, defensibility. All fixed.

- `ESGContext.tsx` — `saveToSupabase()` no longer writes `status: 'draft'` to assessments. Was silently reverting submitted reports back to draft when the supplier edited their profile. Critical data-loss bug.
- `api/intelligence/route.ts` — Recommendations mode now reads cache first (was calling Claude on every click at ~$0.012/call). Added `force: true` flag for explicit refresh. Year normalisation at top so cache keys are deterministic.
- `supplier/dashboard/page.tsx` — Refresh handlers now send `year` and `force: true`. Generate vs Refresh buttons have distinct behaviour. Stale "VERO" comment fixed to "VESQ3".
- `CarbonReportPDF.tsx` — Footer attributions corrected: was citing "DEFRA 2024 / ADEME 2024" when code uses DEFRA 2025 / ADEME V23.6.
- `calculations.ts` — All Scope 1 source strings updated `"ADEME Base Carbone 2024"` → `"ADEME Base Carbone V23.6 (2025)"`. France `primaryCalculator` updated to V23.6.
- `app/page.tsx` (landing) — Germany FAQ corrected from "UBA 2023 / 0.380" to "UBA 2024 / 0.364".
- `methodology/page.tsx` — 9 stale ADEME 2024 references updated to V23.6. Employee Commuting attribution corrected from "DEFRA 2025 / ADEME 2024" to "DEFRA 2025". Factor Update Policy table now correctly attributes remote working to DEFRA.
- `privacy/page.tsx` — Anthropic added to sub-processor table (GDPR Article 28 disclosure for VESQ3 calls). Stripe removed (payments not built yet). `LAST_UPDATED` now rendered. Pre-incorporation note added to §1.
- `terms/page.tsx` — §4 rewritten to "Pricing and Payment (Not Currently Active)". €199/€349/€799 tier prices removed. §8.1 cancellation clause rewritten.
- `EmissionsPanel.tsx` — `useEffect` now syncs `selectedYear` when `availableYears` changes. Year filter no longer goes stale on real-time data.
- US EPA eGRID2023 factor 0.352 → **0.350** (matches EPA's exact 770.9 lbCO₂e/MWh published value: 770.9 × 0.4536 / 1000 = 0.3497 ≈ 0.350).
- Vercel env vars: 4 Clerk redirect vars updated from `/supplier` → `/onboarding` so role detection works correctly. Hostinger forwarders set up: `privacy@`, `legal@`, `methodology@`, `compliance@`, `contact@` → `hello@vsmeos.fr`.

**4b.2 Case 3 supplier name drift fix (April 21, 2026)**

- `actions/buyer.ts` — `getSupplierEmissions()` and `getCSVExportData()` rewritten to match assessments to invites by **email** (resolved via Clerk `clerkClient.users.getUser()`) instead of array position. Added shared helper `resolveSupplierEmails(userIds)` that runs Clerk lookups in parallel.
- Symptom that triggered the fix: editing supplier invite metadata after submission caused supplier name on buyer dashboard to revert to "Supplier 1". Position-match logic was unreliable whenever invite `updated_at` changed.
- Latency cost: ~100–150ms per buyer dashboard load (parallel Clerk lookups). Worth it for permanent correctness.
- Fallback: when Clerk can't resolve a userId (rare — supplier signed up with different email than the invite was sent to), shows "Unknown Supplier" instead of misleading "Supplier 1".

**4b.3 Category A PDF audit (April 23, 2026)**

User feedback after first pitch dry-run revealed missing GHG Protocol disclosure fields. All fixed in one batch.

SQL migration:
```sql
ALTER TABLE profiles
  ADD COLUMN reporting_period_start  date,
  ADD COLUMN reporting_period_end    date,
  ADD COLUMN consolidation_approach  text DEFAULT 'operational',
  ADD COLUMN financial_report_url    text;
ALTER TABLE profiles
  ADD CONSTRAINT profiles_consolidation_approach_check
  CHECK (consolidation_approach IS NULL OR consolidation_approach IN ('operational', 'financial', 'equity'));
```

Code changes:
- `ESGContext.tsx` — `CompanyData` interface + load + save extended with the 4 new fields.
- `supplier/page.tsx` — Profile form gained 3 new sections: reporting period (two date pickers, auto-fills as 1 Jan–31 Dec of selected year), consolidation approach (3 radio buttons with GHG Protocol explanations, defaults to Operational), financial report URL (optional).
- `CarbonReportPDF.tsx` — Reporting period replaces "Financial Year" in the profile card. Consolidation label is dynamic (operational/financial/equity). Scope 2 explicitly labelled "Location-Based" everywhere. Scope 3 boundary dynamically describes only the categories the supplier actually entered (Cat 6 alone, Cat 7 alone, both, or none — never claims data that wasn't provided). Disclaimer wording: "activity data" → "primary and secondary data including consumption where available". Optional financial report URL renders as "Revenue audit trail" line. Email `contact@` → `hello@`.
- `actions/dashboard.ts` — `DashboardData.profile` TS type extended with 4 new optional/nullable fields. Profile SELECT query now fetches the new columns.
- `app/supplier/dashboard/page.tsx` — `company` object passed to `DashboardPdfButton` now spreads all 4 new fields. Carbon intensity KpiCard had duplicate unit display ("kg/€M" prop was redundant with the "kgCO₂e per €1M revenue" subtitle) — removed.
- `EmissionsPanel.tsx` — Bar chart label was showing kg-values with a "t" suffix (e.g. 260,541 kg labelled as "t" — three orders of magnitude off). Now correctly divides by 1000 and labels as "tCO₂e". Scope 2 label "Energy" → "Location-Based". Scope 3 label "Value chain" → "Cat. 6 & 7 — Travel & Commuting". Footer source list updated to V23.6.

**Updated emission factor table (post-Phase 4b — supersedes the April 18 table above)**
- US grid: ~~0.352~~ → **0.350** kgCO₂e/kWh (EPA eGRID2023 exact figure)
- All ADEME source strings now read "V23.6 (2025)" instead of "2024"
- All other factors unchanged from April 18 audit

---

## 2. Phase Status — Complete Picture

| Phase | Name | Status | What it unlocks |
|-------|------|--------|----------------|
| 1 | Free Tool | ✅ Complete | Supplier flow, buyer dashboard, PDF, 69-country DB, evidence vault |
| 2 | Payments | ⏳ Parked | Revenue starts — Stripe after first pitch / incorporation |
| 3 | Platform | ✅ Complete | Buyer data aggregation, custom emails, role separation |
| 4 | Supplier Experience | ✅ Complete | Vault, YoY, VESQ3 intelligence, targets, supplier dashboard |
| 4.x | Post-Launch Fixes | ✅ Complete | Build fixes, cache bug, font, emission audit, year fields, year filter |
| 4b | April 2026 Audit Sprints | ✅ Complete | Phase A+B audit, Case 3 supplier name fix, Category A PDF audit (reporting period, boundary, financial link, GHGP-explicit Scope 3, dynamic disclaimer, Scope 2 Location-Based labelling) |
| **5** | **AI + Intelligence** | 🔄 **NEXT** | Speed + trust — OCR doc processing, VESQ3 chat, Carbon Passport, Buyer Portfolio AI |
| 6 | Trust & Verification Score | 📋 Planned | The moat — supplier trust score, data quality rating, verification tiers, and Scope 2 dual reporting (Location-Based + Market-Based per GHG Protocol Scope 2 Guidance 2015) |
| 7 | Deadline Urgency Engine | 📋 Planned | Organic growth — CSRD deadline calendar, automated buyer + supplier reminders |
| 8 | Supplier Vault + Benchmarks + Passport | 📋 Planned | Network effects begin — Carbon Passport public page, proprietary benchmark data from submissions, and SBTi-validated near-term & net-zero target tracking (separate Scope 1+2 / Scope 3 / long-term targets, baseline year, validation status) |
| 9 | Buyer Collaboration Tools | 📋 Planned | LTV multiplier — multi-user buyer accounts, supplier grouping, engagement workflow |
| 10 | Auditor Portal | 📋 Planned | Third-party verification — verifier portal, assured reports, ISO 14064-3 alignment |
| 11 | White Label + Reseller | 📋 Planned | Enterprise revenue — white-label for accounting firms, ESG consultants, industry bodies |
| 12 | Regulatory Intelligence | 📋 Planned | Defensible recurring subscription — CSRD update alerts, ESRS change tracking, regulatory radar |
| 13 | API + ERP Integrations | 📋 Planned | Infrastructure play — SAP / NetSuite / Workday connectors, REST API for enterprise buyers |
| 14 | Financial Gateway | 📋 Planned | Carbon as a financial instrument — carbon credit integration, offset marketplace, green finance links |

---

## 3. Database Schema (Current State)

### profiles
```sql
id text PK (Clerk userId)
company_name text
country text
industry text
revenue numeric
currency text
signer text
year int4 default 2024
employee_count text
website text
role text  -- 'buyer' or 'supplier'
targets jsonb  -- { reductionPct, targetYear, baselineYear, baselineKg, setAt }
updated_at timestamptz
-- Phase 4b Category A audit columns (April 23, 2026):
reporting_period_start  date         -- ISO YYYY-MM-DD, dd/mm/yyyy in UI
reporting_period_end    date         -- must be > start
consolidation_approach  text default 'operational'  -- 'operational' | 'financial' | 'equity' (CHECK constraint)
financial_report_url    text         -- optional URL to publicly-filed accounts
```

### assessments
```sql
id int8 PK
user_id text (→ profiles.id) -- TEXT not UUID
year int4
status text default 'draft'  -- ONLY: draft|sent|started|submitted
activity_data jsonb default '{}'
emissions_totals jsonb  -- keys: scope1Total, scope2Total, scope3Total, grandTotal, totalTonnes, intensity
evidence_links jsonb default '{}'
buyer_id text  -- TEXT not UUID
created_at, updated_at timestamptz
```
UNIQUE constraint: (user_id, year)

### supplier_invites
```sql
id uuid PK
buyer_id text
supplier_email text
supplier_name text
status text -- draft|sent|started|submitted
buyer_name text
country, industry, financial_year, currency, revenue
created_at, updated_at timestamptz
```

### buyer_settings
```sql
buyer_id text PK
invite_email_subject text
invite_email_body text
updated_at timestamptz
```

### intelligence_cache
```sql
cache_key text NOT NULL
mode text NOT NULL  -- 'benchmark' or 'recommendations'
result jsonb NOT NULL
created_by text
created_at timestamptz
PRIMARY KEY (cache_key, mode)
```
Cache key format:
- Benchmark: `{industry}__{country}__{year}` — Claude Sonnet call, cached after first generation
- Recommendations: `rec__{userId}__{year}` — Claude Sonnet call, cached after first generation

RLS: `USING (false)` — service role only. NEVER read with user token (will silently return null).
Always use `adminSupabase()` (service role client) to read from this table.

---

## 4. RLS Policies (Exact SQL — Currently Active)

```sql
-- profiles
CREATE POLICY "suppliers_own_profile" ON profiles
FOR ALL USING ((auth.jwt() ->> 'sub') = id)
WITH CHECK ((auth.jwt() ->> 'sub') = id);

-- assessments
CREATE POLICY "suppliers_own_assessments" ON assessments
FOR ALL USING ((auth.jwt() ->> 'sub') = user_id)
WITH CHECK ((auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "buyers_read_supplier_assessments" ON assessments
FOR SELECT USING ((auth.jwt() ->> 'sub') = buyer_id);

-- supplier_invites
CREATE POLICY "buyers_own_invites" ON supplier_invites
FOR ALL USING ((auth.jwt() ->> 'sub') = buyer_id)
WITH CHECK ((auth.jwt() ->> 'sub') = buyer_id);

CREATE POLICY "suppliers_update_own_invite" ON supplier_invites
FOR UPDATE USING (true);

-- buyer_settings
CREATE POLICY "buyers_own_settings" ON buyer_settings
FOR ALL USING ((auth.jwt() ->> 'sub') = buyer_id)
WITH CHECK ((auth.jwt() ->> 'sub') = buyer_id);

-- intelligence_cache: service role only
CREATE POLICY "service_only" ON intelligence_cache USING (false);
```

⚠️ ALWAYS use `auth.jwt() ->> 'sub'` NOT `auth.uid()` — auth.uid() breaks with Clerk.
⚠️ intelligence_cache: ALWAYS use adminSupabase() (service role). User tokens return nothing due to RLS.

---

## 5. Critical Bugs Fixed — Do Not Reintroduce

| Bug | Fix Applied |
|-----|------------|
| Data wipes on refresh | AutoSave never writes `status` field |
| Root layout corrupted | `app/layout.tsx` restored with ClerkProvider + Inter font |
| Resend build crash | Lazy `getResend()` — never call `new Resend()` at module level |
| Buyer dashboard prerender crash | `force-dynamic` on all buyer pages |
| Intelligence cache always empty | `actions/dashboard.ts` uses service role for cache reads |
| New Declaration → kicked to dashboard | `/supplier?new=true` bypasses redirect; `?year=XXXX` also bypasses |
| PDF in dashboard → went to vault | `DashboardPdfButton` component generates inline download |
| Sweden grid factor wrong | Was 0.013 (residual mix). Correct location-based is 0.041 |
| Spain grid factor stale | Was 0.181 (2022 data). Updated to 0.108 (REE/EMBER 2024) |
| Remote working factor stale | Was 2.84 (DEFRA 2024). Updated to 2.67 (DEFRA 2025) |
| IEA world fallback stale | Was 0.464. Updated to 0.445 (IEA 2025 provisional 2024) |
| Supplier emit double-count | EmissionsPanel year filter — defaults to latest year only |
| Deleted dead file | `app/api/sync/route.ts` — wrong schema, never used, removed |

---

## 6. File Map (Complete — April 18, 2026 State)

### Core Engine
```
app/utils/calculations.ts        Emission engine. 69 countries. FULLY AUDITED April 18, 2026.
app/utils/supabase.ts            Singleton Supabase client. ALWAYS use this for user operations.
app/utils/benchmarkLookup.ts     Retained but not used for live calls (Claude API used instead).
app/data/benchmarks_2025.json    Retained as reference. Not used for live benchmark calls.
app/context/ESGContext.tsx       Global state. Sole Supabase loader for supplier flow.
middleware.ts                    Clerk route protection. Do NOT rename to proxy.ts.
app/layout.tsx                   Root. ClerkProvider + Inter font + PageTransition ONLY.
app/globals.css                  Apple-style typography + all animation classes.
app/not-found.tsx                Custom 404. force-dynamic required.
app/supplier/layout.tsx          ESGProvider + AutoSave. Nav: Dashboard/Assessment/Reports/Settings.
```

### Supplier Flow
```
app/supplier/page.tsx            Profile form. Bypasses dashboard redirect when ?new=true or ?year=XXXX.
app/supplier/hub/page.tsx        Assessment hub. YoY badge. Target progress.
app/supplier/scope1/page.tsx     5 fuels + 4 refrigerants.
app/supplier/scope2/page.tsx     Grid/green electricity, district heat/cooling.
app/supplier/scope3/page.tsx     Flights, hotels, grey fleet, rail, commuting, remote work.
app/supplier/results/page.tsx    Results + PDF + IntelligenceCards + TargetSetter.
app/supplier/vault/page.tsx      Report history + evidence document trail.
app/supplier/dashboard/page.tsx  Supplier command centre. DashboardPdfButton for inline PDF download.
app/supplier/settings/page.tsx   Account settings.
```

### Buyer Portal
```
app/buyer/dashboard/page.tsx          KPIs + emissions + CSV export. force-dynamic. Latest-year KPIs.
app/buyer/dashboard/layout.tsx        Sidebar. force-dynamic.
app/buyer/dashboard/settings/page.tsx Custom email editor. force-dynamic.
app/buyer/dashboard/suppliers/page.tsx Placeholder. force-dynamic.
```

### Components
```
app/components/IntelligenceCards.tsx  VESQ3 benchmark + recommendations UI. No $ cost strings.
app/components/TargetSetter.tsx       Reduction target UI.
app/components/AutoSave.tsx           Debounced save. NEVER writes status field.
app/components/CarbonReportPDF.tsx    4-page GHG Protocol PDF. Fully dynamic by country.
app/components/DownloadTrigger.tsx    PDF download with staged progress (results page).
app/components/CompanyOnboarding.tsx  First-login company name modal.
app/components/SharedNav.tsx          Public pages nav.
app/components/VsmeLogo.tsx           Logo: dark green square + gold checkmark.
app/components/buyer/EmissionsPanel.tsx  Year filter. Defaults to latest year. Prevents double-counting.
app/components/buyer/ManualEntry.tsx  Financial year dropdown added.
app/components/buyer/CSVUploader.tsx  Financial year selector added.
app/components/buyer/ExportButton.tsx CSV download.
app/components/buyer/InviteTable.tsx  Supplier table with real-time Supabase subscription.
```

### Server Actions
```
actions/buyer.ts          All buyer CRUD + invite email + emissions + CSV + settings.
                          uploadSupplierCSV() reads financialYear from FormData.
                          addManualSupplier() accepts optional financialYear param.
                          getResend() — lazy init (NEVER new Resend() at module level).
actions/supplier.ts       Profile + invite status. NEVER overwrites 'submitted' status.
actions/targets.ts        saveTarget() / loadTarget().
actions/dashboard.ts      getDashboardData() — uses adminSupabase() for intelligence_cache reads.
actions/resignEvidence.ts Re-signs expired Supabase Storage URLs.
actions/uploadEvidence.ts Evidence → Supabase Storage.
actions/onboarding.ts     saveUserRole().
```

### API Routes
```
app/api/intelligence/route.ts   VESQ3 endpoint.
                                Benchmark: Claude Sonnet (~$0.006/call), cached in intelligence_cache.
                                Recommendations: Claude Sonnet (~$0.012/call), cached per userId+year.
                                Both modes: read cache first, call Claude only on miss.
```

---

## 7. Supplier Redirect Flow (Current State)

```
New supplier signs up
  → /supplier (profile form)
  → /supplier/hub (assessment)
  → /supplier/results (PDF + VESQ3)
  → /supplier/dashboard (home)

Returning supplier logs in
  → /supplier/dashboard (direct)

Supplier clicks "New Declaration" in dashboard
  → /supplier?new=true (redirect bypassed — shows form pre-filled)

Supplier follows buyer invite link from dashboard
  → /supplier?year=2024 (redirect bypassed — year pre-filled)

Buyer tries /supplier/* → /buyer/dashboard
Supplier tries /buyer/* → /supplier/dashboard
No role → /onboarding
```

---

## 8. AI / VESQ3 Architecture

### Naming
- All Claude references in UI show as **VESQ3**
- `const AI_NAME = 'VESQ3'` in `app/supplier/dashboard/page.tsx`
- Model: `claude-sonnet-4-20250514` in `app/api/intelligence/route.ts`
- Never use Opus — same training data, 5× cost

### Benchmark (~$0.006/call) — cached per industry+country+year
```
User clicks "Generate benchmark" / "Refresh benchmark"
→ POST /api/intelligence { mode: 'benchmark', industry, country, year, yourIntensity, gridFactor, primaryCalculator }
→ route.ts checks intelligence_cache for key {industry}__{country}__{year}
→ Cache HIT: returns immediately (free)
→ Cache MISS: calls Claude Sonnet with BENCHMARK_SYSTEM prompt
→ Claude returns median/p25/p75/percentile/headline/contextNote as JSON
→ Result written to intelligence_cache
→ Dashboard reads from intelligence_cache on mount (using adminSupabase)
→ Persists across all refreshes
```

### Recommendations (~$0.012/call) — cached per userId+year
```
User clicks "Generate roadmap" / "Refresh roadmap"
→ POST /api/intelligence { mode: 'recommendations', ...full scope data }
→ route.ts checks intelligence_cache for key rec__{userId}__{year}
→ Cache HIT: returns immediately (free)
→ Cache MISS: calls Claude Sonnet with RECOMMENDATIONS_SYSTEM prompt
→ Claude receives: industry, country, year, scope1/2/3 kg, top 5 emission sources, raw activityData, grid factor
→ Claude returns 3 specific reduction recommendations as JSON
→ Result written to intelligence_cache
→ Dashboard reads from intelligence_cache on mount (using adminSupabase)
→ Persists across all refreshes
```

### PDF — Fully Dynamic by Country
The PDF (`CarbonReportPDF.tsx`) calls `getCountryFactors(country)` from `calculations.ts` at generation time.
- Footer cites the correct national database (DEFRA for UK, ADEME for France, UBA for Germany, etc.)
- Scope 2 block shows exact grid factor with country-specific source citation
- Methodology note on Page 1 is country-specific
- All corrections to `calculations.ts` automatically flow into every new PDF generated

---

## 9. Infrastructure Status

| Service | Status | Notes |
|---------|--------|-------|
| Vercel | ✅ Live | Hobby plan. NuclearWiseGeeks account only. |
| Supabase | ✅ Live | Frankfurt EU. Free tier. RLS on all tables. |
| Clerk | ✅ Live | JWT template `supabase` in BOTH dev + prod. |
| GitHub | ✅ Live | vsmeos-final private. main = production. |
| Hostinger | ✅ Live | Domain + DNS + DKIM verified. |
| Resend | ✅ Live | Domain verified. hello@vsmeos.fr sending. |
| Anthropic | ✅ Live | ANTHROPIC_API_KEY set in Vercel. VESQ3 benchmark + recommendations. |
| Stripe | ❌ Not started | Phase 2 — after first pitch / incorporation. |

### Environment Variables (all 8 required)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   ← REQUIRED for intelligence_cache reads/writes + storage
RESEND_API_KEY=re_...
NEXT_PUBLIC_APP_URL=https://vsmeos.fr
ANTHROPIC_API_KEY=sk-ant-...       ← REQUIRED for VESQ3 benchmark + recommendations
```

---

## 10. Brand System — NEVER CHANGE

| Token | Hex | Usage |
|-------|-----|-------|
| Deep forest | `#0C2918` | Buttons, dark sections, logo bg |
| Forest medium | `#122F1E` | Hover states |
| Gold accent | `#C9A84C` | Button text, badges, progress |
| Gold glow | `#DFC06A` | Hover highlights |
| Page bg | `#F5F5F7` | All supplier/buyer pages |

All buttons: `bg-[#0C2918] text-[#C9A84C] hover:bg-[#122F1E]`
Zero emerald. Zero Tailwind green. Anywhere. Ever.

Font: Inter (variable font, next/font/google). Apple-style rendering via globals.css.

---

## 11. Codebase Rules — Read Before Touching Anything

1. Never change brand colors
2. Never rename `middleware.ts` to `proxy.ts`
3. Never upgrade pako beyond v1.0.11
4. Never write revenue or currency to assessments
5. Never call `createClient()` directly — always `createSupabaseClient(token)` for user operations
6. For `intelligence_cache` reads/writes — always use `adminSupabase()` (service role). User tokens return null due to RLS.
7. Status values exactly: `draft` → `sent` → `started` → `submitted`
8. Supplier invite matching uses email address not company name
9. Commit author must be NuclearWiseGeeks
10. New API routes: add to middleware public routes if they don't need auth
11. Emission factors correct as of April 18, 2026 — cite source when updating
12. Never put ESGProvider or AutoSave in app/layout.tsx
13. RLS policies must use `auth.jwt() ->> 'sub'` not `auth.uid()`
14. emissions_totals keys: scope1Total, scope2Total, scope3Total, grandTotal
15. assessments.buyer_id is TEXT — never UUID
16. AutoSave must NEVER include `status` in its assessment upsert
17. Public pages that use SharedNav need `export const dynamic = 'force-dynamic'`
18. All supplier sign-in redirects go to `/supplier/dashboard` not `/supplier`
19. Never call `new Resend()` at module level — use lazy `getResend()` inside the function
20. PDF is fully dynamic — corrections to calculations.ts automatically flow into new PDFs
21. **Reporting period dates** are ISO `YYYY-MM-DD` strings in `profiles.reporting_period_start/end`. Empty string `''` must NOT be written to a `date` column — use `null` (Postgres rejects empty strings as 22007). The save path in `ESGContext.tsx` already does this with `|| null`.
22. **Consolidation approach** is constrained at the DB level — only `'operational'`, `'financial'`, `'equity'`, or `null` will be accepted. The form radio always sets one of these.
23. **Scope 2 is currently always Location-Based** in PDF + dashboard. When Phase 6 adds Market-Based dual reporting, `CarbonReportPDF.tsx` constant `scope2Approach` will be replaced with a per-assessment value.
24. **PDF Scope 3 boundary text is dynamic** — the `scope3IncludedText` constant in `CarbonReportPDF.tsx` inspects `activityData` and only claims categories the supplier actually entered. Never hardcode "Cat 6 and Cat 7" in PDF copy — let the helper compute it.
25. **Supplier name on buyer dashboard** comes from `supplier_invites.supplier_name` joined to assessments via Clerk-resolved email (`actions/buyer.ts` `resolveSupplierEmails`). NEVER match by array position — that broke historically and produced "Supplier 1 / Supplier 2" labels.

### Legal Rules
- "audit-ready" not "audit-standard"
- "GHG Protocol-based" not "GHG Protocol-compliant"
- "designed for CSRD Scope 3 data collection" not "CSRD compliant"
- "self-attested (limited assurance)" near any report reference

### React-PDF v4 Rules
- `<View fixed>` with children = silently fails → use `<Text fixed>`
- Page numbers: render prop on `<Text>` only
- `<Svg>` in fixed containers = fails

---

## 12. Phase 5 — What To Build Next

**Goal:** AI + Intelligence — make VESQ3 smarter, add OCR document processing, Carbon Passport public page, Buyer Portfolio Intelligence.

### Task 5.1: OCR Document Processing
Supplier uploads utility bills, invoices, fuel receipts.
VESQ3 reads the document using Claude Vision API and auto-fills scope fields.
Eliminates manual data entry — the biggest supplier friction point.

Files to create:
- `app/api/ocr/route.ts` — receives base64 file, sends to Claude Vision, returns parsed field values
- `app/components/DocumentUploader.tsx` — drag-drop UI on scope pages replacing manual entry
- Update `scope1/page.tsx`, `scope2/page.tsx`, `scope3/page.tsx` to accept OCR pre-fill

Key: Supplier reviews and confirms OCR values before saving. Never auto-save without confirmation.

### Task 5.2: VESQ3 Chat on Dashboard
A floating chat interface on the supplier dashboard.
Supplier asks: "Why is my Scope 2 so high?" "What should I focus on first?"
VESQ3 has full context in the system prompt.

Files to create:
- `app/components/VESQChat.tsx` — floating chat bubble, opens as slide-in panel
- `app/api/chat/route.ts` — Claude Sonnet with full supplier context (company, country, industry, FY year, scope1/2/3 totals, top 3 sources, benchmark position, YoY change, reduction target)

### Task 5.3: Carbon Passport (Public Page)
Public verification page at `/passport/[slug]`.
Shareable link buyers receive instead of emailing PDFs.
Format: `{company_name_slugified}-{year}` (e.g. `acme-corp-2024`).

Files to create:
- `app/passport/[slug]/page.tsx` — public server component, no auth required
- Add slug generation to results page on submission
- Add `passport_slug` column to `profiles` table in Supabase

### Task 5.4: Buyer Portfolio Intelligence
Buyer dashboard gets VESQ3 analysis of their entire supplier portfolio.
"Your 12 suppliers average 4,200 kgCO₂e/€M — 18% above the Light Manufacturing median."
Identifies highest-risk suppliers and recommends engagement priority.

Files to create:
- `app/components/buyer/PortfolioIntelligence.tsx`
- `app/api/portfolio-intelligence/route.ts`

---

## 12.5 Future Phase Blueprints — Phase 6 & Phase 8 Implementation Notes

When you start Phase 6 or Phase 8, the technical groundwork below is already mapped out so you don't re-design from scratch. These were scoped during the April 23 user feedback review and intentionally placed in the phases where they fit best.

### Phase 6: Scope 2 Location-Based + Market-Based Dual Reporting

**Why this is needed:** GHG Protocol Scope 2 Guidance (2015 amendment) requires dual reporting whenever a company has purchased renewable energy contracts (RECs, GOs, PPAs, green tariffs). Currently we only support Location-Based. Most CSRD-aligned auditors will now reject Scope 2 figures that don't specify the approach.

**Scope of work (~4–6 days):**
- New profile field: "Did you purchase renewable energy contracts in this period?"
- If yes: input fields for REC/GO/PPA quantities (kWh) + supplier name + retirement company name
- Calculation change in `calculations.ts`: subtract market-based contracts from grid electricity, apply residual mix factor
- Schema additions:
  ```sql
  ALTER TABLE assessments ADD COLUMN scope2_approach text DEFAULT 'location_based';
  -- 'location_based' | 'market_based' | 'dual' (both reported)
  ALTER TABLE assessments ADD COLUMN renewable_energy jsonb;
  -- { rec_kwh, go_kwh, ppa_kwh, residual_mix_factor, contract_holder, evidence_files: [] }
  ```
- PDF reporting: show both LB and MB figures side by side when dual mode active
- Evidence vault: accept REC/GO certificates as evidence documents
- Disclaimer: when this lands, remove the "Market-Based Scope 2 reporting are excluded" line from `CarbonReportPDF.tsx`
- Hardcoded `scope2Approach = 'Location-Based'` in PDF becomes a per-assessment field read

### Phase 8: Near-Term & Net-Zero Targets (SBTi-aligned)

**Why this is needed:** Carbon Passport public page should show whether a supplier has science-based targets. Buyers increasingly screen suppliers based on target ambition. Currently `profiles.targets` jsonb only supports a single reduction target.

**Scope of work (~1–2 days):**
- Toggle on supplier dashboard: "Have you set near-term / net-zero targets?"
- If yes:
  - Scope 1+2 near-term target (% reduction, target year)
  - Scope 3 near-term target (% reduction, target year)
  - Long-term / net-zero target year
  - Baseline year for all of the above
  - SBTi validation status: not pursued / committed / validated
- New jsonb shape (no schema migration needed — extend existing `profiles.targets`):
  ```ts
  targets: {
    scope12_near_term: { reductionPct, targetYear, baselineYear, baselineKg },
    scope3_near_term:  { reductionPct, targetYear, baselineYear, baselineKg },
    long_term:         { type: 'net_zero' | 'carbon_neutral', targetYear },
    sbti_validation_status: 'committed' | 'validated' | 'not_pursued',
    sbti_validation_date:   date | null,
  }
  ```
- `TargetSetter.tsx` UX rework — move from single slider to multi-target form
- PDF gains a "Targets & Commitments" appendix block (Page 5 or as inline block on Page 1)
- Carbon Passport public page renders these prominently — main "is this supplier serious?" signal
- Legal note: SBTi validation status is a **claim**, not a fact we can verify. PDF + passport must say "Company states they are SBTi-validated" not "SBTi-validated" to avoid liability if claim is false.

---

## 13. Competitive Context

NOT competing with: EcoVadis (€490–€7,650/year, 50–500 hours, full ESG audit).
Real competitor: **Greenly** ($3,800–$12,000/year, French, well-funded, same market).

**Differentiators:**
1. Two-sided platform (nobody else has buyer + supplier in one product at SME prices)
2. 15–30 minutes vs weeks
3. €199 vs $3,800+ entry price
4. Specific Scope 3 focus (what CSRD buyers actually need from suppliers)
5. PDF format buyers can ingest without reformatting
6. VESQ3 AI intelligence (benchmark + roadmap, now fully persistent)
7. Country-specific emission factors verified against 8+ national databases (April 2026 audit)

**Moat being built:**
- VESQ3 AI brand (our own AI name, not "ChatGPT inside")
- Carbon Passport network effect (Phase 5.3)
- Proprietary benchmark data from every submission (Phase 8)
- Supplier Passport (Phase 8)

---

## 14. Deployment

```bash
git config --global user.name "NuclearWiseGeeks"
git add .
git commit -m "your message"
git push origin main
# Live at vsmeos.fr in ~2 minutes

# Wrong author fix:
git commit --amend --reset-author --no-edit
git push --force origin main
```

---

## 15. Key Context for Phase 5 Work

1. **OCR will use Claude Vision** — send base64 image/PDF, ask Claude to extract quantities in field format (natural_gas_kwh, electricity_grid_kwh, etc.). Pre-fill ESGContext activityData. Supplier reviews before saving.

2. **VESQ3 Chat context** — system prompt must include: company name, country, industry, FY year, scope1/2/3 kg, top 3 emission sources, benchmark position, YoY change, reduction target if set.

3. **Carbon Passport slug** — generate on submission. Format: `{company_name_slugified}-{year}`. Store in `profiles.passport_slug`. Public page fetches by slug, shows submitted assessment data without auth.

4. **Never break existing flows.** Supplier flow (profile → hub → scope1 → scope2 → scope3 → results) must continue unchanged. Phase 5 adds to it, never replaces.

5. **File by file** — Sudeep prefers receiving one file at a time. Always use `present_files` tool.

6. **VESQ3 model** — always `claude-sonnet-4-20250514`. Never Opus (same training data, 5× cost).

7. **intelligence_cache reads** — always use `adminSupabase()` (service role client). User-authenticated client returns null due to RLS `USING (false)`. This was a live bug fixed April 18, 2026.

8. **Emission factors** — fully audited April 18, 2026 against DEFRA 2025, ADEME V23.6, EPA eGRID2023, IEA 2025, REE/EMBER 2024, UBA 2024. Next review due Q1 2027.

*This document reflects exact state of codebase as of April 18, 2026.*
*Always upload alongside latest vsmeos-final.zip.*