// =============================================================================
// FILE: app/supplier/scope3/page.tsx
// PURPOSE: Scope 3 input page — Business Travel & Employee Commuting.
//          This is GHG Protocol Category 6 (Business Travel) and
//          Category 7 (Employee Commuting & Remote Work).
//
// FIELDS:
//   Business Travel (Cat. 6):
//     - grey_fleet         Employee personal cars used for work trips
//     - rail_travel        Train journeys for business
//     - flight_short_haul  Flights under 3,700 km (Paris→London, Paris→Madrid)
//     - flight_long_haul   Flights over 3,700 km (Paris→New York, Paris→Tokyo)
//     - hotel_nights       Hotel stays during business trips
//   Employee Commuting & Remote Work (Cat. 7):
//     - employee_commuting Daily commute to work (ALL employees, ALL days)
//     - remote_working     Days worked from home across ALL employees
//
// WHEN TO MODIFY:
//   - When adding new travel categories (e.g. taxi/rideshare in Phase 3)
//   - When updating tooltip help text for clarity
//   - When adding validation rules
//
// DEPENDENCIES:
//   - ESGContext (useESG) — reads/writes activityData
//   - NumberInput component — the styled input field with help tooltip
// =============================================================================

'use client';

import { useESG } from '@/context/ESGContext';
import { NumberInput } from '@/components/ui/Input';
import Link from 'next/link';
import { ArrowLeft, Check, Plane, Train, Car, Building2, Home, Moon } from 'lucide-react';

