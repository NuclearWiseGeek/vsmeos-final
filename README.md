# VSME OS

**B2B SaaS for SME carbon reporting.**  
Converts energy bills + travel data into GHG Protocol PDF declarations — ready to send to procurement teams for CSRD Scope 3 compliance.

**Live:** https://vsmeos.fr · **Stack:** Next.js 16 · TypeScript · Tailwind v4 · Clerk · Supabase · React-PDF v4 · Resend

---

## Project Status — April 2026

| Phase | Name | Status |
|-------|------|--------|
| 1 | A Tool (Free) | ✅ Complete |
| 2 | A Product (Paid) | ⏳ Pending incorporation + Stripe |
| 3 | A Platform (Both sides pay) | 🔄 Next |
| 4–10 | AI · Marketplace · Auditor · API · Network · Finance | 📋 Planned |

---

## What's Built

**Supplier flow** — Company profile → Scope 1 (fuels + refrigerants) → Scope 2 (electricity + heat) → Scope 3 (flights, hotels, commuting, grey fleet) → PDF report generation + evidence vault + attestation.

**Buyer portal** — KPI dashboard, CSV bulk upload, manual supplier add, invite email via Resend, real-time status tracking (draft → sent → started → submitted).

**Emission engine** — 69-country factor database. Sources: DEFRA 2025, ADEME V23.3, IPCC AR5, IEA 2025, EPA eGRID 2023, Cornell CHSB 2024.

