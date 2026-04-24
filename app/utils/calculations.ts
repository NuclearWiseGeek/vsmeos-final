// =============================================================================
// FILE: app/utils/calculations.ts
// PURPOSE: The core carbon calculation engine for VSME OS.
//          This file contains ALL emission factors, country-specific data,
//          and the logic to convert raw user inputs into kgCO2e outputs.
//
// WHEN TO MODIFY THIS FILE:
//   - When ADEME, DEFRA, IEA, or EPA release updated emission factors (annually)
//   - When adding a new input field (e.g. a new fuel type or travel category)
//   - When adding a new country to the database
//
// DATA SOURCES:
//   - Scope 1 Fuels:        ADEME Base Carbone V23.6 (July 2025, full lifecycle incl. upstream)
//   - Scope 1 Refrigerants: IPCC AR5 GWP100 (legally required standard)
//   - Scope 2 Electricity:  IEA 2025 / EMBER 2024 (country-specific) / EPA eGRID2023 (USA)
//   - Scope 2 Thermal:      Euroheat & Power 2023 / IEA
//   - Scope 3 Travel:       DEFRA 2025 (includes Radiative Forcing x1.9 for flights)
//                           NOTE: DEFRA 2025 flight factors reduced 31-42% due to post-COVID load
//                           factor recovery. Updated June 2025. Previous 2024 factors were materially overstated.
//   - Scope 3 Hotels:       Cornell/Greenview CHSB 2024 (conservative global estimate)
//
// LAST UPDATED: April 2026 — Full audit against DEFRA 2025, ADEME Base Carbone V23.6 (July 2025),
//                UBA 2024, REE/EMBER 2024, EPA eGRID2023 (Jan 2025), IEA 2025 provisional 2024.
//                Notable 2026 audit changes: Spain grid 0.181→0.108, Sweden grid 0.013→0.041 (location-based),
//                Remote working 2.84→2.67, IEA world fallback 0.464→0.445.
//                Next review due Q2 2026 when DEFRA 2026 is released.
// =============================================================================

// =============================================================================
// SECTION 1: TYPE DEFINITIONS
// =============================================================================

export type EmissionFactor = {
  key: string;
  value: number;
  unit: string;
  source: string;
  id: string;
};

export interface ActivityResult {
  scope: "Scope 1" | "Scope 2" | "Scope 3";
  category: string;
  activity: string;
  quantity: number;
  unit: string;
  emissions: number;
  factorRef: number;
  source: string;
}

export interface Totals {
  // Canonical keys (used by buyer dashboard)
  scope1Total: number;
  scope2Total: number;
  scope3Total: number;
  grandTotal:  number;
  // Legacy aliases (kept for backwards compatibility)
  scope1: number;
  scope2: number;
  scope3: number;
  total: number;
  totalTonnes: number;
  intensity: number;
}

export interface CountryFactors {
  electricityGrid: number;
  districtHeating: number;
  districtCooling: number;
  railTravel: number;
  primaryCalculator: string;
  methodologyNote: string;
}

// =============================================================================
// SECTION 2: UNIVERSAL SCOPE 1 FACTORS
// Fuel chemistry is the same worldwide — these do NOT change by country.
// Source: ADEME Base Carbone V23.6 (July 2025, full lifecycle / well-to-wheel methodology)
// NOTE: These factors include BOTH combustion AND upstream (extraction, transport,
// processing) emissions. This is ADEME's methodology and is more complete than
// DEFRA combustion-only Scope 1 factors (e.g. DEFRA nat gas combustion = 0.183
// vs our 0.244 which includes upstream 0.039). This conservative approach is
// intentional and aligned with GHG Protocol's encouragement to report full lifecycle.
// =============================================================================

const SCOPE1_FACTORS: Record<string, EmissionFactor> = {
  natural_gas:  { key: "natural_gas",  value: 0.244,  unit: "kgCO2e/kWh", source: "ADEME Base Carbone V23.6 (2025, full lifecycle incl. upstream)", id: "GAS-NAT"   },
  heating_oil:  { key: "heating_oil",  value: 3.2,    unit: "kgCO2e/L",   source: "ADEME Base Carbone V23.6 (2025, full lifecycle incl. upstream)", id: "OIL-HEAT"  },
  propane:      { key: "propane",      value: 1.51,   unit: "kgCO2e/L",   source: "ADEME Base Carbone V23.6 (2025, full lifecycle incl. upstream)", id: "LPG-PROP"  },
  diesel:       { key: "diesel",       value: 3.16,   unit: "kgCO2e/L",   source: "ADEME Base Carbone V23.6 (2025, full lifecycle incl. upstream)", id: "FUEL-DSL"  },
  petrol:       { key: "petrol",       value: 2.80,   unit: "kgCO2e/L",   source: "ADEME Base Carbone V23.6 (2025, full lifecycle incl. upstream)", id: "FUEL-PET"  },
  // Refrigerants: IPCC AR5 GWP100 — do NOT change to AR6 yet (not legally required)
  ref_R410A:    { key: "ref_R410A",    value: 2088,   unit: "kgCO2e/kg",  source: "IPCC AR5 GWP100 / EU F-Gas Reg.", id: "REF-R410A" },
  ref_R32:      { key: "ref_R32",      value: 675,    unit: "kgCO2e/kg",  source: "IPCC AR5 GWP100 / EU F-Gas Reg.", id: "REF-R32"   },
  ref_R134a:    { key: "ref_R134a",    value: 1430,   unit: "kgCO2e/kg",  source: "IPCC AR5 GWP100 / EU F-Gas Reg.", id: "REF-R134A" },
  ref_R404A:    { key: "ref_R404A",    value: 3922,   unit: "kgCO2e/kg",  source: "IPCC AR5 GWP100 / EU F-Gas Reg.", id: "REF-R404A" },
};

