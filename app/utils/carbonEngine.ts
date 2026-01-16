export type ScopeCategory = 'Scope 1' | 'Scope 2' | 'Scope 3';

export interface ActivityInput {
  id: string;
  label: string;
  value: number;
  unit: string;
  category: ScopeCategory;
}

// 1. The Emission Factors (Ported exactly from your Python `FACTORS`)
export const EMISSION_FACTORS: Record<string, { value: number; unit: string; source: string }> = {
  // Scope 1
  natural_gas: { value: 0.244, unit: "kgCO2e/kWh", source: "ADEME" },
  heating_oil: { value: 3.2, unit: "kgCO2e/L", source: "ADEME" },
  propane: { value: 3.1, unit: "kgCO2e/kg", source: "ADEME" },
  diesel: { value: 3.16, unit: "kgCO2e/L", source: "ADEME" },
  petrol: { value: 2.8, unit: "kgCO2e/L", source: "ADEME" },
  ref_R410A: { value: 2088, unit: "kgCO2e/kg", source: "ADEME" },
  ref_R32: { value: 675, unit: "kgCO2e/kg", source: "ADEME" },
  ref_R134a: { value: 1430, unit: "kgCO2e/kg", source: "ADEME" },
  // Scope 2
  electricity_fr: { value: 0.052, unit: "kgCO2e/kWh", source: "ADEME" },
  district_heat: { value: 0.170, unit: "kgCO2e/kWh", source: "ADEME" },
  // Scope 3
  grey_fleet_avg: { value: 0.218, unit: "kgCO2e/km", source: "ADEME" },
  flight_avg: { value: 0.14, unit: "kgCO2e/km", source: "ADEME" },
  hotel_night_avg: { value: 6.9, unit: "kgCO2e/night", source: "ADEME" },
};

// 2. The Calculation Logic
export function calculateFootprint(inputs: Record<string, number>) {
  let total = 0;
  let scope1 = 0;
  let scope2 = 0;
  let scope3 = 0;
  const breakdown: any[] = [];

  // Helper to process one item
  const processItem = (key: string, label: string, scope: ScopeCategory, unit: string) => {
    const qty = inputs[key] || 0;
    if (qty > 0) {
      const factor = EMISSION_FACTORS[key];
      const emissions = qty * factor.value;
      
      total += emissions;
      if (scope === 'Scope 1') scope1 += emissions;
      if (scope === 'Scope 2') scope2 += emissions;
      if (scope === 'Scope 3') scope3 += emissions;

      breakdown.push({
        scope,
        activity: label,
        quantity: qty,
        unit,
        emissions,
        factor: factor.value
      });
    }
  };

  // Run all inputs (Matching your Python order)
  processItem('natural_gas', 'Natural Gas', 'Scope 1', 'kWh');
  processItem('heating_oil', 'Heating Oil', 'Scope 1', 'L');
  processItem('propane', 'Propane', 'Scope 1', 'kg');
  processItem('diesel', 'Fleet Diesel', 'Scope 1', 'L');
  processItem('petrol', 'Fleet Petrol', 'Scope 1', 'L');
  processItem('ref_R410A', 'Refrigerant R410A', 'Scope 1', 'kg');
  
  processItem('electricity_fr', 'Electricity', 'Scope 2', 'kWh');
  processItem('district_heat', 'District Heating', 'Scope 2', 'kWh');
  
  processItem('grey_fleet_avg', 'Employee Vehicles', 'Scope 3', 'km');
  processItem('flight_avg', 'Business Flights', 'Scope 3', 'km');
  processItem('hotel_night_avg', 'Hotel Nights', 'Scope 3', 'nights');

  return { total, scope1, scope2, scope3, breakdown };
}