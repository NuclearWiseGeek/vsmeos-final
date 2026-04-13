// =============================================================================
// FILE: app/onboarding/page.tsx
// PURPOSE: Role selection screen. Shown to any user who has no role set yet.
//          They pick "Buyer" or "Supplier" — saved to profiles.role.
//          Middleware then redirects them correctly on all future logins.
// =============================================================================

'use client';

import { useState } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/utils/supabase';
import { Building2, Truck, ArrowRight, Loader2 } from 'lucide-react';
import VsmeLogo from '@/components/VsmeLogo';

export default function OnboardingPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [selected, setSelected] = useState<'buyer' | 'supplier' | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleContinue() {
    if (!selected || !user) return;
    setSaving(true);
    setError(null);

    try {
      const token = await getToken({ template: 'supabase' });
      if (!token) throw new Error('No auth token');

      const supabase = createSupabaseClient(token);

      // Save role to profiles table
      const { error: dbError } = await supabase
        .from('profiles')
        .upsert({
          id:         user.id,
          role:       selected,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (dbError) throw new Error(dbError.message);

      // Redirect based on role
      if (selected === 'buyer') {
        router.push('/buyer/dashboard');
      } else {
        router.push('/supplier');
      }
    } catch (err: any) {
      setError('Something went wrong. Please try again.');
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">

      {/* Logo */}
      <div className="mb-10">
        <VsmeLogo />
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 sm:p-10 w-full max-w-lg">

        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Welcome to VSME OS
        </h1>
        <p className="text-sm text-gray-500 text-center mb-8">
          Tell us how you'll be using VSME OS so we can set up the right experience for you.
        </p>

        {/* Role options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">

          {/* Buyer */}
          <button
            onClick={() => setSelected('buyer')}
            className={`relative p-6 rounded-xl border-2 text-left transition-all ${
              selected === 'buyer'
                ? 'border-[#0C2918] bg-[#0C2918]/5'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            {selected === 'buyer' && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#0C2918] flex items-center justify-center">
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            )}
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${
              selected === 'buyer' ? 'bg-[#0C2918]' : 'bg-gray-100'
            }`}>
              <Building2 size={20} className={selected === 'buyer' ? 'text-[#C9A84C]' : 'text-gray-500'} />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">I'm a Buyer</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              I need carbon data from my suppliers for CSRD Scope 3 compliance.
            </p>
          </button>

          {/* Supplier */}
          <button
            onClick={() => setSelected('supplier')}
            className={`relative p-6 rounded-xl border-2 text-left transition-all ${
              selected === 'supplier'
                ? 'border-[#0C2918] bg-[#0C2918]/5'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            {selected === 'supplier' && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#0C2918] flex items-center justify-center">
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            )}
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${
              selected === 'supplier' ? 'bg-[#0C2918]' : 'bg-gray-100'
            }`}>
              <Truck size={20} className={selected === 'supplier' ? 'text-[#C9A84C]' : 'text-gray-500'} />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">I'm a Supplier</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              I've been asked to complete a carbon emissions declaration for a buyer.
            </p>
          </button>

        </div>

        {error && (
          <p className="text-sm text-red-600 text-center mb-4">{error}</p>
        )}

        {/* Continue button */}
        <button
          onClick={handleContinue}
          disabled={!selected || saving}
          className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm bg-[#0C2918] text-[#C9A84C] hover:bg-[#122F1E] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? (
            <><Loader2 size={16} className="animate-spin" /> Setting up your account...</>
          ) : (
            <>Continue <ArrowRight size={16} /></>
          )}
        </button>

      </div>

      <p className="text-xs text-gray-400 mt-6 text-center">
        You can always contact us at hello@vsmeos.fr if you need to change your account type.
      </p>

    </div>
  );
}