// =============================================================================
// SECTION 3: UNIVERSAL SCOPE 3 FACTORS
// FLIGHTS: DEFRA 2025 factors include Radiative Forcing (x1.9) which
// accounts for contrail warming at altitude — required by GHG Protocol.
// DEFRA 2025 significantly revised flight factors (published June 2025):
//   Short-haul: 0.255 (2024) → 0.175 (2025) — -31% post-COVID load factor recovery
//   Long-haul:  0.195 (2024) → 0.117 (2025) — -40% post-COVID load factor recovery
// THRESHOLD: 3,700 km separates short-haul from long-haul (unchanged from DEFRA 2024).
// =============================================================================

const SCOPE3_UNIVERSAL_FACTORS: Record<string, EmissionFactor> = {
  grey_fleet:         { key: "grey_fleet",         value: 0.216,  unit: "kgCO2e/km",    source: "DEFRA 2025 (average car fleet, petrol+diesel)",  id: "TRAVEL-GREY"   },
  flight_short_haul:  { key: "flight_short_haul",  value: 0.175,  unit: "kgCO2e/pkm",   source: "DEFRA 2025 (incl. RF x1.9)",    id: "FLIGHT-SH"     },
  flight_long_haul:   { key: "flight_long_haul",   value: 0.117,  unit: "kgCO2e/pkm",   source: "DEFRA 2025 (incl. RF x1.9)",    id: "FLIGHT-LH"     },
  hotel_nights:       { key: "hotel_nights",        value: 28.0,   unit: "kgCO2e/night", source: "Cornell/Greenview CHSB 2024 (conservative global estimate)",              id: "HOTEL-AVG"     },
  employee_commuting: { key: "employee_commuting",  value: 0.138,  unit: "kgCO2e/km",    source: "DEFRA 2025 (average commute, mixed modes)", id: "COMMUTE-AVG"   },
  remote_working:     { key: "remote_working",      value: 2.67,   unit: "kgCO2e/day",   source: "DEFRA 2025 (0.334 kgCO2e/hr × 8hr working day)", id: "REMOTE-WFH"    },
};

// =============================================================================
// SECTION 4: COUNTRY-SPECIFIC EMISSION FACTORS DATABASE
// Each country has a different electricity grid intensity based on their
// energy mix. France (nuclear) = 0.052. South Africa (coal) = 0.928.
// Using the wrong country's factor produces completely wrong results.
// Sources: IEA 2023/2025, EMBER 2023/2024, national grid operators
// =============================================================================

