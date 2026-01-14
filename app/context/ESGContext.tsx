'use client';
import React, { createContext, useContext, useState } from 'react';

interface ESGState {
  companyName: string;
  country: string;
  revenue: string;
  currency: string;
  // Scope 1
  gas: number;
  heatingOil: number; // NEW
  propane: number;    // NEW
  diesel: number;
  petrol: number;
  r410a: number;      // NEW
  r32: number;        // NEW
  r134a: number;      // NEW
  // Scope 2
  elec: number;
  districtHeat: number;
  // Scope 3
  vehicleKm: number;
  flightKm: number;
  hotelNights: number;
  // Signer
  signerName: string;
}

const ESGContext = createContext<{
  data: ESGState;
  setData: React.Dispatch<React.SetStateAction<ESGState>>;
} | null>(null);

export function ESGProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<ESGState>({
    companyName: '',
    country: 'France',
    revenue: '',
    currency: 'EUR',
    gas: 0,
    heatingOil: 0,
    propane: 0,
    diesel: 0,
    petrol: 0,
    r410a: 0,
    r32: 0,
    r134a: 0,
    elec: 0,
    districtHeat: 0,
    vehicleKm: 0,
    flightKm: 0,
    hotelNights: 0,
    signerName: ''
  });

  return (
    <ESGContext.Provider value={{ data, setData }}>
      {children}
    </ESGContext.Provider>
  );
}

export const useESG = () => {
  const context = useContext(ESGContext);
  if (!context) throw new Error('useESG must be used within an ESGProvider');
  return context;
};