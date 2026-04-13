// =============================================================================
// FILE: app/buyer/dashboard/settings/page.tsx
// PURPOSE: Phase 3.3 — Custom email template editor for buyers.
//          Replaces the "In Development" placeholder entirely.
//
// FEATURES:
//   - Subject + body editor with {{supplier_name}} and {{invite_link}} variables
//   - Live preview panel showing resolved output
//   - Saves to buyer_settings table (already in Supabase, no schema change)
//   - sendInviteEmail() in actions/buyer.ts picks this up automatically
//
// VARIABLES:
//   {{supplier_name}} → replaced with actual supplier name at send time
//   {{invite_link}}   → replaced with the actual assessment URL at send time
// =============================================================================

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Mail, Save, Loader2, CheckCircle2, RotateCcw, Eye, Pencil } from 'lucide-react';
import { getBuyerSettings, saveBuyerSettings } from '@/actions/buyer';

const DEFAULT_SUBJECT =
  'Action Required: Complete your carbon emissions declaration';

const DEFAULT_BODY = `Dear {{supplier_name}},

We are building a comprehensive picture of our supply chain carbon footprint as part of our CSRD Scope 3 compliance programme.

We kindly ask you to complete a short carbon emissions declaration using VSME OS. The process takes 15–30 minutes and you'll receive a GHG Protocol-compliant PDF report at the end.

Please click the link below to begin:
{{invite_link}}

If you have any questions, please reply to this email.

Thank you for your support.`;

const VARIABLE_CHIPS = [
  { variable: '{{supplier_name}}', description: "Supplier's name" },
  { variable: '{{invite_link}}',   description: 'Assessment URL' },
];

// ── Live preview of the email body ────────────────────────────────────────────
function PreviewPanel({ subject, body }: { subject: string; body: string }) {
  const resolvedSubject = subject
    .replace(/\{\{supplier_name\}\}/g, 'Acme Manufacturing')
    .replace(/\{\{invite_link\}\}/g, 'https://vsmeos.fr/supplier/hub');

  const resolvedBody = body
    .replace(/\{\{supplier_name\}\}/g, 'Acme Manufacturing')
    .replace(/\{\{invite_link\}\}/g, 'https://vsmeos.fr/supplier/hub?email=contact@acme.com');

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden text-sm">
      {/* Email chrome */}
      <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-gray-400 w-12">From</span>
          <span className="text-gray-700">VSME OS &lt;hello@vsmeos.fr&gt;</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-gray-400 w-12">To</span>
          <span className="text-gray-700">contact@acme.com</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-gray-400 w-12">Subject</span>
          <span className="font-semibold text-gray-900">{resolvedSubject || '(empty subject)'}</span>
        </div>
      </div>
      {/* Body */}
      <div className="bg-white px-5 py-5">
        <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
          {resolvedBody || '(empty body)'}
        </div>
        {/* CTA button preview */}
        {resolvedBody.includes('https://vsmeos.fr/supplier/hub') && (
          <div className="mt-5">
            <div
              style={{
                display: 'inline-block',
                background: '#0C2918',
                color: '#C9A84C',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              Open My Assessment →
            </div>
          </div>
        )}
      </div>
      <div className="bg-gray-50 border-t border-gray-200 px-5 py-2">
        <p className="text-[10px] text-gray-400">
          Preview uses placeholder values — actual names and links are inserted at send time
        </p>
      </div>
    </div>
  );
}

// ── Main settings page ────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [subject,     setSubject]     = useState(DEFAULT_SUBJECT);
  const [body,        setBody]        = useState(DEFAULT_BODY);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [activeTab,   setActiveTab]   = useState<'edit' | 'preview'>('edit');
  const [isDirty,     setIsDirty]     = useState(false);

  // Load saved settings on mount
  useEffect(() => {
    (async () => {
      try {
        const settings = await getBuyerSettings();
        if (settings) {
          if (settings.invite_email_subject) setSubject(settings.invite_email_subject);
          if (settings.invite_email_body)    setBody(settings.invite_email_body);
        }
      } catch (e) {
        console.error('Failed to load settings:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const result = await saveBuyerSettings(subject, body);
      if ('error' in result) {
        setError((result as { error: string }).error);
      } else {
        setSaved(true);
        setIsDirty(false);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) {
      setError('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  }, [subject, body]);

  const handleReset = useCallback(() => {
    setSubject(DEFAULT_SUBJECT);
    setBody(DEFAULT_BODY);
    setIsDirty(true);
    setSaved(false);
  }, []);

  function insertVariable(variable: string) {
    setBody(prev => prev + variable);
    setIsDirty(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Email Settings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Customise the invitation email your suppliers receive.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <RotateCcw size={14} />
            Reset to default
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-[#0C2918] text-[#C9A84C] hover:bg-[#122F1E] transition-colors disabled:opacity-50"
          >
            {saving ? (
              <><Loader2 size={14} className="animate-spin" /> Saving…</>
            ) : saved ? (
              <><CheckCircle2 size={14} /> Saved</>
            ) : (
              <><Save size={14} /> Save changes</>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {saved && !isDirty && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 flex items-center gap-2">
          <CheckCircle2 size={14} />
          Settings saved — your next invite emails will use this template.
        </div>
      )}

      {/* Variables reference */}
      <div className="bg-[#0C2918]/5 border border-[#0C2918]/15 rounded-xl px-5 py-4">
        <p className="text-xs font-bold text-[#0C2918] uppercase tracking-wider mb-3">
          Available variables — click to insert at cursor
        </p>
        <div className="flex flex-wrap gap-2">
          {VARIABLE_CHIPS.map(({ variable, description }) => (
            <button
              key={variable}
              onClick={() => insertVariable(variable)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#0C2918]/20 text-xs font-mono text-[#0C2918] hover:bg-[#0C2918] hover:text-[#C9A84C] transition-colors"
              title={`Insert ${description}`}
            >
              {variable}
              <span className="font-sans font-normal text-gray-400 hover:text-[#C9A84C]/70 text-[10px]">
                — {description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Editor card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

        {/* Tab bar */}
        <div className="flex border-b border-gray-200">
          {(['edit', 'preview'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-[#0C2918] text-[#0C2918]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab === 'edit' ? <Pencil size={14} /> : <Eye size={14} />}
              {tab === 'edit' ? 'Edit Template' : 'Preview'}
            </button>
          ))}
          <div className="flex items-center ml-auto px-6">
            <div className="flex items-center gap-1.5">
              <Mail size={13} className="text-gray-400" />
              <span className="text-xs text-gray-400">Sent from hello@vsmeos.fr</span>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {activeTab === 'edit' ? (
            <div className="space-y-5">
              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => { setSubject(e.target.value); setIsDirty(true); setSaved(false); }}
                  placeholder="Email subject line…"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0C2918]/30 focus:border-[#0C2918] transition"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Variables like {'{{supplier_name}}'} work here too.
                </p>
              </div>

              {/* Body */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Email Body
                </label>
                <textarea
                  value={body}
                  onChange={e => { setBody(e.target.value); setIsDirty(true); setSaved(false); }}
                  rows={14}
                  placeholder="Write your email body here…"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 font-mono leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-[#0C2918]/30 focus:border-[#0C2918] transition"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Plain text. An "Open My Assessment" button with {'{{invite_link}}'} will be added automatically at the bottom if the link is not already in the body.
                </p>
              </div>
            </div>
          ) : (
            <PreviewPanel subject={subject} body={body} />
          )}
        </div>
      </div>

    </div>
  );
}