export const COUNTRY_FACTORS: Record<string, CountryFactors> = {
  // EUROPE
  "France":         { electricityGrid: 0.052, districtHeating: 0.110, districtCooling: 0.015, railTravel: 0.006, primaryCalculator: "ADEME Base Carbone V23.6 (2025)",                        methodologyNote: "Quantified using ADEME Base Carbone V23.6 (July 2025). France's nuclear-dominated grid produces among the lowest electricity emissions in Europe (RTE 2024)." },
  "Germany":        { electricityGrid: 0.364, districtHeating: 0.145, districtCooling: 0.109, railTravel: 0.023, primaryCalculator: "Umweltbundesamt (UBA) 2024 / IEA",                  methodologyNote: "Quantified using UBA Germany emission factors. Grid intensity reflects ongoing coal phase-out transition." },
  "United Kingdom": { electricityGrid: 0.196, districtHeating: 0.142, districtCooling: 0.059, railTravel: 0.036, primaryCalculator: "DEFRA 2025 / National Grid ESO",                   methodologyNote: "Quantified using DEFRA 2025 UK Government GHG Conversion Factors (generation 0.177 + T&D 0.019 = 0.196 combined). 14.5% reduction from 2024 driven by reduced natural gas use and increased renewables." },
  "Spain":          { electricityGrid: 0.108, districtHeating: 0.085, districtCooling: 0.031, railTravel: 0.015, primaryCalculator: "Red Eléctrica (REE) / EMBER 2024",                     methodologyNote: "Quantified using Red Eléctrica de España (REE) 2024 generation data and EMBER 2024. Spain's grid reached a historic low in 2024: 76.8% of electricity generated was emission-free, driven by record solar and wind additions." },
  "Italy":          { electricityGrid: 0.251, districtHeating: 0.150, districtCooling: 0.067, railTravel: 0.007, primaryCalculator: "GSE Italy 2024 / IEA",                              methodologyNote: "Quantified using GSE (Gestore dei Servizi Energetici) Italy 2023 emission factors." },
  "Netherlands":    { electricityGrid: 0.298, districtHeating: 0.130, districtCooling: 0.097, railTravel: 0.003, primaryCalculator: "CBS Netherlands / IEA 2024",                        methodologyNote: "Quantified using CBS Netherlands Statline and IEA 2023 grid emission factors. NS trains run on 100% wind power since 2017." },
  "Belgium":        { electricityGrid: 0.144, districtHeating: 0.130, districtCooling: 0.048, railTravel: 0.005, primaryCalculator: "CREG Belgium / IEA 2024",                           methodologyNote: "Quantified using CREG Belgian grid operator and IEA 2023 emission factors." },
  "Sweden":         { electricityGrid: 0.041, districtHeating: 0.042, districtCooling: 0.012, railTravel: 0.001, primaryCalculator: "Energimyndigheten (SEA) 2023 / IEA",               methodologyNote: "Quantified using Swedish Energy Agency (Energimyndigheten) location-based emission factors for GHG Protocol Scope 2. Sweden's location-based grid factor is ~41 gCO₂e/kWh (hydro + nuclear dominant). Note: the market-based / residual mix factor is ~0.013 — the location-based figure is used here per GHG Protocol dual-reporting guidance." },
  "Norway":         { electricityGrid: 0.017, districtHeating: 0.025, districtCooling: 0.005, railTravel: 0.001, primaryCalculator: "NVE Norway 2023 / IEA",                             methodologyNote: "Quantified using NVE (Norwegian Water Resources and Energy Directorate) 2023. Grid is almost entirely hydroelectric." },
  "Denmark":        { electricityGrid: 0.133, districtHeating: 0.068, districtCooling: 0.038, railTravel: 0.002, primaryCalculator: "Energistyrelsen (DEA) 2023 / IEA",                 methodologyNote: "Quantified using Danish Energy Agency (DEA) 2023 emission factors." },
  "Finland":        { electricityGrid: 0.079, districtHeating: 0.055, districtCooling: 0.023, railTravel: 0.005, primaryCalculator: "Fingrid 2023 / IEA",                               methodologyNote: "Quantified using Fingrid Finland national grid 2023 emission factors." },
  "Austria":        { electricityGrid: 0.158, districtHeating: 0.120, districtCooling: 0.045, railTravel: 0.010, primaryCalculator: "Umweltbundesamt Austria / IEA 2023",               methodologyNote: "Quantified using Austrian Environment Agency (UBA) and IEA 2023 emission factors." },
  "Switzerland":    { electricityGrid: 0.024, districtHeating: 0.080, districtCooling: 0.007, railTravel: 0.002, primaryCalculator: "SFOE Switzerland / IEA 2023",                      methodologyNote: "Quantified using Swiss Federal Office of Energy (SFOE) 2023. Grid is very clean (nuclear + hydro)." },
  "Poland":         { electricityGrid: 0.695, districtHeating: 0.280, districtCooling: 0.221, railTravel: 0.037, primaryCalculator: "URE Poland / IEA 2024",                            methodologyNote: "Quantified using Polish Energy Regulatory Office (URE) and IEA 2023. Poland has one of Europe's most coal-heavy grids." },
  "Czech Republic": { electricityGrid: 0.489, districtHeating: 0.240, districtCooling: 0.140, railTravel: 0.016, primaryCalculator: "ERU Czech Republic / IEA 2023",                   methodologyNote: "Quantified using Czech Energy Regulatory Office (ERU) and IEA 2023 emission factors." },
  "Portugal":       { electricityGrid: 0.218, districtHeating: 0.100, districtCooling: 0.062, railTravel: 0.017, primaryCalculator: "DGEG Portugal / IEA 2023",                         methodologyNote: "Quantified using DGEG Portugal Directorate General of Energy and IEA 2023 factors." },
  "Ireland":        { electricityGrid: 0.295, districtHeating: 0.120, districtCooling: 0.084, railTravel: 0.035, primaryCalculator: "SEAI Ireland 2023 / IEA",                          methodologyNote: "Quantified using Sustainable Energy Authority of Ireland (SEAI) 2023 emission factors." },
  "Greece":         { electricityGrid: 0.399, districtHeating: 0.130, districtCooling: 0.114, railTravel: 0.019, primaryCalculator: "DAPEEP Greece / IEA 2023",                         methodologyNote: "Quantified using DAPEEP Greek grid operator and IEA 2023 emission factors." },
  "Romania":        { electricityGrid: 0.294, districtHeating: 0.200, districtCooling: 0.084, railTravel: 0.027, primaryCalculator: "ANRE Romania / IEA 2023",                          methodologyNote: "Quantified using ANRE Romanian Energy Regulatory Authority and IEA 2023 factors." },
  "Hungary":        { electricityGrid: 0.233, districtHeating: 0.175, districtCooling: 0.067, railTravel: 0.021, primaryCalculator: "MEKH Hungary / IEA 2023",                          methodologyNote: "Quantified using MEKH Hungarian Energy and Public Utility Regulatory Authority and IEA 2023." },
  "Turkey":         { electricityGrid: 0.452, districtHeating: 0.200, districtCooling: 0.129, railTravel: 0.038, primaryCalculator: "EPDK Turkey / IEA 2023",                           methodologyNote: "Quantified using EPDK Turkish Energy Market Regulatory Authority and IEA 2023 emission factors." },
  "Ukraine":        { electricityGrid: 0.352, districtHeating: 0.210, districtCooling: 0.101, railTravel: 0.029, primaryCalculator: "NEURC Ukraine / IEA 2023",                         methodologyNote: "Quantified using IEA 2023 emission factors." },
  "Bulgaria":       { electricityGrid: 0.489, districtHeating: 0.260, districtCooling: 0.140, railTravel: 0.032, primaryCalculator: "ExecEnv Bulgaria / IEA 2023",                      methodologyNote: "Quantified using IEA 2023 emission factors for Bulgaria." },
  "Croatia":        { electricityGrid: 0.188, districtHeating: 0.140, districtCooling: 0.054, railTravel: 0.027, primaryCalculator: "HAKOM Croatia / IEA 2023",                         methodologyNote: "Quantified using IEA 2023 emission factors for Croatia." },
  "Slovakia":       { electricityGrid: 0.133, districtHeating: 0.155, districtCooling: 0.038, railTravel: 0.013, primaryCalculator: "URSO Slovakia / IEA 2023",                         methodologyNote: "Quantified using IEA 2023 emission factors for Slovakia." },
  "Slovenia":       { electricityGrid: 0.238, districtHeating: 0.140, districtCooling: 0.068, railTravel: 0.020, primaryCalculator: "AGEN Slovenia / IEA 2023",                         methodologyNote: "Quantified using IEA 2023 emission factors for Slovenia." },
  "Serbia":         { electricityGrid: 0.638, districtHeating: 0.260, districtCooling: 0.182, railTravel: 0.036, primaryCalculator: "AERS Serbia / IEA 2023",                           methodologyNote: "Quantified using IEA 2023 emission factors for Serbia." },
  "Luxembourg":     { electricityGrid: 0.276, districtHeating: 0.130, districtCooling: 0.079, railTravel: 0.004, primaryCalculator: "ILR Luxembourg / IEA 2023",                        methodologyNote: "Quantified using IEA 2023 emission factors for Luxembourg." },
  "Lithuania":      { electricityGrid: 0.144, districtHeating: 0.110, districtCooling: 0.041, railTravel: 0.019, primaryCalculator: "LITGRID / IEA 2023",                               methodologyNote: "Quantified using IEA 2023 emission factors for Lithuania." },
  "Latvia":         { electricityGrid: 0.099, districtHeating: 0.095, districtCooling: 0.028, railTravel: 0.016, primaryCalculator: "Sadales tikls / IEA 2023",                         methodologyNote: "Quantified using IEA 2023 emission factors for Latvia." },
  "Estonia":        { electricityGrid: 0.617, districtHeating: 0.280, districtCooling: 0.176, railTravel: 0.020, primaryCalculator: "Elering Estonia / IEA 2023",                       methodologyNote: "Quantified using IEA 2023 emission factors for Estonia." },
  "Iceland":        { electricityGrid: 0.003, districtHeating: 0.015, districtCooling: 0.001, railTravel: 0.002, primaryCalculator: "Orkustofnun (OS) / IEA 2023",                      methodologyNote: "Quantified using Orkustofnun Iceland. Grid is almost entirely geothermal and hydro — one of the world's cleanest." },

  // NORTH AMERICA
  "United States":  { electricityGrid: 0.350, districtHeating: 0.190, districtCooling: 0.110, railTravel: 0.103, primaryCalculator: "EPA eGRID2023 (Jan 2025, AR5 GWP)",                               methodologyNote: "Quantified using US EPA eGRID2023 national average total output emission rate (released January 2025, revised June 2025, year 2023 data). US national rate 770.9 lbCO2e/MWh ≈ 0.350 kgCO2e/kWh (CO2 + CH4 + N2O via AR5 GWP100). Updated from eGRID2022 (0.386)." },
  "Canada":         { electricityGrid: 0.130, districtHeating: 0.110, districtCooling: 0.037, railTravel: 0.033, primaryCalculator: "Environment & Climate Change Canada (ECCC) 2023",  methodologyNote: "Quantified using ECCC 2023 National Inventory Report factors. Canada's grid benefits from significant hydro power." },
  "Mexico":         { electricityGrid: 0.454, districtHeating: 0.180, districtCooling: 0.130, railTravel: 0.075, primaryCalculator: "SEMARNAT Mexico / IEA 2023",                       methodologyNote: "Quantified using SEMARNAT Mexico and IEA 2023 emission factors." },

  // ASIA-PACIFIC
  "China":          { electricityGrid: 0.557, districtHeating: 0.220, districtCooling: 0.166, railTravel: 0.018, primaryCalculator: "CEPCI China / IEA 2024 / EMBER 2024",              methodologyNote: "Quantified using Chinese national emission factors and IEA 2023 grid data. Grid intensity is improving year-on-year." },
  "Japan":          { electricityGrid: 0.463, districtHeating: 0.180, districtCooling: 0.132, railTravel: 0.017, primaryCalculator: "Ministry of Environment Japan / IEA 2023",         methodologyNote: "Quantified using Japan Ministry of Environment and IEA 2023 emission factors." },
  "South Korea":    { electricityGrid: 0.459, districtHeating: 0.200, districtCooling: 0.131, railTravel: 0.017, primaryCalculator: "KEPCO / Ministry of Environment Korea 2023",       methodologyNote: "Quantified using KEPCO Korea Electric Power Corporation and Ministry of Environment Korea 2023 factors." },
  "India":          { electricityGrid: 0.716, districtHeating: 0.000, districtCooling: 0.202, railTravel: 0.040, primaryCalculator: "CEA India 2024 / IEA",                             methodologyNote: "Quantified using Central Electricity Authority (CEA) India 2023 and IEA emission factors." },
  "Australia":      { electricityGrid: 0.610, districtHeating: 0.000, districtCooling: 0.188, railTravel: 0.153, primaryCalculator: "Australian NGA 2024 / Clean Energy Regulator",     methodologyNote: "Quantified using Australian National Greenhouse Accounts (NGA) 2023 emission factors." },
  "New Zealand":    { electricityGrid: 0.098, districtHeating: 0.000, districtCooling: 0.028, railTravel: 0.012, primaryCalculator: "Ministry for the Environment NZ / IEA 2023",       methodologyNote: "Quantified using New Zealand Ministry for the Environment and IEA 2023. Grid is hydro and geothermal dominant." },
  "Singapore":      { electricityGrid: 0.408, districtHeating: 0.000, districtCooling: 0.117, railTravel: 0.005, primaryCalculator: "EMA Singapore / IEA 2023",                        methodologyNote: "Quantified using Energy Market Authority (EMA) Singapore and IEA 2023 emission factors." },
  "Indonesia":      { electricityGrid: 0.709, districtHeating: 0.000, districtCooling: 0.203, railTravel: 0.060, primaryCalculator: "PLN Indonesia / IEA 2023",                        methodologyNote: "Quantified using PLN (Perusahaan Listrik Negara) Indonesia and IEA 2023 emission factors." },
  "Malaysia":       { electricityGrid: 0.585, districtHeating: 0.000, districtCooling: 0.167, railTravel: 0.055, primaryCalculator: "ST Malaysia / IEA 2023",                          methodologyNote: "Quantified using Suruhanjaya Tenaga (ST) Malaysia and IEA 2023 emission factors." },
  "Thailand":       { electricityGrid: 0.513, districtHeating: 0.000, districtCooling: 0.147, railTravel: 0.048, primaryCalculator: "EGAT Thailand / IEA 2023",                        methodologyNote: "Quantified using EGAT (Electricity Generating Authority of Thailand) and IEA 2023 factors." },
  "Vietnam":        { electricityGrid: 0.498, districtHeating: 0.000, districtCooling: 0.142, railTravel: 0.041, primaryCalculator: "EVN Vietnam / IEA 2023",                           methodologyNote: "Quantified using EVN (Vietnam Electricity) and IEA 2023 emission factors." },
  "Bangladesh":     { electricityGrid: 0.582, districtHeating: 0.000, districtCooling: 0.166, railTravel: 0.055, primaryCalculator: "SREDA Bangladesh / IEA 2023",                     methodologyNote: "Quantified using SREDA Bangladesh and IEA 2023 emission factors." },
  "Pakistan":       { electricityGrid: 0.371, districtHeating: 0.000, districtCooling: 0.106, railTravel: 0.045, primaryCalculator: "NEPRA Pakistan / IEA 2023",                       methodologyNote: "Quantified using NEPRA Pakistan and IEA 2023 emission factors." },
  "Philippines":    { electricityGrid: 0.519, districtHeating: 0.000, districtCooling: 0.148, railTravel: 0.055, primaryCalculator: "DOE Philippines / IEA 2023",                      methodologyNote: "Quantified using DOE Philippines and IEA 2023 emission factors." },
  "Taiwan":         { electricityGrid: 0.509, districtHeating: 0.000, districtCooling: 0.145, railTravel: 0.018, primaryCalculator: "Bureau of Energy Taiwan / IEA 2023",               methodologyNote: "Quantified using Bureau of Energy Taiwan and IEA 2023 emission factors." },

  // MIDDLE EAST
  "Saudi Arabia":   { electricityGrid: 0.711, districtHeating: 0.000, districtCooling: 0.203, railTravel: 0.000, primaryCalculator: "SEC Saudi Arabia / IEA 2023",                     methodologyNote: "Quantified using Saudi Electricity Company (SEC) and IEA 2023 emission factors." },
  "UAE":            { electricityGrid: 0.408, districtHeating: 0.000, districtCooling: 0.117, railTravel: 0.000, primaryCalculator: "DEWA / ADWEA / IEA 2023",                          methodologyNote: "Quantified using DEWA (Dubai) and ADWEA (Abu Dhabi) grid data and IEA 2023 factors." },
  "Israel":         { electricityGrid: 0.559, districtHeating: 0.000, districtCooling: 0.160, railTravel: 0.042, primaryCalculator: "IEC Israel / IEA 2023",                            methodologyNote: "Quantified using Israel Electric Corporation (IEC) and IEA 2023 emission factors." },
  "Egypt":          { electricityGrid: 0.469, districtHeating: 0.000, districtCooling: 0.134, railTravel: 0.050, primaryCalculator: "EETC Egypt / IEA 2023",                            methodologyNote: "Quantified using EETC (Egyptian Electricity Transmission Company) and IEA 2023 factors." },
  "Jordan":         { electricityGrid: 0.548, districtHeating: 0.000, districtCooling: 0.157, railTravel: 0.055, primaryCalculator: "EMRC Jordan / IEA 2023",                           methodologyNote: "Quantified using EMRC Jordan and IEA 2023 emission factors." },

  // AFRICA
  "South Africa":   { electricityGrid: 0.928, districtHeating: 0.000, districtCooling: 0.265, railTravel: 0.090, primaryCalculator: "ESKOM / Department of Energy SA 2023",            methodologyNote: "Quantified using ESKOM and SA Department of Energy 2023. South Africa's coal-dominant grid is one of the world's highest intensity." },
  "Nigeria":        { electricityGrid: 0.430, districtHeating: 0.000, districtCooling: 0.123, railTravel: 0.080, primaryCalculator: "NERC Nigeria / IEA 2023",                          methodologyNote: "Quantified using NERC Nigeria and IEA 2023 emission factors." },
  "Morocco":        { electricityGrid: 0.624, districtHeating: 0.000, districtCooling: 0.178, railTravel: 0.040, primaryCalculator: "ONEE Morocco / IEA 2023",                          methodologyNote: "Quantified using ONEE (Office National de l'Electricite) Morocco and IEA 2023 factors." },
  "Kenya":          { electricityGrid: 0.098, districtHeating: 0.000, districtCooling: 0.028, railTravel: 0.040, primaryCalculator: "EPRA Kenya / IEA 2023",                            methodologyNote: "Quantified using EPRA Kenya and IEA 2023. Kenya's grid benefits from significant geothermal and hydro power." },
  "Ethiopia":       { electricityGrid: 0.028, districtHeating: 0.000, districtCooling: 0.008, railTravel: 0.045, primaryCalculator: "EEP Ethiopia / IEA 2023",                          methodologyNote: "Quantified using Ethiopian Electric Power (EEP) and IEA 2023. One of Africa's cleanest grids (hydro-dominant)." },
  "Ghana":          { electricityGrid: 0.329, districtHeating: 0.000, districtCooling: 0.094, railTravel: 0.060, primaryCalculator: "PURC Ghana / IEA 2023",                            methodologyNote: "Quantified using PURC Ghana and IEA 2023 emission factors." },
  "Tanzania":       { electricityGrid: 0.282, districtHeating: 0.000, districtCooling: 0.081, railTravel: 0.065, primaryCalculator: "EWURA Tanzania / IEA 2023",                        methodologyNote: "Quantified using EWURA Tanzania and IEA 2023 emission factors." },

  // LATIN AMERICA
  "Brazil":         { electricityGrid: 0.100, districtHeating: 0.000, districtCooling: 0.029, railTravel: 0.013, primaryCalculator: "MCTIC Brazil / SEEG 2023",                         methodologyNote: "Quantified using Brazilian Ministry of Science (MCTIC) and SEEG 2023. Grid is predominantly hydroelectric." },
  "Argentina":      { electricityGrid: 0.340, districtHeating: 0.000, districtCooling: 0.097, railTravel: 0.032, primaryCalculator: "MADS Argentina / IEA 2023",                        methodologyNote: "Quantified using Argentine Ministry of Environment (MADS) and IEA 2023 factors." },
  "Chile":          { electricityGrid: 0.344, districtHeating: 0.000, districtCooling: 0.098, railTravel: 0.031, primaryCalculator: "CNE Chile / IEA 2023",                             methodologyNote: "Quantified using Comision Nacional de Energia (CNE) Chile and IEA 2023 factors." },
  "Colombia":       { electricityGrid: 0.188, districtHeating: 0.000, districtCooling: 0.054, railTravel: 0.022, primaryCalculator: "UPME Colombia / IEA 2023",                         methodologyNote: "Quantified using UPME Colombia and IEA 2023. Grid is heavily hydro-powered." },
  "Peru":           { electricityGrid: 0.238, districtHeating: 0.000, districtCooling: 0.068, railTravel: 0.032, primaryCalculator: "MINEM Peru / IEA 2023",                            methodologyNote: "Quantified using MINEM Peru and IEA 2023 emission factors." },
  "Uruguay":        { electricityGrid: 0.108, districtHeating: 0.000, districtCooling: 0.031, railTravel: 0.020, primaryCalculator: "MIEM Uruguay / IEA 2023",                          methodologyNote: "Quantified using MIEM Uruguay. Grid is predominantly renewable (wind + hydro)." },
  "Costa Rica":     { electricityGrid: 0.045, districtHeating: 0.000, districtCooling: 0.013, railTravel: 0.009, primaryCalculator: "MINAE Costa Rica / IEA 2023",                      methodologyNote: "Quantified using MINAE Costa Rica. One of the world's greenest grids — nearly 100% renewable." },
};

