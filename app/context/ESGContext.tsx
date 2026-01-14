'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

// ALL numerical fields are STRINGS to allow formatting (e.g. "1,000.00")
interface ESGState {
  companyName: string;
  country: string;
  revenue: string;
  currency: string;
  // Scope 1 (Strings)
  gas: string;
  heatingOil: string;
  propane: string;
  diesel: string;
  petrol: string;
  r410a: string;
  r32: string;
  r134a: string;
  // Scope 2 (Strings)
  elec: string;
  districtHeat: string;
  // Scope 3 (Strings)
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
    // Initialize as empty strings
    gas: '', heatingOil: '', propane: '',
    diesel: '', petrol: '',
    r410a: '', r32: '', r134a: '',
    elec: '', districtHeat: '',
    vehicleKm: '', flightKm: '', hotelNights: '',
    signerName: '',
    files: []
  };

  const [data, setData] = useState<ESGState>(initialState);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. LOAD DATA ON MOUNT (Runs only once when app starts)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('vsme_esg_data');
      if (savedData) {
        try {
          setData(JSON.parse(savedData));
        } catch (error) {
          console.error("Error parsing saved data:", error);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // 2. AUTO-SAVE ON CHANGE (Runs every time 'data' changes)
  useEffect(() => {
    if (isLoaded) { // Only save after we have successfully loaded!
      localStorage.setItem('vsme_esg_data', JSON.stringify(data));
    }
  }, [data, isLoaded]);

  // 3. RESET DATA (Wipes memory and local storage)
  const resetData = () => {
    setData(initialState);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vsme_esg_data');
    }
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