import React, { useState } from 'react';
import { 
  BarChart3, 
  CheckCircle, 
  Clock, 
  Download, 
  FileText, 
  LayoutDashboard, 
  MoreVertical, 
  Search, 
  Settings, 
  User, 
  ChevronRight,
  Zap
  // Removed 'LucideIcon' - this was causing the error
} from 'lucide-react';

// --- Types & Interfaces ---

interface ResultItem {
  id: number;
  title: string;
  status: 'Completed' | 'Processing' | 'Failed';
  date: string;
  score: number;
  type: string;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

interface KpiCardProps {
  title: string;
  value: string;
  trend: string;
}

interface StatusBadgeProps {
  status: string;
}

// --- Main Component ---

const SaasDashboard = () => {
  // Mock Data
  const results: ResultItem[] = [
    { id: 1, title: 'Q4 Financial Projection', status: 'Completed', date: 'Jan 15, 2026', score: 98, type: 'Finance' },
    { id: 2, title: 'Market Analysis - EU', status: 'Processing', date: 'Jan 16, 2026', score: 45, type: 'Strategy' },
    { id: 3, title: 'Competitor Benchmark', status: 'Completed', date: 'Jan 14, 2026', score: 92, type: 'Research' },
    { id: 4, title: 'User Retention Report', status: 'Failed', date: 'Jan 12, 2026', score: 0, type: 'Analytics' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl z-10">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <Zap size={18} fill="white" />
            </div>
            NexusAI
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          <NavItem icon={<LayoutDashboard size={18} />} label="Overview" />
          <NavItem icon={<FileText size={18} />} label="Results" active />
          <NavItem icon={<BarChart3 size={18} />} label="Analytics" />
          <NavItem icon={<Settings size={18} />} label="Settings" />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-medium text-sm">
              JD
            </div>
            <div className="text-sm">
              <p className="text-white font-medium">Jane Doe</p>
              <p className="text-xs text-slate-500">Pro Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOP HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Analysis Results</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search reports..." 
                className="pl-9 pr-4 py-2 bg-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 transition-all"
              />
            </div>
            <button className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
              <User size={20} />
            </button>
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <KpiCard title="Total Analyses" value="1,284" trend="+12%" />
              <KpiCard title="Success Rate" value="98.2%" trend="+0.8%" />
              <KpiCard title="Processing Time" value="1.4s" trend="-0.2s" />
            </div>

            {/* RESULTS TABLE */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Recent Output</h3>
                  <p className="text-sm text-slate-500 mt-1">Manage and download your generated reports.</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm flex items-center gap-2">
                  <Zap size={16} />
                  New Analysis
                </button>
              </div>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-100">
                    <th className="px-6 py-4">Report Name</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Score</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {results.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">{item.title}</div>
                        <div className="text-xs text-slate-400">ID: #{item.id}2938</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${item.score > 90 ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                              style={{ width: `${item.score}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium text-slate-600">{item.score}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 flex items-center gap-2">
                        <Clock size={14} />
                        {item.date}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-md transition-colors" title="Download">
                            <Download size={16} />
                          </button>
                          <button className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-md transition-colors">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                <span>Showing 1-4 of 12 results</span>
                <div className="flex gap-2">
                  <button className="px-3 py-1 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50">Prev</button>
                  <button className="px-3 py-1 border border-slate-200 rounded-md hover:bg-slate-50">Next</button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

// --- Helper Components ---

const NavItem: React.FC<NavItemProps> = ({ icon, label, active = false }) => (
  <button 
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    {icon}
    {label}
  </button>
);

const KpiCard: React.FC<KpiCardProps> = ({ title, value, trend }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <h4 className="text-sm font-medium text-slate-500 mb-2">{title}</h4>
    <div className="flex items-end justify-between">
      <span className="text-2xl font-bold text-slate-900">{value}</span>
      <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend.includes('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
        {trend}
      </span>
    </div>
  </div>
);

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles: Record<string, string> = {
    Completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Processing: "bg-amber-50 text-amber-700 border-amber-100",
    Failed: "bg-rose-50 text-rose-700 border-rose-100",
  };
  
  const icons: Record<string, React.ReactNode> = {
    Completed: <CheckCircle size={12} />,
    Processing: <Clock size={12} />,
    Failed: <Zap size={12} />,
  };

  // Default to Processing if status not found
  const currentStyle = styles[status] || styles.Processing;
  const currentIcon = icons[status] || icons.Processing;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${currentStyle}`}>
      {currentIcon}
      {status}
    </span>
  );
};

export default SaasDashboard;