// =============================================================================
// SECTION 5: FALLBACK — IEA WORLD AVERAGE
// Used when a country is not found in our database above.
// =============================================================================

const DEFAULT_COUNTRY_FACTORS: CountryFactors = {
  electricityGrid: 0.445,
  districtHeating: 0.195,
  districtCooling: 0.127,
  railTravel: 0.041,
  primaryCalculator: "IEA Emissions Factors 2025 (2024 provisional data)",
  methodologyNote: "Quantified using IEA Emissions Factors 2025 world average emission factors (provisional 2024 data). Country-specific data was not available; IEA world averages have been applied as a conservative estimate. Updated from IEA 2024 edition (0.464 g/kWh → 0.445 g/kWh, reflecting 3% global grid decarbonisation in 2024)."
};

const GREEN_ELECTRICITY_FACTOR = 0.000; // Market-based method — GHG Protocol Scope 2 Guidance

// =============================================================================
// SECTION 6: UI LABELS AND UNITS
// Used by all scope input pages, the results page, and the PDF report.
// =============================================================================

export const LABELS: Record<string, string> = {
  natural_gas:        "Natural Gas",
  heating_oil:        "Heating Oil",
  propane:            "Propane / LPG",
  diesel:             "Fleet Diesel",
  petrol:             "Fleet Petrol / Gasoline",
  ref_R410A:          "Refrigerant R410A",
  ref_R32:            "Refrigerant R32",
  ref_R134a:          "Refrigerant R134a",
  ref_R404A:          "Refrigerant R404A",
  electricity_grid:   "Grid Electricity",
  electricity_green:  "Green / Renewable Electricity",
  district_heat:      "District Heating",
  district_cool:      "District Cooling",
  grey_fleet:         "Employee Vehicles (Grey Fleet)",
  rail_travel:        "Rail / Train Travel",
  flight_short_haul:  "Short-Haul Flights (under 3,700 km)",
  flight_long_haul:   "Long-Haul Flights (over 3,700 km)",
  hotel_nights:       "Hotel Stays",
  employee_commuting: "Employee Commuting",
  remote_working:     "Remote Working Days",
};

