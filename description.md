VSME OS — Project Description
Last updated: April 18, 2026

What It Is
VSME OS is a B2B SaaS platform that solves the CSRD Scope 3 data collection problem for supply chains. Large companies (buyers) must report their suppliers' carbon emissions under the EU Corporate Sustainability Reporting Directive. Suppliers — typically SMEs — have no tool to produce that data. VSME OS is the bridge.
Two sides, one platform:

Buyers invite their suppliers, track completion, and receive structured carbon data in a format ready for CSRD filings.
Suppliers complete a guided carbon assessment in 15–30 minutes and receive a 4-page GHG Protocol-based PDF declaration.


The Problem It Solves
Under CSRD (EU Omnibus Directive, in force March 2026), companies with 1,000+ employees and €450M+ turnover must disclose Scope 3 emissions — which includes emissions from their entire supply chain. To do this, they need data from their SME suppliers.
The problem: SMEs don't have the resources, expertise, or tools to produce this data. Existing solutions (EcoVadis, Greenly) cost €3,800–€12,000/year and require weeks of work.
VSME OS solves this in 15–30 minutes at a fraction of the cost, producing a document that satisfies what the EU VSME standard (Commission Recommendation 2025/1710) explicitly defines as sufficient for value chain data requests.

How It Works
For Suppliers

Receive an invite email from their buyer
Enter their company profile (country, industry, revenue, financial year)
Enter Scope 1 data: fuel consumption (natural gas, heating oil, propane, diesel, petrol) and refrigerant leaks
Enter Scope 2 data: electricity consumption (grid or green), district heating/cooling
Enter Scope 3 data: business flights, hotels, grey fleet, rail travel, employee commuting, remote working
Download a 4-page GHG Protocol-based PDF declaration, signed by their authorised signatory
Access VESQ3 AI: industry benchmark vs peers and 3 personalised reduction recommendations
Set a reduction target and track progress year-on-year

For Buyers

Upload a CSV of supplier emails, or add manually — with financial year specified
Send branded invite emails (customisable subject + body with variable placeholders)
Track supplier completion in real time (draft → sent → started → submitted)
View supplier emissions breakdown by scope, filtered by year to prevent double-counting
Download all supplier data as CSV for CSRD filing


The Product
4-Page PDF Report
Every supplier gets a downloadable PDF that contains:

Page 1 — Company profile, compliance statement (GHG Protocol, ISO 14064-1:2018, EU 2025/1710, CSRD ESRS E1), headline scope totals in kgCO₂e and tCO₂e, carbon intensity metric aligned with ESRS E1-6
Page 2 — Detailed activity breakdown: every emission source with quantity, emission factor, and kgCO₂e result
Page 3 — Declaration of Conformity: evidence documentation list, official attestation signed by the authorised signatory
Page 4 — Methodology and audit trail: exact emission factor sources by country, boundary exclusions, disclaimers

The report is fully dynamic by country — a UK supplier's report cites DEFRA 2025, a French supplier's cites ADEME Base Carbone 2024, a German supplier's cites UBA 2024, and so on across 69 countries.
VESQ3 AI Intelligence
VESQ3 is VSME OS's AI engine (Claude Sonnet, branded as VESQ3):

Industry Benchmark — compares the supplier's carbon intensity against sector peers in their country, citing the correct national database. Gives a percentile ranking and visual range bar.
AI Reduction Roadmap — 3 specific, quantified, country-aware reduction actions prioritised by impact. Based on the supplier's actual emission sources — no generic advice.
Both results are cached and persist across dashboard sessions.

Emission Factor Database
69-country database, fully audited April 2026 against:

ADEME Base Carbone V23.6 (France, Scope 1 fuels)
DEFRA 2025 (UK, flights, grey fleet, commuting, remote working)
EPA eGRID2023 (USA)
UBA 2024 (Germany)
REE/EMBER 2024 (Spain)
IEA Emissions Factors 2025 (40+ countries, world fallback 0.445 kgCO₂e/kWh)
CEA 2024 (India), NGA 2024 (Australia), CEPCI/IEA 2024 (China)
IPCC AR5 GWP100 (refrigerants)
Cornell/Greenview CHSB 2024 (hotels)


Tech Stack
LayerTechnologyFrameworkNext.js 16.2.2 (App Router, Turbopack)LanguageTypeScript 5StylingTailwind CSS v4AuthClerk v6DatabaseSupabase (PostgreSQL, Frankfurt EU)PDFReact-PDF v4EmailResend v6AIAnthropic Claude Sonnet (claude-sonnet-4-20250514)HostingVercel (Hobby)FontInter variable font (next/font/google, Apple-style rendering)AnimationsFramer Motion v12

Regulatory Alignment
StandardStatusWhat VSME OS coversGHG Protocol Corporate StandardAlignedActivity-based method, operational control boundary, Scope 2 dual reportingISO 14064-1:2018AlignedQuantification, boundary statement, attestation, uncertainty disclosureCommission Recommendation (EU) 2025/1710AlignedSME-proportionate data points, limited assurance, interoperabilityCSRD ESRS E1Aligned (partial)Scope 1, 2 (location + market), Scope 3 Cat. 6+7, intensity metric (E1-6)SBTi SME PathwayCompatibleScope 1+2 data directly usable for SBTi baselineCDP Supply ChainCompatibleScope totals match CDP S3.1 supplier fields
Not yet covered: Scope 3 Cat. 1 (purchased goods), Cat. 3 (fuel & energy activities), Cat. 11 (use of sold products). These are planned for future phases.
Assurance level: Self-attested (limited assurance). Third-party verification planned for Phase 10 (Auditor Portal).

