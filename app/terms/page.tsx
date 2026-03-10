// =============================================================================
// FILE: app/terms/page.tsx
// PURPOSE: Terms of Service — the legal contract between VSME OS and its users.
//          Required before accepting payment or processing business data.
//
// KEY SECTIONS:
//   1. Acceptance of Terms
//   2. Description of Service
//   3. User Obligations
//   4. Subscription & Payment
//   5. Intellectual Property
//   6. Data Accuracy & Disclaimer
//   7. Limitation of Liability
//   8. Termination
//   9. Governing Law (France / EU)
//
// GOVERNING LAW: French law. Jurisdiction: Paris Commercial Courts.
// UPDATE WHEN: Adding new features, changing pricing, changing liability terms.
// =============================================================================

import Link from 'next/link';
import SharedNav from '@/components/SharedNav';
import { ArrowLeft, FileText } from 'lucide-react';

const LAST_UPDATED  = '1 January 2025';
const CONTACT_EMAIL = 'legal@vsmeos.fr';
const COMPANY_NAME  = 'VSME OS SAS';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <SharedNav />

      <div className="max-w-3xl mx-auto px-6 py-12 sm:py-16">

        {/* Title */}
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-3">
            Terms of Service
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed">
            Please read these terms carefully before using VSME OS. By creating an account
            or using the service, you agree to be bound by these terms.
          </p>
        </div>

        <div className="space-y-12">

          {/* 1. Acceptance */}
          <Section title="1. Acceptance of Terms">
            <p>
              These Terms of Service ("Terms") constitute a legally binding agreement between
              you ("User", "you") and <strong>{COMPANY_NAME}</strong> ("VSME OS", "we", "us"),
              governing your access to and use of the VSME OS
              platform at vsmeos.fr ("the Service").
            </p>
            <p>
              By registering an account, clicking "I Agree", or otherwise accessing the Service,
              you confirm that you have read, understood, and agree to these Terms in full. If
              you are accepting on behalf of a company, you warrant that you have the authority
              to bind that company to these Terms.
            </p>
            <p>
              If you do not agree to these Terms, you may not access or use the Service.
            </p>
          </Section>

          {/* 2. Description of Service */}
          <Section title="2. Description of Service">
            <p>
              VSME OS is a B2B software-as-a-service (SaaS) platform that enables small and
              medium-sized enterprises ("SMEs") to measure, calculate, and report their greenhouse
              gas (GHG) emissions in accordance with recognised standards including:
            </p>
            <ul>
              {[
                'GHG Protocol Corporate Accounting and Reporting Standard',
                'ISO 14064-1:2018 — Specification for quantification of GHG emissions',
                'Commission Recommendation (EU) 2025/1710 of 30 July 2025 — voluntary sustainability reporting standard for SMEs (EU VSME)',
                'CSRD ESRS E1 — EU Corporate Sustainability Reporting Directive',
              ].map(s => <li key={s}>{s}</li>)}
            </ul>
            <p>
              The Service includes: carbon footprint calculation engine, Scope 1/2/3 data entry
              forms, automated PDF report generation, evidence file vault, buyer dashboard, and
              supplier invitation system.
            </p>
            <p>
              We reserve the right to modify, suspend, or discontinue any aspect of the Service
              at any time, with reasonable notice to active subscribers.
            </p>
          </Section>

          {/* 3. User Obligations */}
          <Section title="3. User Obligations and Acceptable Use">
            <SubSection title="3.1 Account Responsibility">
              <p>
                You are responsible for maintaining the confidentiality of your account credentials
                and for all activity that occurs under your account. You must notify us immediately
                at <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 hover:underline">{CONTACT_EMAIL}</a> if
                you suspect unauthorised access.
              </p>
            </SubSection>
            <SubSection title="3.2 Data Accuracy">
              <p>
                You warrant that all activity data, company information, and supporting documents
                you provide are accurate, complete, and relate to the entity and reporting period
                you have declared. Providing knowingly false or misleading data to generate a
                carbon report is a breach of these Terms and may constitute fraud under applicable law.
              </p>
            </SubSection>
            <SubSection title="3.3 Prohibited Uses">
              <p>You agree not to:</p>
              <ul>
                {[
                  'Use the Service for any unlawful purpose or in violation of any applicable regulation',
                  'Attempt to reverse-engineer, copy, or create derivative works of the VSME OS platform',
                  'Upload malware, viruses, or any harmful code',
                  'Attempt to gain unauthorised access to other users\' data or the underlying systems',
                  'Use the Service to generate reports for entities other than your own without authorisation',
                  'Misrepresent your organisation\'s identity or emissions data to third parties',
                  'Scrape, crawl, or systematically extract data from the platform',
                ].map(item => <li key={item}>{item}</li>)}
              </ul>
            </SubSection>
          </Section>

          {/* 4. Subscription & Payment */}
          <Section title="4. Subscription and Payment">
            <SubSection title="4.1 Plans">
              <p>
                VSME OS offers the following subscription tiers (prices subject to change
                with 30 days' notice to existing subscribers):
              </p>
              <div className="mt-3 rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Plan', 'Price', 'What\'s Included'].map(h => (
                        <th key={h} className="text-left px-4 py-2.5 text-xs font-bold text-gray-500 border-b border-gray-100">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { plan: 'Single Report',  price: '€199 one-time', includes: '1 PDF carbon declaration, 1 reporting year, all scopes' },
                      { plan: 'Annual (Solo)',  price: '€349 / year',   includes: 'Unlimited reports, all years, 1 user' },
                      { plan: 'Team',           price: '€799 / year',   includes: 'Unlimited reports, all years, up to 5 users' },
                      { plan: 'Buyer Portal',   price: 'Free',          includes: 'Supplier invitations, dashboard, status tracking' },
                    ].map(({ plan, price, includes }) => (
                      <tr key={plan} className="border-b border-gray-50 last:border-0">
                        <td className="px-4 py-3 font-medium">{plan}</td>
                        <td className="px-4 py-3 text-gray-600">{price}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{includes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SubSection>
            <SubSection title="4.2 Billing">
              <p>
                Payments are processed by <strong>Stripe</strong>, a PCI DSS Level 1 certified
                payment processor. Annual subscriptions are billed in advance and auto-renew
                unless cancelled at least 48 hours before the renewal date. All prices are
                exclusive of VAT, which will be added where applicable under EU VAT rules.
              </p>
            </SubSection>
            <SubSection title="4.3 Refunds">
              <p>
                Single Report purchases are non-refundable once the PDF has been generated and
                downloaded. Annual subscriptions may be cancelled within 14 days of purchase for
                a full refund under EU consumer protection law (right of withdrawal), provided
                no report has been generated. After 14 days or after report generation,
                subscriptions are non-refundable.
              </p>
            </SubSection>
            <SubSection title="4.4 Late Payment">
              <p>
                Failed payments will result in suspension of PDF generation capabilities.
                Access to previously generated reports and saved data is maintained for
                30 days after payment failure to allow account recovery.
              </p>
            </SubSection>
          </Section>

          {/* 5. IP */}
          <Section title="5. Intellectual Property">
            <SubSection title="5.1 Platform Ownership">
              <p>
                All intellectual property in the VSME OS platform — including the software,
                calculation engine, emission factor database, UI design, and generated report
                templates — is owned by or licensed to {COMPANY_NAME}. You are granted a
                limited, non-exclusive, non-transferable licence to use the Service during
                your subscription period.
              </p>
            </SubSection>
            <SubSection title="5.2 Your Content">
              <p>
                You retain ownership of all data, documents, and information you upload to
                the Service ("Your Content"). You grant VSME OS a limited licence to process
                Your Content solely to provide the Service. We will never use your company
                emissions data for purposes other than generating your report and improving
                the calculation engine (in anonymised, aggregated form only).
              </p>
            </SubSection>
            <SubSection title="5.3 Generated Reports">
              <p>
                PDF reports generated by the Service are owned by you. You may share them
                freely with buyers, auditors, regulators, or any third party for any lawful
                business purpose.
              </p>
            </SubSection>
          </Section>

          {/* 6. Data Accuracy Disclaimer */}
          <Section title="6. Data Accuracy and Disclaimer">
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
              <p className="font-bold text-amber-900 mb-2">Important disclaimer — please read carefully.</p>
              <p className="text-amber-800 text-sm leading-relaxed">
                VSME OS provides a calculation tool. The accuracy of generated reports depends
                entirely on the accuracy of the activity data you provide. VSME OS does not
                independently verify the data you enter. Reports are self-attested (limited
                assurance) unless you separately engage a third-party verifier.
              </p>
            </div>
            <p className="mt-4">
              Emission factors used in calculations are sourced from recognised national databases
              (ADEME, DEFRA, EPA, IEA, etc.) and are updated periodically. We make reasonable
              efforts to keep factors current but cannot guarantee they reflect the most recent
              published values at all times. Factor sources and update dates are disclosed in
              each generated report.
            </p>
            <p>
              Generated reports are <strong>not</strong> a substitute for independent third-party
              verification where such verification is required by regulation, contract, or
              buyer specification. Buyers relying on supplier reports for CSRD Scope 3
              disclosures should conduct appropriate due diligence.
            </p>
          </Section>

          {/* 7. Liability */}
          <Section title="7. Limitation of Liability">
            <p>
              To the maximum extent permitted by applicable law:
            </p>
            <ul>
              {[
                `${COMPANY_NAME} shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.`,
                `Our total liability to you for any claim arising from these Terms or the Service shall not exceed the amount you paid to us in the 12 months preceding the claim.`,
                'We are not liable for regulatory penalties, fines, or compliance failures arising from inaccurate data you provided to generate a report.',
                'We are not liable for temporary unavailability of the Service due to maintenance, infrastructure issues, or events beyond our reasonable control (force majeure).',
              ].map(item => <li key={item}>{item}</li>)}
            </ul>
            <p>
              Nothing in these Terms excludes or limits liability for fraud, death or personal
              injury caused by our negligence, or any other liability that cannot be excluded
              under applicable French or EU law.
            </p>
          </Section>

          {/* 8. Termination */}
          <Section title="8. Termination">
            <SubSection title="8.1 By You">
              <p>
                You may cancel your subscription at any time from the account settings page.
                Cancellation takes effect at the end of the current billing period. Your data
                is retained for 90 days after cancellation, during which you may request
                export of your assessment data and reports.
              </p>
            </SubSection>
            <SubSection title="8.2 By VSME OS">
              <p>
                We may suspend or terminate your account immediately if you materially breach
                these Terms (including providing fraudulent data), fail to pay, or if we are
                required to by law. We will give reasonable notice where practicable.
              </p>
            </SubSection>
            <SubSection title="8.3 Effect of Termination">
              <p>
                On termination, your licence to use the Service ends. Previously generated
                PDF reports remain your property. Data deletion timelines follow our Privacy
                Policy (Section 5).
              </p>
            </SubSection>
          </Section>

          {/* 9. Governing Law */}
          <Section title="9. Governing Law and Disputes">
            <p>
              These Terms are governed by and construed in accordance with the laws of France,
              without regard to conflict of law principles.
            </p>
            <p>
              For B2B disputes, the parties agree to the exclusive jurisdiction of the
              Commercial Courts of Paris (Tribunal de Commerce de Paris).
            </p>
            <p>
              For disputes involving consumers (natural persons acting outside their trade or
              profession), mandatory EU consumer protection laws apply and may provide
              additional rights.
            </p>
          </Section>

          {/* 10. General */}
          <Section title="10. General Provisions">
            <ul>
              {[
                'Entire Agreement: These Terms, together with our Privacy Policy, constitute the entire agreement between you and VSME OS.',
                'Severability: If any provision is found unenforceable, it will be modified to the minimum extent necessary; the remaining provisions remain in effect.',
                'No Waiver: Failure to enforce any right does not waive that right.',
                'Assignment: We may assign these Terms in connection with a merger or acquisition. You may not assign your rights without our prior written consent.',
                'Language: These Terms are provided in English. In case of conflict with any translation, the English version prevails.',
              ].map(item => {
                const [label, ...rest] = item.split(': ');
                return (
                  <li key={label}><strong>{label}:</strong> {rest.join(': ')}</li>
                );
              })}
            </ul>
          </Section>

          {/* Contact */}
          <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl">
            <h3 className="font-bold text-gray-900 mb-2">Legal Enquiries</h3>
            <p className="text-sm text-gray-600 mb-4">
              For questions about these Terms or to report a breach:
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              {CONTACT_EMAIL}
            </a>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 mt-8">
        <div className="max-w-3xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} {COMPANY_NAME}</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-xs text-gray-400 hover:text-gray-700">Privacy Policy</Link>
            <Link href="/methodology" className="text-xs text-gray-400 hover:text-gray-700">Methodology</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

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