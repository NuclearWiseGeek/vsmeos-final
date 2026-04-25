# VSME OS — Supabase Database Schema
# Last updated: April 23, 2026 (Category A audit migration)
# Region: Frankfurt (EU) — eu-central-1
#
# This file documents every table, column, type, default, and constraint
# in the production Supabase database. Keep this in sync whenever you
# add or modify columns via the Supabase dashboard.
#
# IMPORTANT: RLS (Row Level Security) is enabled on ALL tables.
# The auth method is `auth.jwt() ->> 'sub'` — NEVER `auth.uid()`.

---

## Table 1: `assessments`

Stores each supplier's carbon footprint assessment per financial year.
One row per (user_id, year) pair — upserted on conflict.

| Column            | Type          | Default                             | PK  | Notes |
|-------------------|---------------|--------------------------------------|-----|-------|
| `id`              | int8          | auto-increment                       | ✅  | Serial primary key |
| `user_id`         | text          | NULL                                 |     | Clerk user ID (`auth.jwt() ->> 'sub'`) |
| `year`            | int4          | NULL                                 |     | Financial year (e.g. 2024) |
| `status`          | text          | `'draft'::text`                      |     | `draft` → `submitted` |
| `activity_data`   | jsonb         | `'{}'::jsonb`                        |     | Raw input values (kWh, litres, km, etc.) |
| `emissions_totals`| jsonb         | `'{}'::jsonb`                        |     | `{ scope1Total, scope2Total, scope3Total, grandTotal, totalTonnes, intensity }` |
| `evidence_links`  | jsonb         | `'{}'::jsonb`                        |     | `{ field_key: [{ name, url }] }` |
| `created_at`      | timestamptz   | `timezone('utc'::text, now())`       |     | |
| `updated_at`      | timestamptz   | `timezone('utc'::text, now())`       |     | |
| `buyer_id`        | text          | NULL                                 |     | FK to buyer's Clerk ID (TEXT, not UUID) |

**Constraints:**
- UNIQUE on `(user_id, year)` — code upserts with `onConflict: 'user_id, year'`
- ⚠️ AutoSave NEVER writes `status` — only the results page sets `status = 'submitted'`

**RLS Policies (active):**
- `suppliers_own_data` — `USING (user_id = auth.jwt() ->> 'sub')`
- `buyers_read_supplier_assessments` — buyers can SELECT where `buyer_id = auth.jwt() ->> 'sub'`

---

## Table 2: `profiles`

One row per user (supplier or buyer). Stores company info + role.

| Column            | Type          | Default                             | PK  | Notes |
|-------------------|---------------|--------------------------------------|-----|-------|
| `id`              | text          | NULL                                 | ✅  | Clerk user ID |
| `company_name`    | text          | NULL                                 |     | Legal entity name |
| `industry`        | text          | NULL                                 |     | GICS sector string |
| `country`         | text          | NULL                                 |     | Drives emission factors |
| `updated_at`      | timestamptz   | `timezone('utc'::text, now())`       |     | |
| `website`         | text          | NULL                                 |     | Optional |
| `employee_count`  | text          | NULL                                 |     | Stored as text (not int) |
| `revenue`         | numeric       | `0`                                  |     | Annual revenue in selected currency |
| `signer`          | text          | `''::text`                           |     | PDF signatory name |
| `year`            | int4          | `2024`                               |     | Reporting financial year |
| `currency`        | text          | `'EUR'::text`                        |     | EUR, USD, GBP, etc. |
| `role`            | text          | NULL                                 |     | `'supplier'` or `'buyer'` |
| `targets`         | jsonb         | NULL                                 |     | `{ baselineKg, baselineYear, reductionPct, targetYear }` |
| `reporting_period_start` | date  | NULL                                 |     | **Category A audit** — ISO date, dd/mm/yyyy in UI |
| `reporting_period_end`   | date  | NULL                                 |     | **Category A audit** — must be > start |
| `consolidation_approach` | text  | `'operational'::text`                |     | **Category A audit** — `'operational'` / `'financial'` / `'equity'` (CHECK constraint) |
| `financial_report_url`   | text  | NULL                                 |     | **Category A audit** — Optional URL for revenue audit trail |

