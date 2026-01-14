'use client';
import React, { createContext, useContext, useState } from 'react';

// ALL numerical fields are now STRINGS to allow formatting (e.g. "1,000.00")
interface ESGState {
  companyName: string;
  country: string;
  revenue: string;
  currency: string;
  // Scope 1 (Strings now)
  gas: string;
  heatingOil: string;
  propane: string;
  diesel: string;
  petrol: string;
  r410a: string;
  r32: string;
  r134a: string;
  // Scope 2 (Strings now)
  elec: string;
  districtHeat: string;
  // Scope 3 (Strings now)
  vehicleKm: string;
  flightKm: string;
  hotelNights: string;
  // Signer
  signerName: string;
  files: string[]; 
}

interface ESGContextType {
  data: ESGState;
  setData: React.Dispatch<React.SetStateAction<ESGState>>;
  resetData: () => void;
}

const ESGContext = createContext<ESGContextType | null>(null);

export function ESGProvider({ children }: { children: React.ReactNode }) {
  const initialState: ESGState = {
    companyName: '',
    country: 'France',
    revenue: '',
    currency: 'EUR',
    // Initialize as empty strings or "0"
    gas: '', heatingOil: '', propane: '',
    diesel: '', petrol: '',
    r410a: '', r32: '', r134a: '',
    elec: '', districtHeat: '',
    vehicleKm: '', flightKm: '', hotelNights: '',
    signerName: '',
    files: []
  };

  const [data, setData] = useState<ESGState>(initialState);

  const resetData = () => {
    setData(initialState);
  };

  return (
    <ESGContext.Provider value={{ data, setData, resetData }}>
      {children}
    </ESGContext.Provider>
  );
}

export const useESG = () => {
  const context = useContext(ESGContext);
  if (!context) throw new Error('useESG must be used within an ESGProvider');
  return context;
};