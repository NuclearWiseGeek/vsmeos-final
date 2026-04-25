# VSME OS — Project Instructions for Claude

**Read this entire document before touching any code.**

---

## You Are Working On

VSME OS — a live, deployed B2B SaaS at https://vsmeos.fr. This is a real product with real users. Every change goes to production. Be careful.

**Current task: Phase 5 — AI + Intelligence**
See HANDOVER_April18.md for full Phase 5 task breakdown.

---

## Database Schema

### `profiles`
One row per user (both buyers and suppliers). `id` = Clerk userId (text PK).
```
id (text PK)
company_name (text)
country (text)
industry (text)
revenue (numeric)
currency (text)
signer (text)
year (int4, default 2024)
employee_count (text)
website (text)
role (text) — 'buyer' or 'supplier'
targets (jsonb) — { reductionPct, targetYear, baselineYear, baselineKg, setAt }
reporting_period_start (date, nullable) — Phase 4b.3 / Category A
reporting_period_end (date, nullable) — Phase 4b.3 / Category A
consolidation_approach (text, default 'operational') — Phase 4b.3 / Category A; CHECK constraint enforces 'operational' | 'financial' | 'equity'
financial_report_url (text, nullable) — Phase 4b.3 / Category A
updated_at (timestamptz)
```
⚠️ Revenue + currency live here ONLY — NEVER in assessments.
⚠️ The 4 Phase 4b.3 columns require the migration SQL in `handover.md` §1 (Phase 4b.3 section). If they're missing in dev, run that ALTER TABLE.

### `assessments`
One row per supplier per year.
```
id (int8 PK)
user_id (text → profiles.id) — Clerk userId as TEXT not UUID
year (int4)
status (text) — 'draft' | 'sent' | 'started' | 'submitted'
activity_data (jsonb)
emissions_totals (jsonb) — keys: scope1Total, scope2Total, scope3Total, grandTotal, totalTonnes, intensity
evidence_links (jsonb)
buyer_id (text) — Clerk userId of buyer — TEXT not UUID
created_at, updated_at
```
UNIQUE constraint: `(user_id, year)`

### `supplier_invites`
```
id (uuid PK)
buyer_id (text)
supplier_email (text)
supplier_name (text)
status (text) — 'draft' | 'sent' | 'started' | 'submitted'
buyer_name (text)
country, industry, financial_year, currency, revenue
created_at, updated_at
```

### `buyer_settings`
```
buyer_id (text PK)
invite_email_subject (text)
invite_email_body (text)
updated_at (timestamptz)
```

### `intelligence_cache`
```
cache_key (text)
mode (text) — 'benchmark' or 'recommendations'
result (jsonb)
created_by (text)
created_at (timestamptz)
PRIMARY KEY (cache_key, mode)
```
⚠️ **RLS = `USING (false)`** — user tokens cannot read this table at all.
⚠️ **Always use `adminSupabase()` (service role) to read OR write this table.**
Benchmark key: `{industry}__{country}__{year}`
Recommendations key: `rec__{userId}__{year}`

---

## Auth & RLS — CRITICAL

- Clerk handles ALL auth. Never use Supabase auth.
- RLS policies use `auth.jwt() ->> 'sub'` NOT `auth.uid()`
- `auth.uid()` does NOT work with Clerk — causes uuid type errors
- JWT template named `supabase` MUST exist in BOTH Clerk dev AND prod instances
- User operations: `const token = await getToken({ template: 'supabase' })` → `createSupabaseClient(token)`
- Cache operations: `adminSupabase()` (service role) — NEVER user token for intelligence_cache

---

## Architecture Patterns — MUST FOLLOW

### Two Supabase Clients
```typescript
// User-authenticated (for all user data — profiles, assessments, invites)
import { createSupabaseClient } from '@/utils/supabase';
const supabase = createSupabaseClient(token);

// Service role (for intelligence_cache ONLY)
import { createClient } from '@supabase/supabase-js';
function adminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
```

### ESGContext
`app/context/ESGContext.tsx` — sole loader of Supabase data for supplier flow.
Loads profile + most recently updated assessment.

### AutoSave
`app/components/AutoSave.tsx` — debounced 1s save.
Has `hasRealData()` guard — skips if all activity values zero.
**NEVER includes `status` in its upsert.**

### ESGProvider Placement
ONLY in `app/supplier/layout.tsx`. NEVER in `app/layout.tsx`.

### Resend
NEVER call `new Resend()` at module level. Always use lazy init inside the function:
```typescript
function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY is not set');
  return new Resend(key);
}
```

### force-dynamic
All buyer dashboard pages need `export const dynamic = 'force-dynamic'`.
All public pages using SharedNav need `export const dynamic = 'force-dynamic'`.

---

## Emission Factors — Current Verified Values (April 18, 2026)

### Scope 1 (ADEME Base Carbone V23.6 — full lifecycle)
| Field | Factor | Unit |
|-------|--------|------|
| natural_gas | 0.244 | kgCO₂e/kWh |
| heating_oil | 3.200 | kgCO₂e/L |
| propane | 1.510 | kgCO₂e/L |
| diesel | 3.160 | kgCO₂e/L |
| petrol | 2.800 | kgCO₂e/L |
| ref_R410A | 2,088 | kgCO₂e/kg |
| ref_R32 | 675 | kgCO₂e/kg |
| ref_R134a | 1,430 | kgCO₂e/kg |
| ref_R404A | 3,922 | kgCO₂e/kg |