**Constraints:**
- PK on `id` — upserted with `onConflict: 'id'`
- CHECK on `consolidation_approach` — must be NULL or one of `'operational'`, `'financial'`, `'equity'` (enforces GHG Protocol Chapter 3 vocabulary)

**RLS Policies:**
- `users_own_profile` — `USING (id = auth.jwt() ->> 'sub')`

---

## Table 3: `supplier_invites`

Links a buyer to a supplier via email. Tracks invite lifecycle.

| Column            | Type          | Default                             | PK  | Notes |
|-------------------|---------------|--------------------------------------|-----|-------|
| `id`              | uuid          | `gen_random_uuid()`                  | ✅  | |
| `buyer_id`        | text          | NULL                                 |     | Clerk ID of the buyer |
| `supplier_email`  | text          | NULL                                 |     | Email used for matching |
| `supplier_name`   | text          | NULL                                 |     | Display name |
| `status`          | text          | `'draft'::text`                      |     | `draft → sent → started → submitted` |
| `created_at`      | timestamptz   | `now()`                              |     | |
| `updated_at`      | timestamptz   | `now()`                              |     | |
| `buyer_name`      | text          | NULL                                 |     | For display in supplier UI |
| `country`         | text          | NULL                                 |     | Pre-fill for supplier |
| `industry`        | text          | NULL                                 |     | Pre-fill for supplier |
| `financial_year`  | text          | NULL                                 |     | ⚠️ TEXT type — code calls `.toString()` |
| `currency`        | text          | NULL                                 |     | Pre-fill |
| `revenue`         | numeric       | NULL                                 |     | Used for intensity calculation on buyer side |

**RLS Policies:**
- `buyers_manage_own_invites` — buyer_id match
- `suppliers_read_own_invites` — supplier_email match

---

## Table 4: `intelligence_cache`

Caches VESQ3 (Claude) AI responses to avoid repeated API calls.

| Column            | Type          | Default                             | PK  | Notes |
|-------------------|---------------|--------------------------------------|-----|-------|
| `cache_key`       | text          | NULL                                 | ✅  | Composite PK part 1 |
| `mode`            | text          | NULL                                 | ✅  | Composite PK part 2 (`'benchmark'` or `'recommendations'`) |
| `result`          | jsonb         | NULL                                 |     | Full Claude response |
| `created_by`      | text          | NULL                                 |     | Clerk user ID |
| `created_at`      | timestamptz   | `now()`                              |     | |

**Cache Key Patterns:**
- Benchmark: `{industry}__{country}__{year}` (e.g. `Manufacturing__France__2024`)
- Recommendations: `rec__{userId}__{year}` (e.g. `rec__user_abc123__2024`)

**RLS Policy:**
- `USING (false)` — ALL reads/writes MUST go through `adminSupabase()` (service role)

---

## Table 5: `buyer_settings`

Per-buyer email template customisation.

| Column               | Type          | Default                             | PK  | Notes |
|----------------------|---------------|--------------------------------------|-----|-------|
| `buyer_id`           | text          | NULL                                 | ✅  | Clerk ID |
| `invite_email_subject`| text         | `'Action Required: Carbo...'`        |     | Custom subject line |
| `invite_email_body`  | text          | `'Dear {{supplier_name}}...'`        |     | Supports `{{supplier_name}}`, `{{invite_link}}` |
| `updated_at`         | timestamptz   | `now()`                              |     | |

**RLS Policy:**
- `buyers_own_settings` — buyer_id match

---

## Schema-to-Code Cross-Reference

