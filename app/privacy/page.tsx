// =============================================================================
// FILE: app/privacy/page.tsx
// PURPOSE: GDPR-compliant Privacy Policy.
//          Required by EU GDPR because VSME OS collects personal data
//          (name, email, company data, files) processed in EU-hosted Supabase.
//
// LEGAL BASIS: GDPR Articles 13 & 14 — inform users what data is collected,
//              why, where stored, how long, who it's shared with, their rights.
//
// GOVERNING LAW: France (CNIL) + EU GDPR
// UPDATE WHEN: Adding new third-party services, changing data retention,
//              adding new data collection features (e.g. OCR in Phase 4)
// =============================================================================


// Required: prevents static prerendering so Clerk context is available
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import SharedNav from '@/components/SharedNav';
import { ArrowLeft, Shield } from 'lucide-react';

const LAST_UPDATED  = '22 March 2026';
const CONTACT_EMAIL = 'privacy@vsmeos.fr';
// NOTE: Update to 'VSME OS SAS' + add SIRET once incorporation is complete
const COMPANY_NAME  = 'VSME OS';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Header nav */}
      <SharedNav />

      <div className="max-w-3xl mx-auto px-6 py-12 sm:py-16">

        {/* Title block */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C9A84C]/10 border border-[#C9A84C]/20 rounded-full mb-4">
            <Shield size={12} className="text-[#C9A84C]" />
            <span className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-widest">GDPR Compliant</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-gray-500 text-lg leading-relaxed">
            What data {COMPANY_NAME} collects when you use VSME OS, how we use it,
            and your rights under the GDPR.
          </p>
        </div>

        <div className="space-y-12">

          {/* 1. Who We Are */}
          <Section title="1. Who We Are (Data Controller)">
            <p>
              The data controller is <strong>{COMPANY_NAME}</strong>, operating from France.
              For privacy enquiries contact{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 hover:underline">{CONTACT_EMAIL}</a>.
              Our supervisory authority is the <strong>CNIL</strong> (Commission Nationale de l'Informatique et des Libertés).
            </p>
          </Section>

          {/* 2. What We Collect */}
          <Section title="2. What Data We Collect and Why">
            <SubSection title="2.1 Account Data (via Clerk)">
              <p>Full name, email address, authentication tokens. <strong>Legal basis:</strong> Contract — necessary to create and secure your account.</p>
            </SubSection>
            <SubSection title="2.2 Company Profile Data">
              <p>Legal company name, country, industry sector, annual revenue (optional), reporting year, authorised signatory name. <strong>Legal basis:</strong> Contract — required to generate your carbon declaration.</p>
            </SubSection>
            <SubSection title="2.3 Carbon Assessment Data">
              <p>Fuel consumption, electricity usage, travel distances, employee commuting estimates, refrigerant quantities. <strong>Legal basis:</strong> Contract — this is the core data that produces your report.</p>
            </SubSection>
            <SubSection title="2.4 Evidence Files">
              <p>PDFs, images, spreadsheets uploaded to the Evidence Vault (utility invoices, maintenance logs, etc.). Stored in encrypted EU-based storage. <strong>Legal basis:</strong> Contract — supports audit verification.</p>
            </SubSection>
            <SubSection title="2.5 Payment Data (via Stripe)">
              <p>Billing name, address, card last 4 digits, transaction history. Full card details are never stored by VSME OS — Stripe is PCI DSS Level 1 certified. <strong>Legal basis:</strong> Contract — necessary to process subscription payments.</p>
            </SubSection>
            <SubSection title="2.6 Technical Data">
              <p>Browser type, device type, IP address (90 days, security only), anonymised page analytics. <strong>Legal basis:</strong> Legitimate interest (security and service improvement).</p>
            </SubSection>
          </Section>

          {/* 3. Third Parties */}
          <Section title="3. Third-Party Sub-Processors">
            <p>We share data with the following GDPR-compliant sub-processors, each bound by a Data Processing Agreement:</p>
            <div className="mt-4 rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Service', 'Purpose', 'Data', 'Location'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { s: 'Clerk',    p: 'Authentication',    d: 'Name, email, tokens',          l: 'EU/USA (SCCs)' },
                    { s: 'Supabase', p: 'Database & storage', d: 'All assessment data & files',  l: 'EU (Frankfurt)' },
                    { s: 'Resend',   p: 'Transactional email', d: 'Email, invite content',        l: 'EU/USA (SCCs)' },
                    { s: 'Stripe',   p: 'Payments',          d: 'Billing name, address, history', l: 'EU/USA (SCCs)' },
                    { s: 'Vercel',   p: 'App hosting',       d: 'Request logs',                  l: 'EU (Frankfurt)' },
                  ].map(({ s, p, d, l }) => (
                    <tr key={s} className="border-b border-gray-50 last:border-0">
                      <td className="px-4 py-3 font-medium text-gray-900">{s}</td>
                      <td className="px-4 py-3 text-gray-600">{p}</td>
                      <td className="px-4 py-3 text-gray-600">{d}</td>
                      <td className="px-4 py-3 text-gray-500">{l}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-2">SCCs = EU Standard Contractual Clauses for international data transfers.</p>
          </Section>

          {/* 4. Data Sharing */}
          <Section title="4. Who We Share Your Data With">
            <p>We <strong>do not sell your data</strong>. We share it only in these circumstances:</p>
            <ul className="space-y-2 mt-3">
              {[
                { label: 'With your buyer (if invited)', text: 'Only the generated PDF report is shared with the buyer who invited you. Raw activity data is never shared.' },
                { label: 'With sub-processors', text: 'As listed in Section 3, solely to deliver the service.' },
                { label: 'Legal obligation', text: 'If required by law, court order, or regulatory authority (CNIL, tax authorities).' },
                { label: 'Business transfer', text: 'If VSME OS is acquired, data may transfer under the same privacy commitments.' },
              ].map(({ label, text }) => (
                <li key={label} className="flex gap-3">
                  <span className="text-gray-400 mt-0.5">→</span>
                  <span><strong>{label}:</strong> {text}</span>
                </li>
              ))}
            </ul>
          </Section>

          {/* 5. Retention */}
          <Section title="5. How Long We Keep Your Data">
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-3">
              {[
                { type: 'Account data (name, email)',          period: 'Until deletion + 30 days' },
                { type: 'Company profile & assessment data',   period: '7 years (CSRD audit requirement)' },
                { type: 'Uploaded evidence files',             period: '7 years (CSRD audit requirement)' },
                { type: 'Generated PDF reports',               period: '7 years (CSRD audit requirement)' },
                { type: 'Payment records',                     period: '10 years (French commercial law)' },
                { type: 'Security / access logs',              period: '90 days' },
                { type: 'Anonymised analytics',                period: 'Indefinitely (no personal data)' },
              ].map(({ type, period }) => (
                <div key={type} className="flex justify-between gap-4 pb-3 border-b border-gray-100 last:border-0 last:pb-0 text-sm">
                  <span className="text-gray-700 font-medium">{type}</span>
                  <span className="text-gray-500 text-right flex-shrink-0">{period}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* 6. Your Rights */}
          <Section title="6. Your Rights Under GDPR">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              {[
                { right: 'Right of Access (Art. 15)',        desc: 'Request a copy of all personal data we hold about you.' },
                { right: 'Right to Rectification (Art. 16)', desc: 'Correct inaccurate or incomplete personal data.' },
                { right: 'Right to Erasure (Art. 17)',       desc: 'Request deletion ("right to be forgotten"), subject to legal retention obligations.' },
                { right: 'Right to Portability (Art. 20)',   desc: 'Receive your data in a machine-readable format (JSON/CSV).' },
                { right: 'Right to Restriction (Art. 18)',   desc: 'Restrict how we process your data in certain circumstances.' },
                { right: 'Right to Object (Art. 21)',        desc: 'Object to processing based on legitimate interests.' },
                { right: 'Withdraw Consent',                 desc: 'Where processing is consent-based, withdraw it at any time.' },
                { right: 'Lodge a Complaint',                desc: 'File a complaint with the CNIL at cnil.fr if you believe your data was mishandled.' },
              ].map(({ right, desc }) => (
                <div key={right} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-900 mb-1">{right}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-4">
              To exercise any right, email{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 hover:underline">{CONTACT_EMAIL}</a>.
              We respond within 30 days (GDPR Article 12).
            </p>
          </Section>

          {/* 7. Security */}
          <Section title="7. Data Security">
            <ul className="space-y-2">
              {[
                'Encryption at rest: AES-256 (Supabase, Frankfurt EU)',
                'Encryption in transit: TLS 1.3 on all connections',
                'Row Level Security: database access scoped per user',
                'Evidence files stored in private Supabase Storage (not publicly accessible)',
                'Authentication via Clerk with MFA support',
                'Data breach notification to CNIL and affected users within 72 hours (GDPR Art. 33)',
              ].map(item => (
                <li key={item} className="flex gap-3 text-sm">
                  <span className="text-[#C9A84C] mt-0.5 flex-shrink-0">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Section>

          {/* 8. Cookies */}
          <Section title="8. Cookies">
            <p>We use only technically necessary cookies. No advertising cookies, no tracking pixels.</p>
            <div className="mt-3 rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Cookie', 'Type', 'Purpose', 'Duration'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-bold text-gray-500 border-b border-gray-100">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: '__clerk_*', type: 'Essential', purpose: 'Authentication session (Clerk)', duration: '30 days' },
                    { name: 'sb-*',      type: 'Essential', purpose: 'Supabase auth token',            duration: 'Session' },
                    { name: '_vercel_*', type: 'Technical', purpose: 'Load balancing',                 duration: 'Session' },
                  ].map(({ name, type, purpose, duration }) => (
                    <tr key={name} className="border-b border-gray-50 last:border-0">
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">{name}</td>
                      <td className="px-4 py-3 text-xs font-bold text-[#C9A84C]">{type}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{purpose}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* 9. Changes */}
          <Section title="9. Changes to This Policy">
            <p>
              Material changes will be notified by email and in-app banner at least 30 days
              before taking effect. The "last updated" date at the top reflects the current version.
            </p>
          </Section>

          {/* Contact CTA */}
          <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl">
            <h3 className="font-bold text-gray-900 mb-2">Questions or Requests?</h3>
            <p className="text-sm text-gray-600 mb-4">
              For any privacy enquiries, data access requests, or to exercise your GDPR rights:
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0C2918] text-[#C9A84C] rounded-full text-sm font-medium hover:bg-[#122F1E] transition-colors"
            >
              {CONTACT_EMAIL}
            </a>
            <p className="text-xs text-gray-400 mt-3">
              Or file a complaint with the CNIL:{' '}
              <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">cnil.fr</a>
            </p>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 mt-8">
        <div className="max-w-3xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} {COMPANY_NAME}</p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-xs text-gray-400 hover:text-gray-700">Terms of Service</Link>
            <Link href="/methodology" className="text-xs text-gray-400 hover:text-gray-700">Methodology</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper layout components
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">{title}</h2>
      <div className="space-y-3 text-gray-600 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 pl-4 border-l-2 border-gray-100">
      <h3 className="text-sm font-bold text-gray-800 mb-1">{title}</h3>
      <div className="text-sm text-gray-600 leading-relaxed">{children}</div>
    </div>
  );
}