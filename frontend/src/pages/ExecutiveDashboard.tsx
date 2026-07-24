import React, { useState } from 'react';
import { 
  TrendingUp, DollarSign, Activity, Percent, ShieldCheck, 
  Layers, Database, Cpu, Network, Server, ArrowRight, Info, Clock, Award
} from 'lucide-react';

export default function ExecutiveDashboard() {
  // Slider Inputs for ROI Calculator
  const [monthlyRequests, setMonthlyRequests] = useState(15000);
  const [manualReviewCost, setManualReviewCost] = useState(45);
  const [averageFraudValue, setAverageFraudValue] = useState(1200);

  // Performance metrics baseline
  const automationRate = 91.5; // %
  const manualReviewReductionRate = 62.4; // %
  const complianceRate = 99.98; // %
  const fraudAttemptRate = 2.4; // % of requests flagged as fraud block

  // Calculations
  const monthlyReviewsReduced = monthlyRequests * (manualReviewReductionRate / 100.0);
  const monthlyManualCostSavings = monthlyReviewsReduced * manualReviewCost;
  
  const monthlyFraudBlockedCount = monthlyRequests * (fraudAttemptRate / 100.0);
  const monthlyFraudSavings = monthlyFraudBlockedCount * averageFraudValue;

  const totalMonthlySavings = monthlyManualCostSavings + monthlyFraudSavings;
  const annualSavings = totalMonthlySavings * 12;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-100 uppercase">Why American Express Needs GuardianAI</h2>
        <p className="text-xs text-blue-400 font-semibold tracking-wider uppercase mt-0.5">
          Quantifiable ROI & Risk Reduction Metrics for Senior Bank Leadership
        </p>
      </div>

      {/* Grid: 6 Key Business Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
        {[
          { label: 'Estimated Fraud Prevented', value: `$${(monthlyFraudSavings / 1000.0).toFixed(0)}k/mo`, desc: 'ML Risk blocks', icon: DollarSign, color: 'text-emerald-400', glow: 'glow-emerald' },
          { label: 'Manual Review Reduction', value: `${manualReviewReductionRate}%`, desc: 'Workload optimization', icon: TrendingUp, color: 'text-blue-400', glow: 'glow-blue' },
          { label: 'Cost Saved', value: `$${(annualSavings / 1000000.0).toFixed(1)}M/yr`, desc: 'Combined operational ROI', icon: Award, color: 'text-emerald-400', glow: 'glow-emerald' },
          { label: 'Automation Rate', value: `${automationRate}%`, desc: 'Hands-off approvals', icon: Percent, color: 'text-indigo-400', glow: 'glow-blue' },
          { label: 'Average Decision Time', value: '109 ms', desc: 'Real-time response', icon: Clock, color: 'text-amber-400', glow: 'glow-amber' },
          { label: 'Compliance Score', value: `${complianceRate}%`, desc: 'RBI & PCI DSS adherence', icon: ShieldCheck, color: 'text-emerald-400', glow: 'glow-emerald' }
        ].map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className={`glass-panel p-5 flex flex-col justify-between glass-card-hover min-h-[120px] ${m.glow}`}>
              <div className="flex items-start justify-between">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-none">{m.label}</span>
                <Icon className={`h-4.5 w-4.5 ${m.color}`} />
              </div>
              <div className="mt-3">
                <h3 className="text-xl font-black text-slate-50">{m.value}</h3>
                <p className="text-[9px] text-slate-500 mt-1 truncate font-mono">{m.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid: Business Impact Calculator & Deployment Architecture */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Business Value Calculator (Sliders) */}
        <div className="xl:col-span-2 glass-panel p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs uppercase tracking-widest font-black text-slate-300">Interactive Business ROI Calculator</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Model financial savings based on Amex transaction volumes</p>
            </div>
            <span className="flex items-center gap-1 text-[9px] font-mono text-blue-400 uppercase bg-blue-600/10 px-2.5 py-1 rounded-xl border border-blue-500/20">
              <Info className="h-3 w-3" />
              <span>Real-Time Modeler</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sliders Input */}
            <div className="space-y-6 text-xs">
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-semibold text-slate-300 font-mono">
                  <span>Monthly Agent Requests</span>
                  <span className="text-blue-400 font-bold">{monthlyRequests.toLocaleString()} txn</span>
                </div>
                <input 
                  type="range" 
                  min="2000" max="100000" step="2000"
                  value={monthlyRequests}
                  onChange={(e) => setMonthlyRequests(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-semibold text-slate-300 font-mono">
                  <span>Auditor Cost (per Review)</span>
                  <span className="text-blue-400 font-bold">${manualReviewCost} USD</span>
                </div>
                <input 
                  type="range" 
                  min="10" max="150" step="5"
                  value={manualReviewCost}
                  onChange={(e) => setManualReviewCost(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-semibold text-slate-300 font-mono">
                  <span>Average Fraud Impact</span>
                  <span className="text-blue-400 font-bold">${averageFraudValue} USD</span>
                </div>
                <input 
                  type="range" 
                  min="100" max="10000" step="250"
                  value={averageFraudValue}
                  onChange={(e) => setAverageFraudValue(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>

            {/* Calculations Output */}
            <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider block">Estimated Annual ROI Savings</span>
                  <h3 className="text-4xl font-black text-emerald-400">${(annualSavings / 1000000.0).toFixed(2)}M</h3>
                  <span className="text-[9px] text-slate-400 font-mono">Calculated for {monthlyRequests.toLocaleString()} monthly decisions</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono border-t border-slate-900 pt-4">
                  <div>
                    <span className="text-slate-500 text-[9px] uppercase">Manual Review Savings</span>
                    <p className="text-slate-200 font-bold">${(monthlyManualCostSavings * 12 / 1000.0).toFixed(0)}k/yr</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[9px] uppercase">Fraud Prevention Savings</span>
                    <p className="text-slate-200 font-bold">${(monthlyFraudSavings * 12 / 1000.0).toFixed(0)}k/yr</p>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 leading-normal border-t border-slate-900 pt-3 flex items-start gap-2 font-mono">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Automation rate of {automationRate}% reduces manual review costs by {manualReviewReductionRate}%.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Summary Card */}
        <div className="glass-panel p-6 flex flex-col justify-between min-h-[300px]">
          <div>
            <h3 className="text-xs uppercase tracking-widest font-black text-slate-300">Enterprise Value Mandate</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Summary for American Express board presentation</p>
          </div>

          <div className="space-y-4 my-4 text-xs">
            <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">Key Business Value Drivers</span>
              <ul className="space-y-2 text-[11px] text-slate-300 leading-relaxed font-mono">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  <span>Eliminates runaway AI spending loops.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                  <span>Enforces strict RBI & PCI DSS compliance.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                  <span>Provides full audit trail transparency for regulators.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="p-3 bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-bold rounded-xl text-center">
            Deployable in AWS Enterprise Cloud
          </div>
        </div>
      </div>

      {/* Cloud Deployment Architecture Section */}
      <div className="glass-panel p-6">
        <div className="mb-6">
          <h3 className="text-xs uppercase tracking-widest font-black text-slate-300">Enterprise Deployment Architecture</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">High-availability cloud setup with AWS Load Balancers, Kafka event streams, and Grafana monitoring</p>
        </div>

        <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl overflow-x-auto">
          <svg viewBox="0 0 1000 200" className="w-full min-w-[800px] h-auto">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
              </marker>
            </defs>

            {/* Node 1: Browser */}
            <g transform="translate(60, 100)">
              <rect x="-40" y="-30" width="80" height="60" rx="8" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
              <text textAnchor="middle" y="5" fill="#94a3b8" fontSize="9" fontWeight="bold">Operator UI</text>
              <text textAnchor="middle" y="18" fill="#475569" fontSize="8">HTTPS/React</text>
            </g>

            <line x1="100" y1="100" x2="160" y2="100" stroke="#475569" strokeWidth="1.5" markerEnd="url(#arrow)" />

            {/* Node 2: Load Balancer */}
            <g transform="translate(200, 100)">
              <rect x="-40" y="-30" width="80" height="60" rx="8" fill="#0b1329" stroke="#1d4ed8" strokeWidth="1.5" />
              <text textAnchor="middle" y="5" fill="#3b82f6" fontSize="9" fontWeight="bold">Load Balancer</text>
              <text textAnchor="middle" y="18" fill="#475569" fontSize="8">AWS ELB</text>
            </g>

            <line x1="240" y1="100" x2="300" y2="100" stroke="#475569" strokeWidth="1.5" markerEnd="url(#arrow)" />

            {/* Node 3: FastAPI Web App */}
            <g transform="translate(340, 100)">
              <rect x="-40" y="-30" width="80" height="60" rx="8" fill="#1e1b4b" stroke="#4f46e5" strokeWidth="1.5" />
              <text textAnchor="middle" y="5" fill="#818cf8" fontSize="9" fontWeight="bold">FastAPI Engine</text>
              <text textAnchor="middle" y="18" fill="#475569" fontSize="8">ECS Fargate</text>
            </g>

            <path d="M 380 100 L 410 100 L 410 50 L 440 50" stroke="#475569" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
            <path d="M 380 100 L 410 100 L 410 150 L 440 150" stroke="#475569" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />

            {/* Node 4: Redis cache */}
            <g transform="translate(480, 50)">
              <rect x="-40" y="-20" width="80" height="40" rx="6" fill="#1c0d12" stroke="#b91c1c" strokeWidth="1.5" />
              <text textAnchor="middle" y="3" fill="#f87171" fontSize="9" fontWeight="bold">Redis Cache</text>
              <text textAnchor="middle" y="13" fill="#475569" fontSize="7">ElastiCache</text>
            </g>

            {/* Node 5: PostgreSQL */}
            <g transform="translate(480, 150)">
              <rect x="-40" y="-20" width="80" height="40" rx="6" fill="#042f2e" stroke="#0d9488" strokeWidth="1.5" />
              <text textAnchor="middle" y="3" fill="#2dd4bf" fontSize="9" fontWeight="bold">PostgreSQL</text>
              <text textAnchor="middle" y="13" fill="#475569" fontSize="7">AWS RDS</text>
            </g>

            <line x1="380" y1="100" x2="600" y2="100" stroke="#475569" strokeWidth="1.5" markerEnd="url(#arrow)" />

            {/* Node 6: Kafka */}
            <g transform="translate(640, 100)">
              <rect x="-40" y="-30" width="80" height="60" rx="8" fill="#172554" stroke="#2563eb" strokeWidth="1.5" />
              <text textAnchor="middle" y="5" fill="#60a5fa" fontSize="9" fontWeight="bold">Kafka Broker</text>
              <text textAnchor="middle" y="18" fill="#475569" fontSize="8">Event Bus</text>
            </g>

            <line x1="680" y1="100" x2="740" y2="100" stroke="#475569" strokeWidth="1.5" markerEnd="url(#arrow)" />

            {/* Node 7: Prom / Grafana */}
            <g transform="translate(780, 100)">
              <rect x="-40" y="-30" width="80" height="60" rx="8" fill="#1e293b" stroke="#d97706" strokeWidth="1.5" />
              <text textAnchor="middle" y="5" fill="#fbbf24" fontSize="9" fontWeight="bold">Grafana Logs</text>
              <text textAnchor="middle" y="18" fill="#475569" fontSize="8">Monitoring</text>
            </g>

            <line x1="820" y1="100" x2="880" y2="100" stroke="#475569" strokeWidth="1.5" markerEnd="url(#arrow)" />

            {/* Node 8: AWS Cloud boundary */}
            <g transform="translate(920, 100)">
              <circle r="25" fill="#0f172a" stroke="#006fcf" strokeWidth="2" />
              <text textAnchor="middle" y="4" fill="#006fcf" fontSize="9" fontWeight="bold">AWS</text>
              <text textAnchor="middle" y="14" fill="#475569" fontSize="7">Cloud</text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
