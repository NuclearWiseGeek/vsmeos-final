'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import { useESG } from '@/context/ESGContext';
import { Building2, ArrowRight, Loader2 } from 'lucide-react';

// Use a single Supabase instance helper if possible, or create locally
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function createClerkSupabaseClient(token: string) {
  return createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

export default function CompanyOnboarding() {
  const { companyData, setCompanyData } = useESG();
  const { getToken, userId, isLoaded } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  // 1. Check if User has a Company Profile
  useEffect(() => {
    const checkProfile = async () => {
      // Don't run if not loaded or already checked
      if (!isLoaded || !userId || hasChecked) return;

      try {
        const token = await getToken({ template: 'supabase' });
        if (!token) return;
        const supabase = createClerkSupabaseClient(token);

        // Check DB for existing name
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_name')
          .eq('id', userId)
          .maybeSingle();

        // LOGIC: If no name, or name is "EMPTY", FORCE OPEN MODAL
        if (!profile || !profile.company_name || profile.company_name === "EMPTY") {
          setIsOpen(true);
        } else {
          // Name exists? Load it into Context and stay closed.
          setCompanyData(prev => ({ ...prev, name: profile.company_name }));
          setIsOpen(false);
        }
      } catch (err) {
        console.error("Profile Check Error:", err);
      } finally {
        setHasChecked(true);
      }
    };

    checkProfile();
  }, [isLoaded, userId, getToken, setCompanyData, hasChecked]);

  // 2. Handle Creation (The "Forever Save")
  const handleCreateProfile = async () => {
    if (!nameInput.trim()) return;
    setIsSubmitting(true);

    try {
      const token = await getToken({ template: 'supabase' });
      if (!token) return;
      const supabase = createClerkSupabaseClient(token);

      // FORCE SAVE to Database
      const { error } = await supabase.from('profiles').upsert({
        id: userId,
        company_name: nameInput,
        updated_at: new Date().toISOString()
      });

      if (error) throw error;

      // Update Context immediately
      setCompanyData(prev => ({ ...prev, name: nameInput }));
      setIsOpen(false); // Close Modal

    } catch (err) {
      console.error("Creation Failed:", err);
      alert("Could not save company name. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-6 text-blue-600">
            <Building2 size={24} />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h2>
          <p className="text-gray-500 mb-8">
            To start your ESG assessment, please register your organization's legal name.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-2">
                Company Legal Name
              </label>
              <input 
                type="text"
                autoFocus
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Tesla Inc."
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl font-medium text-lg focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
              />
            </div>

            <button 
              onClick={handleCreateProfile}
              disabled={!nameInput.trim() || isSubmitting}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>Creating Workspace <Loader2 className="animate-spin" /></>
              ) : (
                <>Get Started <ArrowRight size={18} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}