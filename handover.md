# VSME OS — Complete Handover Document

**Updated: April 18, 2026**
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
| **Stage** | Pre-revenue. Phases 1+3+4 complete + post-launch bug fixes + emission factor audit. **Phase 5 is next.** |
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

---

## 2. Phase Status — Complete Picture

| Phase | Name | Status | What it unlocks |
|-------|------|--------|----------------|
| 1 | Free Tool | ✅ Complete | Supplier flow, buyer dashboard, PDF, 69-country DB, evidence vault |
| 2 | Payments | ⏳ Parked | Revenue starts — Stripe after first pitch / incorporation |
| 3 | Platform | ✅ Complete | Buyer data aggregation, custom emails, role separation |
| 4 | Supplier Experience | ✅ Complete | Vault, YoY, VESQ3 intelligence, targets, supplier dashboard |
| 4.x | Post-Launch Fixes | ✅ Complete | Build fixes, cache bug, font, emission audit, year fields, year filter |
| **5** | **AI + Intelligence** | 🔄 **NEXT** | Speed + trust — OCR doc processing, VESQ3 chat, Carbon Passport, Buyer Portfolio AI |
| 6 | Trust & Verification Score | 📋 Planned | The moat — supplier trust score, data quality rating, verification tiers |
| 7 | Deadline Urgency Engine | 📋 Planned | Organic growth — CSRD deadline calendar, automated buyer + supplier reminders |
| 8 | Supplier Vault + Benchmarks + Passport | 📋 Planned | Network effects begin — Carbon Passport public page, proprietary benchmark data from submissions |
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