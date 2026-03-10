# VSME OS

**Carbon reporting infrastructure for SME suppliers responding to CSRD Scope 3 requests.**

VSME OS enables small and medium-sized enterprises to generate a GHG Protocol-compliant carbon footprint declaration — a 4-page PDF — that satisfies their buyers' CSRD data collection requirements. Built on Commission Recommendation (EU) 2025/1710 (the EU VSME standard), which the EU Omnibus Directive (in force 18 March 2026) explicitly names as the ceiling for what large companies may request from value chain suppliers.

---

## What it does

**For suppliers** — A guided 3-step flow (profile → scope inputs → results) that calculates Scope 1, 2, and 3 emissions using country-specific emission factors, then generates a signed, audit-ready 4-page PDF declaration.

**For buyers** — A free dashboard to invite suppliers, track completion status in real time, and receive structured tCO₂e data for their CSRD Scope 3 inventory.

---

## Pricing

| Plan | Price | Includes |
|---|---|---|
| Single Report | €199 one-time | 1 PDF report, 1 reporting year, all scopes |
| Annual Unlimited | €349/year | Unlimited reports, all reporting years |
| Team | €799/year | Up to 5 users, all features |
| Buyer Portal | Free | Invite suppliers, track progress, view reports |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Auth | Clerk |
| Database | Supabase (PostgreSQL) |
| PDF Generation | @react-pdf/renderer |
| Animations | Framer Motion |
| Icons | Lucide React |
| Email | Resend |
| Deployment | Vercel |

---

## Project Structure

```
app/
├── page.tsx                          # Landing page
├── layout.tsx                        # Root layout (fonts, metadata)
├── middleware.ts                     # Route protection (Clerk)
│
├── utils/
│   ├── calculations.ts               # ⭐ Core emission engine — all factors live here
│   └── supabase.ts                   # Supabase client (Clerk-authenticated)
│
├── context/
│   └── ESGContext.tsx                # Global state — holds all supplier data in session
│
├── components/
│   ├── CarbonReportPDF.tsx           # ⭐ 4-page PDF generator (react-pdf)
│   ├── SampleReportModal.tsx         # Landing page report preview modal
│   ├── SharedNav.tsx                 # Navigation bar (all public pages)
│   ├── SupplierProgress.tsx          # 3-step progress stepper
│   ├── AutoSave.tsx                  # Supabase autosave toast
│   ├── DownloadTrigger.tsx           # Client-side PDF download handler
│   ├── PageTransition.tsx            # Page entrance animations
│   ├── ProgressRing.tsx              # Circular progress indicator
│   └── ui/
│       └── Input.tsx                 # NumberInput with help tooltip
│
├── supplier/                         # Supplier-facing app (auth required)
│   ├── page.tsx                      # Company profile (Step 1)
│   ├── layout.tsx                    # Supplier layout wrapper
│   ├── Sidebar.tsx                   # Sidebar navigation
│   ├── hub/page.tsx                  # Hub / dashboard overview
│   ├── scope1/page.tsx               # Direct emissions input (Step 2a)
│   ├── scope2/page.tsx               # Indirect energy input (Step 2b)
│   ├── scope3/page.tsx               # Travel & commuting input (Step 2c)
│   ├── results/page.tsx              # Results, evidence vault, PDF download (Step 3)
│   └── settings/page.tsx             # Account settings
│
├── buyer/                            # Buyer-facing app (auth required)
│   └── dashboard/
│       ├── layout.tsx                # Buyer dashboard layout
│       ├── page.tsx                  # Supplier progress overview
│       ├── suppliers/page.tsx        # Supplier list and invite management
│       └── settings/page.tsx        # Buyer account settings
│
├── components/buyer/
│   ├── CSVUploader.tsx               # Bulk supplier CSV import
│   ├── InviteTable.tsx               # Supplier invite table
│   └── ManualEntry.tsx               # Manual supplier add form
│
├── api/
│   └── sync/route.ts                 # Supabase sync API endpoint
│
├── alignment/page.tsx                # Regulatory alignment page (CSRD, ISO, VSME)
├── framework/page.tsx                # PDF structure explanation page
├── methodology/page.tsx              # Full technical methodology documentation
├── privacy/page.tsx                  # Privacy policy
├── terms/page.tsx                    # Terms of service
├── sign-in/[[...sign-in]]/page.tsx   # Clerk sign-in
└── sign-up/[[...sign-up]]/page.tsx   # Clerk sign-up
```

---

## The Calculation Engine

`app/utils/calculations.ts` is the single source of truth for all emission factors. **Never hardcode a factor anywhere else in the codebase** — always import from this file.

### Emission Factor Sources (as of March 2026)

| Scope | Source | Version | Notes |
|---|---|---|---|
| Scope 1 — Fuels | ADEME Base Carbone | 2024 | Full lifecycle (combustion + upstream). Not DEFRA combustion-only. |
| Scope 1 — Refrigerants | IPCC AR5 GWP100 | 2013, stable | AR6 not yet legally required by EU F-Gas or GHG Protocol |
| Scope 2 — Electricity | IEA / national grid operators | 2023 | 69 countries. UK uses DEFRA 2025 (0.196 kgCO₂e/kWh combined) |
| Scope 2 — Thermal | Euroheat & Power / IEA | 2023 | Country-specific derived factors |
| Scope 3 — Flights | DEFRA | **2025** | Includes RF ×1.9. Major revision: short-haul -31%, long-haul -40% vs 2024 |
| Scope 3 — Ground travel | DEFRA | 2024 | Grey fleet 0.218, rail country-specific |
| Scope 3 — Hotels | Cornell/Greenview CHSB | **2024** | 28.0 kgCO₂e/room-night, conservative global estimate |
| Scope 3 — Commuting/WFH | DEFRA / ADEME | 2024 | 0.141 kgCO₂e/km commute, 2.84 kgCO₂e/WFH day |
| IEA world fallback | IEA World Energy Statistics | 2023 | Applied when country not in database |