**Infrastructure** — Clerk auth + Supabase RLS + Supabase Storage evidence vault (private, 60-min signed URLs) + Vercel auto-deploy + Resend email (DKIM verified, hello@vsmeos.fr).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.2 (Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Auth | Clerk v6 |
| Database | Supabase (PostgreSQL, Frankfurt EU) |
| Storage | Supabase Storage (`evidence-vault`, private) |
| PDF | React-PDF v4 + pako@1.0.11 (locked — do not upgrade) |
| Email | Resend v6 |
| Hosting | Vercel (Hobby, NuclearWiseGeeks author only) |
| Charts | Chart.js v4 + react-chartjs-2 |
| Animation | Framer Motion v12 |

---

## Database Schema (4 tables)

**`profiles`** — One row per supplier. `id` = Clerk userId.  
Columns: `id`, `company_name`, `country`, `industry`, `revenue`, `currency`, `signer`, `year`, `employee_count`, `website`, `updated_at`.  
⚠️ Revenue and currency live here ONLY — never in assessments.

**`assessments`** — One row per supplier per year.  
Columns: `id`, `user_id`, `year`, `status`, `activity_data` (jsonb), `emissions_totals` (jsonb), `evidence_links` (jsonb), `buyer_id`, `created_at`, `updated_at`.

**`supplier_invites`** — One row per buyer→supplier invite.  
Status flow: `draft` → `sent` → `started` → `submitted`.

**`buyer_settings`** — Custom email templates per buyer. UI built in Phase 3.

---

## Running Locally

```bash
# Clone and install
git clone https://github.com/NuclearWiseGeeks/vsmeos-final
cd vsmeos-final
npm install

# Add environment variables (see .env.example)
cp .env.example .env.local

# Run dev server
npm run dev
# → http://localhost:3000
```

### Required Environment Variables

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
RESEND_API_KEY=re_...
NEXT_PUBLIC_APP_URL=https://vsmeos.fr
```

> Production keys must start with `pk_live_` / `sk_live_`. Never use test keys on vsmeos.fr.

---

## Deploying

Vercel auto-deploys on every push to `main`. Commit author **must be NuclearWiseGeeks** or the Hobby plan blocks deployment.

```bash
# Verify identity before pushing
git config --global user.name "NuclearWiseGeeks"
git config --global user.email "your-nuclearwisegeeks-email@example.com"

git add .
git commit -m "your message"
git push origin main
# Vercel builds automatically. Live in ~2 minutes at vsmeos.fr.

# If blocked by wrong author on last commit:
git commit --amend --reset-author --no-edit
git push --force origin main
```

> ⚠️ Do NOT rename `middleware.ts` to `proxy.ts` despite Next.js 16 deprecation warnings — it causes 500 errors on all protected routes.

---

## Architecture

### Auth Flow
Clerk handles all authentication. Supabase RLS is enforced via Clerk JWT:
```typescript
const token = await getToken({ template: 'supabase' });
const supabase = createSupabaseClient(token); // always use the singleton
```
The JWT template named `supabase` must exist in **both** Clerk dev and production instances.

### Singleton Supabase Client
All components use `createSupabaseClient(token)` from `app/utils/supabase.ts`. This caches the client by token and prevents "Multiple GoTrueClient instances" warnings. Never call `createClient()` directly.

### ESG Context
`app/context/ESGContext.tsx` holds all global state — company profile + all activity data inputs. Loads from Supabase on mount. `saveToSupabase()` is triggered by Save buttons and AutoSave every 30 seconds.

### Routing
- Buyers → `/buyer/dashboard`
- Suppliers → `/supplier`
- Public: `/`, `/sign-in`, `/sign-up`, `/privacy`, `/terms`, `/methodology`, `/framework`, `/alignment`

---

## File Map

### Core Engine
| File | Lines | Role |
|------|-------|------|
| `app/utils/calculations.ts` | 432 | Emission factors + all calculation logic. 69 countries. |
| `app/utils/supabase.ts` | ~40 | Singleton Supabase client factory. |
| `app/context/ESGContext.tsx` | 352 | Global state. saveToSupabase(). |
| `middleware.ts` | ~35 | Clerk route protection. Do not rename. |

### Supplier Flow
| File | Lines | Role |
|------|-------|------|
| `app/supplier/page.tsx` | ~300 | Company profile form. |
| `app/supplier/hub/page.tsx` | 421 | Assessment hub. Sets status → `started` on mount. |
| `app/supplier/scope1/page.tsx` | 364 | 5 fuels + 4 refrigerants. |
| `app/supplier/scope2/page.tsx` | 307 | Grid/green electricity, district heat/cooling. |
| `app/supplier/scope3/page.tsx` | 339 | Flights, hotels, grey fleet, rail, commuting, remote. |
| `app/supplier/results/page.tsx` | 517 | Results + PDF generation + evidence vault + attestation. |

### Buyer Portal
| File | Lines | Role |
|------|-------|------|
| `app/buyer/dashboard/page.tsx` | 444 | Server component. KPIs + coverage + supplier table. |
| `app/buyer/dashboard/settings/page.tsx` | ~30 | Placeholder — Phase 3.3 builds this. |
| `components/buyer/CSVUploader.tsx` | ~80 | CSV upload. |
| `components/buyer/InviteTable.tsx` | ~200 | Supplier table with actions. |
| `components/buyer/ManualEntry.tsx` | ~80 | Manual add form. |

### Server Actions
| File | Lines | Role |
|------|-------|------|
| `actions/buyer.ts` | 286 | All buyer CRUD + invite email send. |
| `actions/supplier.ts` | 89 | Profile + invite status. No revenue/currency in assessments. |
| `actions/uploadEvidence.ts` | 86 | Evidence upload → Supabase Storage. 60-min signed URLs. |

---

## Brand System

Never change these. Zero emerald/Tailwind green anywhere.

| Token | Hex | Usage |
|-------|-----|-------|
| Deep forest | `#0C2918` | Buttons, dark sections, logo background |
| Forest medium | `#122F1E` | Card backgrounds, hover states |
| Gold accent | `#C9A84C` | Button text, badges, progress rings |
| Gold glow | `#DFC06A` | Hover highlights |

All buttons: `bg-[#0C2918] text-[#C9A84C] hover:bg-[#122F1E]`

---

## Rules for This Codebase

1. Never change brand colors or visual design
2. Never rename `middleware.ts` to `proxy.ts`
3. Never upgrade `pako` beyond v1.0.11 — React-PDF v4 breaks
4. Never write `revenue` or `currency` to the `assessments` table — profiles only
5. Never call `createClient()` directly — always use `createSupabaseClient(token)`
6. Status values are exactly: `draft` → `sent` → `started` → `submitted`
7. Supplier invite matching uses email address, not company name
8. Commit author must be NuclearWiseGeeks
9. New webhook/external API routes must be added to public routes in `middleware.ts`
10. Emission factors in `calculations.ts` are correct as of April 2026 — don't modify unless updating to a new official published edition

### React-PDF v4 Rules
- `<View fixed>` with nested children = silently fails. Use `<Text fixed>` instead.
- Page numbers: render prop on `<Text>` only.
- `<Svg>` inside fixed containers = fails.
- Footer: individual `<Text fixed>` as direct children of `<Page>`.

---

## Roadmap

### Phase 2 — A Product `⏳ Pending`
Stripe integration (€199 one-time / €349/yr / €799/yr). Gate PDF downloads behind payment. Awaiting company incorporation (VSME OS SAS) before enabling payments.

**New files:** `app/api/checkout/route.ts`, `app/api/webhooks/stripe/route.ts`  
**New env vars:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`  
**New table:** `subscriptions` (user_id, stripe_customer_id, plan, status, current_period_end)

### Phase 3 — A Platform `🔄 Next`
Both sides of the marketplace pay. Three tasks, no Stripe or legal entity required:

**3.1 Buyer data aggregation** — New `getSupplierEmissions()` action fetches submitted suppliers' `emissions_totals` from assessments via `buyer_id`. Adds total tCO₂e KPI card, average intensity, per-supplier breakdown table, and bar chart to buyer dashboard. Requires new Supabase RLS policy for buyer→assessment reads.

**3.2 CSV export** — Export button on buyer dashboard. Server action fetches supplier data + emissions. Client-side CSV generation + browser download. Columns: name, email, status, country, scope1/2/3, total, date.

**3.3 Custom email editor** — Replaces the "In Development" placeholder in `app/buyer/dashboard/settings/page.tsx`. Subject + body editor with `{{supplier_name}}` and `{{invite_link}}` variables. Preview panel. Saves to `buyer_settings` table (already exists). `sendInviteEmail()` in `actions/buyer.ts` uses custom template when present.

### Phase 4 — Intelligent Platform `📋 Planned`
AI data entry assistant (Claude API benchmarks), invoice/bill OCR (auto-extract kWh from photos), anomaly detection on buyer dashboard, automated supplier reminder emails.

### Phase 5 — Sustainability Advisor `📋 Planned`
Year-on-year comparison (schema already supports multi-year), AI reduction recommendations (Claude API post-report), reduction target setting, DEFRA 2026 factor updates (due June 2026).

### Phase 6–10 `📋 Planned`
Procurement marketplace → Third-party auditor portal → Public REST API → Network effects (Supplier Passport) → Financial gateway (green finance scores, carbon credits, ESG portfolio API).

---

## Emission Factor Sources

| Source | Edition | Next update |
|--------|---------|-------------|
| DEFRA | 2025 | June 2026 |
| ADEME | V23.3 (2024) | Mid-2026 |
| IPCC | AR5 | No mandate |
| Cornell CHSB | 2024 | Late 2026 |
| EPA eGRID | 2023 (updated) | Done |
| IEA | 2025 (updated) | Done |

---

## Infrastructure Status

| Service | Status | Notes |
|---------|--------|-------|
| Vercel | ✅ Live | Hobby plan. NuclearWiseGeeks only. |
| Supabase | ✅ Live | Frankfurt EU. Free tier. RLS enabled. |
| Clerk | ✅ Live | JWT template `supabase` configured in both dev + prod. |
| GitHub | ✅ Live | `vsmeos-final` private repo. `main` = production. |
| Hostinger | ✅ Live | Domain + DNS + DKIM. |
| Resend | ✅ Live | Domain verified. `hello@vsmeos.fr` sending. |
| Stripe | ❌ Not started | Phase 2 — after incorporation. |