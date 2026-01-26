'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js'; 
import { useESG } from '@/context/ESGContext';
import { calculateEmissions, summarizeEmissions } from '@/utils/calculations';
import { Loader2, CloudCheck, AlertCircle, DownloadCloud, Save } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function createClerkSupabaseClient(token: string) {
  return createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

export default function AutoSave() {
  const { companyData, setCompanyData, activityData, setActivityData } = useESG();
  const { getToken, userId, isLoaded } = useAuth();
  
  // Refs to capture state instantly
  const companyDataRef = useRef(companyData);
  const activityDataRef = useRef(activityData);

  useEffect(() => { companyDataRef.current = companyData; }, [companyData]);
  useEffect(() => { activityDataRef.current = activityData; }, [activityData]);

  const [status, setStatus] = useState<"idle" | "loading" | "saving" | "saved" | "error">("idle");
  const hasLoaded = useRef(false); 

  // --- 1. THE SMART LOADER ---
  useEffect(() => {
    const loadData = async () => {
      if (!isLoaded || !userId || hasLoaded.current) return;
      
      setStatus("loading");
      let localName = "";

      try {
        // A. LOAD BROWSER MEMORY (Step 1)
        const localBackup = localStorage.getItem(`esg_backup_${userId}`);
        if (localBackup) {
            const parsed = JSON.parse(localBackup);
            if (parsed.company && parsed.company.name) {
                console.log("⚡ Browser Memory says:", parsed.company.name);
                setCompanyData(parsed.company);
                if (parsed.activity) setActivityData(parsed.activity);
                localName = parsed.company.name; // Remember this!
            }
        }

        // B. CHECK CLOUD (Step 2)
        const token = await getToken({ template: 'supabase' });
        if (token) {
            const supabase = createClerkSupabaseClient(token);
            
            const { data: profile } = await supabase
                .from('profiles').select('*').eq('id', userId).maybeSingle();

            const dbName = profile?.company_name || "";

            // --- THE CONFLICT FIX ---
            // If DB is "EMPTY" (or blank), but Local has a Real Name...
            // IGNORE THE DB. Keep the Local Name.
            if ((!dbName || dbName === "EMPTY") && localName.length > 0) {
                 console.log("🛡️ BLOCKED empty Cloud overwrite. Keeping Local Data.");
                 // Do nothing. Keep Local.
            } 
            // Otherwise, if DB has real data, accept it.
            else if (dbName && dbName !== "EMPTY") {
                console.log("☁️ Cloud has real data. Syncing...", dbName);
                setCompanyData(prev => ({
                    ...prev,
                    name: profile.company_name,
                    industry: profile.industry || prev.industry,
                    country: profile.country || prev.country
                }));
            }

            // Load Assessment logic remains same...
            const { data: assess } = await supabase
                .from('assessments').select('*').eq('user_id', userId)
                .order('updated_at', { ascending: false }).limit(1).maybeSingle();

            if (assess) {
                 if (assess.activity_data) setActivityData(prev => ({ ...prev, ...assess.activity_data }));
                 if (assess.year) setCompanyData(prev => ({ ...prev, year: assess.year.toString() }));
            }
        }
        
      } catch (err) {
        console.error("Load Error:", err);
      } finally {
        hasLoaded.current = true;
        setStatus("idle");
      }
    };

    loadData();
  }, [isLoaded, userId, getToken, setCompanyData, setActivityData]);


  // --- 2. THE SAVER ---
  const saveData = useCallback(async () => {
    if (!userId || !hasLoaded.current) return; 
    
    setStatus("saving");

    try {
      const currentCompany = companyDataRef.current;
      const currentActivity = activityDataRef.current;

      // 1. SAVE LOCAL
      localStorage.setItem(`esg_backup_${userId}`, JSON.stringify({
          company: currentCompany,
          activity: currentActivity
      }));

      // 2. SAVE CLOUD
      const token = await getToken({ template: 'supabase' });
      if (!token) return; 
      const supabase = createClerkSupabaseClient(token);

      await supabase.from('profiles').upsert({
        id: userId,
        company_name: currentCompany.name || "EMPTY", // Only sends EMPTY if you actually typed nothing
        industry: currentCompany.industry || "General",
        country: currentCompany.country || "France",
        updated_at: new Date().toISOString()
      });

      // ... rest of save logic (assessments)
      const results = calculateEmissions(currentActivity);
      const totals = summarizeEmissions(results);
      await supabase.from('assessments').upsert({
        user_id: userId,
        year: parseInt(currentCompany.year) || 2024,
        activity_data: currentActivity,
        emissions_totals: totals,
        status: 'draft',
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id, year' });

      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);

    } catch (error) {
      console.error("Cloud Save Failed:", error);
      setStatus("saved"); // Local save worked
    }
  }, [userId, getToken]);


  // --- 3. TRIGGER ---
  useEffect(() => {
    if (!hasLoaded.current) return;
    const handler = setTimeout(() => saveData(), 1000);
    return () => clearTimeout(handler);
  }, [companyData, activityData, saveData]);


  if (status === 'idle') return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-xl border backdrop-blur-md ${
        status === 'error' ? 'bg-red-50 border-red-200 text-red-600' : 
        'bg-white/95 border-zinc-200 text-zinc-600'
      }`}>
        {status === 'loading' && <DownloadCloud size={14} className="animate-bounce text-blue-500" />}
        {status === 'saving' && <Loader2 size={14} className="animate-spin text-blue-500" />}
        {status === 'saved' && <Save size={16} className="text-emerald-500" />}
        <span className="text-xs font-bold tracking-wide">
            {status === 'loading' && "Restoring..."}
            {status === 'saving' && "Saving..."}
            {status === 'saved' && "Saved"}
        </span>
      </div>
    </div>
  );
}