### Key factor values

```
Natural gas:         0.244  kgCO₂e/kWh   (ADEME 2024 full lifecycle)
Heating oil:         3.200  kgCO₂e/L
Propane/LPG:         1.510  kgCO₂e/L
Fleet diesel:        3.160  kgCO₂e/L
Fleet petrol:        2.800  kgCO₂e/L
R410A refrigerant:   2,088  kgCO₂e/kg
R32 refrigerant:     675    kgCO₂e/kg
R134a refrigerant:   1,430  kgCO₂e/kg
R404A refrigerant:   3,922  kgCO₂e/kg
UK electricity:      0.196  kgCO₂e/kWh   (DEFRA 2025 combined)
France electricity:  0.052  kgCO₂e/kWh   (ADEME 2024)
Germany electricity: 0.380  kgCO₂e/kWh   (UBA 2023)
Short-haul flights:  0.175  kgCO₂e/pkm   (DEFRA 2025, incl. RF ×1.9)
Long-haul flights:   0.117  kgCO₂e/pkm   (DEFRA 2025, incl. RF ×1.9)
Hotel nights:        28.0   kgCO₂e/night  (CHSB 2024)
Grey fleet:          0.218  kgCO₂e/km    (DEFRA 2024)
Green electricity:   0.000  kgCO₂e/kWh   (GHG Protocol market-based)
```

### Next scheduled factor update
- **DEFRA 2026** — expected June 2026 (update `flight_short_haul`, `flight_long_haul`, `grey_fleet`, UK `electricityGrid`)
- **ADEME Base Carbone v24** — expected Q1 2026 (update Scope 1 fuel factors if changed)
- **CHSB 2025** — expected 2026 (update `hotel_nights` if published)

---

## The PDF Report

`app/components/CarbonReportPDF.tsx` generates a 4-page A4 document using `@react-pdf/renderer`.

| Page | Title | Contents |
|---|---|---|
| 1 | Corporate Carbon Footprint Declaration | Company profile, compliance statement, scope summary table, dual intensity metrics |
| 2 | Emissions Breakdown | Activity table with Factor /unit column, grand total row |
| 3 | Declaration of Conformity | Evidence retained, official attestation, authorised signatory |
| 4 | Methodology & Audit Trail | Emission factor sources (dynamic Scope 2), boundary exclusions (scope-grouped), disclaimer |

**Everything is dynamic** — factors, company name, year, country, totals, intensity metrics, evidence retained list, boundary exclusions, and Scope 2 source citations all pull from live data. Nothing on Pages 1–4 is hardcoded except legally fixed values (IPCC AR5 GWP100, DEFRA/ADEME standard references).

---

## Route Protection

Defined in `middleware.ts` via Clerk.

**Public routes** (no auth required):
`/` `/sign-in` `/sign-up` `/privacy` `/terms` `/methodology` `/framework` `/alignment`

**Protected routes** (Clerk auth required):
`/supplier/*` `/buyer/*` `/api/*`

---

## Environment Variables

Create a `.env.local` file in the project root:

```bash
# Clerk — Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/supplier
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/supplier

# Supabase — Database & Storage
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
# Type-check and build
npm run build

# Start production server
npm start
```

---

## Deployment

Deployed on **Vercel**. Every push to `main` triggers an automatic production deployment.

Add all environment variables from `.env.local` in the Vercel project settings under **Settings → Environment Variables**.

---

## Regulatory Alignment

| Standard | Status |
|---|---|
| GHG Protocol Corporate Standard | ✅ Aligned — activity-based methodology, location + market-based Scope 2 |
| ISO 14064-1:2018 | ✅ Aligned — organisational boundary, self-attested (limited assurance) |
| CSRD ESRS E1-6 | ✅ Aligned — tCO₂e totals, dual intensity metrics, factor disclosure, boundary statement |
| Commission Recommendation (EU) 2025/1710 | ✅ Direct implementation — this is the EU VSME standard |
| EU Omnibus Directive (in force 18 March 2026) | ✅ Compliant — Omnibus explicitly names VSME 2025/1710 as the standard for value chain data requests |

Reports are **self-attested (limited assurance)**. Third-party verification is not included but is planned for a future phase.

---

## Roadmap

| Phase | Description | Status |
|---|---|---|
| 1 | Core calculator — Scope 1, 2, 3 (Cat. 6 + 7) | ✅ Live |
| 2 | Buyer portal — invite, track, receive data | ✅ Live |
| 3 | Scope 3 expansion — Cat. 1, 4, 5, 11, 12 | 🔜 Planned |
| 4 | On-site solar / EV fleet inputs | 🔜 Planned |
| 5 | Stripe payments integration | 🔜 Planned |
| 6 | OCR utility bill upload (auto-fill inputs) | 🔜 Planned |
| 7 | Third-party verification integration | 🔜 Planned |

---

## Contact

- General: contact@vsmeos.fr
- Methodology enquiries: methodology@vsmeos.fr
- Legal: legal@vsmeos.fr
- Website: [vsmeos.fr](https://vsmeos.fr)