// =============================================================================
// FILE: app/supplier/scope1/page.tsx
// PURPOSE: Scope 1 input page — Direct Emissions from sources owned or
//          controlled by the company.
//
// GHG PROTOCOL SCOPE 1 CATEGORIES COVERED:
//   1. Stationary Combustion  — fuel burned in buildings (boilers, furnaces)
//   2. Mobile Combustion      — fuel burned in company-owned vehicles
//   3. Fugitive Emissions     — refrigerant leaks from AC units & freezers
//
// WHAT IS NOT SCOPE 1 (common mistakes):
//   - Electricity from the grid → that's Scope 2 (next page)
//   - Employee personal cars for business → that's Scope 3 grey fleet
//   - Rented/leased vehicles → depends on operational control boundary
//
// WHEN TO MODIFY:
//   - When adding new fuel types (e.g. biomass, coal) in Phase 3
//   - When updating tooltip help text
//   - When adding input validation rules
//
// DEPENDENCIES:
//   - ESGContext (useESG) — reads/writes activityData and companyData
//   - NumberInput component — the styled input with help tooltip
// =============================================================================

'use client';

import { useESG } from '@/context/ESGContext';
import { NumberInput } from '@/components/ui/Input';
import Link from 'next/link';
import { ArrowLeft, Check, Flame, Truck, Wind } from 'lucide-react';

