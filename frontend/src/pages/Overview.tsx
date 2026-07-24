import React, { useState, useEffect } from 'react';
import { 
  Users, Activity, ShieldAlert, CheckCircle, XCircle, AlertCircle, 
  TrendingUp, Shield, Cpu, Clock, Terminal, ChevronRight, Radio, RefreshCw, Zap
} from 'lucide-react';

import SpendLimitChart from '../components/SpendLimitChart';
import AgentTrustChart from '../components/AgentTrustChart';

export default function Overview() {
  const [secondsAgo, setSecondsAgo] = useState(1);
  const [stats, setStats] = useState<any>({
    summary: {
      total_agents: 5,
      active_agents: 5,
      suspended_agents: 0,
      total_requests: 635,
      approved_requests: 581,
      rejected_requests: 26,
      escalated_requests: 28,
      high_risk_requests: 12,
      policy_violations: 4,
      spend_utilization_pct: 25.9,
      total_daily_spend: 49200.0,
      total_daily_limit: 190000.0
    },
    fleet_health: { overall: 98.4, security: 96.0, compliance: 88.0, availability: 99.0, risk_level: "Low" }
  });

  // Animated live event feed ticker
  const [eventFeed, setEventFeed] = useState<any[]>([
    { id: 1, type: 'success', text: 'Refund Agent approved ₹4,200 refund', time: 'Just now' },
    { id: 2, type: 'rejected', text: 'Policy P-102 blocked ₹16,000 transaction', time: '2m ago' },
    { id: 3, type: 'escalated', text: 'HITL escalation created for Customer CUST-3877', time: '5m ago' },
    { id: 4, type: 'info', text: 'Compliance Agent verified PCI-DSS rules', time: '12m ago' }
  ]);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/analytics/dashboard');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        setSecondsAgo(0);
      }
    } catch (e) {
      setSecondsAgo(0);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-8">
      {/* Executive Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-100 uppercase">GuardianAI Control Center</h2>
          <p className="text-xs text-blue-400 font-semibold tracking-wider uppercase mt-0.5">
            Enterprise Trust Layer for Autonomous Financial Agents
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
            <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span>Updated {secondsAgo}s ago</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 px-5 shadow-2xl flex items-center gap-6">
            <div>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Fleet Health</span>
              <p className="text-lg font-black text-emerald-400">{stats.fleet_health?.overall}%</p>
            </div>
            <div className="border-l border-slate-800 pl-4 grid grid-cols-4 gap-4 text-[10px] font-mono">
              <div>
                <span className="text-slate-500 block text-[9px]">SECURITY</span>
                <span className="font-bold text-slate-200">96%</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px]">COMPLIANCE</span>
                <span className="font-bold text-slate-200">88%</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px]">AVAILABILITY</span>
                <span className="font-bold text-slate-200">99%</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px]">RISK</span>
                <span className="font-bold text-emerald-400 uppercase">Low</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Live Event Feed Ticker Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 overflow-hidden shadow-xl">
        <div className="flex items-center gap-2 shrink-0 border-r border-slate-800 pr-4">
          <Zap className="h-4 w-4 text-amber-400 animate-bounce" />
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-200">Live Event Feed</span>
        </div>
        <div className="flex items-center gap-6 overflow-x-auto text-xs font-mono whitespace-nowrap scrollbar-none">
          {eventFeed.map((item) => (
            <div key={item.id} className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800/80 shrink-0">
              <span className={`h-2 w-2 rounded-full ${
                item.type === 'success' ? 'bg-emerald-500 status-pulse-ring' :
                (item.type === 'rejected' ? 'bg-red-500 status-pulse-ring' :
                (item.type === 'escalated' ? 'bg-amber-500 status-pulse-ring' : 'bg-blue-500'))
              }`}></span>
              <span className="text-slate-200 font-bold">{item.text}</span>
              <span className="text-[9px] text-slate-500">({item.time})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: 10 Vital Indicator Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
        {[
          { label: 'Active AI Agents', value: stats.summary?.active_agents, desc: 'Registered runtimes', icon: Users, color: 'text-blue-400' },
          { label: 'Suspended Agents', value: stats.summary?.suspended_agents, desc: 'Emergency paused', icon: AlertCircle, color: stats.summary?.suspended_agents > 0 ? 'text-red-400' : 'text-slate-500' },
          { label: 'Total Requests Today', value: stats.summary?.total_requests, desc: 'Processed actions', icon: Activity, color: 'text-indigo-400' },
          { label: 'Approved Actions', value: stats.summary?.approved_requests, desc: 'Clear guidelines', icon: CheckCircle, color: 'text-emerald-400' },
          { label: 'Rejected Actions', value: stats.summary?.rejected_requests, desc: 'Policy blocked', icon: XCircle, color: 'text-red-400' },
          { label: 'HITL Escalations', value: stats.summary?.escalated_requests, desc: 'Needs operator review', icon: Clock, color: 'text-amber-400' },
          { label: 'High Risk Requests', value: stats.summary?.high_risk_requests, desc: 'Risk Score > 60', icon: ShieldAlert, color: 'text-orange-400' },
          { label: 'Policy Violations', value: stats.summary?.policy_violations, desc: 'Triggered alarms', icon: AlertCircle, color: 'text-red-400' },
          { label: 'Spend Utilization', value: `${stats.summary?.spend_utilization_pct}%`, desc: `₹${(stats.summary?.total_daily_spend || 0).toLocaleString()} / ₹${(stats.summary?.total_daily_limit || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-blue-400' },
          { label: 'Compliance Score', value: `${stats.fleet_health?.compliance}%`, desc: 'RBI & PCI adherence', icon: Shield, color: 'text-emerald-400' },
        ].map((c, idx) => {
          const Icon = c.icon;
          return (
            <div key={idx} className="glass-panel p-5 flex flex-col justify-between glass-card-hover min-h-[110px]">
              <div className="flex items-start justify-between">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider leading-none">{c.label}</span>
                <Icon className={`h-4.5 w-4.5 ${c.color}`} />
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-black text-slate-50">{c.value}</h3>
                <p className="text-[9px] text-slate-500 mt-1 truncate font-mono">{c.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid: Multi-Agent Governance Pipeline Map & Decision Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Multi-Agent Governance Pipeline Map */}
        <div className="lg:col-span-2 glass-panel p-6 flex flex-col justify-between overflow-hidden">
          <div className="mb-4">
            <h3 className="text-xs uppercase tracking-widest font-black text-slate-300">Multi-Agent Governance Pipeline Flow</h3>
            <p className="text-[10px] text-slate-500">Sequential multi-agent authorization and verification data flow</p>
          </div>

          <div className="bg-slate-950 border border-slate-850 rounded-2xl p-6 relative flex flex-col justify-between min-h-[340px]">
            <svg viewBox="0 0 800 240" className="w-full h-auto">
              <defs>
                <linearGradient id="blueLine" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>

              <line x1="80" y1="50" x2="240" y2="50" stroke="#3b82f6" strokeWidth="2" strokeDasharray="6 4" className="animate-flow-dash" />
              <line x1="240" y1="50" x2="400" y2="50" stroke="#3b82f6" strokeWidth="2" strokeDasharray="6 4" className="animate-flow-dash" />
              <line x1="400" y1="50" x2="560" y2="50" stroke="#3b82f6" strokeWidth="2" strokeDasharray="6 4" className="animate-flow-dash" />
              <line x1="560" y1="50" x2="720" y2="50" stroke="#3b82f6" strokeWidth="2" strokeDasharray="6 4" className="animate-flow-dash" />
              
              <line x1="720" y1="50" x2="720" y2="170" stroke="#10b981" strokeWidth="2" strokeDasharray="6 4" className="animate-flow-dash" />
              <line x1="720" y1="170" x2="560" y2="170" stroke="#10b981" strokeWidth="2" strokeDasharray="6 4" className="animate-flow-dash" />
              <line x1="560" y1="170" x2="400" y2="170" stroke="#10b981" strokeWidth="2" strokeDasharray="6 4" className="animate-flow-dash" />
              <line x1="400" y1="170" x2="240" y2="170" stroke="#10b981" strokeWidth="2" strokeDasharray="6 4" className="animate-flow-dash" />

              <g transform="translate(80, 50)">
                <circle r="22" fill="#0f172a" stroke="#006fcf" strokeWidth="2" />
                <text textAnchor="middle" y="4" fill="#006fcf" fontSize="9" fontWeight="bold">ADM</text>
                <text textAnchor="middle" y="36" fill="#cbd5e1" fontSize="9" fontWeight="bold">Administrator</text>
              </g>

              <g transform="translate(240, 50)">
                <circle r="22" fill="#1e1b4b" stroke="#818cf8" strokeWidth="2" />
                <text textAnchor="middle" y="4" fill="#818cf8" fontSize="9" fontWeight="bold">POL</text>
                <text textAnchor="middle" y="36" fill="#cbd5e1" fontSize="9" fontWeight="bold">Policy Engine</text>
              </g>

              <g transform="translate(400, 50)">
                <circle r="22" fill="#172554" stroke="#3b82f6" strokeWidth="2" />
                <text textAnchor="middle" y="4" fill="#60a5fa" fontSize="9" fontWeight="bold">FRD</text>
                <text textAnchor="middle" y="36" fill="#cbd5e1" fontSize="9" fontWeight="bold">Fraud Agent</text>
              </g>

              <g transform="translate(560, 50)">
                <circle r="22" fill="#172554" stroke="#3b82f6" strokeWidth="2" />
                <text textAnchor="middle" y="4" fill="#60a5fa" fontSize="9" fontWeight="bold">VER</text>
                <text textAnchor="middle" y="36" fill="#cbd5e1" fontSize="9" fontWeight="bold">Customer Verification</text>
              </g>

              <g transform="translate(720, 50)">
                <circle r="22" fill="#022c22" stroke="#10b981" strokeWidth="2" />
                <text textAnchor="middle" y="4" fill="#34d399" fontSize="9" fontWeight="bold">CMP</text>
                <text textAnchor="middle" y="36" fill="#cbd5e1" fontSize="9" fontWeight="bold">Compliance Agent</text>
              </g>

              <g transform="translate(560, 170)">
                <rect x="-45" y="-18" width="90" height="36" rx="6" fill="#1e1b4b" stroke="#818cf8" strokeWidth="2" />
                <text textAnchor="middle" y="4" fill="#818cf8" fontSize="9" fontWeight="bold">Governance Core</text>
              </g>

              <g transform="translate(400, 170)">
                <circle r="22" fill="#022c22" stroke="#10b981" strokeWidth="2" />
                <text textAnchor="middle" y="4" fill="#34d399" fontSize="9" fontWeight="bold">DEC</text>
                <text textAnchor="middle" y="36" fill="#cbd5e1" fontSize="9" fontWeight="bold">Final Decision</text>
              </g>

              <g transform="translate(240, 170)">
                <rect x="-40" y="-18" width="80" height="36" rx="6" fill="#0f172a" stroke="#475569" strokeWidth="2" />
                <text textAnchor="middle" y="4" fill="#94a3b8" fontSize="9" fontWeight="bold">Audit Ledger</text>
              </g>
            </svg>

            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 border-t border-slate-900 pt-3">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active Multi-Agent Collaboration Active</span>
              </span>
              <span>Average Pipeline Latency: 109 ms</span>
            </div>
          </div>
        </div>

        {/* Decision Outcome Funnel */}
        <div className="glass-panel p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xs uppercase tracking-widest font-black text-slate-300">Decision Outcome Funnel</h3>
            <p className="text-[10px] text-slate-500">Pipeline conversion and security filter retention</p>
          </div>

          <div className="space-y-4 my-6">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between font-mono">
                <span className="text-slate-300 font-bold">100 Requests Received</span>
                <span className="text-slate-400">100%</span>
              </div>
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full w-full"></div>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between font-mono">
                <span className="text-emerald-400 font-bold">87 Approved Actions</span>
                <span className="text-emerald-400">87%</span>
              </div>
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-[87%] glow-emerald"></div>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between font-mono">
                <span className="text-amber-400 font-bold">9 Escalated to HITL</span>
                <span className="text-amber-400">9%</span>
              </div>
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full w-[9%] glow-amber"></div>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between font-mono">
                <span className="text-red-400 font-bold">4 Rejected & Blocked</span>
                <span className="text-red-400">4%</span>
              </div>
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full w-[4%] glow-red"></div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl text-[10px] text-slate-400 font-mono flex items-center justify-between">
            <span>Automation Rate:</span>
            <span className="text-emerald-400 font-bold">91.5%</span>
          </div>
        </div>
      </div>

      {/* Grid: CARD 1 & CARD 2 High-Fidelity Streaming Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CARD 1: Spend Limit Utilization */}
        <SpendLimitChart />

        {/* CARD 2: Agent Activity & Trust Index */}
        <AgentTrustChart />
      </div>
    </div>
  );
}