export const INPUT_UNITS: Record<string, string> = {
  natural_gas:        "kWh",
  heating_oil:        "Litres",
  propane:            "Litres",
  diesel:             "Litres",
  petrol:             "Litres",
  ref_R410A:          "kg",
  ref_R32:            "kg",
  ref_R134a:          "kg",
  ref_R404A:          "kg",
  electricity_grid:   "kWh",
  electricity_green:  "kWh",
  district_heat:      "kWh",
  district_cool:      "kWh",
  grey_fleet:         "km",
  rail_travel:        "km",
  flight_short_haul:  "km",
  flight_long_haul:   "km",
  hotel_nights:       "Nights",
  employee_commuting: "km",
  remote_working:     "Days",
};

// =============================================================================
// SECTION 7: INTERNAL HELPER FUNCTIONS
// =============================================================================

function getScope(key: string): "Scope 1" | "Scope 2" | "Scope 3" {
  const scope1 = ["natural_gas","heating_oil","propane","diesel","petrol","ref_R410A","ref_R32","ref_R134a","ref_R404A"];
  const scope2 = ["electricity_grid","electricity_green","district_heat","district_cool"];
  if (scope1.includes(key)) return "Scope 1";
  if (scope2.includes(key)) return "Scope 2";
  return "Scope 3";
}