export default function Scope1() {
  const { activityData, updateActivity, isSaving, companyData } = useESG();

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
          <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
            1
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Direct Emissions</h1>
        </div>
        <p className="text-gray-500 ml-11 text-base sm:text-lg leading-relaxed">
          Fuel burned directly by your company's buildings and owned vehicles, plus refrigerant leaks.
        </p>

        {/* Reporting year badge */}
        <div className="ml-11 mt-3 inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full">
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500">
            Reporting Period: FY {companyData.year}
          </span>
        </div>
      </div>

      {/* ================================================================
          WHAT IS SCOPE 1? — Quick explainer for non-experts
          This helps suppliers understand what they should and shouldn't
          include before they start entering numbers.
          ================================================================ */}
      <div className="mb-8 p-4 bg-gray-50 border border-gray-100 rounded-2xl">
        <p className="text-xs text-gray-600 leading-relaxed">
          <span className="font-bold text-gray-900">What counts as Scope 1?</span> Only fuel your company
          directly purchases and burns — gas bills for your boiler, diesel for your company trucks, petrol
          for company cars. <span className="font-bold text-gray-900">Not sure?</span> If you see it on a
          utility bill or fuel receipt paid by your company, it's likely Scope 1. Electricity is NOT Scope 1
          — enter that on the next page (Scope 2).
        </p>
      </div>

      {/* ================================================================
          CARD 1: STATIONARY COMBUSTION
          Fuel burned in fixed equipment: boilers, furnaces, generators,
          kitchen equipment, industrial processes.
          Source: DEFRA 2024 / ADEME Base Carbone 2024
          ================================================================ */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 mb-6 sm:mb-8">

        {/* Card Header */}
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
          <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
            <Flame size={16} className="text-orange-500" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base sm:text-lg">Stationary Combustion</h3>
            <p className="text-xs text-gray-400">Fuel burned in fixed equipment at your premises</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Natural Gas */}
          <NumberInput
            label="Natural Gas"
            unit="kWh"
            helpText={`How to find this number: Check your gas utility bills for FY ${companyData.year}. Your supplier (e.g. Engie, EDF, British Gas) will show consumption in kWh or m³ on each bill. Add up all bills across the year. 💡 If your bills show m³ instead of kWh: multiply m³ × 10.55 to convert to kWh. Include all sites and buildings your company is responsible for. The emission factor is 0.244 kgCO₂e/kWh (ADEME Base Carbone 2024, full lifecycle incl. upstream).`}
            value={activityData['natural_gas'] || 0}
            onChange={(v) => updateActivity('natural_gas', v)}
          />

          {/* Heating Oil */}
          <NumberInput
            label="Heating Oil"
            unit="Litres"
            helpText={`How to find this number: Check your heating oil delivery receipts or invoices for FY ${companyData.year}. Heating oil (also called fuel oil, fioul domestique, or gasoil de chauffage) is typically delivered by truck to a tank on your premises. Each delivery invoice shows litres delivered — add them all up. 💡 Don't confuse this with diesel for vehicles — heating oil goes in a fixed tank for boilers only. Emission factor: 3.2 kgCO₂e/litre (ADEME Base Carbone 2024, full lifecycle).`}
            value={activityData['heating_oil'] || 0}
            onChange={(v) => updateActivity('heating_oil', v)}
          />

          {/* Propane / LPG */}
          <NumberInput
            label="Propane / LPG"
            unit="Litres"
            helpText={`How to find this number: Check your LPG delivery receipts for FY ${companyData.year}. Propane/LPG (liquefied petroleum gas) comes in bottles or a fixed tank and is used for heating, cooking, forklifts, or industrial burners. Your supplier (e.g. Primagaz, Butagaz, Calor) will invoice per litre or per kg. 💡 If billed in kg: multiply kg × 1.96 to convert to litres. Emission factor: 1.51 kgCO₂e/litre (ADEME Base Carbone 2024, full lifecycle).`}
            value={activityData['propane'] || 0}
            onChange={(v) => updateActivity('propane', v)}
          />

        </div>
      </div>

      {/* ================================================================
          CARD 2: MOBILE COMBUSTION
          Fuel burned in company-OWNED vehicles.
          IMPORTANT DISTINCTION:
          - Company-owned cars/trucks/vans → Scope 1 (enter here)
          - Employees' personal cars used for work → Scope 3 grey fleet (Scope 3 page)
          - Leased vehicles → usually Scope 1 if under operational control
          ================================================================ */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 mb-6 sm:mb-8">

        {/* Card Header */}
        <div className="flex items-center gap-3 mb-2 border-b border-gray-100 pb-4">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <Truck size={16} className="text-blue-500" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base sm:text-lg">Mobile Combustion</h3>
            <p className="text-xs text-gray-400">Fuel for company-owned or leased vehicles</p>
          </div>
        </div>

        {/* Distinction banner */}
        <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-xl">
          <p className="text-xs text-blue-700 leading-relaxed">
            <span className="font-bold">Only include vehicles your company owns or leases.</span> Employee
            personal cars used for business trips go in Scope 3 (Grey Fleet) on the next-to-last page.
            If unsure about a vehicle, ask: does the company pay for its insurance and maintenance? If yes → enter it here.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Diesel */}
          <NumberInput
            label="Diesel Fuel"
            unit="Litres"
            helpText={`How to find this number: Add up all diesel fuel purchases for company-owned vehicles during FY ${companyData.year}. Sources: fuel card statements (e.g. Total, Shell, BP fleet cards), petrol station receipts, or your fleet management system. Include diesel for cars, vans, trucks, forklifts, and generators. 💡 Most fleet fuel cards give you a monthly report with total litres — check your finance system or ask your fleet manager. Emission factor: 3.16 kgCO₂e/litre (ADEME Base Carbone 2024, full lifecycle).`}
            value={activityData['diesel'] || 0}
            onChange={(v) => updateActivity('diesel', v)}
          />

          {/* Petrol */}
          <NumberInput
            label="Petrol / Gasoline"
            unit="Litres"
            helpText={`How to find this number: Add up all petrol/gasoline purchases for company-owned vehicles during FY ${companyData.year}. Check fuel card statements, petrol receipts, or your fleet management system. 💡 If you use a fuel card (Total, Shell, BP, etc.), log into the online portal — they provide monthly and annual consumption reports per vehicle. Emission factor: 2.80 kgCO₂e/litre (ADEME Base Carbone 2024, full lifecycle).`}
            value={activityData['petrol'] || 0}
            onChange={(v) => updateActivity('petrol', v)}
          />

        </div>
      </div>

      {/* ================================================================
          CARD 3: FUGITIVE EMISSIONS — REFRIGERANTS
          These are gases that LEAK from air conditioning units, heat pumps,
          commercial freezers, and refrigerated transport.
          They have very high Global Warming Potential (GWP) — R410A for
          example is 2,088x more warming than CO₂ per kg leaked.
          Source: IPCC AR5 GWP100 (legally required standard under EU F-Gas Regulation)
          ================================================================ */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 mb-6 sm:mb-8">

        {/* Card Header */}
        <div className="flex items-center gap-3 mb-2 border-b border-gray-100 pb-4">
          <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
            <Wind size={16} className="text-purple-500" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base sm:text-lg">
              Refrigerants (Fugitive Leaks)
            </h3>
            <p className="text-xs text-gray-400">
              Gas refills for AC units, heat pumps & freezers · IPCC AR5 GWP100
            </p>
          </div>
        </div>

        {/* Warning banner — explains the high impact */}
        <div className="mb-6 p-3 bg-purple-50 border border-purple-100 rounded-xl">
          <p className="text-xs text-purple-700 leading-relaxed">
            <span className="font-bold">Why this matters:</span> Refrigerant leaks are often the single
            largest Scope 1 source for office-based companies. R410A has a warming impact 2,088× higher
            than CO₂ — even a small leak (1 kg) equals over 2 tonnes of CO₂e.{' '}
            <span className="font-bold">How to find the data:</span> Ask your HVAC maintenance contractor
            for the annual service report — it lists which gas was used and how many kg were added as a
            "top-up" (= leaked amount). EU F-Gas Regulation requires this to be logged for all units
            over 5 tonnes CO₂e equivalent.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* R410A */}
          <NumberInput
            label="R410A Refrigerant"
            unit="kg"
            helpText={`How to find this number: Ask your HVAC/air conditioning maintenance company for the service records for FY ${companyData.year}. The amount of R410A "topped up" or "recharged" during a service = the amount that leaked. R410A is the most common gas in modern split-system office air conditioners. ⚠️ High impact: 1 kg leaked = 2,088 kg CO₂e (GWP100, IPCC AR5). If you don't have this data, check if you have F-Gas logbooks — these are legally required in the EU for large systems.`}
            value={activityData['ref_R410A'] || 0}
            onChange={(v) => updateActivity('ref_R410A', v)}
          />

          {/* R32 */}
          <NumberInput
            label="R32 Refrigerant"
            unit="kg"
            helpText={`How to find this number: Check HVAC service records for FY ${companyData.year} with your maintenance contractor. R32 is a newer, more efficient replacement for R410A found in modern split-system air conditioners (Daikin, Mitsubishi, Fujitsu models from 2015 onwards). It has a lower GWP than R410A but still significant: 1 kg leaked = 675 kg CO₂e (IPCC AR5). Your AC unit's model plate or service manual will confirm which gas it uses.`}
            value={activityData['ref_R32'] || 0}
            onChange={(v) => updateActivity('ref_R32', v)}
          />

          {/* R134a */}
          <NumberInput
            label="R134a Refrigerant"
            unit="kg"
            helpText={`How to find this number: Check vehicle AC service records and HVAC maintenance logs for FY ${companyData.year}. R134a is used in vehicle air conditioning systems (cars, vans, trucks manufactured before ~2017) and some older commercial refrigeration units. Your vehicle fleet service records should show any R134a top-ups. 1 kg leaked = 1,430 kg CO₂e (IPCC AR5 GWP100).`}
            value={activityData['ref_R134a'] || 0}
            onChange={(v) => updateActivity('ref_R134a', v)}
          />

          {/* R404A */}
          <NumberInput
            label="R404A Refrigerant"
            unit="kg"
            helpText={`How to find this number: Check refrigeration maintenance records for FY ${companyData.year}. R404A is the standard gas for commercial freezers, cold rooms, display cabinets, and refrigerated transport — common in food industry, hospitality, and logistics. ⚠️ Very high impact: 1 kg leaked = 3,922 kg CO₂e (IPCC AR5) — the highest of the four gases. Your refrigeration engineer's service report will show kg recharged per unit. This gas is being phased out under the EU F-Gas Regulation by 2030.`}
            value={activityData['ref_R404A'] || 0}
            onChange={(v) => updateActivity('ref_R404A', v)}
          />

        </div>
      </div>

      {/* ================================================================
          SCOPE 1 SUMMARY — Quick sense-check panel
          Only shows if at least one value has been entered
          ================================================================ */}
      {(activityData['natural_gas'] > 0 ||
        activityData['heating_oil'] > 0 ||
        activityData['propane'] > 0 ||
        activityData['diesel'] > 0 ||
        activityData['petrol'] > 0 ||
        activityData['ref_R410A'] > 0 ||
        activityData['ref_R32'] > 0 ||
        activityData['ref_R134a'] > 0 ||
        activityData['ref_R404A'] > 0) && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">
            Data Entered This Session
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {activityData['natural_gas'] > 0 && (
              <div className="text-xs text-blue-700">
                <span className="font-bold block">{activityData['natural_gas'].toLocaleString()} kWh</span>
                Natural Gas
              </div>
            )}
            {activityData['heating_oil'] > 0 && (
              <div className="text-xs text-blue-700">
                <span className="font-bold block">{activityData['heating_oil'].toLocaleString()} L</span>
                Heating Oil
              </div>
            )}
            {activityData['propane'] > 0 && (
              <div className="text-xs text-blue-700">
                <span className="font-bold block">{activityData['propane'].toLocaleString()} L</span>
                Propane / LPG
              </div>
            )}
            {activityData['diesel'] > 0 && (
              <div className="text-xs text-blue-700">
                <span className="font-bold block">{activityData['diesel'].toLocaleString()} L</span>
                Fleet Diesel
              </div>
            )}
            {activityData['petrol'] > 0 && (
              <div className="text-xs text-blue-700">
                <span className="font-bold block">{activityData['petrol'].toLocaleString()} L</span>
                Fleet Petrol
              </div>
            )}
            {activityData['ref_R410A'] > 0 && (
              <div className="text-xs text-blue-700">
                <span className="font-bold block">{activityData['ref_R410A'].toLocaleString()} kg</span>
                R410A Leak
              </div>
            )}
            {activityData['ref_R32'] > 0 && (
              <div className="text-xs text-blue-700">
                <span className="font-bold block">{activityData['ref_R32'].toLocaleString()} kg</span>
                R32 Leak
              </div>
            )}
            {activityData['ref_R134a'] > 0 && (
              <div className="text-xs text-blue-700">
                <span className="font-bold block">{activityData['ref_R134a'].toLocaleString()} kg</span>
                R134a Leak
              </div>
            )}
            {activityData['ref_R404A'] > 0 && (
              <div className="text-xs text-blue-700">
                <span className="font-bold block">{activityData['ref_R404A'].toLocaleString()} kg</span>
                R404A Leak
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