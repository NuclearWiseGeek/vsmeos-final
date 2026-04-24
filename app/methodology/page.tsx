// =============================================================================
// FILE: app/methodology/page.tsx
// PURPOSE: Technical methodology page — explains exactly how VSME OS
//          calculates emissions. This is read by procurement directors,
//          ESG auditors, and sustainability consultants who need to know
//          if they can trust the numbers before using them in CSRD filings.
//
// COMMERCIAL IMPORTANCE:
//   A credible methodology page is what separates a "carbon calculator app"
//   from an "audit-ready reporting tool". It needs to answer:
//   1. Which emission factor databases do you use, and are they authoritative?
//   2. How do you handle Scope 2 location-based vs market-based?
//   3. Do flights include Radiative Forcing?
//   4. What are the boundary exclusions?
//   5. When are factors updated?
//
// WHEN TO UPDATE:
//   - When emission factors are updated (annually, typically Q1)
//   - When adding new scope categories (Phase 3: Scope 3 Cat. 1, 5, 12)
//   - When adding third-party verification support (Phase 7)
// =============================================================================


// Required: prevents static prerendering so Clerk context is available
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import SharedNav from '@/components/SharedNav';
import { ArrowLeft, ArrowRight, BookOpen, Database, Globe, Zap, Plane, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ================================================================
          HEADER NAV
          ================================================================ */}
      <SharedNav />

      <div className="max-w-4xl mx-auto px-6 py-12 sm:py-16">

        {/* ================================================================
            HERO
            ================================================================ */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full mb-4">
            <BookOpen size={12} className="text-blue-600" />
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Technical Documentation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-4">
            Calculation Methodology
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed max-w-2xl">
            A complete technical account of how VSME OS calculates greenhouse gas emissions —
            the data sources used, the formulas applied, and the assumptions made.
            Designed to satisfy auditor enquiries and ESG due diligence.
          </p>
        </div>

        {/* ================================================================
            QUICK SUMMARY BADGES
            ================================================================ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-14">
          {[
            { label: 'GHG Protocol',        sub: 'Corporate Standard',       colour: 'bg-blue-50 border-blue-100 text-blue-700' },
            { label: 'ISO 14064-1:2018',     sub: 'Quantification standard',  colour: 'bg-purple-50 border-purple-100 text-purple-700' },
            { label: 'EU VSME 2025/1710',    sub: 'Commission Recommendation',  colour: 'bg-green-50 border-green-100 text-green-700' },
            { label: 'CSRD ESRS E1',         sub: 'Climate disclosures',      colour: 'bg-orange-50 border-orange-100 text-orange-700' },
          ].map(({ label, sub, colour }) => (
            <div key={label} className={`p-4 rounded-xl border ${colour}`}>
              <p className="font-bold text-sm">{label}</p>
              <p className="text-xs opacity-70 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        <div className="space-y-16">

          {/* ================================================================
              SECTION 1: CORE FORMULA
              ================================================================ */}
          <Section icon={<TrendingUp size={18} />} title="1. Core Emission Calculation Formula">
            <p>
              All emissions in VSME OS are calculated using the standard activity-based
              methodology defined by the GHG Protocol:
            </p>

            {/* Formula block */}
            <div className="my-6 p-6 bg-[#0C2918] rounded-2xl text-center">
              <p className="text-white font-mono text-lg sm:text-xl tracking-tight">
                Emissions (kgCO₂e) = Activity Data × Emission Factor
              </p>
              <p className="text-gray-400 text-xs mt-3">
                Where activity data is the quantity of a resource consumed (e.g. kWh of electricity,
                litres of diesel, km flown) and the emission factor converts that quantity into
                kg of CO₂ equivalent (kgCO₂e), accounting for all relevant greenhouse gases
                (CO₂, CH₄, N₂O, HFCs etc.) expressed as CO₂ equivalents using IPCC AR5 GWP100 values.
              </p>
            </div>

            <p>
              Emissions from multiple sources are summed to produce scope totals. The grand total
              is the sum of Scope 1 + Scope 2 (location-based) + Scope 3 emissions, expressed in
              kgCO₂e or tCO₂e (1 tCO₂e = 1,000 kgCO₂e).
            </p>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-4">
              <p className="text-sm text-blue-800">
                <strong>Carbon Intensity Metrics:</strong> Where annual revenue is provided,
                VSME OS calculates two intensity metrics. The primary metric is kgCO₂e per million
                units of revenue currency (e.g. kgCO₂e / M€), aligned with ESRS E1-6 (GHG intensity
                of net revenues) and used for cross-supplier comparison. The secondary metric is
                kgCO₂e per actual EUR of revenue (4 decimal places), useful for absolute cost-of-carbon
                calculations. Both are shown on Page 1 of the generated report.
              </p>
            </div>
          </Section>

          {/* ================================================================
              SECTION 2: EMISSION FACTOR DATABASES
              ================================================================ */}
          <Section icon={<Database size={18} />} title="2. Emission Factor Databases by Country">
            <p>
              VSME OS uses <strong>country-specific emission factor databases</strong> rather
              than a single global average. The correct national database is selected automatically
              based on the supplier's declared country of operations. This is critical for
              accuracy: France's electricity grid (predominantly nuclear) has a factor of
              0.052 kgCO₂e/kWh, while Poland's (predominantly coal) is 0.695 kgCO₂e/kWh —
              a 15× difference that would produce a fundamentally misleading report if the
              wrong factor were applied.
            </p>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    {['Country / Region', 'Primary Database', 'Grid Factor (kgCO₂e/kWh)', 'Last Updated'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 border-b border-gray-100">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { country: 'France',         db: 'ADEME Base Carbone V23.6 (2025)',   factor: '0.052',  updated: '2024 Q1' },
                    { country: 'United Kingdom', db: 'DEFRA 2025 / National Grid ESO',    factor: '0.196',  updated: '2025 Q2' },
                    { country: 'Germany',        db: 'Umweltbundesamt (UBA) 2024',        factor: '0.364',  updated: '2025 Q1' },
                    { country: 'Spain',          db: 'Red Eléctrica (REE) / EMBER 2024',  factor: '0.108',  updated: '2025 Q1' },
                    { country: 'Italy',          db: 'GSE Italy 2024',                    factor: '0.251',  updated: '2025 Q1' },
                    { country: 'Netherlands',    db: 'CBS Netherlands / IEA 2024',        factor: '0.298',  updated: '2025 Q1' },
                    { country: 'Belgium',        db: 'CREG Belgium / IEA 2024',           factor: '0.144',  updated: '2025 Q1' },
                    { country: 'Sweden',         db: 'Energimyndigheten (SEA) 2023',      factor: '0.041',  updated: '2024 Q1' },
                    { country: 'Poland',         db: 'URE Poland / IEA 2024',              factor: '0.695',  updated: '2025 Q1' },
                    { country: 'USA',            db: 'US EPA eGRID2023 (Jan 2025)',       factor: '0.350',  updated: '2026 Q1' },
                    { country: 'Canada',         db: 'ECCC NIR 2023',                     factor: '0.130',  updated: '2024 Q1' },
                    { country: 'Australia',      db: 'Australian NGA 2024 / Clean Energy Regulator', factor: '0.610',  updated: '2025 Q1' },
                    { country: 'South Africa',   db: 'DFFE / Eskom 2022',                 factor: '0.928',  updated: '2023 Q4' },
                    { country: 'India',          db: 'CEA India 2024',                    factor: '0.716',  updated: '2025 Q1' },
                    { country: 'China',          db: 'CEPCI / IEA 2024 / EMBER 2024',    factor: '0.557',  updated: '2025 Q1' },
                    { country: 'Other (default)','db': 'IEA Emissions Factors 2025 (provisional 2024)', factor: '0.445',  updated: '2026 Q1' },
                  ].map(({ country, db, factor, updated }) => (
                    <tr key={country} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                      <td className="px-4 py-2.5 font-medium text-gray-900">{country}</td>
                      <td className="px-4 py-2.5 text-gray-600 text-xs">{db}</td>
                      <td className="px-4 py-2.5 font-mono text-gray-900 text-xs">{factor}</td>
                      <td className="px-4 py-2.5 text-gray-400 text-xs">{updated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              69 countries are supported. For countries where national grid operators do not
              publish standalone emission factors, IEA Emissions Factors 2025 averages
              are applied as a conservative estimate and clearly labelled as such in the report.
              Factors are reviewed and updated annually, typically in Q1 following national
              database publication cycles.
            </p>
          </Section>

          {/* ================================================================
              SECTION 3: SCOPE 1
              ================================================================ */}
          <Section icon={<div className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</div>} title="3. Scope 1 — Direct Emissions">
            <p>
              Scope 1 covers emissions from sources owned or controlled by the reporting
              organisation. VSME OS covers three Scope 1 categories:
            </p>

            <SubSection title="3.1 Stationary Combustion (Fuels for heating/energy)">
              <FactorTable rows={[
                { source: 'Natural Gas',    unit: 'kWh',    factor: '0.244',  db: 'ADEME Base Carbone V23.6 (2025)', notes: 'Full lifecycle (combustion 0.205 + upstream 0.039). Conservative approach per GHG Protocol.' },
                { source: 'Heating Oil',    unit: 'litres', factor: '3.200',  db: 'ADEME Base Carbone V23.6 (2025)', notes: 'Full lifecycle. Gas oil / fuel oil.' },
                { source: 'Propane / LPG',  unit: 'litres', factor: '1.510',  db: 'ADEME Base Carbone V23.6 (2025)', notes: 'Full lifecycle. Liquefied petroleum gas.' },
              ]} />
              <p className="text-xs text-gray-500 mt-2">
                All fuel factors use ADEME Base Carbone V23.6 (2025) full lifecycle methodology, which includes combustion CO₂, CH₄, N₂O (IPCC AR5 GWP100) plus upstream extraction and transport emissions. This is more conservative than DEFRA combustion-only Scope 1 factors and is the standard approach in French/EU GHG accounting.
              </p>
            </SubSection>

            <SubSection title="3.2 Mobile Combustion (Company-owned vehicles)">
              <p>Covers fuel used in vehicles owned or leased by the company (fleet vehicles). Employee personal vehicles reimbursed per km are reported in Scope 3.</p>
              <FactorTable rows={[
                { source: 'Diesel (fleet)',    unit: 'litres', factor: '3.160', db: 'ADEME Base Carbone V23.6 (2025)', notes: 'Full lifecycle incl. upstream extraction and transport.' },
                { source: 'Petrol / Gasoline', unit: 'litres', factor: '2.800', db: 'ADEME Base Carbone V23.6 (2025)', notes: 'Full lifecycle incl. upstream extraction and transport.' },
              ]} />
            </SubSection>

            <SubSection title="3.3 Fugitive Emissions (Refrigerants)">
              <p>
                Refrigerant leaks are high-impact Scope 1 emissions due to the very high
                Global Warming Potential (GWP) of hydrofluorocarbons. Factors are GWP100
                values from IPCC Fifth Assessment Report (AR5, 2013), which is the current
                standard required by UNFCCC and GHG Protocol.
              </p>
              <FactorTable rows={[
                { source: 'R410A', unit: 'kg', factor: '2,088', db: 'IPCC AR5 GWP100', notes: 'Common AC refrigerant. 50% R32 + 50% R125.' },
                { source: 'R32',   unit: 'kg', factor: '675',   db: 'IPCC AR5 GWP100', notes: 'Newer AC refrigerant, lower GWP than R410A' },
                { source: 'R134a', unit: 'kg', factor: '1,430', db: 'IPCC AR5 GWP100', notes: 'Vehicle and light commercial AC' },
                { source: 'R404A', unit: 'kg', factor: '3,922', db: 'IPCC AR5 GWP100', notes: 'Commercial refrigeration. EU F-Gas phase-out.' },
              ]} />
              <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 mt-3">
                <p className="text-xs text-orange-800">
                  <strong>EU F-Gas Regulation Note:</strong> R404A is being phased out under EU Regulation
                  517/2014. Organisations using R404A should be planning transition to lower-GWP alternatives.
                  Reporting refrigerant top-ups is legally required for systems ≥3 tonnes CO₂e charge
                  under EU F-Gas Regulation.
                </p>
              </div>
            </SubSection>
          </Section>

          {/* ================================================================
              SECTION 4: SCOPE 2
              ================================================================ */}
          <Section icon={<Zap size={18} className="text-orange-500" />} title="4. Scope 2 — Indirect Energy Emissions">
            <p>
              Scope 2 covers emissions from purchased electricity, heat, steam, and cooling.
              VSME OS implements <strong>both GHG Protocol Scope 2 methods</strong> as required
              by CSRD ESRS E1:
            </p>

            <SubSection title="4.1 Location-Based Method">
              <p>
                Uses the average emission factor for the national or regional electricity grid
                in the country where the energy was consumed. See Section 2 for the full
                country-specific factor table. This is the default method and the one most
                commonly required by buyers for Scope 3 Category 3 reporting.
              </p>
            </SubSection>

            <SubSection title="4.2 Market-Based Method">
              <p>
                Uses the emission factor from the specific energy contract or certificate:
              </p>
              <ul className="text-sm space-y-1 mt-2">
                <li><strong>Green tariff / Guarantee of Origin (GoO):</strong> 0.000 kgCO₂e/kWh</li>
                <li><strong>Renewable Energy Certificate (REC):</strong> 0.000 kgCO₂e/kWh</li>
                <li><strong>No contract / residual mix:</strong> Uses country residual mix factor (typically higher than average grid factor)</li>
              </ul>
              <p className="mt-2">
                Both methods are reported in the generated PDF. CSRD ESRS E1-6 requires both
                to be disclosed. The location-based figure is typically used for Scope 3 Category 3
                (buyer's upstream energy) calculations by the buyer.
              </p>
            </SubSection>

            <SubSection title="4.3 District Heating and Cooling">
              <FactorTable rows={[
                { source: 'District Heating', unit: 'kWh', factor: 'Country-specific', db: 'Euroheat & Power 2023', notes: 'Derived from country grid mix and typical plant efficiency' },
                { source: 'District Cooling',  unit: 'kWh', factor: 'Country-specific', db: 'IEA methodology', notes: 'Grid factor ÷ Coefficient of Performance (COP 3.5)' },
              ]} />
            </SubSection>
          </Section>

          {/* ================================================================
              SECTION 5: SCOPE 3
              ================================================================ */}
          <Section icon={<Plane size={18} className="text-purple-500" />} title="5. Scope 3 — Value Chain Emissions">
            <p>
              Scope 3 covers indirect emissions in a company's value chain. VSME OS currently
              covers <strong>Category 6 (Business Travel)</strong> and{' '}
              <strong>Category 7 (Employee Commuting)</strong>, which together represent the
              most material Scope 3 sources for the majority of SME service businesses.
            </p>

            <SubSection title="5.1 Business Travel — Ground (Category 6)">
              <FactorTable rows={[
                { source: 'Employee Vehicles (Grey Fleet)', unit: 'km',     factor: '0.216',  db: 'DEFRA 2025', notes: 'Average UK car fleet (petrol+diesel mix). Total annual km across all grey fleet drivers.' },
                { source: 'Rail / Train Travel',            unit: 'km',     factor: 'Country-specific', db: 'DEFRA 2025 / national databases', notes: 'UK: 0.036 · France: 0.006 · Germany: 0.023 · Poland: 0.037. Varies by grid mix.' },
                { source: 'Hotel Stays',                    unit: 'nights', factor: '28.0',   db: 'Cornell/Greenview CHSB 2024', notes: 'kgCO₂e per room-night, conservative global estimate — see disclosure below' },
              ]} />
            </SubSection>

            <SubSection title="5.2 Business Travel — Aviation (Category 6)">
              <p>
                VSME OS splits flights into <strong>short-haul</strong> (under 3,700 km) and{' '}
                <strong>long-haul</strong> (3,700 km and above). This split matters because:
              </p>
              <ul className="text-sm space-y-1 mt-2 mb-3">
                <li>Short-haul flights are less fuel-efficient per km (more fuel consumed during takeoff and landing relative to total flight distance)</li>
                <li>Long-haul flights spend more time at cruising altitude where Radiative Forcing is most significant</li>
                <li>DEFRA 2025 publishes separate factors for each category, and using a blended average significantly understates emissions for frequent short-haul travellers</li>
              </ul>
              <FactorTable rows={[
                { source: 'Short-Haul Flights (<3,700 km)',  unit: 'pkm', factor: '0.175',  db: 'DEFRA 2025', notes: 'Includes Radiative Forcing ×1.9 (IPCC, GHG Protocol recommended). Reduced 31% from 2024 due to post-COVID load factor recovery.' },
                { source: 'Long-Haul Flights (≥3,700 km)',   unit: 'pkm', factor: '0.117',  db: 'DEFRA 2025', notes: 'Economy class. Includes Radiative Forcing ×1.9. Reduced 40% from 2024 due to post-COVID load factor recovery.' },
              ]} />
              <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 mt-3">
                <p className="text-sm font-bold text-purple-900 mb-1">Radiative Forcing (RF) Multiplier</p>
                <p className="text-xs text-purple-700 leading-relaxed">
                  Aviation emissions at altitude cause additional warming beyond CO₂ alone through
                  contrail formation, cirrus cloud impacts, and NOx effects. The IPCC and GHG Protocol
                  recommend applying a Radiative Forcing Index (RFI) of 1.9× to aviation CO₂ emissions
                  to account for these high-altitude effects. VSME OS applies this multiplier by default,
                  as does DEFRA 2025. This is increasingly required by CSRD auditors and science-based
                  target frameworks. Some legacy calculators omit RF — if comparing VSME OS outputs to
                  another tool that does not include RF, divide VSME OS flight figures by 1.9.
                  Note: DEFRA 2025 significantly revised aviation factors (published June 2025), reducing
                  short-haul by 31% and long-haul by 40%, reflecting post-COVID passenger load factor
                  recovery. VSME OS uses these updated 2025 factors.
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                <strong>pkm = passenger-kilometre.</strong> To calculate: number of return trips × route
                distance × 2 (for return). Route distances can be found using flight distance calculators
                or IATA published city-pair distances.
              </p>
            </SubSection>

            <SubSection title="5.3 Employee Commuting & Remote Working (Category 7)">
              <p>
                Category 7 is the GHG Protocol's category for emissions from employees travelling
                between their home and their regular workplace. VSME OS covers two sub-categories:
              </p>
              <FactorTable rows={[
                { source: 'Employee Commuting',  unit: 'km/year (all employees)',  factor: '0.138', db: 'DEFRA 2025', notes: 'Average mixed-mode commute. Total annual km across all commuting employees.' },
                { source: 'Remote Working Days', unit: 'WFH days/year (all staff)', factor: '2.670', db: 'DEFRA 2025', notes: 'kgCO₂e per WFH day (0.334 kgCO₂e/hr × 8hr day). Covers home heating and device energy. Reduced from 2024 (2.84) due to cleaner UK grid.' },
              ]} />
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 mt-3">
                <p className="text-xs text-gray-600">
                  <strong>Remote working note:</strong> The 2.670 kgCO₂e/day WFH factor reflects
                  additional home energy consumption attributable to work activity (ADEME 2024,
                  "Empreinte carbone du télétravail"). Updated from 2.84 in DEFRA 2024 to 2.67 in DEFRA 2025, reflecting the 14.5% reduction in UK grid intensity. It is calculated as the marginal energy
                  increase vs a non-working day, applied to the French/EU average residential
                  energy mix. This factor will vary by country in a future update.
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mt-3">
                <p className="text-xs text-gray-600">
                  <strong>Hotel stays — CHSB 2024 disclosure:</strong> The 28.0 kgCO₂e/room-night
                  figure is a conservative global estimate derived from the Cornell/Greenview Hotel
                  Carbon Measurement Initiative (CHSB 2024, covering 20,000+ hotels). From CHSB 2024
                  onwards, Cornell and Greenview no longer publish a single "all hotels" global
                  average, as it can misrepresent results when one segment or geography dominates
                  the dataset. The study now provides segmented benchmarks by asset class, star
                  rating, location type, and climate zone. The 28.0 figure used here is a
                  conservative practitioner estimate for organisations that cannot segment by hotel
                  type. Users with detailed hotel booking data are encouraged to apply
                  geography- and segment-specific CHSB 2024 index values for greater precision.
                  CHSB 2025 (covering 2023 data) is anticipated and this factor will be reviewed
                  upon publication.
                </p>
              </div>
            </SubSection>
          </Section>

          {/* ================================================================
              SECTION 6: BOUNDARIES & EXCLUSIONS
              ================================================================ */}
          <Section icon={<Globe size={18} />} title="6. Reporting Boundary and Exclusions">
            <SubSection title="6.1 Organisational Boundary">
              <p>
                VSME OS uses the <strong>operational control approach</strong> (GHG Protocol,
                Chapter 3). This means the reporting boundary includes all facilities and vehicles
                over which the company has operational control — typically the company's own
                offices, production sites, and owned/leased fleet vehicles.
                It excludes joint ventures and franchise operations unless specified.
              </p>
            </SubSection>
            <SubSection title="6.2 What Is Currently Covered">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                {[
                  { scope: 'Scope 1', items: ['Natural gas', 'Heating oil', 'Propane/LPG', 'Fleet diesel', 'Fleet petrol', 'Refrigerants (R410A, R32, R134a, R404A)'] },
                  { scope: 'Scope 2', items: ['Grid electricity (location-based)', 'Green electricity (market-based)', 'District heating', 'District cooling'] },
                  { scope: 'Scope 3', items: ['Grey fleet (Cat. 6)', 'Rail travel (Cat. 6)', 'Short-haul flights (Cat. 6)', 'Long-haul flights (Cat. 6)', 'Hotel stays (Cat. 6)', 'Employee commuting (Cat. 7)', 'Remote working (Cat. 7)'] },
                ].map(({ scope, items }) => (
                  <div key={scope} className="bg-green-50 rounded-xl p-4 border border-green-100">
                    <p className="text-xs font-bold text-green-700 uppercase tracking-widest mb-2">{scope} ✓</p>
                    <ul className="space-y-1">
                      {items.map(item => (
                        <li key={item} className="text-xs text-gray-600 flex items-start gap-1.5">
                          <CheckCircle2 size={10} className="text-green-500 mt-0.5 flex-shrink-0" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </SubSection>
            <SubSection title="6.3 What Is Not Currently Covered (Phase 3 Roadmap)">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {[
                  'Scope 3 Cat. 1 — Purchased goods and services',
                  'Scope 3 Cat. 2 — Capital goods',
                  'Scope 3 Cat. 3 — Fuel & energy-related activities',
                  'Scope 3 Cat. 4 — Upstream transportation',
                  'Scope 3 Cat. 5 — Waste generated in operations',
                  'Scope 3 Cat. 11 — Use of sold products',
                  'Scope 3 Cat. 12 — End-of-life treatment',
                  'Biogenic CO₂ emissions (land use change)',
                ].map(item => (
                  <div key={item} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <AlertCircle size={12} className="text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-3">
                These categories are planned for future phases of the VSME OS roadmap. All currently
                excluded categories are explicitly listed as boundary exclusions in every
                generated PDF report (Page 4, Section 5).
              </p>
            </SubSection>
          </Section>

          {/* ================================================================
              SECTION 7: ASSURANCE & LIMITATIONS
              ================================================================ */}
          <Section icon={<CheckCircle2 size={18} className="text-green-500" />} title="7. Assurance Level and Limitations">
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
              <p className="font-bold text-amber-900 mb-2">Self-Attested (Limited Assurance)</p>
              <p className="text-sm text-amber-800 leading-relaxed">
                Reports generated by VSME OS are <strong>self-attested</strong> — they reflect the
                activity data provided by the supplier and have not been independently verified by
                a third party. This constitutes "limited assurance" under ISO 14064-3. For many
                CSRD Scope 3 data collection purposes, self-attested supplier data is acceptable.
                For highest-tier reporting or where reasonable assurance is required, third-party
                verification should be engaged.
              </p>
            </div>
            <p className="mt-4">
              VSME OS does not independently verify the accuracy of activity data entered by
              suppliers. The calculation methodology is correct — but the output is only as
              accurate as the input data. This limitation is disclosed on every generated report.
            </p>
            <p>
              Future phases will support integration with third-party verification bodies to
              provide independently assured reports where required.
            </p>
          </Section>

          {/* ================================================================
              SECTION 8: FACTOR UPDATE SCHEDULE
              ================================================================ */}
          <Section icon={<Database size={18} />} title="8. Factor Update Policy">
            <p>
              Emission factors are reviewed and updated annually, following the publication
              cycles of our primary source databases:
            </p>
            <div className="mt-4 space-y-3">
              {[
                { db: 'DEFRA UK (2025)', cycle: 'Released June 2025',            sources: 'Used for: UK electricity grid (0.196 combined), flights (major revision), grey fleet, commuting, remote working factor. Next: DEFRA 2026 expected June 2026.' },
                { db: 'ADEME Base Carbone V23.6', cycle: 'Released July 2025', sources: 'Used for: All Scope 1 fuel combustion factors (full lifecycle), French electricity grid factor.' },
                { db: 'IEA / EMBER',     cycle: 'Annual, typically Q2',          sources: 'Used for: 40+ country grid factors where no national database is available' },
                { db: 'IPCC AR5 GWP100', cycle: 'Published 2013, stable',        sources: 'Used for: All refrigerant GWP values' },
                { db: 'Cornell/Greenview CHSB 2024', cycle: 'Annual',                        sources: 'Used for: Hotel night emission factor (conservative global estimate)' },
              ].map(({ db, cycle, sources }) => (
                <div key={db} className="flex flex-col sm:flex-row sm:items-start gap-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="sm:w-44 flex-shrink-0">
                    <p className="text-sm font-bold text-gray-900">{db}</p>
                    <p className="text-xs text-gray-500">{cycle}</p>
                  </div>
                  <p className="text-xs text-gray-600">{sources}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-4">
              When factors are updated, previously generated reports retain the factors that
              were current at generation time (with version noted in the report). New reports
              use the latest available factors. The factor version and update date are disclosed
              in the footer of every generated PDF.
            </p>
          </Section>

          {/* ================================================================
              CTA BLOCK
              ================================================================ */}
          <div className="bg-[#0C2918] text-white rounded-2xl p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3 className="font-bold text-lg mb-1">Questions about our methodology?</h3>
              <p className="text-gray-400 text-sm">
                We welcome technical enquiries from ESG auditors, procurement teams, and
                sustainability consultants.
              </p>
            </div>
            <div className="flex flex-col gap-3 flex-shrink-0">
              <a
                href="mailto:methodology@vsmeos.fr"
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-full text-sm font-bold hover:bg-gray-100 transition-colors"
              >
                methodology@vsmeos.fr
              </a>
              <Link
                href="/alignment"
                className="flex items-center gap-2 px-5 py-2.5 border border-gray-700 text-gray-300 rounded-full text-sm font-medium hover:border-white transition-colors"
              >
                Regulatory Alignment <ArrowRight size={14} />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
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

function FactorTable({ rows }: { rows: { source: string; unit: string; factor: string; db: string; notes: string }[] }) {
  return (
    <div className="mt-3 rounded-xl border border-gray-100 overflow-hidden text-xs">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            {['Activity Source', 'Unit', 'Factor (kgCO₂e)', 'Source', 'Notes'].map(h => (
              <th key={h} className="text-left px-3 py-2.5 font-bold text-gray-500 border-b border-gray-100">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ source, unit, factor, db, notes }) => (
            <tr key={source} className="border-b border-gray-50 last:border-0">
              <td className="px-3 py-2.5 font-medium text-gray-900">{source}</td>
              <td className="px-3 py-2.5 text-gray-500 font-mono">{unit}</td>
              <td className="px-3 py-2.5 font-mono font-bold text-gray-900">{factor}</td>
              <td className="px-3 py-2.5 text-gray-500">{db}</td>
              <td className="px-3 py-2.5 text-gray-400">{notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}