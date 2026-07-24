import React, { useState, useEffect, useRef } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';
import { ErrorBoundary } from './ErrorBoundary';

interface AgentSpend {
  name: string;
  limit: number;
  current: number;
  formattedLimit: string;
}

function SpendLimitChartContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(500);

  const [agentsSpend, setAgentsSpend] = useState<Record<string, AgentSpend>>({
    "Refund Agent": { name: "Refund Agent", limit: 50000, current: 14438, formattedLimit: "₹50k" },
    "Credit Agent": { name: "Credit Agent", limit: 100000, current: 29555, formattedLimit: "₹100k" },
    "Card Agent": { name: "Card Agent", limit: 40000, current: 10660, formattedLimit: "₹40k" }
  });

  const [streamData, setStreamData] = useState<any[]>(() => {
    const initial = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 2000);
      const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      initial.push({
        time: timeStr,
        "Refund Agent": 14438 + Math.floor(Math.sin(i) * 1200),
        "Credit Agent": 29555 + Math.floor(Math.cos(i) * 1800),
        "Card Agent": 10660 + Math.floor(Math.sin(i * 0.5) * 800)
      });
    }
    return initial;
  });

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

  // Streaming data every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setAgentsSpend(prev => {
        const refundCurr = prev["Refund Agent"] ? prev["Refund Agent"].current : 14438;
        const creditCurr = prev["Credit Agent"] ? prev["Credit Agent"].current : 29555;
        const cardCurr = prev["Card Agent"] ? prev["Card Agent"].current : 10660;

        const nextRefund = Math.min(50000, Math.max(8000, refundCurr + Math.floor(Math.random() * 900 - 400)));
        const nextCredit = Math.min(100000, Math.max(15000, creditCurr + Math.floor(Math.random() * 1400 - 600)));
        const nextCard = Math.min(40000, Math.max(4000, cardCurr + Math.floor(Math.random() * 600 - 250)));

        const updated = {
          "Refund Agent": { name: "Refund Agent", limit: 50000, current: nextRefund, formattedLimit: "₹50k" },
          "Credit Agent": { name: "Credit Agent", limit: 100000, current: nextCredit, formattedLimit: "₹100k" },
          "Card Agent": { name: "Card Agent", limit: 40000, current: nextCard, formattedLimit: "₹40k" }
        };

        setStreamData(oldData => {
          const nextPoint = {
            time: timeStr,
            "Refund Agent": nextRefund,
            "Credit Agent": nextCredit,
            "Card Agent": nextCard
          };
          const safeData = Array.isArray(oldData) && oldData.length > 0 ? oldData : [];
          return [...safeData.slice(1), nextPoint];
        });

        return updated;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (current: number, limit: number) => {
    const pct = (current / limit) * 100;
    if (pct >= 100) return { label: 'CRITICAL', bg: 'bg-red-500/20 text-red-400 border-red-500/30' };
    if (pct >= 90) return { label: 'WARNING', bg: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
    if (pct >= 70) return { label: 'ELEVATED', bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    return { label: 'NORMAL', bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
  };

  return (
    <div className="glass-panel p-6 space-y-4 flex flex-col justify-between">
      {/* Header with Clean HTML Legend */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs uppercase tracking-widest font-black text-slate-300">Spend Limit Utilization</h3>
              <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span>STREAMING (2s)</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Real-time spend stream telemetry (showing last 30 intervals)</p>
          </div>

          <div className="flex items-center gap-3 text-[10px] font-mono">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500"></span> &lt;70%</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500"></span> 70%</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-orange-500"></span> 90%</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500"></span> 100%</span>
          </div>
        </div>

        {/* HTML Line Legend Bar (No SVG Overlap) */}
        <div className="flex items-center gap-4 text-xs font-mono pt-1">
          <span className="flex items-center gap-1.5 text-blue-400 font-bold"><span className="h-2.5 w-2.5 rounded bg-blue-500"></span> Refund Agent</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold"><span className="h-2.5 w-2.5 rounded bg-emerald-500"></span> Credit Agent</span>
          <span className="flex items-center gap-1.5 text-indigo-400 font-bold"><span className="h-2.5 w-2.5 rounded bg-indigo-400"></span> Card Agent</span>
        </div>
      </div>

      {/* Clean AreaChart */}
      <div ref={containerRef} className="w-full h-[220px] my-1">
        <AreaChart 
          width={containerWidth > 0 ? containerWidth : 500} 
          height={220} 
          data={streamData} 
          margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
        >
          <defs>
            <linearGradient id="refundGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="creditGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="time" stroke="#475569" fontSize={9} />
          <YAxis stroke="#475569" fontSize={9} tickFormatter={(val) => `₹${val/1000}k`} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
            formatter={(val: any) => [`₹${Number(val || 0).toLocaleString()}`, '']}
          />
          <Area type="monotone" dataKey="Refund Agent" stroke="#3b82f6" fill="url(#refundGrad)" strokeWidth={2} isAnimationActive={false} />
          <Area type="monotone" dataKey="Credit Agent" stroke="#10b981" fill="url(#creditGrad)" strokeWidth={2} isAnimationActive={false} />
          <Area type="monotone" dataKey="Card Agent" stroke="#818cf8" fill="url(#cardGrad)" strokeWidth={2} isAnimationActive={false} />
        </AreaChart>
      </div>

      {/* Live Agent Cards Below */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {Object.values(agentsSpend).map((agent) => {
          const limit = agent.limit || 1;
          const current = agent.current || 0;
          const pct = Math.min(100, Math.round((current / limit) * 100));
          const status = getStatusBadge(current, limit);

          return (
            <div key={agent.name} className="bg-slate-950/90 border border-slate-800 p-3.5 rounded-2xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs text-slate-200">{agent.name}</span>
                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${status.bg}`}>
                  {status.label}
                </span>
              </div>

              <div>
                <div className="flex justify-between items-baseline gap-1">
                  <span className="text-base font-black text-slate-100 font-mono">
                    ₹{current.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono font-bold">
                    / {agent.formattedLimit}
                  </span>
                </div>

                <div className="h-2 w-full bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      pct >= 90 ? 'bg-red-500 glow-red' : (pct >= 70 ? 'bg-amber-500 glow-amber' : 'bg-blue-500 glow-blue')
                    }`}
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] font-mono pt-1 text-slate-400">
                <span>Budget Utilized:</span>
                <span className="font-bold text-slate-200">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SpendLimitChart() {
  return (
    <ErrorBoundary>
      <SpendLimitChartContent />
    </ErrorBoundary>
  );
}