Phases — What's Done and What's Coming
✅ Done
Phase 1 — Free Tool
Complete supplier flow, buyer dashboard, 69-country emission factor database, 4-page dynamic PDF, Resend invite emails, Supabase evidence vault, landing page, methodology/framework/alignment public pages.
Phase 3 — Platform
Buyer data aggregation with emissions panel, custom invite email editor, buyer/supplier role separation with middleware route guards, DEFRA 2025 + multiple national database updates, legal copy audit.
Phase 4 — Supplier Experience
Supplier vault (all past reports, re-download), year-on-year comparison badges, VESQ3 industry benchmarking (Claude API, cached), VESQ3 AI reduction roadmap (Claude API, cached, persistent), reduction target setter with progress tracking, supplier dashboard (permanent home, single-load parallel fetch).
Phase 4.x — Post-Launch Fixes (April 18, 2026)

Root layout corruption fixed, Inter Apple-style font added
Intelligence cache RLS bug fixed (benchmark + roadmap now persist across refreshes)
Buyer dashboard year filter (prevents double-counting when same supplier submits multiple years)
Financial year field added to manual add + CSV upload (pre-fills supplier form)
Supplier "New Declaration" flow fixed (no longer kicked back to dashboard)
Full emission factor audit: Spain (0.181→0.108), Sweden (0.013→0.041), remote working (2.84→2.67), IEA fallback (0.464→0.445), methodology page corrected throughout
All VESQ3 branding consistent (no "Claude" visible in UI), no $ cost strings

⏳ Parked
Phase 2 — Payments
Stripe integration. Parked until after first pitch conversations and incorporation.
📋 Planned — The Full 14-Phase Roadmap
Phase 5 — AI + Intelligence ← NEXT · Unlocks: Speed + trust

OCR document processing: supplier uploads utility bills, VESQ3 auto-fills scope fields
VESQ3 Chat: floating assistant on supplier dashboard with full context
Carbon Passport: public shareable verification page per supplier per year
Buyer Portfolio Intelligence: VESQ3 analysis of buyer's entire supplier portfolio

Phase 6 — Trust & Verification Score · Unlocks: The moat
Supplier trust score based on data quality, evidence completeness, and year-on-year consistency. Verification tiers. Buyers can filter and rank suppliers by data quality.
Phase 7 — Deadline Urgency Engine · Unlocks: Organic growth
CSRD deadline calendar. Automated reminder emails to buyers and suppliers tied to regulatory reporting cycles. Urgency-driven re-engagement without manual outreach.
Phase 8 — Supplier Vault + Benchmarks + Passport · Unlocks: Network effects
Carbon Passport public page per supplier per year. Proprietary industry benchmark data built from VSME OS submission history. Supplier Passport — a portable carbon identity.
Phase 9 — Buyer Collaboration Tools · Unlocks: LTV multiplier
Multi-user buyer accounts. Supplier grouping and tagging. Engagement workflow tracking. Internal comment and approval workflows for procurement teams.
Phase 10 — Auditor Portal · Unlocks: Third-party verification
Dedicated portal for third-party verification bodies. Independently assured reports. ISO 14064-3 alignment. Moves platform from limited to reasonable assurance tier.
Phase 11 — White Label + Reseller · Unlocks: Enterprise revenue
White-label version for accounting firms, ESG consultants, industry associations, and trade bodies. Reseller programme. Custom branding, custom domains, custom pricing.
Phase 12 — Regulatory Intelligence · Unlocks: Defensible recurring subscription
CSRD update alerts. ESRS change tracking. Omnibus Directive monitoring. Regulatory radar that keeps buyers and suppliers informed automatically. Turns compliance into a subscription relationship.
Phase 13 — API + ERP Integrations · Unlocks: Infrastructure play
REST API for enterprise buyers. Native connectors for SAP, NetSuite, Workday, Salesforce. Allows large procurement teams to pull VSME OS supplier data directly into their systems without manual exports.
Phase 14 — Financial Gateway · Unlocks: Carbon as a financial instrument
Carbon credit integration. Verified offset marketplace. Green finance product links (green loans, sustainability-linked bonds). Turns the carbon declaration into the entry point for a financial product.

Competitive Position
VSME OSGreenlyEcoVadisPrice€199 (planned)$3,800–$12,000/yr€490–€7,650/yrTime to complete15–30 minWeeks50–500 hoursTwo-sided platform✅❌❌Country-specific factors69 countriesYesYesAI intelligenceVESQ3LimitedNoCSRD ESRS E1 aligned✅✅✅Buyer + supplier in one✅❌❌
The moat being built: VESQ3 AI brand · Carbon Passport network · Proprietary benchmark data from every submission · Two-sided flywheel (more buyers → more suppliers → more data → better benchmarks)

Infrastructure
ServicePurposeStatusVercelHosting (Next.js)✅ LiveSupabase (Frankfurt EU)PostgreSQL + Storage + RLS✅ LiveClerkAuth + JWT✅ LiveResendTransactional email✅ LiveAnthropicVESQ3 AI (Claude Sonnet)✅ LiveHostingerDomain + DNS✅ LiveGitHub (NuclearWiseGeeks)Source control → Vercel deploy✅ LiveStripePayments❌ Phase 2

Contact & Access

Live site: https://vsmeos.fr
Email: hello@vsmeos.fr
GitHub: NuclearWiseGeeks / vsmeos-final (private)
Vercel: NuclearWiseGeeks account only — pushes to main auto-deploy