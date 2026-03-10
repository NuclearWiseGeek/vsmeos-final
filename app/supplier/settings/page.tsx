// =============================================================================
// FILE: app/supplier/settings/page.tsx
// PURPOSE: Workspace Settings — allows the supplier to update their company
//          name, notification preferences, and manage their account.
//
// FIXES IN THIS VERSION:
//   - Fixed typo: back link was "/suppliyer" (404) → now "/supplier" ✓
//   - Save button now actually writes to Supabase via saveToSupabase()
//   - Added danger zone: reset assessment data
//   - Added account info section (read-only Clerk data)
//
// WHEN TO MODIFY:
//   - Phase 3: Add notification preferences (email on buyer request, etc.)
//   - Phase 4: Add OCR preferences, default currency per user
//   - Phase 5: Add reduction target settings
//
// DEPENDENCIES:
//   - ESGContext (useESG) — companyData, setCompanyData, saveToSupabase, resetAssessment
//   - Clerk (useUser) — for displaying account email / name
// =============================================================================

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useESG } from '@/context/ESGContext';
import { useUser } from '@clerk/nextjs';
import {
  ArrowLeft, Building2, Save, CheckCircle2,
  User, AlertTriangle, Loader2, Shield
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { companyData, setCompanyData, saveToSupabase, resetAssessment } = useESG();
  const { user } = useUser();
  const router = useRouter();

  // UI state
  const [isSaving, setIsSaving]   = useState(false);
  const [isSaved,  setIsSaved]    = useState(false);
  const [saveError, setSaveError] = useState(false);

  // Local copy of name so we don't update context on every keystroke
  const [nameInput, setNameInput] = useState(companyData.name || '');

  // =============================================================================
  // SAVE HANDLER — writes to Supabase then shows success/error state
  // =============================================================================
  const handleSave = async () => {
    if (!nameInput.trim() || nameInput.trim().length < 2) return;

    setIsSaving(true);
    setSaveError(false);

    try {
      // 1. Update the context with the new name
      setCompanyData(prev => ({ ...prev, name: nameInput.trim() }));

      // 2. Persist to Supabase (profiles + assessments table)
      await saveToSupabase();

      // 3. Show success state briefly, then redirect back to supplier profile
      setIsSaved(true);
      setTimeout(() => {
        router.push('/supplier'); // ← FIXED: was "/suppliyer" (typo → 404)
      }, 800);

    } catch (err) {
      console.error('[VSME OS] Settings save failed:', err);
      setSaveError(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">

      {/* ================================================================
          HEADER
          ================================================================ */}
      <div className="flex items-center gap-4 mb-8">
        {/* FIXED: back link was "/suppliyer" — now correctly "/supplier" */}
        <Link
          href="/supplier"
          className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          title="Back to profile"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workspace Settings</h1>
          <p className="text-sm text-gray-500">
            Manage your company profile and account preferences.
          </p>
        </div>
      </div>

      <div className="space-y-6">

        {/* ================================================================
            SECTION 1: ACCOUNT INFO (Read-only — from Clerk)
            ================================================================ */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <User size={16} className="text-gray-400" />
              <h3 className="font-semibold text-gray-900">Account Information</h3>
            </div>
          </div>

          <div className="p-8 space-y-4">

            {/* User's full name from Clerk */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400">
                Full Name
              </label>
              <p className="text-sm font-medium text-gray-700">
                {user?.fullName || user?.firstName || '—'}
              </p>
            </div>

            {/* Email from Clerk */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400">
                Email Address
              </label>
              <p className="text-sm font-medium text-gray-700">
                {user?.emailAddresses?.[0]?.emailAddress || '—'}
              </p>
            </div>

            {/* Account created date */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400">
                Account Created
              </label>
              <p className="text-sm font-medium text-gray-700">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })
                  : '—'}
              </p>
            </div>

            <p className="text-[10px] text-gray-400 pt-2">
              To change your email or password, use the account menu (top right of the dashboard).
            </p>
          </div>
        </div>

        {/* ================================================================
            SECTION 2: ORGANISATION IDENTITY
            The one field that is editable here — company name.
            Other profile fields (country, industry, year) are edited on
            the main /supplier profile page.
            ================================================================ */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Building2 size={16} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900">Organisation Identity</h3>
            </div>
          </div>

          <div className="p-8 space-y-6">

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">
                Legal Company Name
              </label>
              <p className="text-xs text-gray-400">
                This is the official name that appears on all generated PDF reports.
                Make sure it matches your legal registration exactly.
              </p>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => {
                  setNameInput(e.target.value);
                  setIsSaved(false);
                  setSaveError(false);
                }}
                className="w-full p-4 bg-white border border-gray-200 rounded-lg font-bold text-gray-900 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                placeholder="e.g. Dupont Industries SAS"
              />
            </div>

            {/* Current profile summary — links to full profile for other edits */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 leading-relaxed">
                <span className="font-bold text-gray-700">Current profile:</span>{' '}
                {companyData.country && <span>📍 {companyData.country}</span>}
                {companyData.industry && <span> · {companyData.industry}</span>}
                {companyData.year && <span> · FY {companyData.year}</span>}
                {companyData.currency && <span> · {companyData.currency}</span>}
                {' '}
                <Link href="/supplier" className="text-blue-600 hover:underline font-medium">
                  Edit full profile →
                </Link>
              </p>
            </div>

            {/* Error message */}
            {saveError && (
              <p className="text-xs text-red-600 font-medium">
                ⚠️ Failed to save. Please try again or check your connection.
              </p>
            )}

            {/* Action buttons */}
            <div className="flex justify-end gap-3">
              <Link
                href="/supplier"
                className="px-6 py-3 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </Link>
              <button
                onClick={handleSave}
                disabled={isSaving || nameInput.trim().length < 2}
                className={`flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-white text-sm transition-all shadow-lg active:scale-95 ${
                  isSaved
                    ? 'bg-green-600 shadow-green-200'
                    : nameInput.trim().length >= 2
                    ? 'bg-black hover:bg-gray-800 shadow-gray-200'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                }`}
              >
                {isSaving ? (
                  <><Loader2 size={16} className="animate-spin" /> Saving...</>
                ) : isSaved ? (
                  <><CheckCircle2 size={16} /> Saved!</>
                ) : (
                  <><Save size={16} /> Update Profile</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ================================================================
            SECTION 3: DATA & PRIVACY
            ================================================================ */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Shield size={16} className="text-gray-400" />
              <h3 className="font-semibold text-gray-900">Data & Privacy</h3>
            </div>
          </div>

          <div className="p-8 space-y-3">
            <p className="text-xs text-gray-500 leading-relaxed">
              Your assessment data is stored securely in our EU-based database (Supabase,
              Frankfurt region). Data is encrypted at rest and in transit.
              Your emission data is never shared with third parties without your explicit consent.
            </p>
            <div className="flex gap-4 pt-2">
              <Link href="/privacy" className="text-xs text-blue-600 hover:underline font-medium">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-xs text-blue-600 hover:underline font-medium">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        {/* ================================================================
            SECTION 4: DANGER ZONE — Reset Assessment
            Placed last and styled in red so it's clearly destructive.
            Uses the resetAssessment() function from ESGContext which
            has a confirm() dialog guard before clearing anything.
            ================================================================ */}
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-red-50">
            <div className="flex items-center gap-3">
              <AlertTriangle size={16} className="text-red-500" />
              <h3 className="font-semibold text-red-700">Danger Zone</h3>
            </div>
          </div>

          <div className="p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-gray-900 mb-1">
                  Reset Assessment Data
                </p>
                <p className="text-xs text-gray-500">
                  Clears all Scope 1, 2, and 3 emission inputs. Your company profile
                  (name, country, industry) will be preserved. This cannot be undone.
                </p>
              </div>
              <button
                onClick={resetAssessment}
                className="flex-shrink-0 px-6 py-3 border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors"
              >
                Reset Assessment
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}