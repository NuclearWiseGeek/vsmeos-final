import Link from "next/link";
import Methodology from "./components/Methodology";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();

  return (
    <main className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      
      {/* --- 1. HEADER (Login & Logo) --- */}
      <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">V</span>
            </div>
            VSME OS
          </div>

          <nav className="flex items-center gap-6">
            <Link href="#methodology" className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block">
              How it Works
            </Link>
            <Link href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block">
              Pricing
            </Link>
            
            {userId ? (
              <Link 
                href="/dashboard"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition-all"
              >
                Go to Dashboard →
              </Link>
            ) : (
              <Link 
                href="/sign-in"
                className="px-4 py-2 bg-white text-black text-sm font-bold rounded-lg hover:bg-gray-200 transition-all"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* --- 2. HERO SECTION --- */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/30 border border-blue-800 text-blue-400 text-sm mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Live for French SMEs
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            ESG Reporting, <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Simplified.
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Generate your compliant Carbon Assessment (Scope 1, 2 & 3) in under 15 minutes. 
            No expensive consultants. No complex spreadsheets.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href={userId ? "/dashboard" : "/sign-up"}
              className="w-full sm:w-auto px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
            >
              Start Free Assessment ⚡
            </Link>
            <Link 
              href="#methodology"
              className="w-full sm:w-auto px-8 py-4 bg-gray-900 text-white border border-gray-800 rounded-xl hover:bg-gray-800 transition-all"
            >
              How it Works
            </Link>
          </div>
        </div>
      </section>

      {/* --- 3. METHODOLOGY SECTION --- */}
      {/* This component handles the ID="methodology" internally */}
      <Methodology />

      {/* --- 4. PRICING SECTION (New!) --- */}
      <section id="pricing" className="py-24 bg-black border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-gray-400">Everything you need to be compliant. No hidden fees.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            
            {/* Free Tier */}
            <div className="p-8 rounded-2xl bg-gray-900/50 border border-gray-800 flex flex-col">
              <div className="mb-4">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Starter</span>
                <div className="text-3xl font-bold mt-2 text-white">Free</div>
              </div>
              <ul className="space-y-4 mb-8 flex-1 text-gray-400 text-sm">
                <li className="flex gap-3">✅ <span className="text-gray-300">Basic Scope 1 & 2</span></li>
                <li className="flex gap-3">✅ <span className="text-gray-300">Online Dashboard</span></li>
                <li className="flex gap-3">✅ <span className="text-gray-300">Standard Support</span></li>
              </ul>
              <Link href="/sign-up" className="w-full py-3 rounded-xl bg-gray-800 text-white font-bold text-center hover:bg-gray-700 transition-all">
                Get Started
              </Link>
            </div>

            {/* Pro Tier (Highlighted) */}
            <div className="p-8 rounded-2xl bg-blue-900/10 border border-blue-500/50 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
              <div className="mb-4">
                <span className="text-sm font-bold text-blue-400 uppercase tracking-wider">Pro License</span>
                <div className="text-3xl font-bold mt-2 text-white">€49 <span className="text-lg font-normal text-gray-500">/report</span></div>
              </div>
              <ul className="space-y-4 mb-8 flex-1 text-gray-400 text-sm">
                <li className="flex gap-3">✅ <span className="text-white">Full Scope 1, 2 & 3</span></li>
                <li className="flex gap-3">✅ <span className="text-white">Official PDF Certificate</span></li>
                <li className="flex gap-3">✅ <span className="text-white">ADEME Factors</span></li>
                <li className="flex gap-3">✅ <span className="text-white">Audit-Ready Export</span></li>
              </ul>
              <Link href="/sign-up" className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-center hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20">
                Start Now
              </Link>
            </div>

            {/* Enterprise Tier */}
            <div className="p-8 rounded-2xl bg-gray-900/50 border border-gray-800 flex flex-col">
              <div className="mb-4">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Agency</span>
                <div className="text-3xl font-bold mt-2 text-white">Custom</div>
              </div>
              <ul className="space-y-4 mb-8 flex-1 text-gray-400 text-sm">
                <li className="flex gap-3">✅ <span className="text-gray-300">Multi-Client Dashboard</span></li>
                <li className="flex gap-3">✅ <span className="text-gray-300">White Label Reports</span></li>
                <li className="flex gap-3">✅ <span className="text-gray-300">API Access</span></li>
              </ul>
              <button className="w-full py-3 rounded-xl bg-gray-800 text-white font-bold text-center hover:bg-gray-700 transition-all cursor-not-allowed opacity-50">
                Contact Sales
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* --- 5. FOOTER --- */}
      <footer className="border-t border-gray-900 py-12 text-center text-gray-600 text-sm bg-black">
        <p>© 2026 VSME OS. Built for French Regulations.</p>
      </footer>

    </main>
  );
}