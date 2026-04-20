// =============================================================================
// FILE: app/supplier/scope2/page.tsx
// PURPOSE: Scope 2 input page — Indirect Energy Emissions.
//          These are emissions from energy the company PURCHASES but does not
//          directly produce — electricity, district heating, district cooling.
//
// GHG PROTOCOL SCOPE 2 — TWO METHODS:
//   1. Location-Based:  Uses the average grid emission factor for the country
//                       (e.g. France = 0.052 kgCO2e/kWh, UK = 0.196 kgCO2e/kWh — DEFRA 2025)
//   2. Market-Based:    Uses the factor from the specific energy contract.
//                       If you have a green tariff or GoO certificate → 0.000
//
//   VSME OS uses BOTH simultaneously:
//   - Grid Electricity field  → Location-Based (country-specific factor)
//   - Green Electricity field → Market-Based (always 0.000 kgCO2e/kWh)
//   This is GHG Protocol compliant and is what CSRD ESRS E1 requires.
//
// KEY INSIGHT: The electricity grid factor changes dramatically by country.
//   France (nuclear):       0.052 kgCO2e/kWh  — very clean
//   Germany (coal+gas):     0.380 kgCO2e/kWh  — 7x dirtier than France
//   South Africa (coal):    0.928 kgCO2e/kWh  — 18x dirtier than France
//   This is why we use country-specific factors, not a single global number.
//
// WHEN TO MODIFY:
//   - When adding new energy types (e.g. steam purchases in Phase 3)
//   - When updating help text
//   - When adding solar/on-site generation in Phase 4
//
// DEPENDENCIES:
//   - ESGContext (useESG) — reads activityData, companyData (for country)
//   - NumberInput — styled input with help tooltip
//   - calculations.ts — getCountryFactors() to show live factor to supplier
// =============================================================================

'use client';

import { useESG } from '@/context/ESGContext';
import { NumberInput } from '@/components/ui/Input';
import { getCountryFactors } from '@/utils/calculations';
import Link from 'next/link';
import { ArrowLeft, Check, Zap, Thermometer, Snowflake, Info } from 'lucide-react';