export default function Scope3() {
  const { activityData, updateActivity, isSaving, companyData } = useESG();

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:py-12 sm:px-6">

      {/* ================================================================
          TOP NAV BAR
          Shows "Back to Hub" and a live "Saving..." indicator
          ================================================================ */}
      <div className="flex justify-between items-center mb-6 sm:mb-8">
        <Link
          href="/supplier/hub"
          className="text-sm text-gray-500 hover:text-black flex items-center gap-1 font-medium transition-colors"
        >
          <ArrowLeft size={14} /> Back to Hub
        </Link>

        {/* Live save indicator — only shows when a Supabase write is in progress */}
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
          <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
            3
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Business Travel & Commuting
          </h1>
        </div>
        <p className="text-gray-500 ml-11 text-base sm:text-lg leading-relaxed">
          Emissions from employee travel — both business trips and the daily commute to work.
        </p>

        {/* Reporting year reminder — helps supplier confirm they're entering the right year's data */}
        <div className="ml-11 mt-3 inline-flex items-center gap-2 px-3 py-1 bg-purple-50 border border-purple-100 rounded-full">
          <span className="text-[10px] font-bold uppercase tracking-widest text-purple-500">
            Reporting Period: FY {companyData.year}
          </span>
        </div>
      </div>

      {/* ================================================================
          CARD 1: LAND TRAVEL (Grey Fleet + Rail)
          GHG Protocol Category 6 — Business Travel
          ================================================================ */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 mb-6 sm:mb-8">

        {/* Card Header */}
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <Car size={16} className="text-gray-500" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base sm:text-lg">Land Travel</h3>
            <p className="text-xs text-gray-400">GHG Protocol — Category 6: Business Travel</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Grey Fleet — employee personal cars used for business trips */}
          <NumberInput
            label="Employee Vehicles (Grey Fleet)"
            unit="km"
            helpText={`How to find this number: Look at your expense reports or mileage reimbursement records for FY ${companyData.year}. Add up all the kilometres (or miles × 1.6) claimed by employees who used their OWN personal car for business trips — client visits, supplier meetings, travel between sites. ⚠️ Do NOT include daily commuting to the office — that goes in the section below.`}
            value={activityData['grey_fleet'] || 0}
            onChange={(v) => updateActivity('grey_fleet', v)}
          />

          {/* Rail Travel — country-specific factor used in calculations */}
          <NumberInput
            label="Rail / Train Travel"
            unit="km"
            helpText={`How to find this number: Check corporate travel booking records or expense reports for FY ${companyData.year}. Add up total kilometres travelled by train for business purposes (TGV, Eurostar, regional trains, metro if for business). 💡 Tip: Most booking systems show distance. If not, use Google Maps distance × number of trips. Rail emissions are calculated using ${companyData.country || 'your country'}'s national rail emission factor.`}
            value={activityData['rail_travel'] || 0}
            onChange={(v) => updateActivity('rail_travel', v)}
          />

        </div>
      </div>

      {/* ================================================================
          CARD 2: AIR TRAVEL
          Split into short-haul and long-haul — GHG Protocol requires this
          because the emission factor per km is HIGHER for short flights
          (more fuel burned during takeoff/landing relative to distance).
          DEFRA threshold: 3,700 km separates short from long haul.
          Both factors include Radiative Forcing ×1.9 as required by GHG Protocol.
          ================================================================ */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 mb-6 sm:mb-8">

        {/* Card Header */}
        <div className="flex items-center gap-3 mb-2 border-b border-gray-100 pb-4">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <Plane size={16} className="text-blue-500" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base sm:text-lg">Air Travel</h3>
            <p className="text-xs text-gray-400">GHG Protocol — Category 6 · Includes Radiative Forcing ×1.9</p>
          </div>
        </div>

        {/* Explanation banner — why we split flights */}
        <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-xl">
          <p className="text-xs text-blue-700 leading-relaxed">
            <span className="font-bold">Why two fields?</span> Short-haul flights (under 3,700 km) produce
            more CO₂ per km than long-haul because takeoff and landing consume disproportionately more fuel.
            GHG Protocol and DEFRA 2025 require them to be reported separately.
            <span className="font-bold"> 3,700 km examples:</span> Paris→New York = long-haul (5,839 km).
            Paris→London = short-haul (344 km). Paris→Dubai = long-haul (5,252 km).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Short-Haul Flights */}
          <NumberInput
            label="Short-Haul Flights (under 3,700 km)"
            unit="km"
            helpText={`How to find this number: From your travel booking system or expense reports for FY ${companyData.year}, list all business flights. For each flight UNDER 3,700 km (e.g. Paris→London, Paris→Madrid, Amsterdam→Berlin), add up the one-way distances in km. 💡 Example: 4 Paris→London round trips = 4 × (344 km × 2) = 2,752 km. Use Google Flights or Rome2rio for distances. Enter ECONOMY class distances only — business class will be handled in Phase 3.`}
            value={activityData['flight_short_haul'] || 0}
            onChange={(v) => updateActivity('flight_short_haul', v)}
          />

          {/* Long-Haul Flights */}
          <NumberInput
            label="Long-Haul Flights (over 3,700 km)"
            unit="km"
            helpText={`How to find this number: From your travel booking system or expense reports for FY ${companyData.year}, list all business flights OVER 3,700 km (e.g. Paris→New York, Paris→Tokyo, London→Singapore). Add up the one-way distances in km. 💡 Example: 2 Paris→New York round trips = 2 × (5,839 km × 2) = 23,356 km. Use Google Flights or Rome2rio for exact distances.`}
            value={activityData['flight_long_haul'] || 0}
            onChange={(v) => updateActivity('flight_long_haul', v)}
          />

        </div>
      </div>

      {/* ================================================================
          CARD 3: ACCOMMODATION
          GHG Protocol Category 6 — Business Travel
          ================================================================ */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 mb-6 sm:mb-8">

        {/* Card Header */}
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
          <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
            <Moon size={16} className="text-amber-500" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base sm:text-lg">Accommodation</h3>
            <p className="text-xs text-gray-400">GHG Protocol — Category 6: Business Travel</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Hotel Nights */}
          <NumberInput
            label="Hotel Stays"
            unit="Nights"
            helpText={`How to find this number: Check your company's expense reports or travel booking system for FY ${companyData.year}. Count the total number of hotel nights booked for business travel across ALL employees. 💡 Example: If 3 employees each stayed 4 nights at a conference, that's 12 hotel nights total. Include all countries. The factor used (28 kgCO₂e/night) is the European average from Cornell/Greenview Hotel Sustainability Benchmarking Index (CHSB 2024).`}
            value={activityData['hotel_nights'] || 0}
            onChange={(v) => updateActivity('hotel_nights', v)}
          />

        </div>
      </div>

      {/* ================================================================
          CARD 4: EMPLOYEE COMMUTING & REMOTE WORKING
          GHG Protocol Category 7 — Employee Commuting
          This is a SEPARATE category from business travel.
          It covers emissions from employees getting TO work, not AT work.
          ================================================================ */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 mb-6 sm:mb-8">

        {/* Card Header */}
        <div className="flex items-center gap-3 mb-2 border-b border-gray-100 pb-4">
          <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
            <Home size={16} className="text-green-500" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base sm:text-lg">
              Employee Commuting & Remote Work
            </h3>
            <p className="text-xs text-gray-400">GHG Protocol — Category 7: Employee Commuting</p>
          </div>
        </div>

        {/* Explanation banner */}
        <div className="mb-6 p-3 bg-green-50 border border-green-100 rounded-xl">
          <p className="text-xs text-green-700 leading-relaxed">
            <span className="font-bold">What is this?</span> This section captures emissions from your
            employees travelling to and from work each day — their daily commute. This is different from
            business travel above. Remote working days are subtracted because employees working from home
            do not commute (but they use home energy, which is also counted here).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Employee Commuting */}
          <NumberInput
            label="Employee Commuting"
            unit="km"
            helpText={`How to find this number: This is the TOTAL commuting distance for ALL employees for the full year. Formula: (Number of employees) × (average daily commute distance, one way, km × 2) × (working days in the year). 💡 Example: 20 employees, average commute 15 km each way, 220 working days = 20 × 30 km × 220 days = 132,000 km. If you have a mix of car, train, and cycle commuters, use the average. Don't have this data? Estimate based on a short employee survey.`}
            value={activityData['employee_commuting'] || 0}
            onChange={(v) => updateActivity('employee_commuting', v)}
          />

          {/* Remote Working */}
          <NumberInput
            label="Remote Working Days"
            unit="Days"
            helpText={`How to find this number: Total number of days ALL employees worked from home during FY ${companyData.year}. Formula: (Number of employees who WFH) × (average WFH days per week) × (weeks in the year). 💡 Example: 10 employees each working from home 2 days/week for 48 weeks = 10 × 2 × 48 = 960 days. Remote working has a carbon cost (home heating/electricity) of 2.84 kgCO₂e per day (DEFRA 2024), but usually much less than commuting. This data also helps reduce your commuting total if you do a detailed calculation.`}
            value={activityData['remote_working'] || 0}
            onChange={(v) => updateActivity('remote_working', v)}
          />

        </div>
      </div>

      {/* ================================================================
          SCOPE 3 SUMMARY — Quick preview of what's been entered
          Helps the supplier sense-check their data before saving
          ================================================================ */}
      {(activityData['grey_fleet'] > 0 ||
        activityData['rail_travel'] > 0 ||
        activityData['flight_short_haul'] > 0 ||
        activityData['flight_long_haul'] > 0 ||
        activityData['hotel_nights'] > 0 ||
        activityData['employee_commuting'] > 0 ||
        activityData['remote_working'] > 0) && (
        <div className="mb-6 p-4 bg-purple-50 border border-purple-100 rounded-2xl">
          <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-3">
            Data Entered This Session
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {activityData['grey_fleet'] > 0 && (
              <div className="text-xs text-purple-700">
                <span className="font-bold block">{activityData['grey_fleet'].toLocaleString()} km</span>
                Grey Fleet
              </div>
            )}
            {activityData['rail_travel'] > 0 && (
              <div className="text-xs text-purple-700">
                <span className="font-bold block">{activityData['rail_travel'].toLocaleString()} km</span>
                Rail Travel
              </div>
            )}
            {activityData['flight_short_haul'] > 0 && (
              <div className="text-xs text-purple-700">
                <span className="font-bold block">{activityData['flight_short_haul'].toLocaleString()} km</span>
                Short-Haul Flights
              </div>
            )}
            {activityData['flight_long_haul'] > 0 && (
              <div className="text-xs text-purple-700">
                <span className="font-bold block">{activityData['flight_long_haul'].toLocaleString()} km</span>
                Long-Haul Flights
              </div>
            )}
            {activityData['hotel_nights'] > 0 && (
              <div className="text-xs text-purple-700">
                <span className="font-bold block">{activityData['hotel_nights'].toLocaleString()} nights</span>
                Hotel Stays
              </div>
            )}
            {activityData['employee_commuting'] > 0 && (
              <div className="text-xs text-purple-700">
                <span className="font-bold block">{activityData['employee_commuting'].toLocaleString()} km</span>
                Commuting
              </div>
            )}
            {activityData['remote_working'] > 0 && (
              <div className="text-xs text-purple-700">
                <span className="font-bold block">{activityData['remote_working'].toLocaleString()} days</span>
                Remote Work
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