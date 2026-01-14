import Link from "next/link";
import Methodology from "./components/Methodology"; // We import the file we just made!

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      
      {/* 1. HERO SECTION (The Top Part) */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Glow */}
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
              href="/dashboard"
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

      {/* 2. METHODOLOGY SECTION (The New Part) */}
      <Methodology />

      {/* 3. FOOTER */}
      <footer className="border-t border-gray-900 py-12 mt-20 text-center text-gray-600 text-sm">
        <p>© 2026 VSME OS. Built for French Regulations.</p>
      </footer>

    </main>
  );
}