function getCategory(key: string): string {
  if (["natural_gas","heating_oil","propane"].includes(key))                              return "Stationary Combustion";
  if (["diesel","petrol"].includes(key))                                                  return "Mobile Combustion";
  if (key.startsWith("ref_"))                                                             return "Fugitive Emissions";
  if (["electricity_grid","electricity_green"].includes(key))                             return "Purchased Electricity";
  if (["district_heat","district_cool"].includes(key))                                   return "Purchased Heat & Cooling";
  if (["grey_fleet","rail_travel","flight_short_haul","flight_long_haul","hotel_nights"].includes(key)) return "Business Travel";
  if (["employee_commuting","remote_working"].includes(key))                             return "Employee Commuting & Remote Work";
  return "Other";
}

// =============================================================================
// SECTION 8: EXPORTED UTILITY FUNCTIONS
// =============================================================================

/**
 * Returns correct emission factors for a given country.
 * Falls back to IEA world average if country not in our database.
 */
export function getCountryFactors(country: string): CountryFactors {
  if (COUNTRY_FACTORS[country]) return COUNTRY_FACTORS[country];
  const normalised = Object.keys(COUNTRY_FACTORS).find(k => k.toLowerCase() === country?.toLowerCase());
  if (normalised) return COUNTRY_FACTORS[normalised];
  console.warn(`[VSME OS] Country "${country}" not in database — using IEA world average fallback.`);
  return DEFAULT_COUNTRY_FACTORS;
}

