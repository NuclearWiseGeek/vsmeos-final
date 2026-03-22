/* app/page.tsx */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Globe, FileText, Zap, BarChart3, Menu, X, CheckCircle2, Clock, Download, ChevronDown, ChevronUp, Building2, Users } from 'lucide-react';
import VsmeLogo from '@/components/VsmeLogo';
import SampleReportModal from '@/components/SampleReportModal';
import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';

// =============================================================================
// FAQ DATA
// =============================================================================
const FAQS = [
  {
    q: 'Is this actually CSRD compliant?',
    a: 'VSME OS generates reports designed for CSRD Scope 3 data collection — the standard your buyer uses when requesting supplier carbon data. The report covers Scope 1 (direct emissions), Scope 2 (purchased energy), and Scope 3 Categories 6 and 7 (business travel and employee commuting). Reports are self-attested (limited assurance) and based on GHG Protocol methodology. They are designed to satisfy buyer CSRD data requests. For independently verified reports, we recommend engaging a third-party verifier. Our alignment page explains this in full.'
  },
  {
    q: 'How long does it take to complete a report?',
    a: 'Most suppliers complete their first report in a single session. You will need your utility bills (gas, electricity), fuel receipts or mileage records, and a rough count of business travel. Having those documents to hand before you start significantly speeds things up.'
  },
  {
    q: 'What if I don\'t have all the data?',
    a: 'You can complete only the scopes you have data for and generate a partial report. Empty fields are listed as boundary exclusions on the report — which is GHG Protocol compliant. A partial report is better than no report for your buyer.'
  },
  {
    q: 'What do I actually send to my buyer?',
    a: 'You download a 4-page PDF report and email or upload it to your buyer\'s procurement portal. The format is standardised so buyers can read it without reformatting. The total tCO₂e figure on Page 1 is what their Scope 3 team enters into their inventory.'
  },
  {
    q: 'My company is based outside France. Does it still work?',
    a: 'Yes. VSME OS uses country-specific emission factors for 60+ countries. A UK supplier\'s electricity is calculated using DEFRA 2025 factors (0.196 kgCO₂e/kWh). A German supplier uses UBA 2023 (0.380 kgCO₂e/kWh). Your country is selected on the profile page and drives the correct factors throughout.'
  },
];

