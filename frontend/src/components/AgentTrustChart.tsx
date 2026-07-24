import React, { useState, useEffect, useRef } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';
import { ErrorBoundary } from './ErrorBoundary';

interface AgentMetrics {
  name: string;
  fullName: string;
  requests: number;
  trust: number;
}

function AgentTrustChartContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(500);
  const [secondsAgo, setSecondsAgo] = useState(0);

  const [agentData, setAgentData] = useState<AgentMetrics[]>([
    { name: 'Refund', fullName: 'Refund Agent', requests: 128, trust: 97 },
    { name: 'Credit', fullName: 'Credit Agent', requests: 86, trust: 92 },
    { name: 'Card', fullName: 'Card Agent', requests: 215, trust: 98 },
    { name: 'Dispute', fullName: 'Dispute Agent', requests: 64, trust: 95 },
    { name: 'Rewards', fullName: 'Rewards Agent', requests: 142, trust: 99 }
  ]);

  const [avgResponseTime, setAvgResponseTime] = useState(109);

  // ResizeObserver for chart width
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const measure = () => {
      if (node.clientWidth > 0) {
        setContainerWidth(node.clientWidth);
      }
    };

    measure();

    const ro = new ResizeObserver(() => {
      measure();
    });
    ro.observe(node);

    return () => ro.disconnect();
  }, []);

  // Streaming updates every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setAgentData(prev => {
        const safe = Array.isArray(prev) && prev.length === 5 ? prev : [
          { name: 'Refund', fullName: 'Refund Agent', requests: 128, trust: 97 },
          { name: 'Credit', fullName: 'Credit Agent', requests: 86, trust: 92 },
          { name: 'Card', fullName: 'Card Agent', requests: 215, trust: 98 },
          { name: 'Dispute', fullName: 'Dispute Agent', requests: 64, trust: 95 },
          { name: 'Rewards', fullName: 'Rewards Agent', requests: 142, trust: 99 }
        ];

        return safe.map(agent => ({
          name: agent.name,
          fullName: agent.fullName,
          requests: agent.requests + Math.floor(Math.random() * 4) + 1,
          trust: Math.min(100, Math.max(90, agent.trust + (Math.floor(Math.random() * 3) - 1)))
        }));
      });

      setAvgResponseTime(109 + Math.floor(Math.random() * 8 - 4));
      setSecondsAgo(0);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo(s => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalTrust = agentData.reduce((acc, curr) => acc + curr.trust, 0);
  const avgTrust = Math.round(totalTrust / agentData.length);

  return (
    <div className="glass-panel p-6 space-y-4 flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs uppercase tracking-widest font-black text-slate-300">Agent Activity & Trust Index</h3>
              <span className="flex items-center gap-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                <span>LIVE TELEMETRY (3s)</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Dual telemetry tracking action throughput vs reputational trust score</p>
          </div>

          <div className="text-[10px] font-mono text-slate-400">
            Last updated <span className="text-blue-400 font-bold">{secondsAgo}s ago</span>
          </div>
        </div>

        {/* HTML Legend Bar */}
        <div className="flex items-center gap-4 text-xs font-mono pt-1">
          <span className="flex items-center gap-1.5 text-blue-400 font-bold"><span className="h-2.5 w-2.5 rounded bg-blue-500"></span> Request Volume</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold"><span className="h-2.5 w-2.5 rounded bg-emerald-500"></span> Trust Score (%)</span>
        </div>
      </div>

      {/* Bulletproof AreaChart */}
      <div ref={containerRef} className="w-full h-[220px] my-1">
        <AreaChart 
          width={containerWidth > 0 ? containerWidth : 500} 
          height={220} 
          data={agentData} 
          margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
        >
          <defs>
            <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="trustGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="name" stroke="#475569" fontSize={10} />
          <YAxis stroke="#475569" fontSize={10} />
          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
          <Area type="monotone" dataKey="requests" name="Request Volume" stroke="#3b82f6" fill="url(#reqGrad)" strokeWidth={2} isAnimationActive={false} />
          <Area type="monotone" dataKey="trust" name="Trust Score (%)" stroke="#10b981" fill="url(#trustGrad)" strokeWidth={2} isAnimationActive={false} />
        </AreaChart>
      </div>

      {/* 5 Clean KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 pt-2">
        <div className="bg-slate-950/90 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Average Trust</span>
          <p className="text-base font-black text-emerald-400 font-mono my-1">{avgTrust}%</p>
          <span className="text-[9px] text-slate-500 leading-none">Fleet mean</span>
        </div>

        <div className="bg-slate-950/90 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Most Active</span>
          <p className="text-xs font-extrabold text-blue-400 truncate my-1">Card</p>
          <span className="text-[9px] text-slate-400 font-mono leading-none">{agentData[2]?.requests || 215} txn</span>
        </div>

        <div className="bg-slate-950/90 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Highest Trust</span>
          <p className="text-xs font-extrabold text-emerald-400 truncate my-1">Rewards</p>
          <span className="text-[9px] text-slate-400 font-mono leading-none">{agentData[4]?.trust || 99}%</span>
        </div>

        <div className="bg-slate-950/90 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Lowest Trust</span>
          <p className="text-xs font-black text-amber-400 truncate my-1">Credit</p>
          <span className="text-[9px] text-slate-400 font-mono leading-none">{agentData[1]?.trust || 92}%</span>
        </div>

        <div className="bg-slate-950/90 border border-slate-800 p-3 rounded-xl flex flex-col justify-between col-span-2 md:col-span-1">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Avg Latency</span>
          <p className="text-base font-black text-indigo-400 font-mono my-1">{avgResponseTime} ms</p>
          <span className="text-[9px] text-slate-500 leading-none">Real-time</span>
        </div>
      </div>
    </div>
  );
}

export default function AgentTrustChart() {
  return (
    <ErrorBoundary>
      <AgentTrustChartContent />
    </ErrorBoundary>
  );
}
