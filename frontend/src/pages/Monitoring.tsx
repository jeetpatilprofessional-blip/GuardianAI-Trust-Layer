import React, { useState, useEffect, useRef } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';
import { 
  Terminal, Activity, Server, Cpu, Database, ChevronRight, HardDrive, Clock, Zap, ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw
} from 'lucide-react';
import { ErrorBoundary } from '../components/ErrorBoundary';

interface SparklinePoint {
  time: string;
  cpu: number;
  mem: number;
  latency: number;
  rps: number;
}

interface ServiceHealth {
  name: string;
  status: "ONLINE" | "WARNING" | "OFFLINE";
  latency: number;
}

interface AlertItem {
  id: string;
  time: string;
  msg: string;
  severity: "CRITICAL" | "WARNING" | "INFO" | "RESOLVED";
}

function MonitoringContent() {
  const containerRef1 = useRef<HTMLDivElement>(null);
  const containerRef2 = useRef<HTMLDivElement>(null);
  const containerRef3 = useRef<HTMLDivElement>(null);
  const containerRef4 = useRef<HTMLDivElement>(null);

  const [w1, setW1] = useState(280);
  const [w2, setW2] = useState(280);
  const [w3, setW3] = useState(280);
  const [w4, setW4] = useState(280);

  // Measure widths for instant chart paint
  useEffect(() => {
    const m = () => {
      if (containerRef1.current?.clientWidth) setW1(containerRef1.current.clientWidth);
      if (containerRef2.current?.clientWidth) setW2(containerRef2.current.clientWidth);
      if (containerRef3.current?.clientWidth) setW3(containerRef3.current.clientWidth);
      if (containerRef4.current?.clientWidth) setW4(containerRef4.current.clientWidth);
    };
    m();
    const ro = new ResizeObserver(m);
    if (containerRef1.current) ro.observe(containerRef1.current);
    if (containerRef2.current) ro.observe(containerRef2.current);
    if (containerRef3.current) ro.observe(containerRef3.current);
    if (containerRef4.current) ro.observe(containerRef4.current);
    return () => ro.disconnect();
  }, []);

  // 60-Second Sparkline History
  const [timeline, setTimeline] = useState<SparklinePoint[]>(() => {
    const init = [];
    const now = new Date();
    for (let i = 59; i >= 0; i--) {
      const t = new Date(now.getTime() - i * 1000);
      const tStr = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      init.push({
        time: tStr,
        cpu: Math.round((14.2 + (Math.random() * 4 - 2)) * 10) / 10,
        mem: Math.round((48.6 + (Math.random() * 3 - 1.5)) * 10) / 10,
        latency: Math.round(109 + (Math.random() * 12 - 6)),
        rps: Math.round(45 + (Math.random() * 14 - 7))
      });
    }
    return init;
  });

  // System Vitals State
  const [totalRequests, setTotalRequests] = useState(1482920);

  // Terminal Logs State
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] Gateway heartbeat OK`,
    `[${new Date().toLocaleTimeString()}] Refund Agent health check passed`,
    `[${new Date().toLocaleTimeString()}] Risk Engine score cache refreshed`,
    `[${new Date().toLocaleTimeString()}] Policy P-102 synchronized`,
    `[${new Date().toLocaleTimeString()}] Audit logs committed`,
    `[${new Date().toLocaleTimeString()}] Notification service heartbeat OK`,
    `[${new Date().toLocaleTimeString()}] AI Governance Copilot indexed latest events`,
    `[${new Date().toLocaleTimeString()}] Fleet telemetry synchronized`
  ]);

  const terminalBoxRef = useRef<HTMLDivElement>(null);

  // Live Services Health
  const [services] = useState<ServiceHealth[]>([
    { name: "API Gateway", status: "ONLINE", latency: 8 },
    { name: "Authentication Service", status: "ONLINE", latency: 12 },
    { name: "Governance Engine", status: "ONLINE", latency: 14 },
    { name: "Policy Engine", status: "ONLINE", latency: 9 },
    { name: "Risk Engine", status: "ONLINE", latency: 18 },
    { name: "Decision Engine", status: "ONLINE", latency: 11 },
    { name: "Audit Service", status: "ONLINE", latency: 15 },
    { name: "Notification Service", status: "ONLINE", latency: 10 },
    { name: "PostgreSQL", status: "ONLINE", latency: 4 },
    { name: "Redis Cache", status: "ONLINE", latency: 2 }
  ]);

  // Live Alerts Feed State
  const [alertsFeed, setAlertsFeed] = useState<AlertItem[]>([
    { id: "1", time: "17:20:45", msg: "Refund Agent daily spend boundary verified", severity: "INFO" },
    { id: "2", time: "17:19:30", msg: "Policy P-102 cache synchronized across cluster", severity: "INFO" },
    { id: "3", time: "17:18:12", msg: "CPU load normalized on primary node", severity: "RESOLVED" },
    { id: "4", time: "17:16:04", msg: "High latency spike resolved (112ms)", severity: "RESOLVED" }
  ]);

  // 1-Second Telemetry Ticker
  useEffect(() => {
    const interval = setInterval(() => {
      const tStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      // Occasional latency spike simulation
      const isSpike = Math.random() < 0.1;
      const nextCpu = Math.round((14.2 + (Math.random() * 6 - 3)) * 10) / 10;
      const nextMem = Math.round((48.6 + (Math.random() * 4 - 2)) * 10) / 10;
      const nextLat = isSpike ? Math.floor(Math.random() * 80 + 160) : Math.floor(Math.random() * 14 + 102);
      const nextRps = Math.floor(Math.random() * 30 + 35);

      setTotalRequests(prev => prev + nextRps);

      setTimeline(prev => {
        const safe = Array.isArray(prev) ? prev : [];
        const nextPoint = { time: tStr, cpu: nextCpu, mem: nextMem, latency: nextLat, rps: nextRps };
        return [...safe.slice(1), nextPoint];
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 2-Second Terminal Log Generator
  useEffect(() => {
    const logTemplates = [
      "Gateway heartbeat OK",
      "Refund Agent health check passed",
      "Risk Engine score cache refreshed",
      "Policy P-102 synchronized",
      "Audit logs committed",
      "Notification service heartbeat OK",
      "AI Governance Copilot indexed latest events",
      "Fleet telemetry synchronized",
      "POST /api/v1/governance/request 200 OK - 109ms",
      "GET /api/v1/monitor/health 200 OK - 12ms",
      "Security Scanned payload for customer - Clear",
      "Credit Agent threshold compliance verified",
      "PostgreSQL connection pool healthy (18 active)"
    ];

    const timer = setInterval(() => {
      const template = logTemplates[Math.floor(Math.random() * logTemplates.length)];
      const tStr = new Date().toLocaleTimeString();
      setTerminalLogs(prev => {
        const nextLogs = [...prev, `[${tStr}] ${template}`];
        return nextLogs.slice(-100);
      });
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalBoxRef.current) {
      terminalBoxRef.current.scrollTop = terminalBoxRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  // Compute Sparkline Metrics
  const lastPoint = timeline[timeline.length - 1] || { cpu: 14.2, mem: 48.6, latency: 109, rps: 45 };
  const cpuValues = timeline.map(t => t.cpu);
  const minCpu = Math.min(...cpuValues);
  const maxCpu = Math.max(...cpuValues);
  const avgCpu = (cpuValues.reduce((a, b) => a + b, 0) / cpuValues.length).toFixed(1);

  const memValues = timeline.map(t => t.mem);
  const avgMem = (memValues.reduce((a, b) => a + b, 0) / memValues.length).toFixed(1);
  const usedMemGB = ((Number(avgMem) / 100) * 32).toFixed(2);

  const latValues = timeline.map(t => t.latency);
  const avgLat = Math.round(latValues.reduce((a, b) => a + b, 0) / latValues.length);
  const sortedLat = [...latValues].sort((a, b) => a - b);
  const p95Lat = sortedLat[Math.floor(sortedLat.length * 0.95)] || 142;
  const p99Lat = sortedLat[Math.floor(sortedLat.length * 0.99)] || 185;

  const rpsValues = timeline.map(t => t.rps);
  const peakRps = Math.max(...rpsValues);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-100 uppercase">Diagnostic Monitoring</h2>
        <p className="text-xs text-blue-400 font-semibold tracking-wider uppercase mt-0.5">
          Enterprise real-time observability desk, service health, and automated terminal tail feed
        </p>
      </div>

      {/* Fleet Health Summary Banner */}
      <div className="glass-panel p-5 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 text-center font-mono">
        <div className="border-r border-slate-800/80 pr-2">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Running Agents</span>
          <span className="text-base font-black text-emerald-400 mt-1 block">5</span>
        </div>
        <div className="border-r border-slate-800/80 pr-2">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Offline Agents</span>
          <span className="text-base font-black text-slate-400 mt-1 block">0</span>
        </div>
        <div className="border-r border-slate-800/80 pr-2">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Average CPU</span>
          <span className="text-base font-black text-blue-400 mt-1 block">{avgCpu}%</span>
        </div>
        <div className="border-r border-slate-800/80 pr-2">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Average Memory</span>
          <span className="text-base font-black text-emerald-400 mt-1 block">{avgMem}%</span>
        </div>
        <div className="border-r border-slate-800/80 pr-2">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Average Latency</span>
          <span className="text-base font-black text-amber-400 mt-1 block">{avgLat} ms</span>
        </div>
        <div className="border-r border-slate-800/80 pr-2">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">System Uptime</span>
          <span className="text-base font-black text-indigo-400 mt-1 block">99.98%</span>
        </div>
        <div className="border-r border-slate-800/80 pr-2">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Total Processed</span>
          <span className="text-base font-black text-slate-200 mt-1 block">{totalRequests.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Error Rate</span>
          <span className="text-base font-black text-emerald-400 mt-1 block">0.02%</span>
        </div>
      </div>

      {/* Grid: 4 Real-time Diagnostic Telemetry Sparkline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: CPU Load */}
        <div className="glass-panel p-5 space-y-3 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">CPU Load (%)</span>
            <Cpu className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-100 font-mono">{lastPoint.cpu}%</h3>
            <p className="text-[10px] text-slate-500">Live 60-second telemetry</p>
          </div>

          <div ref={containerRef1} className="w-full h-24 my-1">
            <AreaChart width={w1} height={96} data={timeline} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="cpuG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="cpu" stroke="#3b82f6" fill="url(#cpuG)" strokeWidth={2} isAnimationActive={false} />
            </AreaChart>
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-850">
            <span>Min: <strong className="text-slate-200">{minCpu}%</strong></span>
            <span>Max: <strong className="text-slate-200">{maxCpu}%</strong></span>
            <span>Avg: <strong className="text-blue-400">{avgCpu}%</strong></span>
          </div>
        </div>

        {/* Card 2: Memory Load */}
        <div className="glass-panel p-5 space-y-3 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Memory Utilization</span>
            <HardDrive className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-100 font-mono">{lastPoint.mem}%</h3>
            <p className="text-[10px] text-slate-500">Fluctuating between 35% - 65%</p>
          </div>

          <div ref={containerRef2} className="w-full h-24 my-1">
            <AreaChart width={w2} height={96} data={timeline} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="memG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="mem" stroke="#10b981" fill="url(#memG)" strokeWidth={2} isAnimationActive={false} />
            </AreaChart>
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-850">
            <span>RAM: <strong className="text-emerald-400">{usedMemGB} GB</strong> / 32.00 GB</span>
          </div>
        </div>

        {/* Card 3: Latency */}
        <div className="glass-panel p-5 space-y-3 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Latency (ms)</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-100 font-mono">{lastPoint.latency} ms</h3>
            <p className="text-[10px] text-slate-500">Real-time RPC response speed</p>
          </div>

          <div ref={containerRef3} className="w-full h-24 my-1">
            <AreaChart width={w3} height={96} data={timeline} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="latG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="latency" stroke="#f59e0b" fill="url(#latG)" strokeWidth={2} isAnimationActive={false} />
            </AreaChart>
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-850">
            <span>Avg: <strong className="text-amber-400">{avgLat}ms</strong></span>
            <span>P95: <strong className="text-slate-200">{p95Lat}ms</strong></span>
            <span>P99: <strong className="text-slate-200">{p99Lat}ms</strong></span>
          </div>
        </div>

        {/* Card 4: Requests / Sec (RPS) */}
        <div className="glass-panel p-5 space-y-3 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Throughput (RPS)</span>
            <Zap className="h-4 w-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-100 font-mono">{lastPoint.rps} RPS</h3>
            <p className="text-[10px] text-slate-500">Traffic volume (20 - 80 RPS)</p>
          </div>

          <div ref={containerRef4} className="w-full h-24 my-1">
            <AreaChart width={w4} height={96} data={timeline} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="rpsG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="rps" stroke="#818cf8" fill="url(#rpsG)" strokeWidth={2} isAnimationActive={false} />
            </AreaChart>
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-850">
            <span>Current: <strong className="text-indigo-400">{lastPoint.rps} RPS</strong></span>
            <span>Peak: <strong className="text-slate-200">{peakRps} RPS</strong></span>
          </div>
        </div>
      </div>

      {/* Grid: 10 Core Services Health Panel & Alerts Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Service Health Panel (10 Enterprise Services) */}
        <div className="lg:col-span-2 glass-panel p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-emerald-400" />
              <h3 className="text-xs uppercase tracking-widest font-black text-slate-300">Service Health Matrix</h3>
            </div>
            <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              10 / 10 ONLINE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {services.map((svc) => (
              <div key={svc.name} className="bg-slate-950 border border-slate-850 p-3 rounded-xl flex items-center justify-between font-mono">
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-bold text-slate-200">{svc.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-500">{svc.latency} ms</span>
                  <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
                    ONLINE
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Alerts Feed */}
        <div className="glass-panel p-6 space-y-4 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-400" />
              <h3 className="text-xs uppercase tracking-widest font-black text-slate-300">Live Alerts Feed</h3>
            </div>
            <span className="text-[9px] font-mono text-blue-400 font-bold">STREAMING</span>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-64">
            {alertsFeed.map((alt) => (
              <div key={alt.id} className="bg-slate-950 border border-slate-850 p-3 rounded-xl space-y-1 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-500">{alt.time}</span>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${
                    alt.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                    (alt.severity === 'WARNING' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                    (alt.severity === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'))
                  }`}>
                    {alt.severity}
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] leading-tight font-semibold">{alt.msg}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Auto-scrolling Real Live Terminal Log */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-blue-400" />
            <h3 className="text-xs uppercase tracking-widest font-black text-slate-300">Console Log Output Stream</h3>
          </div>
          <span className="px-2.5 py-0.5 rounded bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[9px] font-mono font-bold animate-pulse">
            LIVE TAIL FEED (2s)
          </span>
        </div>

        <div ref={terminalBoxRef} className="bg-black/95 border border-slate-800 rounded-xl p-4 h-64 overflow-y-auto font-mono text-[11px] text-emerald-400 leading-relaxed space-y-1 shadow-inner">
          {terminalLogs.map((log, idx) => (
            <div key={idx} className="flex gap-2">
              <ChevronRight className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Monitoring() {
  return (
    <ErrorBoundary>
      <MonitoringContent />
    </ErrorBoundary>
  );
}
