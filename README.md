# VSME OS

**Carbon reporting infrastructure for SME suppliers responding to CSRD Scope 3 requests.**

VSME OS enables small and medium-sized enterprises to generate a GHG Protocol-compliant carbon footprint declaration — a 4-page PDF — that satisfies their buyers' CSRD data collection requirements. Built on Commission Recommendation (EU) 2025/1710 (the EU VSME standard), which the EU Omnibus Directive (in force 18 March 2026) explicitly names as the ceiling for what large companies may request from value chain suppliers.

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

### Emission Factor Sources (as of April 2026)

| Scope | Source | Version |
|-------|--------|---------|
| Scope 1 — Fuels | ADEME Base Carbone | 2024 (full lifecycle, incl. upstream) |
| Scope 1 — Refrigerants | IPCC AR5 GWP100 | 2013, stable |
| Scope 2 — Electricity | IEA 2025 / EMBER 2024 / EPA eGRID 2023 | 69 countries |
| Scope 2 — Thermal | Euroheat & Power / IEA | 2023 |
| Scope 3 — Flights | DEFRA | 2025 (incl. Radiative Forcing ×1.9) |
| Scope 3 — Ground travel | DEFRA | 2024 |
| Scope 3 — Hotels | Cornell/Greenview CHSB | 2024 |
| Scope 3 — Commuting/WFH | DEFRA / ADEME | 2024 |

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

**`profiles`** — One row per supplier. `id` = Clerk userId.
Revenue and currency live here ONLY — never in assessments.

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

### Required Environment Variables

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
RESEND_API_KEY=re_...
NEXT_PUBLIC_APP_URL=https://vsmeos.fr
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
| EU Omnibus Directive (in force 18 March 2026) | ✅ Compliant |

---

## Roadmap

| Phase | Name | Status |
|-------|------|--------|
| 1 | A Tool — Free supplier carbon reporting | ✅ Complete |
| 2 | A Product — Stripe payments (€199–€799/yr) | ⏳ Parked (pending incorporation) |
| 3 | A Platform — Buyer data aggregation, CSV export, custom emails | 🔄 In progress |
| 4 | Intelligent Platform — AI data entry, invoice OCR, smart reminders | 📋 Planned |
| 5 | Sustainability Advisor — YoY comparison, AI reduction recommendations | 📋 Planned |
| 6 | Procurement Marketplace — Supplier directory, benchmarking | 📋 Planned |
| 7 | Auditor Portal — Third-party verification workflow | 📋 Planned |
| 8 | Infrastructure — Public REST API, webhooks, ERP integrations | 📋 Planned |
| 9 | Network Effects — Supplier Passport, Carbon Score™ | 📋 Planned |
| 10 | Financial Gateway — Green finance scores, carbon credits | 📋 Planned |

---

## Contact

- General: contact@vsmeos.fr
- Methodology: methodology@vsmeos.fr
- Legal: legal@vsmeos.fr
- Website: [vsmeos.fr](https://vsmeos.fr)