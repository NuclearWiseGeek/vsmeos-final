'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

// ALL numerical fields are STRINGS to allow formatting (e.g. "1,000.00")
interface ESGState {
  companyName: string;
  country: string;
  revenue: string;
  currency: string;
  // Scope 1
  gas: string; heatingOil: string; propane: string;
  diesel: string; petrol: string;
  r410a: string; r32: string; r134a: string;
  // Scope 2
  elec: string; districtHeat: string;
  // Scope 3
  vehicleKm: string; flightKm: string; hotelNights: string;
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
    companyName: '', country: 'France', revenue: '', currency: 'EUR',
    gas: '', heatingOil: '', propane: '', diesel: '', petrol: '',
    r410a: '', r32: '', r134a: '', elec: '', districtHeat: '',
    vehicleKm: '', flightKm: '', hotelNights: '', signerName: '', files: []
  };

  const [data, setData] = useState<ESGState>(initialState);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. LOAD DATA (Cloud First Strategy)
  useEffect(() => {
    async function loadData() {
      // A. Try LocalStorage first (Fast preview)
      const savedLocal = localStorage.getItem('vsme_esg_data');
      if (savedLocal) setData(JSON.parse(savedLocal));

      // B. Fetch Real Data from Cloud (The Truth)
      try {
        const response = await fetch('/api/sync');
        if (response.ok) {
          const cloudData = await response.json();
          if (cloudData) {
            setData(cloudData); // Update app with cloud data
            localStorage.setItem('vsme_esg_data', JSON.stringify(cloudData)); // Sync local
          }
        }
      } catch (err) {
        console.error("Failed to load cloud data", err);
      }
      setIsLoaded(true);
    }
    loadData();
  }, []);

  // 2. AUTO-SAVE (Runs when you type)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('vsme_esg_data', JSON.stringify(data));

      const timeoutId = setTimeout(async () => {
        try {
          await fetch('/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
        } catch (err) {
          console.error("Cloud save failed", err);
        }
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [data, isLoaded]);

  const resetData = () => {
    setData(initialState);
    if (typeof window !== 'undefined') localStorage.removeItem('vsme_esg_data');
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