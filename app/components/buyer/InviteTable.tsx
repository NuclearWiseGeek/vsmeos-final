// =============================================================================
// FILE: components/buyer/InviteTable.tsx
// PURPOSE: Displays supplier invites with real-time updates via Supabase.
//
// RESPONSIVE:
//   Desktop (md+)  → Standard table with columns
//   Mobile (<md)   → Card layout per supplier (no horizontal scroll)
//
// REAL-TIME: Supabase postgres_changes subscription updates status badges
//            live as suppliers progress through their assessment.
// =============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Trash2, Pencil, Check, X, Loader2, Send, CheckCircle2 } from 'lucide-react';
import { deleteSupplier, updateSupplier, sendInviteEmail } from '@/actions/buyer';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ── Status badge component (reused in both mobile + desktop) ──────
function StatusBadge({ status }: { status: string }) {
  if (status === 'sent') return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Invite Sent
    </span>
  );
  if (status === 'in_progress') return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
      <Loader2 size={10} className="animate-spin" /> In Progress
    </span>
  );
  if (status === 'completed') return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
      <CheckCircle2 size={12} /> Report Ready
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
      <div className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Draft
    </span>
  );
}

export default function InviteTable({ suppliers: initialSuppliers }: { suppliers: any[] }) {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [sentSuccessId, setSentSuccessId] = useState<string | null>(null);

  // ── Real-time subscription ────────────────────────────────────────
  useEffect(() => {
    setSuppliers(initialSuppliers);

    const channel = supabase
      .channel('public-invites')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'supplier_invites' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setSuppliers((current) => current.map((s) => s.id === payload.new.id ? { ...s, ...payload.new } : s));
          router.refresh();
        }
        if (payload.eventType === 'INSERT') {
          setSuppliers((current) => [payload.new, ...current]);
        }
        if (payload.eventType === 'DELETE') {
          setSuppliers((current) => current.filter((s) => s.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [initialSuppliers, router]);

  // ── Handlers ──────────────────────────────────────────────────────
  const startEdit = (s: any) => { setEditingId(s.id); setEditName(s.supplier_name); setEditEmail(s.supplier_email); };
  const cancelEdit = () => { setEditingId(null); setEditName(''); setEditEmail(''); };

  const handleSave = async (id: string) => {
    setLoadingId(id); await updateSupplier(id, editName, editEmail); setLoadingId(null); setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this supplier?')) return;
    setLoadingId(id); await deleteSupplier(id); setLoadingId(null);
  };

  const handleSendEmail = async (id: string, email: string, name: string) => {
    setSendingId(id);
    const result = await sendInviteEmail(id, email, name);
    setSendingId(null);
    if (result.success) { setSentSuccessId(id); setTimeout(() => setSentSuccessId(null), 3000); }
    else { alert("Failed to send email"); }
  };

  // ── Action buttons (reused in both layouts) ───────────────────────
  function ActionButtons({ s }: { s: any }) {
    const isLoading = loadingId === s.id;
    const isEditing = editingId === s.id;
    const isSending = sendingId === s.id;
    const isSentRecently = sentSuccessId === s.id;

    if (isLoading) return <Loader2 className="animate-spin text-blue-600" size={18} />;
    if (isEditing) return (
      <div className="flex items-center gap-2">
        <button onClick={() => handleSave(s.id)} className="text-emerald-600 hover:bg-emerald-50 p-1.5 rounded-md transition-colors"><Check size={18} /></button>
        <button onClick={cancelEdit} className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-md transition-colors"><X size={18} /></button>
      </div>
    );
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleSendEmail(s.id, s.supplier_email, s.supplier_name)}
          disabled={isSending || isSentRecently || s.status === 'completed' || s.status === 'in_progress'}
          className={`p-2 rounded-full transition-colors ${
            isSentRecently || s.status === 'sent' ? 'text-emerald-600 bg-emerald-50' : 'text-blue-600 hover:bg-blue-50'
          } ${s.status === 'completed' ? 'opacity-30 cursor-not-allowed' : ''}`}
          title="Send Invite Email"
        >
          {isSending ? <Loader2 className="animate-spin" size={16} /> : (s.status === 'sent' ? <CheckCircle2 size={16} /> : <Send size={16} />)}
        </button>
        <button onClick={() => startEdit(s)} className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-colors"><Pencil size={16} /></button>
        <button onClick={() => handleDelete(s.id)} className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors"><Trash2 size={16} /></button>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────
  if (!suppliers || suppliers.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-14 text-center mt-6">
        <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Send size={22} className="text-gray-300" />
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-2">No suppliers yet</h3>
        <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
          Add suppliers manually or upload a CSV file above to start collecting their carbon reports.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">

      {/* ── DESKTOP TABLE (hidden on mobile) ───────────────────── */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[640px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Supplier Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {suppliers.map((s) => {
                const isEditing = editingId === s.id;
                return (
                  <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {isEditing ? (
                        <input className="border border-gray-300 rounded-lg px-3 py-1.5 w-full text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={editName} onChange={(e) => setEditName(e.target.value)} />
                      ) : s.supplier_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {isEditing ? (
                        <input className="border border-gray-300 rounded-lg px-3 py-1.5 w-full text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                      ) : s.supplier_email}
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={s.status || 'draft'} /></td>
                    <td className="px-6 py-4 text-right"><ActionButtons s={s} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MOBILE CARD LIST (hidden on desktop) ───────────────── */}
      <div className="md:hidden space-y-3">
        {suppliers.map((s) => {
          const isEditing = editingId === s.id;
          return (
            <div key={s.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <input className="border border-gray-300 rounded-lg px-3 py-1.5 w-full text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none mb-2" value={editName} onChange={(e) => setEditName(e.target.value)} />
                  ) : (
                    <p className="font-semibold text-gray-900 truncate">{s.supplier_name}</p>
                  )}
                  {isEditing ? (
                    <input className="border border-gray-300 rounded-lg px-3 py-1.5 w-full text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                  ) : (
                    <p className="text-sm text-gray-500 truncate">{s.supplier_email}</p>
                  )}
                </div>
                <div className="ml-3 flex-shrink-0">
                  <ActionButtons s={s} />
                </div>
              </div>
              <StatusBadge status={s.status || 'draft'} />
            </div>
          );
        })}
      </div>
    </div>
  );
}