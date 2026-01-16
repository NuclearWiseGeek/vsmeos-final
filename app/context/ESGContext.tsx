'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';

// --- Configuration ---
// We initialize the Supabase client here.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- Types ---
// Explicitly defining the structure of our Company Data
interface CompanyData {
    name: string;
    country: string;
    revenue: number;
    currency: string;
    year: string;          // Reporting Calendar Year
    financialYear: string; // Fiscal Year (FY)
    signer: string;        // Person authenticating the report
}

// The Shape of the Context Object
interface ESGContextType {
  companyData: CompanyData;
  setCompanyData: React.Dispatch<React.SetStateAction<CompanyData>>;
  
  activityData: Record<string, number>;
  updateActivity: (key: string, value: number) => void;
  
  // New function to clear everything for a new assessment
  resetAssessment: () => void;
  
  isSaving: boolean;
}

// Create the Context with an undefined initial state
const ESGContext = createContext<ESGContextType | undefined>(undefined);

// --- Provider Component ---
export function ESGProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser(); // Access the logged-in user from Clerk
  
  // 1. State: Company Profile
  const initialCompanyState = { 
      name: '', 
      country: 'France', 
      revenue: 0, 
      currency: 'EUR',
      year: new Date().getFullYear().toString(),
      financialYear: `FY ${new Date().getFullYear()}`, 
      signer: ''
  };

  const [companyData, setCompanyData] = useState<CompanyData>(initialCompanyState);
  
  // 2. State: Activity Data (The raw numbers)
  const [activityData, setActivityData] = useState<Record<string, number>>({});
  
  // 3. State: UI Loading Status
  const [isSaving, setIsSaving] = useState(false);

  // --- Logic: Reset ---
  const resetAssessment = () => {
      if (confirm("Are you sure you want to start a new assessment? All current data will be cleared.")) {
          setCompanyData(initialCompanyState);
          setActivityData({});
          // Optional: Clear Supabase or LocalStorage here if we add that later
      }
  };

  // --- Logic: Auto-Save ---
  useEffect(() => {
    const saveData = async () => {
      // We only attempt to save if the user has at least started (Company Name exists)
      // and if they are logged in (user exists).
      if (companyData.name && user) {
        setIsSaving(true);
        try {
            console.log("--------------------------------");
            console.log("AUTO-SAVE TRIGGERED");
            console.log("User:", user.id);
            console.log("Payload:", { companyData, activityData });
            console.log("--------------------------------");
            
            // --- DATABASE SYNC (Placeholder for future) ---
            /*
            const { error } = await supabase.from('assessments').upsert({
                user_id: user.id,
                company_name: companyData.name,
                payload: { 
                    company: companyData, 
                    activity: activityData,
                    last_updated: new Date().toISOString() 
                }
            }, { onConflict: 'user_id' });
            */

        } catch (err) {
            console.error("Unexpected error during auto-save:", err);
        } finally {
            setTimeout(() => setIsSaving(false), 800);
        }
      }
    };

    const handler = setTimeout(saveData, 2000); // Debounce 2s
    return () => clearTimeout(handler);
  }, [companyData, activityData, user]);

  // --- Helper: Update a single activity field ---
  const updateActivity = (key: string, value: number) => {
    setActivityData(prev => ({ 
        ...prev, 
        [key]: value 
    }));
  };

  return (
    <ESGContext.Provider value={{ companyData, setCompanyData, activityData, updateActivity, resetAssessment, isSaving }}>
      {children}
    </ESGContext.Provider>
  );
}

// --- Hook: Custom Accessor ---
export const useESG = () => {
  const context = useContext(ESGContext);
  if (!context) throw new Error("useESG must be used within an ESGProvider");
  return context;
};