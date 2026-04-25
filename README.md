# VSME OS

**Carbon reporting infrastructure for SME suppliers responding to CSRD Scope 3 requests.**

VSME OS enables small and medium-sized enterprises to generate a GHG Protocol-based carbon footprint declaration — a 4-page PDF — designed for CSRD Scope 3 data collection by their buyers. Built on Commission Recommendation (EU) 2025/1710 (the EU VSME standard), which the EU Omnibus Directive (in force 18 March 2026) explicitly names as the ceiling for what large companies may request from value chain suppliers.

**Live:** https://vsmeos.fr

---

## What it does

**For suppliers** — A guided 3-step flow (profile → scope inputs → results) that calculates Scope 1, 2, and 3 emissions using country-specific emission factors, then generates a signed, audit-ready 4-page PDF declaration.

**For buyers** — A free dashboard to invite suppliers, track completion status in real time, and receive structured tCO₂e data for their CSRD Scope 3 inventory.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.2 (App Router + Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Auth | Clerk v6 |
| Database | Supabase (PostgreSQL, Frankfurt EU) |
| Storage | Supabase Storage (`evidence-vault`, private) |
| PDF Generation | React-PDF v4 + pako@1.0.11 (locked) |
| Email | Resend v6 |
| Charts | Chart.js v4 + react-chartjs-2 |
| Animations | Framer Motion v12 |
| Icons | Lucide React |
| Hosting | Vercel |

---

## Project Structure

```
app/
├── page.tsx                        # Landing page
├── layout.tsx                      # Root layout
├── globals.css                     # Global styles
│
├── utils/
│   ├── calculations.ts             # ⭐ Core emission engine — all 69-country factors
│   └── supabase.ts                 # Singleton Supabase client (Clerk-authenticated)
│
├── context/
│   └── ESGContext.tsx              # Global state — all supplier data + save logic
│
├── components/
│   ├── CarbonReportPDF.tsx         # ⭐ 4-page PDF generator (React-PDF v4)
│   ├── AutoSave.tsx                # Debounced save every 30s + on page exit
│   ├── CompanyOnboarding.tsx       # First-login company name modal
│   ├── DownloadTrigger.tsx         # PDF download button + trigger logic
│   ├── PageTransition.tsx          # Framer Motion page wrapper
│   ├── ProgressRing.tsx            # SVG coverage ring
│   ├── SampleReportModal.tsx       # Landing page PDF preview
│   ├── SharedNav.tsx               # Navigation bar
│   ├── SupplierProgress.tsx        # 3-step scope stepper
│   ├── VsmeLogo.tsx                # Brand logo
│   └── ui/
│       └── Input.tsx               # Shared number input with tooltip
│
├── components/buyer/
│   ├── CSVUploader.tsx             # Bulk CSV import
│   ├── InviteTable.tsx             # Supplier table with actions
│   └── ManualEntry.tsx             # Single supplier add form
│
├── supplier/                       # Supplier flow (auth required)
│   ├── page.tsx                    # Company profile
│   ├── hub/page.tsx                # Assessment hub
│   ├── scope1/page.tsx             # Fuels + refrigerants
│   ├── scope2/page.tsx             # Electricity + heat
│   ├── scope3/page.tsx             # Flights, hotels, commuting, grey fleet
│   ├── results/page.tsx            # Results + PDF + evidence vault
│   └── settings/page.tsx           # Account settings
│
├── buyer/dashboard/                # Buyer portal (auth required)
│   ├── layout.tsx                  # Sidebar layout
│   ├── page.tsx                    # KPIs + supplier status table
│   └── settings/page.tsx           # Email template editor (Phase 3.3)
│
├── api/
│   └── sync/route.ts               # Legacy fallback sync route (not actively used)
│
├── alignment/page.tsx              # Regulatory alignment (CSRD, ISO, VSME)
├── framework/page.tsx              # PDF structure explanation
├── methodology/page.tsx            # Full technical methodology
├── privacy/page.tsx                # Privacy policy
└── terms/page.tsx                  # Terms of service

actions/
├── buyer.ts                        # All buyer CRUD + invite email via Resend
├── supplier.ts                     # Profile + invite status
└── uploadEvidence.ts               # Evidence → Supabase Storage (60-min signed URLs)

middleware.ts                       # Clerk route protection — do not rename
```

---

## The Calculation Engine

`app/utils/calculations.ts` is the single source of truth for all emission factors. Never hardcode a factor anywhere else — always import from this file.

### Emission Factor Sources (as of April 23, 2026)

| Scope | Source | Version |
|-------|--------|---------|
| Scope 1 — Fuels | ADEME Base Carbone | V23.6 (2025, full lifecycle, incl. upstream) |
| Scope 1 — Refrigerants | IPCC AR5 GWP100 | 2013, stable |
| Scope 2 — Electricity | DEFRA 2025 / UBA 2024 / REE 2024 / IEA 2025 / EMBER 2024 / EPA eGRID2023 (Jan 2025) | 69 countries |
| Scope 2 — Thermal | Euroheat & Power / IEA | 2023 |
| Scope 3 — Flights | DEFRA | 2025 (incl. Radiative Forcing ×1.9) |
| Scope 3 — Ground travel (grey fleet) | DEFRA | 2025 |
| Scope 3 — Hotels | Cornell/Greenview CHSB | 2024 |
| Scope 3 — Commuting & remote working | DEFRA | 2025 |

Last full audit: **April 23, 2026** (US grid 0.352 → 0.350 to match EPA's exact 770.9 lbCO₂e/MWh value).
Next scheduled update: **DEFRA 2026** due June 2026.

---

## The PDF Report

`app/components/CarbonReportPDF.tsx` generates a 4-page A4 document.

| Page | Contents |
|------|----------|
| 1 | Company profile, compliance statement, scope summary, intensity metrics |
| 2 | Full activity table with emission factors, grand total |
| 3 | Declaration of conformity, evidence retained, authorised signatory |
| 4 | Methodology, factor sources, boundary exclusions, disclaimer |

Everything is dynamic — factors, company name, year, totals, evidence list all pull from live data.

---

## Database Schema (4 tables)

**`profiles`** — One row per user (buyer or supplier). `id` = Clerk userId.
Holds company info, role (`'buyer'` or `'supplier'`), revenue + currency (here ONLY — never in assessments), reporting period, consolidation approach, and optional financial report URL.

**`assessments`** — One row per supplier per year.
`activity_data` (jsonb) holds all emission inputs. `emissions_totals` (jsonb) holds calculated results.

**`supplier_invites`** — One row per buyer→supplier invite.
Status flow: `draft` → `sent` → `started` → `submitted`.

**`buyer_settings`** — Custom invite email templates per buyer.

---

## Local Development

```bash
npm install
npm run dev
# → http://localhost:3000
```

> ⚠️ Before first local run: ensure your Supabase database has the latest schema. The Phase 4b.3 audit (April 23, 2026) added 4 columns to `profiles`. If you cloned an older snapshot of the DB, run the migration block in `handover.md` §1 (Phase 4b.3 section).

### Required Environment Variables

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...      # Required for intelligence_cache reads/writes (RLS bypass)
RESEND_API_KEY=re_...
NEXT_PUBLIC_APP_URL=https://vsmeos.fr
ANTHROPIC_API_KEY=sk-ant-...          # Required for VESQ3 benchmark + recommendations
```

> Local dev uses Clerk dev instance (`pk_test_` keys). Production uses `pk_live_` / `sk_live_`.

---

## Deployment

Deployed on Vercel. Every push to `main` triggers an automatic production deployment.

```bash
# Author must be NuclearWiseGeeks (Vercel Hobby plan requirement)
git config --global user.name "NuclearWiseGeeks"

git add .
git commit -m "your message"
git push origin main
# Live at vsmeos.fr in ~2 minutes
```

---

## Regulatory Alignment

| Standard | Status |
|----------|--------|
| GHG Protocol Corporate Standard | ✅ Aligned |
| ISO 14064-1:2018 | ✅ Aligned (limited assurance) |
| CSRD ESRS E1-6 | ✅ Aligned |
| Commission Recommendation (EU) 2025/1710 | ✅ Direct implementation |
| EU Omnibus Directive (in force 18 March 2026) | ✅ Aligned |

---

## Roadmap

| Phase | Name | Status |
|-------|------|--------|
| 1 | Free Tool — supplier flow, buyer dashboard, PDF, 69-country DB, evidence vault | ✅ Complete |
| 2 | Payments — Stripe integration | ⏳ Parked (pending incorporation) |
| 3 | Platform — Buyer data aggregation, custom emails, role separation | ✅ Complete |
| 4 | Supplier Experience — Vault, YoY, VESQ3 intelligence, targets, supplier dashboard | ✅ Complete |
| 4b | April 2026 Audit Sprints — Phase A+B audit, Case 3 supplier name fix, Phase 4b.3 PDF audit | ✅ Complete |
| **5** | **AI + Intelligence** — OCR doc processing, VESQ3 chat, Carbon Passport, Buyer Portfolio AI | 🔄 **Next** |
| 6 | Trust & Verification Score — supplier trust score, verification tiers, Scope 2 dual reporting | 📋 Planned |
| 7 | Deadline Urgency Engine — CSRD calendar, automated reminders | 📋 Planned |
| 8 | Supplier Vault + Benchmarks + Passport — Carbon Passport public page, SBTi target tracking | 📋 Planned |
| 9 | Buyer Collaboration Tools — multi-user accounts, supplier grouping | 📋 Planned |
| 10 | Auditor Portal — verifier portal, ISO 14064-3 alignment | 📋 Planned |
| 11 | White Label + Reseller — for accounting firms, ESG consultants | 📋 Planned |
| 12 | Regulatory Intelligence — CSRD update alerts, ESRS change tracking | 📋 Planned |
| 13 | API + ERP Integrations — SAP / NetSuite / Workday connectors | 📋 Planned |
| 14 | Financial Gateway — carbon credit integration, offset marketplace | 📋 Planned |

> **Single source of truth:** `handover.md` §2 has the canonical phase status with every detail. This README is a summary.

---

## Contact

- General: contact@vsmeos.fr
- Methodology: methodology@vsmeos.fr
- Legal: legal@vsmeos.fr
- Website: [vsmeos.fr](https://vsmeos.fr)