| Code Operation | Table | Columns Used | Client |
|---|---|---|---|
| `AutoSave.tsx` upsert | assessments | user_id, year, activity_data, emissions_totals, evidence_links, updated_at (NEVER status) | `createSupabaseClient(token)` |
| `results/page.tsx` save | assessments | + status='submitted', + buyer_id | `createSupabaseClient(token)` |
| `supplier/page.tsx` profile | profiles | company_name, industry, country, revenue, currency, year, signer, **reporting_period_start**, **reporting_period_end**, **consolidation_approach**, **financial_report_url** | `createSupabaseClient(token)` |
| `buyer/dashboard` role | profiles | id, role='buyer' | `createSupabaseClient(token)` |
| `actions/buyer.ts` invites | supplier_invites | all columns | `createSupabaseClient(token)` |
| `actions/dashboard.ts` profile fetch | profiles | all of above + the 4 Category A fields | `createSupabaseClient(token)` |
| `api/intelligence` cache | intelligence_cache | cache_key, mode, result, created_by | `adminSupabase()` |
| `actions/dashboard.ts` cache read | intelligence_cache | cache_key, mode, result | `adminSupabase()` |
| `buyer/settings` | buyer_settings | buyer_id, invite_email_subject, invite_email_body | `createSupabaseClient(token)` |
| `CarbonReportPDF.tsx` render | profiles (via props) | reporting_period_start/end, consolidation_approach, financial_report_url | n/a (read-only render) |

---

## Migration History

| Date | Migration | Tables affected |
|---|---|---|
| April 23, 2026 | **Category A audit** — added Reporting Period (start + end), Consolidation Approach, Financial Report URL to support GHG Protocol disclosure requirements in PDF. SQL: `ALTER TABLE profiles ADD COLUMN ... reporting_period_start date, reporting_period_end date, consolidation_approach text DEFAULT 'operational', financial_report_url text` + CHECK constraint on consolidation_approach. | `profiles` |

> **When you run a migration, append a row here.** This is how anyone debugging "why is column X missing in dev?" finds out they need to run a particular ALTER TABLE.

---

## Future Schema Changes — Tracked but Not Yet Implemented

These are documented here so future contributors don't accidentally re-design them from scratch when the time comes.

### Phase 6 — Scope 2 Dual Reporting (Location-Based + Market-Based)

**Why:** GHG Protocol Scope 2 Guidance (2015 amendment) requires dual reporting whenever a company has purchased renewable energy contracts (RECs, GOs, PPAs, green tariffs). Currently we only support Location-Based.

**Schema changes likely needed:**
```sql
ALTER TABLE assessments ADD COLUMN scope2_approach text DEFAULT 'location_based';
-- 'location_based' | 'market_based' | 'dual' (both reported)
ALTER TABLE assessments ADD COLUMN renewable_energy jsonb;
-- { rec_kwh, go_kwh, ppa_kwh, residual_mix_factor, evidence_files: [] }
```

The PDF disclaimer already references "Market-Based Scope 2 reporting" as out of scope — when the feature lands, that disclaimer line will be removed.

### Phase 8 — Near-Term & Net-Zero Targets

**Why:** Carbon Passport public page should show whether a supplier has science-based targets. Currently the `profiles.targets` jsonb is a single reduction target — needs to support separate Scope 1+2, Scope 3, and net-zero targets, plus SBTi validation status.

**Schema changes likely needed:** extend `profiles.targets` jsonb structure (no schema migration needed — jsonb is flexible):
```ts
targets: {
  scope12_near_term: { reductionPct, targetYear, baselineYear, baselineKg },
  scope3_near_term:  { reductionPct, targetYear, baselineYear, baselineKg },
  long_term:         { type: 'net_zero' | 'carbon_neutral', targetYear },
  sbti_validation_status: 'committed' | 'validated' | 'not_pursued',
  sbti_validation_date:   date | null,
}
```

The dashboard `TargetSetter.tsx` will need a UX rework to capture these. The PDF will gain a "Targets & Commitments" appendix block.