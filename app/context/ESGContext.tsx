'use client';
import React, { createContext, useContext, useState } from 'react';

// 1. Define the shape of the data
interface ESGState {
  companyName: string;
  country: string;
  revenue: string;
  currency: string;
  gas: number;
  heatingOil: number;
  propane: number;
  diesel: number;
  petrol: number;
  r410a: number;
  r32: number;
  r134a: number;
  elec: number;
  districtHeat: number;
  vehicleKm: number;
  flightKm: number;
  hotelNights: number;
  signerName: string;
  files: string[]; 
}

// 2. Define the Functions (THIS IS WHAT WAS MISSING)
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
    signerName: '',
    files: []
  };

  const [data, setData] = useState<ESGState>(initialState);

  // 3. The Missing Function
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