/**
 * Returns all supported countries sorted A-Z.
 * Used to populate the country dropdown in the company profile.
 */
export function getSupportedCountries(): string[] {
  return Object.keys(COUNTRY_FACTORS).sort();
}

/**
 * Smart emissions formatter.
 * Shows kgCO2e for small values, tCO2e for values above 1,000 kg.
 */
export function formatEmissions(kg: number): { value: number; unit: string; formatted: string } {
  if (kg >= 1000) {
    const tonnes = kg / 1000;
    return { value: tonnes, unit: "tCO2e", formatted: `${tonnes.toLocaleString("en-US", { maximumFractionDigits: 2 })} tCO2e` };
  }
  return { value: kg, unit: "kgCO2e", formatted: `${kg.toLocaleString("en-US", { maximumFractionDigits: 2 })} kgCO2e` };
}

// =============================================================================
// SECTION 9: MAIN CALCULATION FUNCTION
// =============================================================================

/**
 * Calculates carbon emissions for all activities entered by the supplier.
 * IMPORTANT: Pass the supplier's country so the correct grid factors are used.
 *
 * @param inputs  - Key-value map of activity keys to user-entered quantities
 * @param country - Supplier's country from the company profile
 * @returns Ordered array of ActivityResult rows (Scope 1 → 2 → 3)
 */