### Scope 3 Universal (DEFRA 2025 + CHSB 2024)
| Field | Factor | Unit |
|-------|--------|------|
| grey_fleet | 0.216 | kgCO₂e/km |
| flight_short_haul | 0.175 | kgCO₂e/pkm |
| flight_long_haul | 0.117 | kgCO₂e/pkm |
| hotel_nights | 28.0 | kgCO₂e/night |
| employee_commuting | 0.138 | kgCO₂e/km |
| remote_working | 2.67 | kgCO₂e/day |

### Key Country Grid Factors (verified April 18, 2026)
| Country | kgCO₂e/kWh | Source |
|---------|-----------|--------|
| France | 0.052 | ADEME 2024 |
| UK | 0.196 | DEFRA 2025 |
| Germany | 0.364 | UBA 2024 |
| Spain | 0.108 | REE / EMBER 2024 |
| Italy | 0.251 | GSE Italy 2024 |
| Netherlands | 0.298 | CBS / IEA 2024 |
| Belgium | 0.144 | CREG / IEA 2024 |
| Sweden | 0.041 | Energimyndigheten 2023 (location-based) |
| Poland | 0.695 | URE Poland / IEA 2024 |
| US | 0.352 | EPA eGRID2023 |
| Australia | 0.610 | NGA 2024 |
| India | 0.716 | CEA 2024 |
| China | 0.557 | CEPCI / IEA 2024 |
| World fallback | 0.445 | IEA 2025 provisional 2024 |

---

## Environment Variables

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
RESEND_API_KEY=re_...
NEXT_PUBLIC_APP_URL=https://vsmeos.fr
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Deployment

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

## Codebase Rules

1. Never change brand colors (`#0C2918`, `#122F1E`, `#C9A84C`, `#DFC06A`, `#F5F5F7`)
2. Never rename `middleware.ts` to `proxy.ts`
3. Never upgrade pako beyond v1.0.11
4. Never write revenue or currency to assessments
5. Never call `createClient()` for user ops — always `createSupabaseClient(token)`
6. Always use `adminSupabase()` for intelligence_cache reads and writes
7. Status values exactly: `draft` → `sent` → `started` → `submitted`
8. Supplier invite matching uses email address not company name
9. Commit author must be NuclearWiseGeeks
10. Emission factors correct as of April 23, 2026 — cite source when updating. Most recent change: US grid 0.352 → 0.350 (EPA eGRID2023 exact).
11. Never put ESGProvider or AutoSave in app/layout.tsx
12. RLS policies must use `auth.jwt() ->> 'sub'` not `auth.uid()`
13. emissions_totals ALWAYS saved with: scope1Total, scope2Total, scope3Total, grandTotal
14. assessments.buyer_id is TEXT — never UUID
15. AutoSave must NEVER include `status` in its upsert
16. Public pages with SharedNav need `export const dynamic = 'force-dynamic'`
17. All supplier sign-in redirects go to `/supplier/dashboard` not `/supplier`
18. Never call `new Resend()` at module level — use lazy `getResend()` function
19. File by file — always deliver one file at a time using `present_files` tool
20. Date and URL columns: when saving from the UI, coerce empty strings to `null` before upsert. Postgres `date` columns reject `''` with error 22007 ("invalid input syntax for type date"). Pattern: `value || null`.
21. `consolidation_approach` accepts only `'operational'`, `'financial'`, `'equity'` — DB enforces this via CHECK constraint. If you add a new approach, update both the CHECK constraint and the `boundaryMap` in `CarbonReportPDF.tsx`.
22. When adding a new field to the supplier company profile, update FOUR places in this order: (a) `ESGContext.tsx` interface + INITIAL_COMPANY_DATA + load mapping + save mapping, (b) `app/supplier/page.tsx` form input, (c) `app/components/CarbonReportPDF.tsx` render block, (d) `actions/dashboard.ts` TypeScript profile interface + SELECT column list. Skipping any one breaks data flow silently.
23. Bar chart / KPI labels: emissions are stored in **kilograms** in `emissions_totals`. When displaying as tonnes, ALWAYS divide by 1000. Unit label is `tCO₂e`, never just `t`. (Historical bug: April 2026 had a 1000× display error on the buyer dashboard bar chart.)
24. Scope 2 reporting is currently Location-Based only. Every Scope 2 figure displayed in PDF or UI must be labelled "Location-Based" so it's auditor-defensible. Market-Based dual reporting is planned for Phase 6.

### Legal Rules
- "audit-ready" not "audit-standard"
- "GHG Protocol-based" not "GHG Protocol-compliant"
- "designed for CSRD Scope 3 data collection" not "CSRD compliant"
- "self-attested (limited assurance)" near any report reference

### React-PDF v4 Rules
- `<View fixed>` with children = silently fails → use `<Text fixed>`
- Page numbers: render prop on `<Text>` only
- `<Svg>` in fixed containers = fails
- PDF is fully dynamic — corrections to calculations.ts flow into all new PDFs