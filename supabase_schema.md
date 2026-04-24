# VSME OS — Supabase Database Schema
# Last updated: April 23, 2026
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

**Constraints:**
- PK on `id` — upserted with `onConflict: 'id'`

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
| `supplier/page.tsx` profile | profiles | company_name, industry, country, revenue, currency, year, signer | `createSupabaseClient(token)` |
| `buyer/dashboard` role | profiles | id, role='buyer' | `createSupabaseClient(token)` |
| `actions/buyer.ts` invites | supplier_invites | all columns | `createSupabaseClient(token)` |
| `api/intelligence` cache | intelligence_cache | cache_key, mode, result, created_by | `adminSupabase()` |
| `actions/dashboard.ts` cache read | intelligence_cache | cache_key, mode, result | `adminSupabase()` |
| `buyer/settings` | buyer_settings | buyer_id, invite_email_subject, invite_email_body | `createSupabaseClient(token)` |
