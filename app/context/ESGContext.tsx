'use client';

import React, { createContext, useContext, useState } from 'react';
import { useUser } from '@clerk/nextjs';

// --- Types ---
interface CompanyData {
    name: string;
    country: string;
    industry: string; 
    revenue: number;
    currency: string;
    year: string;          
    financialYear: string; 
    signer: string;        
}

interface ESGContextType {
  companyData: CompanyData;
  setCompanyData: React.Dispatch<React.SetStateAction<CompanyData>>;
  activityData: Record<string, any>;
  setActivityData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  updateActivity: (key: string, value: number) => void;
  resetAssessment: () => void;
  isSaving: boolean;
}

const ESGContext = createContext<ESGContextType | undefined>(undefined);

// --- Provider Component ---
export function ESGProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser(); 
  
  // 1. State: Company Profile
  const initialCompanyState = { 
      name: '', 
      country: 'France', 
      industry: '', 
      revenue: 0, 
      currency: 'EUR',
      year: new Date().getFullYear().toString(),
      financialYear: `FY ${new Date().getFullYear()}`, 
      signer: ''
  };

  const [companyData, setCompanyData] = useState<CompanyData>(initialCompanyState);
  const [activityData, setActivityData] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);

  // --- Logic: Reset ---
  const resetAssessment = () => {
      if (confirm("Are you sure you want to start a new assessment? All current data will be cleared.")) {
          setCompanyData(initialCompanyState);
          setActivityData({});
      }
  };

  const updateActivity = (key: string, value: number) => {
    setActivityData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <ESGContext.Provider value={{ 
        companyData, setCompanyData, 
        activityData, setActivityData, 
        updateActivity, resetAssessment, isSaving 
    }}>
      {children}
    </ESGContext.Provider>
  );
}

export const useESG = () => {
  const context = useContext(ESGContext);
  if (!context) throw new Error("useESG must be used within an ESGProvider");
  return context;
};