export default function Scope2() {
  const { activityData, updateActivity, isSaving, companyData } = useESG();

  // Get the country-specific factors so we can show them live in the UI.
  // This means if a supplier set their country to "United Kingdom", they see
  // "0.196 kgCO₂e/kWh" right on the page — full transparency (DEFRA 2025).
  const countryData = getCountryFactors(companyData.country || 'France');
  const country = companyData.country || 'France';

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:py-12 sm:px-6">

      {/* ================================================================
          TOP NAV BAR
          ================================================================ */}
      <div className="flex justify-between items-center mb-6 sm:mb-8">
        <Link
          href="/supplier/hub"
          className="text-sm text-gray-500 hover:text-black flex items-center gap-1 font-medium transition-colors"
        >
          <ArrowLeft size={14} /> Back to Hub
        </Link>
        {isSaving && (
          <span className="text-xs text-green-600 font-bold animate-pulse uppercase tracking-wider">
            Saving...
          </span>
        )}
      </div>

      {/* ================================================================
          PAGE HEADER
          ================================================================ */}
      <div className="mb-8 sm:mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
            2
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Indirect Energy</h1>
        </div>
        <p className="text-gray-500 ml-11 text-base sm:text-lg leading-relaxed">
          Electricity, heating, and cooling purchased from external providers.
        </p>

        {/* Reporting year + country badges side by side */}
        <div className="ml-11 mt-3 flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-100 rounded-full">
            <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500">
              Reporting Period: FY {companyData.year}
            </span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 border border-gray-200 rounded-full">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Grid Factor: {countryData.electricityGrid} kgCO₂e/kWh · {country}
            </span>
          </div>
        </div>
      </div>

      {/* ================================================================
          WHAT IS SCOPE 2? — Quick explainer
          ================================================================ */}
      <div className="mb-8 p-4 bg-gray-50 border border-gray-100 rounded-2xl">
        <p className="text-xs text-gray-600 leading-relaxed">
          <span className="font-bold text-gray-900">What counts as Scope 2?</span> Energy you purchase
          from an external supplier — your electricity bill, district heating bill, or district cooling
          bill. The emissions are "indirect" because they happen at the power plant or heating network,
          not at your premises. <span className="font-bold text-gray-900">Not Scope 2:</span> fuel you
          burn yourself (that's Scope 1), or solar panels you own on your roof (that reduces your Scope 2).
        </p>
      </div>

      {/* ================================================================
          CARD 1: ELECTRICITY
          Split into standard grid and green/renewable.
          Both are required by GHG Protocol Scope 2 Guidance (2015) and
          CSRD ESRS E1 — they appear as separate line items in the PDF report.
          ================================================================ */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 mb-6 sm:mb-8">

        {/* Card Header */}
        <div className="flex items-center gap-3 mb-2 border-b border-gray-100 pb-4">
          <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-yellow-500" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base sm:text-lg">Electricity</h3>
            <p className="text-xs text-gray-400">
              Location-based & market-based · Source: {countryData.primaryCalculator}
            </p>
          </div>
        </div>

        {/* Live factor display — shows the actual number being used */}
        <div className="mb-6 flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
          <Info size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-700 leading-relaxed">
            <span className="font-bold">Your grid factor ({country}):</span>{' '}
            <span className="font-mono font-bold">{countryData.electricityGrid} kgCO₂e/kWh</span> —
            sourced from <span className="font-bold">{countryData.primaryCalculator}</span>.
            This factor is specific to {country}'s electricity grid mix in 2023.
            {countryData.electricityGrid <= 0.1 && ' This is a very clean grid — predominantly renewable or nuclear energy.'}
            {countryData.electricityGrid > 0.1 && countryData.electricityGrid <= 0.3 && ' This is a relatively clean grid with a good mix of low-carbon sources.'}
            {countryData.electricityGrid > 0.3 && countryData.electricityGrid <= 0.5 && ' This is an average grid with a mix of fossil fuels and renewables.'}
            {countryData.electricityGrid > 0.5 && ' This grid has a high carbon intensity due to significant fossil fuel usage.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Standard Grid Electricity */}
          <NumberInput
            label={`Standard Grid Electricity (${country})`}
            unit="kWh"
            helpText={`How to find this number: Check your electricity bills from your utility provider for FY ${companyData.year}. Your bill shows consumption in kWh — add up all 12 monthly bills across all meters and all sites your company occupies. 💡 Most utility providers offer an online portal where you can download annual consumption data. Include all office buildings, warehouses, and production sites. Do NOT include electricity covered by a green tariff or renewable certificate — enter that separately below. Factor applied: ${countryData.electricityGrid} kgCO₂e/kWh (${countryData.primaryCalculator}).`}
            value={activityData['electricity_grid'] || 0}
            onChange={(v) => updateActivity('electricity_grid', v)}
          />

          {/* Green / Renewable Electricity */}
          <NumberInput
            label="Green / Renewable Electricity"
            unit="kWh"
            helpText={`How to find this number: Enter the kWh covered by a verified renewable energy contract, green tariff, or Guarantee of Origin (GoO) / Renewable Energy Certificate (REC). This is the "market-based" method under GHG Protocol. 💡 Check your energy contract — if it says "100% renewable", "garantie d'origine", or "GoO certified", enter your TOTAL electricity consumption here too (not just a portion). Entering data here reduces your market-based Scope 2 to near zero. ⚠️ Only certified contracts qualify — a standard "eco-friendly" marketing claim does not count. Factor applied: 0.000 kgCO₂e/kWh (GHG Protocol market-based method).`}
            value={activityData['electricity_green'] || 0}
            onChange={(v) => updateActivity('electricity_green', v)}
          />

        </div>

        {/* Green electricity note */}
        <p className="text-[10px] text-gray-400 mt-4 leading-relaxed">
          * Entering kWh in "Green / Renewable" reduces your <span className="font-bold">market-based</span> Scope 2
          emissions to zero for that volume. Both location-based AND market-based totals appear in your PDF report,
          as required by CSRD ESRS E1 and GHG Protocol Scope 2 Guidance.
        </p>
      </div>

      {/* ================================================================
          CARD 2: THERMAL ENERGY NETWORKS
          District heating = hot water/steam piped from a central plant
          District cooling = chilled water piped from a central plant
          Common in France (réseau de chaleur), Scandinavia, and large cities.
          Less common in UK, USA, Southern Europe.
          ================================================================ */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 mb-6 sm:mb-8">

        {/* Card Header */}
        <div className="flex items-center gap-3 mb-2 border-b border-gray-100 pb-4">
          <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
            <Thermometer size={16} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base sm:text-lg">Thermal Energy Networks</h3>
            <p className="text-xs text-gray-400">District heating & cooling from external networks</p>
          </div>
        </div>

        {/* Not sure banner */}
        <div className="mb-6 p-3 bg-gray-50 border border-gray-100 rounded-xl">
          <p className="text-xs text-gray-600 leading-relaxed">
            <span className="font-bold">Not sure if this applies to you?</span> District heating
            (réseau de chaleur in France) is common in apartment buildings, university campuses,
            hospitals, and large commercial buildings in Paris, Lyon, and other major cities.
            Check your utility bills — if you pay a separate bill for "chauffage urbain",
            "réseau de chaleur", or "district heating", enter those kWh here.
            If you only have a gas bill for your own boiler, leave these as zero.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* District Heating */}
          <NumberInput
            label="District Heating"
            unit="kWh"
            helpText={`How to find this number: Check your utility bills for FY ${companyData.year} for a "district heating", "réseau de chaleur", or "thermal energy" line. Your provider (e.g. Dalkia, Engie Réseaux, CPCU in Paris) will bill in kWh or MWh — add up all invoices across the year. 💡 1 MWh = 1,000 kWh. If billed in GJ: multiply GJ × 277.78 to get kWh. Factor applied: ${countryData.districtHeating} kgCO₂e/kWh (derived from ${country} grid mix, Euroheat & Power 2023).`}
            value={activityData['district_heat'] || 0}
            onChange={(v) => updateActivity('district_heat', v)}
          />

          {/* District Cooling */}
          <NumberInput
            label="District Cooling"
            unit="kWh"
            helpText={`How to find this number: Check your utility bills for FY ${companyData.year} for a "district cooling", "climatisation urbaine", or "chilled water" line. Less common than district heating — mainly found in large commercial complexes, airports, and business districts in major cities. Your provider will bill in kWh — add up all invoices. Factor applied: ${countryData.districtCooling} kgCO₂e/kWh (derived from ${country} grid mix ÷ COP 3.5, IEA methodology).`}
            value={activityData['district_cool'] || 0}
            onChange={(v) => updateActivity('district_cool', v)}
          />

        </div>
      </div>

      {/* ================================================================
          SCOPE 2 LIVE SUMMARY
          Shows what's been entered and the estimated emissions
          using the country-specific factor
          ================================================================ */}
      {(activityData['electricity_grid'] > 0 ||
        activityData['electricity_green'] > 0 ||
        activityData['district_heat'] > 0 ||
        activityData['district_cool'] > 0) && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-100 rounded-2xl">
          <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-3">
            Data Entered This Session
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {activityData['electricity_grid'] > 0 && (
              <div className="text-xs text-orange-700">
                <span className="font-bold block">
                  {activityData['electricity_grid'].toLocaleString()} kWh
                </span>
                Grid Electricity
                <span className="block text-orange-400 mt-0.5">
                  ≈ {(activityData['electricity_grid'] * countryData.electricityGrid).toLocaleString('en-US', { maximumFractionDigits: 0 })} kgCO₂e
                </span>
              </div>
            )}
            {activityData['electricity_green'] > 0 && (
              <div className="text-xs text-orange-700">
                <span className="font-bold block">
                  {activityData['electricity_green'].toLocaleString()} kWh
                </span>
                Green Electricity
                <span className="block text-green-500 mt-0.5 font-bold">0 kgCO₂e</span>
              </div>
            )}
            {activityData['district_heat'] > 0 && (
              <div className="text-xs text-orange-700">
                <span className="font-bold block">
                  {activityData['district_heat'].toLocaleString()} kWh
                </span>
                District Heating
                <span className="block text-orange-400 mt-0.5">
                  ≈ {(activityData['district_heat'] * countryData.districtHeating).toLocaleString('en-US', { maximumFractionDigits: 0 })} kgCO₂e
                </span>
              </div>
            )}
            {activityData['district_cool'] > 0 && (
              <div className="text-xs text-orange-700">
                <span className="font-bold block">
                  {activityData['district_cool'].toLocaleString()} kWh
                </span>
                District Cooling
                <span className="block text-orange-400 mt-0.5">
                  ≈ {(activityData['district_cool'] * countryData.districtCooling).toLocaleString('en-US', { maximumFractionDigits: 0 })} kgCO₂e
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================
          SAVE BUTTON
          ================================================================ */}
      <div className="mt-8 flex justify-center sm:justify-end">
        <Link href="/supplier/hub" className="w-full sm:w-auto">
          <button className="w-full sm:w-auto bg-[#0C2918] text-[#C9A84C] px-8 py-4 rounded-full font-bold hover:bg-[#122F1E] transition-transform active:scale-[1.02] flex items-center justify-center gap-2 shadow-lg">
            <Check size={18} /> Save & Return to Hub
          </button>
        </Link>
      </div>

    </div>
  );
}