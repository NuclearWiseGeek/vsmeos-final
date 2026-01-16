// utils/calculations.ts

// --- Types ---
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
  scope1: number;
  scope2: number;
  scope3: number;
  total: number;
}

// --- Data ---
export const FACTORS: Record<string, EmissionFactor> = {
  natural_gas: { key: "natural_gas", value: 0.244, unit: "kgCO2e/kWh", source: "ADEME", id: "GAS-NAT" },
  heating_oil: { key: "heating_oil", value: 3.2, unit: "kgCO2e/L", source: "ADEME", id: "OIL-HEAT" },
  propane: { key: "propane", value: 3.1, unit: "kgCO2e/kg", source: "ADEME", id: "LPG-PROP" },
  diesel: { key: "diesel", value: 3.16, unit: "kgCO2e/L", source: "ADEME", id: "FUEL-DSL" },
  petrol: { key: "petrol", value: 2.8, unit: "kgCO2e/L", source: "ADEME", id: "FUEL-PET" },
  ref_R410A: { key: "ref_R410A", value: 2088, unit: "kgCO2e/kg", source: "ADEME", id: "REF-R410A" },
  ref_R32: { key: "ref_R32", value: 675, unit: "kgCO2e/kg", source: "ADEME", id: "REF-R32" },
  ref_R134a: { key: "ref_R134a", value: 1430, unit: "kgCO2e/kg", source: "ADEME", id: "REF-R134a" },
  electricity_fr: { key: "electricity_fr", value: 0.052, unit: "kgCO2e/kWh", source: "ADEME", id: "ELEC-FR" },
  district_heat: { key: "district_heat", value: 0.170, unit: "kgCO2e/kWh", source: "ADEME", id: "HEAT-NET" },
  grey_fleet_avg: { key: "grey_fleet_avg", value: 0.218, unit: "kgCO2e/km", source: "ADEME", id: "TRAVEL-CAR-AVG" },
  flight_avg: { key: "flight_avg", value: 0.14, unit: "kgCO2e/km", source: "ADEME", id: "FLIGHT-AVG" },
  hotel_night_avg: { key: "hotel_night_avg", value: 6.9, unit: "kgCO2e/night", source: "ADEME", id: "HOTEL-FR-AVG" },
};

// --- Labels Dictionary for UI ---
export const LABELS: Record<string, string> = {
  natural_gas: "Natural Gas",
  heating_oil: "Heating Oil",
  propane: "Propane",
  diesel: "Fleet Diesel",
  petrol: "Fleet Petrol",
  ref_R410A: "R410A Refill",
  ref_R32: "R32 Refill",
  ref_R134a: "R134a Refill",
  electricity_fr: "Electricity",
  district_heat: "District Heating",
  grey_fleet_avg: "Employee Vehicles",
  flight_avg: "Business Flights",
  hotel_night_avg: "Hotel Nights",
};

// --- Helper Functions ---
function getCategory(key: string): string {
    if (["natural_gas", "heating_oil", "propane"].includes(key)) return "Stationary Combustion";
    if (["diesel", "petrol"].includes(key)) return "Mobile Combustion";
    if (key.startsWith("ref_")) return "Fugitive Emissions";
    if (["electricity_fr", "district_heat"].includes(key)) return "Purchased Energy";
    return "Business Travel";
}

function getScope(key: string): "Scope 1" | "Scope 2" | "Scope 3" {
  if (["natural_gas", "heating_oil", "propane", "diesel", "petrol", "ref_R410A", "ref_R32", "ref_R134a"].includes(key)) return "Scope 1";
  if (["electricity_fr", "district_heat"].includes(key)) return "Scope 2";
  return "Scope 3";
}

// --- Main Calculation ---
export function calculateEmissions(inputs: Record<string, number>): ActivityResult[] {
  const rows: ActivityResult[] = [];
  
  // Strict Order: S1 -> S2 -> S3 to match PDF requirements
  const order = [
    "natural_gas", "heating_oil", "propane", "diesel", "petrol", 
    "ref_R410A", "ref_R32", "ref_R134a",
    "electricity_fr", "district_heat", 
    "grey_fleet_avg", "flight_avg", "hotel_night_avg"
  ];

  order.forEach((key) => {
    const qty = inputs[key] || 0;
    if (qty > 0) {
      const factor = FACTORS[key];
      if (factor) {
        rows.push({
          scope: getScope(key),
          category: getCategory(key),
          activity: LABELS[key] || key,
          quantity: qty,
          unit: factor.unit.split("/")[1], // Extract unit from kgCO2e/Unit
          emissions: qty * factor.value,
          factorRef: factor.value,
          source: factor.source
        });
      }
    }
  });
  return rows;
}

export function summarizeEmissions(rows: ActivityResult[]): Totals {
  const s1 = rows.filter(r => r.scope === "Scope 1").reduce((acc, curr) => acc + curr.emissions, 0);
  const s2 = rows.filter(r => r.scope === "Scope 2").reduce((acc, curr) => acc + curr.emissions, 0);
  const s3 = rows.filter(r => r.scope === "Scope 3").reduce((acc, curr) => acc + curr.emissions, 0);
  return { scope1: s1, scope2: s2, scope3: s3, total: s1 + s2 + s3 };
}