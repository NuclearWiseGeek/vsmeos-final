'use client';
import React, { createContext, useContext, useState } from 'react';

interface ESGState {
  companyName: string;
  country: string;
  revenue: string;
  currency: string;
  gas: number;
  diesel: number;
  petrol: number;
  elec: number;
  districtHeat: number;
  vehicleKm: number;
  flightKm: number;
  hotelNights: number;
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
    diesel: 0,
    petrol: 0,
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