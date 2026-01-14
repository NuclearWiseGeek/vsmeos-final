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

  // 1. LOAD DATA (Runs once when app starts)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // First, try to load from LocalStorage (Fastest)
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

  // 2. AUTO-SAVE (Runs every time 'data' changes)
  useEffect(() => {
    if (isLoaded) {
      // A. Save to Local Browser Memory (Instant)
      localStorage.setItem('vsme_esg_data', JSON.stringify(data));

      // B. Save to Cloud Database (Debounced - Waits 2 seconds)
      const timeoutId = setTimeout(async () => {
        try {
          // This calls the API route we just made in Step 3
          await fetch('/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          // Optional: You can uncomment this to see it working in the console
          // console.log("☁️ Data synced to Supabase");
        } catch (err) {
          console.error("Cloud save failed", err);
        }
      }, 2000); // Waits 2000ms (2 seconds) after you stop typing

      // Cleanup: If you type again before 2 seconds, cancel the previous save
      return () => clearTimeout(timeoutId);
    }
  }, [data, isLoaded]);

  // 3. RESET DATA
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