export function calculateEmissions(
  inputs: Record<string, number>,
  country: string = "France"
): ActivityResult[] {

  const rows: ActivityResult[] = [];
  const countryData = getCountryFactors(country);

  // Build country-specific Scope 2 factors
  const scope2Factors: Record<string, { value: number; source: string }> = {
    electricity_grid:  { value: countryData.electricityGrid,  source: countryData.primaryCalculator },
    electricity_green: { value: GREEN_ELECTRICITY_FACTOR,     source: "GHG Protocol Scope 2 Guidance / AIB 2024" },
    district_heat:     { value: countryData.districtHeating,  source: countryData.primaryCalculator },
    district_cool:     { value: countryData.districtCooling,  source: countryData.primaryCalculator },
  };

  // Build country-specific Scope 3 rail factor
  const railFactor = { value: countryData.railTravel, source: countryData.primaryCalculator };

  // Strict processing order — must match PDF layout
  const order = [
    "natural_gas","heating_oil","propane","diesel","petrol",
    "ref_R410A","ref_R32","ref_R134a","ref_R404A",
    "electricity_grid","electricity_green","district_heat","district_cool",
    "grey_fleet","rail_travel","flight_short_haul","flight_long_haul",
    "hotel_nights","employee_commuting","remote_working",
  ];

  order.forEach((key) => {
    const qty = inputs[key] || 0;
    if (qty <= 0) return; // Skip zero entries

    let factorValue: number;
    let factorSource: string;

    if (SCOPE1_FACTORS[key]) {
      factorValue = SCOPE1_FACTORS[key].value;
      factorSource = SCOPE1_FACTORS[key].source;
    } else if (scope2Factors[key]) {
      factorValue = scope2Factors[key].value;
      factorSource = scope2Factors[key].source;
    } else if (key === "rail_travel") {
      factorValue = railFactor.value;
      factorSource = railFactor.source;
    } else if (SCOPE3_UNIVERSAL_FACTORS[key]) {
      factorValue = SCOPE3_UNIVERSAL_FACTORS[key].value;
      factorSource = SCOPE3_UNIVERSAL_FACTORS[key].source;
    } else {
      console.warn(`[VSME OS] Unknown key: "${key}" — skipped`);
      return;
    }

    rows.push({
      scope: getScope(key),
      category: getCategory(key),
      activity: LABELS[key] || key,
      quantity: qty,
      unit: INPUT_UNITS[key] || "unit",
      emissions: qty * factorValue,
      factorRef: factorValue,
      source: factorSource,
    });
  });

  return rows;
}

// =============================================================================
// SECTION 10: SUMMARISATION FUNCTION
// =============================================================================

/**
 * Aggregates detailed emission rows into scope totals + key metrics.
 *
 * @param rows    - From calculateEmissions()
 * @param revenue - Annual revenue in EUR (for carbon intensity calculation)
 */
export function summarizeEmissions(
  rows: ActivityResult[],
  revenue: number
): Totals {
  const scope1 = rows.filter(r => r.scope === "Scope 1").reduce((a, c) => a + c.emissions, 0);
  const scope2 = rows.filter(r => r.scope === "Scope 2").reduce((a, c) => a + c.emissions, 0);
  const scope3 = rows.filter(r => r.scope === "Scope 3").reduce((a, c) => a + c.emissions, 0);
  const total = scope1 + scope2 + scope3;

  return {
    // New canonical keys — used by buyer dashboard (getSupplierEmissions, EmissionsPanel, CSV export)
    scope1Total: scope1,
    scope2Total: scope2,
    scope3Total: scope3,
    grandTotal:  total,
    // Legacy aliases — kept so existing references don't break
    scope1,
    scope2,
    scope3,
    total,
    totalTonnes: total / 1000,                                    // Convert to tCO2e
    intensity: revenue > 0 ? total / (revenue / 1_000_000) : 0,  // kgCO2e per €1M revenue
  };
}