// =============================================================================
// SCROLL REVEAL HOOK
// Adds 'is-visible' class when element scrolls into view.
// CSS in globals.css handles the actual animation.
// =============================================================================
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Check if already in view on mount (e.g. short pages)
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) {
      el.classList.add('is-visible');
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          obs.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================
export default function LandingPage() {
  const [isModalOpen,      setModalOpen]      = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openFaq,          setOpenFaq]         = useState<number | null>(null);
  const [heroVisible,      setHeroVisible]     = useState(false);

  const howRef      = useScrollReveal();
  const audienceRef = useScrollReveal();
  const pillarsRef  = useScrollReveal();
  const pricingRef  = useScrollReveal();
  const faqRef      = useScrollReveal();

  // Tiny delay so SSR hydration completes before triggering hero entrance
  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-[#C9A84C]/20 antialiased">

      {/* ================================================================
          1. NAVIGATION
          ================================================================ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-lg border-b border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 md:px-10 md:py-5 max-w-7xl mx-auto">

          <div className="text-xl md:text-2xl font-bold tracking-tighter flex items-center gap-2.5">
            <VsmeLogo size={32} />
            VSME <span className="text-gray-400 font-medium text-lg md:text-xl">OS</span>
          </div>

          <div className="hidden md:flex items-center gap-10 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
            <a href="/methodology" className="hover:text-black transition-colors">Methodology</a>
            <a href="/framework"   className="hover:text-black transition-colors">Framework</a>
            <a href="/alignment"   className="hover:text-black transition-colors">Alignment</a>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:block">
              <SignedOut>
                <SignInButton mode="modal" forceRedirectUrl="/buyer/dashboard">
                  <button className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-colors">
                    Buyer Login
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/buyer/dashboard" className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C9A84C] hover:text-black transition-colors">
                  Buyer Dashboard
                </Link>
              </SignedIn>
            </div>
            <button className="md:hidden p-2 text-gray-400 hover:text-black" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100 px-6 py-8 flex flex-col gap-6">
            <a href="/methodology" onClick={() => setIsMobileMenuOpen(false)} className="text-xs font-bold uppercase tracking-widest text-gray-400">Methodology</a>
            <a href="/framework"   onClick={() => setIsMobileMenuOpen(false)} className="text-xs font-bold uppercase tracking-widest text-gray-400">Framework</a>
            <a href="/alignment"   onClick={() => setIsMobileMenuOpen(false)} className="text-xs font-bold uppercase tracking-widest text-gray-400">Alignment</a>
            <SignedOut>
              <SignInButton mode="modal" forceRedirectUrl="/buyer/dashboard">
                <button className="text-left text-xs font-bold uppercase tracking-widest text-[#C9A84C] mt-2">Buyer Portal Login</button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/buyer/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-xs font-bold uppercase tracking-widest text-[#C9A84C]">
                Go to Dashboard
              </Link>
            </SignedIn>
          </div>
        )}
      </nav>

      {/* ================================================================
          2. HERO
          Dot grid from globals.css, radial gradient overlay,
          staggered entrance via hero-item / hero-visible classes
          ================================================================ */}
      <main className="relative overflow-hidden">

        {/* Dot grid */}
        <div className="absolute inset-0 dot-grid opacity-50 pointer-events-none" />

        {/* Vignette — fades grid at edges so text stays clean */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 90% 70% at 50% 0%, transparent 0%, rgba(255,255,255,0.75) 60%, white 100%)' }}
        />

        {/* Subtle green glow — sustainability signal, top left */}
        <div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)' }}
        />

        <div className={`relative max-w-7xl mx-auto px-6 md:px-10 pt-36 md:pt-52 pb-24 md:pb-40 ${heroVisible ? 'hero-visible' : ''}`}>
          <div className="max-w-5xl">

            {/* Badge */}
            <div className="hero-item inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0C2918] text-[#C9A84C] text-[10px] font-bold uppercase tracking-[0.2em] mb-10">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] flex-shrink-0 animate-pulse" />
              Your buyer is CSRD-regulated. They need your carbon data.
            </div>

            {/* Headline */}
            <h1 className="hero-item text-[48px] sm:text-7xl md:text-[112px] font-bold tracking-[-0.06em] text-black leading-[0.88] mb-8 md:mb-10">
              Supply chain carbon data,<br />
              <span className="text-gray-200">finally standardised.</span>
            </h1>

            {/* Subline */}
            <p className="hero-item text-lg sm:text-2xl md:text-3xl text-gray-400 max-w-3xl leading-[1.4] font-light mb-5">
              VSME OS turns energy bills and travel records into a{' '}
              <span className="text-black font-normal">GHG Protocol-based carbon declaration</span>{' '}
              — ready to send to any procurement team, worldwide.
            </p>

            {/* Legal micro-disclaimer */}
            <p className="hero-item text-[10px] text-gray-400 mb-10 font-medium tracking-wide">
              Self-attested reports · Based on GHG Protocol &amp; ISO 14064-1:2018 ·{' '}
              <a href="/methodology" className="underline underline-offset-2 hover:text-gray-600 transition-colors">Full methodology →</a>
            </p>

            {/* CTAs */}
            <div className="hero-item flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <SignedOut>
                <SignInButton mode="modal" forceRedirectUrl="/supplier">
                  <button className="group w-full sm:w-auto px-8 py-4 md:px-10 md:py-5 bg-[#0C2918] text-[#C9A84C] rounded-2xl text-base md:text-lg font-bold flex items-center justify-center gap-3 hover:bg-[#122F1E] transition-all active:scale-[0.98] shadow-xl shadow-black/10">
                    Start Your Report
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/supplier" className="group w-full sm:w-auto px-8 py-4 md:px-10 md:py-5 bg-[#0C2918] text-[#C9A84C] rounded-2xl text-base md:text-lg font-bold flex items-center justify-center gap-3 hover:bg-[#122F1E] transition-all active:scale-[0.98] shadow-xl shadow-black/10">
                  Resume Assessment
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </SignedIn>
              <button
                onClick={() => setModalOpen(true)}
                className="w-full sm:w-auto px-8 py-4 md:px-10 md:py-5 bg-white text-gray-900 border border-gray-200 rounded-2xl text-base md:text-lg font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                <FileText size={18} className="text-gray-400" />
                View Sample Report
              </button>
            </div>
          </div>

          {/* Standards bar */}
          <div className="hero-item mt-24 md:mt-32 pt-10 border-t border-gray-100 overflow-x-auto no-scrollbar">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 md:gap-x-14 gap-y-10 min-w-[600px] md:min-w-0">
              {[
                { label: 'Standard',         title: 'GHG Protocol',   badge: 'Corporate Standard',      dot: false },
                { label: 'Methodology',      title: 'ISO 14064-1',    badge: 'Based on 2018 Edition',   dot: false },
                { label: 'Designed For',     title: 'CSRD ESRS E1',   badge: 'Scope 3 Data Collection', dot: true  },
                { label: 'Emission Factors', title: '60+ Countries',  badge: 'IEA · DEFRA · ADEME',     dot: false },
              ].map(({ label, title, badge, dot }) => (
                <div key={title} className="flex flex-col space-y-2">
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">{label}</span>
                  <span className="text-xl md:text-2xl font-bold tracking-tight text-gray-900">{title}</span>
                  <span className="text-[10px] font-medium text-gray-500 border border-gray-200 px-2 py-0.5 rounded-md w-fit flex items-center gap-1.5">
                    {dot && <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] flex-shrink-0" />}
                    {badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* ================================================================
          3. HOW IT WORKS — dark section
          ================================================================ */}
      <section className="bg-[#0C2918] text-white">
        <div ref={howRef} className="reveal-section max-w-7xl mx-auto px-6 md:px-10 py-24 md:py-32">
          <div className="mb-12">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#4A7A5C] mb-3">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              From bills to report.<br />
              <span className="text-[#3D6B4E]">One session.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
            {[
              {
                step: '01', icon: <FileText size={20} className="text-blue-400" />,
                title: 'Enter your data',
                desc: 'Fill in energy bills, fuel usage, and business travel across Scope 1, 2, and 3 (Categories 6 & 7: business travel, employee commuting). Tooltips on every field tell you exactly where to find each number.',
                border: 'border-blue-900/60', bg: 'bg-blue-950/20',
              },
              {
                step: '02', icon: <Zap size={20} className="text-amber-400" />,
                title: 'We calculate',
                desc: 'Our engine applies the correct national emission factors for your country — ADEME for France, DEFRA for the UK, EPA for the USA — and produces Scope 1, 2, and 3 totals.',
                border: 'border-amber-900/60', bg: 'bg-amber-950/20',
              },
              {
                step: '03', icon: <Download size={20} className="text-[#C9A84C]" />,
                title: 'Download and send',
                desc: 'Sign the declaration and download a 4-page GHG Protocol-based PDF. Send it to your buyer\'s procurement team. No consultant required.',
                border: 'border-[#1A5C3A]/60', bg: 'bg-[#0C2918]/20',
              },
            ].map(({ step, icon, title, desc, border, bg }) => (
              <div key={step} className={`relative rounded-2xl border ${border} ${bg} p-7`}>
                <div className="absolute -top-3.5 left-6">
                  <span className="bg-[#122F1E] text-[#6B9B7A] text-[10px] font-bold px-2.5 py-1 rounded-full tracking-widest border border-[#1A5C3A]">
                    {step}
                  </span>
                </div>
                <div className="mt-4 mb-5">{icon}</div>
                <h3 className="font-bold text-white text-base mb-2">{title}</h3>
                <p className="text-sm text-[#6B9B7A] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center gap-2">
            <Clock size={13} className="text-[#3D6B4E]" />
            <p className="text-xs text-[#4A7A5C] font-medium">
              Most suppliers complete their first report in a single session. Have your utility bills and travel records to hand before you start.
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================
          4. FOR SUPPLIERS / FOR BUYERS
          ================================================================ */}
      <section className="border-t border-gray-100">
        <div ref={audienceRef} className="reveal-section max-w-7xl mx-auto px-6 md:px-10 py-24 md:py-32">
          <div className="mb-12">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Two Sides, One Platform</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Built for suppliers and buyers.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Supplier — black */}
            <div className="relative bg-[#0C2918] text-[#C9A84C] rounded-2xl p-8 md:p-10 flex flex-col justify-between min-h-[360px] overflow-hidden">
              {/* Subtle green glow top-right corner */}
              <div className="absolute top-0 right-0 w-56 h-56 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 70%)' }}
              />
              <div>
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-6">
                  <Users size={18} className="text-white" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#4A7A5C] mb-2">For Suppliers</p>
                <h3 className="text-xl font-bold mb-5 leading-snug">Your buyer asked for carbon data.<br />Here's how to respond.</h3>
                <ul className="space-y-2.5 mb-8">
                  {[
                    'Enter energy, fuel, and travel data — we do the maths',
                    'Country-specific factors (60+ countries supported)',
                    'Download a signed, audit-standard 4-page PDF',
                    'Evidence vault to attach supporting documents',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-[#6B9B7A]">
                      <CheckCircle2 size={13} className="text-[#C9A84C] mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <SignedOut>
                <SignInButton mode="modal" forceRedirectUrl="/supplier">
                  <button className="group flex items-center gap-2 text-sm font-bold text-white hover:text-zinc-300 transition-colors">
                    Start as a Supplier <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/supplier" className="group flex items-center gap-2 text-sm font-bold text-white hover:text-zinc-300 transition-colors">
                  Go to Assessment Hub <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </SignedIn>
            </div>

            {/* Buyer — light */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 md:p-10 flex flex-col justify-between min-h-[360px]">
              <div>
                <div className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center mb-6">
                  <Building2 size={18} className="text-gray-600" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">For Buyers</p>
                <h3 className="text-xl font-bold text-gray-900 mb-5 leading-snug">Collect Scope 3 data from your entire supply chain.</h3>
                <ul className="space-y-2.5 mb-8">
                  {[
                    'Invite suppliers by email or CSV upload',
                    'Track submission status in real time',
                    'Data coverage dashboard for CSRD filing',
                    'Standardised PDF format — no reformatting needed',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <CheckCircle2 size={13} className="text-[#C9A84C] mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <SignedOut>
                <SignInButton mode="modal" forceRedirectUrl="/buyer/dashboard">
                  <button className="group flex items-center gap-2 text-sm font-bold text-gray-900 hover:text-gray-500 transition-colors">
                    Access Buyer Portal <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/buyer/dashboard" className="group flex items-center gap-2 text-sm font-bold text-gray-900 hover:text-gray-500 transition-colors">
                  Go to Buyer Dashboard <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          5. THREE PILLARS
          ================================================================ */}
      <section className="border-t border-gray-50">
        <div ref={pillarsRef} className="reveal-section max-w-7xl mx-auto px-6 md:px-10 py-24 md:py-32">
          <div className="mb-12">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Technical Foundation</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Built for auditors, not just buyers.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            {[
              {
                href: '/methodology', icon: <Zap size={20} />,
                hoverCard: 'group-hover:bg-blue-50 group-hover:border-blue-100',
                hoverIcon: 'group-hover:text-blue-500',
                title: 'Technical Methodology',
                body: <>Emission factors from <strong className="text-gray-900 font-semibold">60+ national databases</strong> — ADEME for France, DEFRA for the UK, EPA for the USA, IEA for 40+ further countries. Your country determines your factor.</>,
                linkLabel: 'Read methodology', linkColour: 'text-blue-600',
              },
              {
                href: '/framework', icon: <BarChart3 size={20} />,
                hoverCard: 'group-hover:bg-zinc-100 group-hover:border-zinc-200',
                hoverIcon: 'group-hover:text-black',
                title: 'Reporting Framework',
                body: <>A 4-page PDF with <strong className="text-gray-900 font-semibold">tCO₂e totals</strong>, full activity breakdown with factors disclosed, a signed Declaration of Conformity, and a full methodology audit trail. Buyers can ingest data without reformatting.</>,
                linkLabel: 'See report structure', linkColour: 'text-gray-700',
              },
              {
                href: '/alignment', icon: <ShieldCheck size={20} />,
                hoverCard: 'group-hover:bg-[#0C2918]/5 group-hover:border-[#C9A84C]/20',
                hoverIcon: 'group-hover:text-[#C9A84C]',
                title: 'Global Alignment',
                body: <>Based on <strong className="text-gray-900 font-semibold">GHG Protocol</strong>, ISO 14064-1:2018, and <strong className="text-gray-900 font-semibold">Commission Recommendation (EU) 2025/1710</strong> (EU VSME). Designed for procurement teams across Europe and beyond.</>,
                linkLabel: 'Regulatory alignment', linkColour: 'text-[#C9A84C]',
              },
            ].map(({ href, icon, hoverCard, hoverIcon, title, body, linkLabel, linkColour }) => (
              <a href={href} key={href} className="pillar-link group block space-y-4">
                <div className={`w-11 h-11 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-gray-300 ${hoverCard} ${hoverIcon} transition-all duration-200`}>
                  {icon}
                </div>
                <h3 className="font-bold text-gray-900 text-base md:text-lg">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed font-light">{body}</p>
                <span className={`text-xs font-bold ${linkColour} flex items-center gap-1`}>
                  {linkLabel} <span className="pillar-arrow"><ArrowRight size={12} /></span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          6. PRICING
          ================================================================ */}
      <section className="bg-gray-50 border-t border-gray-100">
        <div ref={pricingRef} className="reveal-section max-w-7xl mx-auto px-6 md:px-10 py-24 md:py-32">
          <div className="mb-12">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Pricing</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Simple. No surprises.</h2>
            <p className="text-gray-500 mt-2 text-lg">Suppliers pay only when generating a report.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            <div className="price-card bg-white border border-gray-200 rounded-2xl p-8 flex flex-col">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Single Report</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold tracking-tight">€199</span>
                <span className="text-gray-400 text-sm font-medium">one-time</span>
              </div>
              <p className="text-sm text-gray-500 mb-7">One report, one year.</p>
              <ul className="space-y-3 mb-8 flex-1">
                {['1 PDF carbon declaration', 'All Scopes 1, 2 and 3', 'Evidence vault', 'Signed Declaration of Conformity'].map(i => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <CheckCircle2 size={13} className="text-[#C9A84C] flex-shrink-0" /> {i}
                  </li>
                ))}
              </ul>
              <SignedOut>
                <SignInButton mode="modal" forceRedirectUrl="/supplier">
                  <button className="w-full py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 hover:bg-gray-50 transition-colors">Get Started</button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/supplier" className="w-full py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 hover:bg-gray-50 transition-colors text-center block">Get Started</Link>
              </SignedIn>
            </div>

            <div className="price-card bg-[#0C2918] text-[#C9A84C] rounded-2xl p-8 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-44 h-44 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)' }}
              />
              <div className="absolute top-4 right-4 px-2.5 py-1 bg-[#C9A84C]/20 rounded-full text-[9px] font-bold uppercase tracking-widest text-[#C9A84C]">
                Popular
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#4A7A5C] mb-4">Annual — Solo</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold tracking-tight">€349</span>
                <span className="text-[#6B9B7A] text-sm font-medium">/ year</span>
              </div>
              <p className="text-sm text-[#6B9B7A] mb-7">Unlimited reports, one user.</p>
              <ul className="space-y-3 mb-8 flex-1">
                {['Unlimited PDF reports', 'All years, all scopes', 'Evidence vault', 'Priority email support', 'Factors updated with DEFRA, ADEME & IEA releases'].map(i => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-zinc-300">
                    <CheckCircle2 size={13} className="text-[#C9A84C] flex-shrink-0" /> {i}
                  </li>
                ))}
              </ul>
              <SignedOut>
                <SignInButton mode="modal" forceRedirectUrl="/supplier">
                  <button className="w-full py-3 bg-white text-black rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors">Get Started</button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/supplier" className="w-full py-3 bg-white text-black rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors text-center block">Go to Dashboard</Link>
              </SignedIn>
            </div>

            <div className="price-card bg-white border border-gray-200 rounded-2xl p-8 flex flex-col">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Team</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold tracking-tight">€799</span>
                <span className="text-gray-400 text-sm font-medium">/ year</span>
              </div>
              <p className="text-sm text-gray-500 mb-7">Up to 5 users.</p>
              <ul className="space-y-3 mb-8 flex-1">
                {['Everything in Annual', 'Up to 5 team members', 'Shared account access', 'Dedicated onboarding call', 'Priority email support'].map(i => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <CheckCircle2 size={13} className="text-[#C9A84C] flex-shrink-0" /> {i}
                  </li>
                ))}
              </ul>
              <a href="mailto:hello@vsmeos.fr" className="w-full py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 hover:bg-gray-50 transition-colors text-center block">
                Contact Us
              </a>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-5">
            All prices exclude VAT. EU VAT rules apply. 14-day right of withdrawal for annual plans —{' '}
            <a href="/terms" className="underline hover:text-gray-600">Terms of Service</a>.
          </p>
        </div>
      </section>

      {/* ================================================================
          7. FAQ
          ================================================================ */}
      <section className="border-t border-gray-100">
        <div ref={faqRef} className="reveal-section max-w-7xl mx-auto px-6 md:px-10 py-24 md:py-32">
          <div className="mb-12">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">FAQ</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Common questions.</h2>
          </div>

          <div className="max-w-3xl space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-gray-100 rounded-xl overflow-hidden transition-colors hover:bg-gray-50">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                >
                  <span className="font-bold text-gray-900 text-sm pr-4">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp size={15} className="text-gray-400 flex-shrink-0" />
                    : <ChevronDown size={15} className="text-gray-400 flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-50 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          8. FOOTER CTA — dark, reuses dot grid
          ================================================================ */}
      <section className="bg-[#0C2918] relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-10 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-28 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-3">
              Ready to respond<br />
              <span className="text-[#3D6B4E]">to your buyer?</span>
            </h2>
            <p className="text-[#6B9B7A] text-base max-w-md">
              Start your carbon assessment. Have your energy bills to hand.
            </p>
          </div>
          <SignedOut>
            <SignInButton mode="modal" forceRedirectUrl="/supplier">
              <button className="group flex-shrink-0 px-8 py-4 bg-white text-black rounded-2xl font-bold text-base hover:bg-gray-100 transition-all flex items-center gap-3 active:scale-95 shadow-2xl shadow-black/60">
                Start Your Report <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/supplier" className="group flex-shrink-0 px-8 py-4 bg-white text-black rounded-2xl font-bold text-base hover:bg-gray-100 transition-all flex items-center gap-3 active:scale-95">
              Resume Assessment <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </SignedIn>
        </div>
      </section>

      {/* ================================================================
          9. FOOTER
          ================================================================ */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-8 flex flex-col items-center gap-5">
          <div className="flex items-center gap-2.5">
            <VsmeLogo size={24} />
            <span className="text-sm font-bold tracking-tighter text-gray-400 uppercase">VSME OS</span>
          </div>
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            <a href="/privacy" className="hover:text-black transition-colors">Privacy</a>
            <a href="/terms"   className="hover:text-black transition-colors">Terms of Service</a>
          </div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-gray-300 text-center">
            © {new Date().getFullYear()} VSME OS. All rights reserved.
          </p>
        </div>
      </footer>

      <SampleReportModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}