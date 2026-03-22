// =============================================================================
// FILE: app/alignment/page.tsx
// PURPOSE: Explains how VSME OS reports align with CSRD, GHG Protocol,
//          ISO 14064-1, and Commission Recommendation (EU) 2025/1710.
//
// AUDIENCE: Procurement directors, ESG teams, compliance officers, and
//           buyers who need to confirm that supplier reports satisfy
//           their own regulatory disclosure obligations.
//
// COMMERCIAL VALUE: This page answers the most common objection in B2B sales:
//   "Will this actually satisfy our CSRD auditors?"
//   A detailed, accurate answer here converts sceptical enterprise buyers.
//
// WHEN TO UPDATE:
//   - When CSRD delegated acts are published (expected 2025/2026)
//   - When VSME OS achieves third-party verification support (Phase 7)
//   - When new standards emerge (e.g. SBTi SME pathway updates)
// =============================================================================

import Link from 'next/link';
import SharedNav from '@/components/SharedNav';
import { ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Building2, Globe, FileText, TrendingUp } from 'lucide-react';

export default function AlignmentPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Nav */}
      <SharedNav />

      <div className="max-w-4xl mx-auto px-6 py-12 sm:py-16">

        {/* Hero */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-100 rounded-full mb-4">
            <CheckCircle2 size={12} className="text-green-600" />
            <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Regulatory Alignment</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-4">
            Standards & Regulatory Alignment
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed max-w-2xl">
            How VSME OS reports satisfy the requirements of CSRD, GHG Protocol,
            ISO 14064-1:2018, and Commission Recommendation (EU) 2025/1710 (EU VSME) — and what
            remains the buyer's responsibility.
          </p>
        </div>

        {/* Standards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-14">
          {[
            { label: 'CSRD ESRS E1',        status: 'Aligned',     detail: 'Scope 1, 2 (location & market), Scope 3 Cat. 6+7, intensity metric' },
            { label: 'GHG Protocol',         status: 'Aligned',     detail: 'Activity-based method, operational control boundary, Scope 2 dual reporting' },
            { label: 'ISO 14064-1:2018',     status: 'Aligned',     detail: 'Quantification, boundary statement, uncertainty disclosure, attestation' },
            { label: 'EU (2025/1710)',         status: 'Aligned',     detail: 'SME-appropriate data points, proportionality principle, limited assurance' },
            { label: 'SBTi SME Pathway',     status: 'Compatible',  detail: 'Scope 1+2 data directly usable for SBTi target-setting baseline' },
            { label: 'CDP Supply Chain',     status: 'Compatible',  detail: 'Scope totals and intensity metric match CDP S3.1 supplier fields' },
            { label: 'EU Taxonomy',          status: 'Partial',     detail: 'Provides GHG data for Do No Significant Harm climate assessment; full taxonomy requires additional disclosures' },
            { label: 'Ecovadis / Sedex',     status: 'Compatible',  detail: 'Carbon footprint data can be imported into Ecovadis environmental scorecards' },
          ].map(({ label, status, detail }) => (
            <div key={label} className={`p-4 rounded-xl border ${
              status === 'Aligned'     ? 'bg-green-50 border-green-100' :
              status === 'Compatible'  ? 'bg-blue-50 border-blue-100' :
                                        'bg-amber-50 border-amber-100'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-gray-900 text-sm">{label}</p>
                <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                  status === 'Aligned'    ? 'bg-green-100 text-green-700' :
                  status === 'Compatible' ? 'bg-blue-100 text-blue-700' :
                                           'bg-amber-100 text-amber-700'
                }`}>
                  {status}
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{detail}</p>
            </div>
          ))}
        </div>

        <div className="space-y-14">

          {/* CSRD */}
          <Section icon={<Building2 size={18} className="text-blue-600" />} title="1. EU Corporate Sustainability Reporting Directive (CSRD)">
            <p>
              The EU Omnibus Directive (published 26 February 2026, in force 18 March 2026) significantly
              revised the CSRD. Companies with more than 1,000 employees and over €450 million net turnover
              are now required to disclose Scope 1, 2, and Scope 3 emissions, with first reports due for
              financial year 2027 (published in 2028). The Omnibus explicitly names the VSME standard
              (Commission Recommendation EU 2025/1710) as the voluntary standard that value chain suppliers
              use to respond to buyer data requests — making VSME OS the direct implementation of that standard.
              Critically, in-scope companies are prohibited from requesting data from value chain partners
              that exceeds what the VSME voluntary standard covers. VSME OS generates exactly that data.
            </p>

            <SubSection title="What CSRD ESRS E1 Requires from Suppliers">
              <p>Under ESRS E1, large companies must disclose:</p>
              <div className="mt-3 space-y-2">
                {[
                  { req: 'E1-6 — Gross Scope 1, 2, 3 GHG emissions (in tCO₂e)', vsme: 'Page 1 totals panel — all three scopes in tCO₂e', met: true },
                  { req: 'E1-6 — Scope 2 location-based AND market-based',       vsme: 'Both methods reported. Grid electricity = location-based. Green electricity = market-based.', met: true },
                  { req: 'E1-6 — GHG intensity of net revenues',                  vsme: 'Two intensity metrics: kgCO₂e / M revenue currency (ESRS E1-6 compliant) and kgCO₂e / actual EUR (4 decimal places). Both shown on Page 1.', met: true },
                  { req: 'E1-6 — Emission factor sources disclosed',              vsme: 'Primary database named per country. Scope 3 RF multiplier disclosed. Factor versions noted in footer.', met: true },
                  { req: 'E1-6 — Boundary statement and exclusions',              vsme: 'Page 4 Section 5 lists every assessed but zero-activity source, grouped by scope (Scope 1 / 2 / 3)', met: true },
                  { req: 'E1-6 — Upstream Scope 3 Cat. 1 (purchased goods)',      vsme: 'Not yet covered — Phase 3 roadmap', met: false },
                  { req: 'E1-5 — Transition plan and targets',                    vsme: 'Outside scope of VSME OS (measurement tool, not target-setting tool)', met: false },
                ].map(({ req, vsme, met }) => (
                  <div key={req} className={`p-3 rounded-lg border ${met ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="flex items-start gap-3">
                      {met
                        ? <CheckCircle2 size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                        : <AlertCircle size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />}
                      <div>
                        <p className="text-xs font-bold text-gray-900">{req}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{vsme}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SubSection>

            <SubSection title="The CSRD Scope 3 Data Chain">
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 text-sm">
                <p className="font-bold text-gray-900 mb-3">How data flows from SME supplier to CSRD filing:</p>
                <div className="flex flex-col gap-2">
                  {[
                    { step: '1', label: 'SME supplier enters emissions data in VSME OS',         detail: 'Scope 1, 2, 3 activity data' },
                    { step: '2', label: 'VSME OS generates PDF report (GHG Protocol compliant)',  detail: '4-page: Summary · Breakdown · Declaration · Methodology' },
                    { step: '3', label: 'Supplier shares PDF with buying company',                detail: 'Via email, buyer portal, or procurement platform' },
                    { step: '4', label: 'Buyer ingests Scope 3 tCO₂e from Page 1',               detail: 'Into their Scope 3 Cat. 1 or Cat. 11 inventory' },
                    { step: '5', label: 'Buyer discloses aggregated Scope 3 in CSRD filing',      detail: 'Under ESRS E1-6, with supplier data as evidence base' },
                  ].map(({ step, label, detail }) => (
                    <div key={step} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-[#0C2918] text-[#C9A84C] rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {step}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{label}</p>
                        <p className="text-xs text-gray-500">{detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SubSection>
          </Section>

          {/* GHG Protocol */}
          <Section icon={<Globe size={18} className="text-green-600" />} title="2. GHG Protocol Corporate Accounting and Reporting Standard">
            <p>
              The GHG Protocol Corporate Standard (WRI / WBCSD, 2004, updated 2015 for Scope 2)
              is the most widely used international framework for corporate GHG accounting and
              reporting. It defines Scopes 1, 2, and 3, the activity-based calculation methodology,
              and the requirements for boundary setting and disclosure.
            </p>

            <div className="mt-4 space-y-3">
              {[
                { principle: 'Relevance',      desc: 'All material emission sources for a typical SME are included. Sources not yet covered are explicitly disclosed as boundary exclusions.' },
                { principle: 'Completeness',   desc: 'All Scope 1, 2, and selected Scope 3 sources within the declared boundary are covered. Boundary is defined using the operational control approach.' },
                { principle: 'Consistency',    desc: 'The same methodology, factors, and boundary apply across reporting years, enabling year-on-year comparison.' },
                { principle: 'Transparency',   desc: 'Factor sources, update dates, assumptions (e.g. RF×1.9 for flights), and boundary exclusions are all disclosed on-report.' },
                { principle: 'Accuracy',       desc: 'Country-specific emission factors from national authoritative databases. Self-attested (limited assurance) — disclosure is on-report.' },
              ].map(({ principle, desc }) => (
                <div key={principle} className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-24 flex-shrink-0">
                    <p className="text-xs font-bold text-gray-900">{principle}</p>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            <SubSection title="Scope 2 Dual Reporting (GHG Protocol Scope 2 Guidance, 2015)">
              <p>
                The 2015 update to the GHG Protocol introduced the requirement to report Scope 2
                emissions using <strong>both</strong> the location-based and market-based methods.
                VSME OS implements both by default:
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                <li><strong>Location-based:</strong> Grid electricity consumption × country grid factor. Reported on Page 1 and Page 2.</li>
                <li><strong>Market-based:</strong> Green electricity consumption × 0.000 kgCO₂e/kWh (with GoO/REC certificate). Reported as a separate line on Page 2 and noted in the compliance block.</li>
              </ul>
            </SubSection>
          </Section>

          {/* ISO 14064-1 */}
          <Section icon={<FileText size={18} className="text-purple-600" />} title="3. ISO 14064-1:2018 — Quantification of GHG Emissions">
            <p>
              ISO 14064-1:2018 specifies principles and requirements for the quantification and
              reporting of GHG emissions at the organisation level. It is the international
              standard underlying the GHG Protocol and is referenced by CSRD as an acceptable
              quantification methodology.
            </p>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    {['ISO 14064-1 Requirement', 'VSME OS Implementation'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 border-b border-gray-100">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { req: 'Organisational boundary (Clause 5.2)', impl: 'Operational control approach. Declared in report boundary statement.' },
                    { req: 'GHG sources and sinks (Clause 5.3)',    impl: 'All relevant emission sources categorised by scope and type. Exclusions documented.' },
                    { req: 'Activity data (Clause 6.2)',             impl: 'Supplier-entered data with evidence documentation listed in Declaration.' },
                    { req: 'Emission factors (Clause 6.3)',          impl: 'Country-specific, annually updated, source-cited in every report.' },
                    { req: 'GHG assertion (Clause 7)',               impl: 'Page 1 totals panel. Scope-level breakdown on Page 2.' },
                    { req: 'Uncertainty assessment (Clause 6.5)',    impl: 'Disclosed as self-attested (limited assurance) in disclaimer.' },
                    { req: 'GHG report contents (Clause 7.2)',       impl: 'All required elements present across 4 pages: summary, activity detail, declaration, and methodology & audit trail.' },
                  ].map(({ req, impl }) => (
                    <tr key={req} className="border-b border-gray-50 last:border-0">
                      <td className="px-4 py-3 font-medium text-gray-900 text-xs">{req}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{impl}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* EU VSME 2025 */}
          <Section icon={<TrendingUp size={18} className="text-orange-500" />} title="4. Commission Recommendation (EU) 2025/1710 — EU VSME Standard">
            <p>
              The European Commission published the Voluntary Sustainability Reporting Standard
              for SMEs (VSME) as Commission Recommendation (EU) 2025/1710, signed in Brussels on 30 July 2025. It is designed to allow
              SMEs to report sustainability data proportionately — without the full burden of
              ESRS that applies to large companies — while still producing data that is useful
              for their buyers' CSRD disclosures.
            </p>
            <p className="mt-3">
              VSME OS is named after and built around this standard. The key VSME principles
              reflected in the platform:
            </p>
            <div className="mt-4 space-y-3">
              {[
                { principle: 'Proportionality',     desc: 'Data entry is limited to sources that are material for the majority of SMEs. Highly technical or data-intensive sources (e.g. Scope 3 Cat. 1 purchased goods) are deferred to Phase 3 to avoid overwhelming small companies on first engagement.' },
                { principle: 'Interoperability',    desc: 'Report format designed to be directly usable by buyers for ESRS E1 Scope 3 disclosures without reformatting. The tCO₂e figures map directly to ESRS E1-6 disclosure fields.' },
                { principle: 'Reliability',         desc: 'Country-specific emission factors from authoritative national databases, not generic global averages. Factor sources and update dates cited on every report.' },
                { principle: 'Accessibility',       desc: 'Plain-language tooltips and "how to find this number" guidance on every data entry field, designed for SMEs without a sustainability team.' },
              ].map(({ principle, desc }) => (
                <div key={principle} className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                  <p className="text-sm font-bold text-orange-900 mb-1">{principle}</p>
                  <p className="text-xs text-orange-800 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Buyer's responsibilities */}
          <Section icon={<AlertCircle size={18} className="text-amber-500" />} title="5. What Remains the Buyer's Responsibility">
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
              <p className="font-bold text-amber-900 mb-3">Important — please read before using supplier data in CSRD filings.</p>
              <p className="text-sm text-amber-800 leading-relaxed mb-3">
                VSME OS supplier reports satisfy the <strong>data collection</strong> requirement
                for Scope 3. They do not remove the buyer's obligation to:
              </p>
              <ul className="space-y-2">
                {[
                  'Apply their own data quality assessment to supplier-submitted data before including it in regulated disclosures',
                  'Determine whether limited assurance (self-attested) is sufficient for their specific CSRD filing, or whether independently verified data is required',
                  'Aggregate supplier data correctly into the right Scope 3 categories (typically Cat. 1 for purchased goods/services, Cat. 11 for use of sold products)',
                  'Conduct spend-based or hybrid estimation for suppliers who have not yet submitted VSME OS reports',
                  'Disclose data quality and coverage gaps in their own CSRD filing',
                  'Ensure their assurance provider accepts self-attested supplier data (most do, but confirm with your provider)',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm text-amber-800">
                    <AlertCircle size={12} className="text-amber-500 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Section>

          {/* Questions CTA */}
          <div className="bg-gray-900 text-white rounded-2xl p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3 className="font-bold text-lg mb-1">Need a compliance briefing for your ESG team?</h3>
              <p className="text-gray-400 text-sm">
                We can walk your sustainability or legal team through how VSME OS data
                integrates with your CSRD reporting workflow.
              </p>
            </div>
            <div className="flex flex-col gap-3 flex-shrink-0">
              <a
                href="mailto:compliance@vsmeos.fr"
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-full text-sm font-bold hover:bg-gray-100 transition-colors"
              >
                compliance@vsmeos.fr
              </a>
              <Link
                href="/methodology"
                className="flex items-center gap-2 px-5 py-2.5 border border-gray-700 text-gray-300 rounded-full text-sm font-medium hover:border-white transition-colors"
              >
                Calculation Methodology <ArrowRight size={14} />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">{icon}</div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
      <div className="space-y-4 text-gray-600 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5 pl-4 border-l-2 border-gray-100">
      <h3 className="text-sm font-bold text-gray-900 mb-2">{title}</h3>
      <div className="space-y-2 text-sm text-gray-600 leading-relaxed">{children}</div>
    </div>
  );
}