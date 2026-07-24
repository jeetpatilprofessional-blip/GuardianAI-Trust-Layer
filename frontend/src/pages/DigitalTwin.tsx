import React, { useState, useEffect, useRef } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';
import { 
  ShieldAlert, Zap, RefreshCw, Cpu, Server, Activity, AlertOctagon, CheckCircle2, Play, ShieldCheck, ChevronRight, Loader2, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TimelinePoint {
  step: string;
  health: number;
  trust: number;
}

export default function DigitalTwin() {
  const { roleConfig, notifyRestrictedAction } = useAuth();
  const perms = roleConfig.permissions;

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(500);

  // Display Vitals (Animated)
  const [fleetHealth, setFleetHealth] = useState<number>(98.4);
  const [trustScore, setTrustScore] = useState<number>(97.2);
  const [activeAlerts, setActiveAlerts] = useState<number>(1);

  // Targets for smooth numeric interpolation
  const targetHealthRef = useRef<number>(98.4);
  const targetTrustRef = useRef<number>(97.2);
  const targetAlertsRef = useRef<number>(1);

  // Attack Lifecycle Phase
  const [phaseStatus, setPhaseStatus] = useState<"normal" | "attack" | "containment" | "recovery">("normal");
  const [statusText, setStatusText] = useState<string>("Nominal Operations: All Shields Active");
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Live Threat Event Log Stepper
  const [threatLogs, setThreatLogs] = useState<Array<{ time: string, title: string, phase: string }>>([
    { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), title: "System Ready: Fleet Resilience Monitor Active", phase: "normal" }
  ]);

  // Rolling Timeline Data (20 points max for smooth sliding wave)
  const [resilienceTimeline, setResilienceTimeline] = useState<TimelinePoint[]>(() => {
    const initial: TimelinePoint[] = [];
    const now = new Date();
    for (let i = 19; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 1500);
      const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const h = Math.min(100, Math.max(97.5, Math.round((98.4 + (Math.random() * 1.0 - 0.5)) * 10) / 10));
      const t = Math.min(100, Math.max(96.0, Math.round((97.2 + (Math.random() * 0.8 - 0.4)) * 10) / 10));
      initial.push({ step: timeStr, health: h, trust: t });
    }
    return initial;
  });

  // ResizeObserver for chart container width
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

  // Smooth Numeric Interpolation Ticker for Telemetry Cards
  useEffect(() => {
    const numTimer = setInterval(() => {
      setFleetHealth(prev => {
        const diff = targetHealthRef.current - prev;
        if (Math.abs(diff) < 0.2) return targetHealthRef.current;
        return Math.round((prev + diff * 0.2) * 10) / 10;
      });

      setTrustScore(prev => {
        const diff = targetTrustRef.current - prev;
        if (Math.abs(diff) < 0.2) return targetTrustRef.current;
        return Math.round((prev + diff * 0.2) * 10) / 10;
      });

      setActiveAlerts(prev => {
        const diff = targetAlertsRef.current - prev;
        if (Math.abs(diff) < 0.5) return targetAlertsRef.current;
        return Math.round(prev + Math.sign(diff));
      });
    }, 80);

    return () => clearInterval(numTimer);
  }, []);

  // Continuous background wave when NOT simulating an attack
  useEffect(() => {
    if (isSimulating) return;

    const interval = setInterval(() => {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const newHealth = Math.min(100, Math.max(97.8, Math.round((98.4 + (Math.random() * 1.0 - 0.5)) * 10) / 10));
      const newTrust = Math.min(100, Math.max(96.5, Math.round((97.2 + (Math.random() * 0.8 - 0.4)) * 10) / 10));

      targetHealthRef.current = newHealth;
      targetTrustRef.current = newTrust;
      targetAlertsRef.current = 1;

      setResilienceTimeline(prev => {
        const nextPoint = { step: timeStr, health: newHealth, trust: newTrust };
        const safe = Array.isArray(prev) ? prev : [];
        return [...safe.slice(1), nextPoint];
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // Full Attack Lifecycle Simulation Trigger
  const triggerAttackLifecycle = (attackName: string) => {
    if (!perms.canRunDigitalTwin || perms.isReadOnly) {
      notifyRestrictedAction();
      return;
    }
    if (isSimulating) return;
    setIsSimulating(true);

    const nowStr = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // PHASE 1: Attack Drop (🔴 Red)
    setPhaseStatus("attack");
    setStatusText(`🚨 ATTACK INJECTED: ${attackName}`);
    setThreatLogs(prev => [...prev, { time: nowStr(), title: `${attackName} Payload Injected`, phase: "attack" }]);

    const attackSteps = [
      { health: 91.0, trust: 92.4, alerts: 2, delay: 300 },
      { health: 81.5, trust: 84.0, alerts: 4, delay: 700 },
      { health: 69.2, trust: 76.1, alerts: 6, delay: 1100 },
      { health: 58.4, trust: 69.0, alerts: 8, delay: 1500 }
    ];

    attackSteps.forEach(step => {
      setTimeout(() => {
        const tStr = nowStr();
        targetHealthRef.current = step.health;
        targetTrustRef.current = step.trust;
        targetAlertsRef.current = step.alerts;

        setResilienceTimeline(prev => {
          const safe = Array.isArray(prev) ? prev : [];
          return [...safe.slice(1), { step: tStr, health: step.health, trust: step.trust }];
        });
      }, step.delay);
    });

    // PHASE 2: Containment (🟡 Amber)
    setTimeout(() => {
      setPhaseStatus("containment");
      setStatusText("⚠️ CONTAINMENT PHASE: Circuit Breaker Quarantined Rogue Agent");
      const tStr = nowStr();
      setThreatLogs(prev => [...prev, { time: tStr, title: "Circuit Breaker Activated: Rogue Agent Quarantined", phase: "containment" }]);

      targetHealthRef.current = 62.5;
      targetTrustRef.current = 74.0;
      targetAlertsRef.current = 6;

      setResilienceTimeline(prev => [...prev.slice(1), { step: tStr, health: 62.5, trust: 74.0 }]);
    }, 2200);

    // PHASE 3: Recovery Curve (🔵 Blue)
    setTimeout(() => {
      setPhaseStatus("recovery");
      setStatusText("🛡️ RECOVERY PHASE: Restoring Fleet Snapshots");
      setThreatLogs(prev => [...prev, { time: nowStr(), title: "Initiating Automated Fleet Snapshot Recovery", phase: "recovery" }]);
    }, 3000);

    const recoverySteps = [
      { health: 74.0, trust: 82.1, alerts: 4, delay: 3300 },
      { health: 86.2, trust: 90.0, alerts: 2, delay: 3800 },
      { health: 94.5, trust: 95.1, alerts: 1, delay: 4300 },
      { health: 98.9, trust: 97.5, alerts: 1, delay: 4800 }
    ];

    recoverySteps.forEach(step => {
      setTimeout(() => {
        const tStr = nowStr();
        targetHealthRef.current = step.health;
        targetTrustRef.current = step.trust;
        targetAlertsRef.current = step.alerts;

        setResilienceTimeline(prev => {
          const safe = Array.isArray(prev) ? prev : [];
          return [...safe.slice(1), { step: tStr, health: step.health, trust: step.trust }];
        });
      }, step.delay);
    });

    // PHASE 4: Stable Normal (🟢 Green)
    setTimeout(() => {
      setPhaseStatus("normal");
      setStatusText("✅ STABLE: Fleet Health Restored to 98.9%");
      setThreatLogs(prev => [...prev, { time: nowStr(), title: "Automated Fleet Recovery Complete", phase: "normal" }]);
      targetHealthRef.current = 98.9;
      targetTrustRef.current = 97.5;
      targetAlertsRef.current = 1;
      setIsSimulating(false);
    }, 5400);
  };

  // Phase Specific Badge Styles
  const getBadgeStyle = () => {
    switch (phaseStatus) {
      case 'attack':
        return { label: '🔴 Attack Phase', stroke: '#ef4444', text: 'text-red-400', bg: 'bg-red-500/20 border-red-500/40 text-red-400' };
      case 'containment':
        return { label: '🟡 Containment Phase', stroke: '#f59e0b', text: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/40 text-amber-400' };
      case 'recovery':
        return { label: '🔵 Recovery Phase', stroke: '#3b82f6', text: 'text-blue-400', bg: 'bg-blue-500/20 border-blue-500/40 text-blue-400' };
      default:
        return { label: '🟢 Stable', stroke: '#10b981', text: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' };
    }
  };

  const badge = getBadgeStyle();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-100 uppercase">Digital Twin Fleet Resilience</h2>
        <p className="text-xs text-blue-400 font-semibold tracking-wider uppercase mt-0.5">
          Simulate threat vectors and observe complete attack lifecycle recovery (Normal ➔ Attack ➔ Containment ➔ Recovery ➔ Stable)
        </p>
      </div>

      {/* Grid: Threat Deck & Live Resilience Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Threat Control Deck */}
        <div className="glass-panel p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xs uppercase tracking-widest font-black text-slate-300">Attack Injector Deck</h3>
            <span className={`h-2.5 w-2.5 rounded-full ${
              phaseStatus === 'attack' ? 'bg-red-500 animate-ping' : 
              (phaseStatus === 'containment' ? 'bg-amber-500 animate-pulse' : 
              (phaseStatus === 'recovery' ? 'bg-blue-500 animate-bounce' : 'bg-emerald-500 status-pulse-ring'))
            }`}></span>
          </div>

          <div className="space-y-3 text-xs">
            {perms.canRunDigitalTwin && !perms.isReadOnly ? (
              <button
                onClick={() => triggerAttackLifecycle("Prompt Injection Attack")}
                disabled={isSimulating}
                className={`w-full border p-3.5 rounded-xl font-bold transition-all text-left flex justify-between items-center group ${
                  isSimulating 
                    ? 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed opacity-50' 
                    : 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border-red-500/40'
                }`}
              >
                <div>
                  <span className="block font-black">
                    {isSimulating ? '⏳ Simulation in Progress...' : '⚡ Trigger Prompt Injection Attack'}
                  </span>
                  <span className="text-[9px] text-slate-400 font-normal">Inject policy bypass payload</span>
                </div>
                {isSimulating ? <Loader2 className="h-4 w-4 animate-spin text-slate-500" /> : <Play className="h-4 w-4 text-red-400 group-hover:scale-110 transition-transform" />}
              </button>
            ) : (
              <button
                onClick={notifyRestrictedAction}
                className="w-full border border-slate-800 bg-slate-900 p-3.5 rounded-xl text-slate-500 text-left flex justify-between items-center cursor-not-allowed opacity-60"
                title="This action requires elevated privileges."
              >
                <div>
                  <span className="block font-bold">⚡ Trigger Prompt Injection (Restricted)</span>
                  <span className="text-[9px] text-slate-600">Requires Digital Twin privileges</span>
                </div>
                <Lock className="h-4 w-4 text-slate-500" />
              </button>
            )}

            {perms.canRunDigitalTwin && !perms.isReadOnly ? (
              <button
                onClick={() => triggerAttackLifecycle("Spend Limit Breach")}
                disabled={isSimulating}
                className={`w-full border p-3.5 rounded-xl font-bold transition-all text-left flex justify-between items-center group ${
                  isSimulating 
                    ? 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed opacity-50' 
                    : 'bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border-amber-500/40'
                }`}
              >
                <div>
                  <span className="block font-black">
                    {isSimulating ? '⏳ Simulation in Progress...' : '⚠️ Trigger Spend Limit Breach'}
                  </span>
                  <span className="text-[9px] text-slate-400 font-normal">Simulate runaway refund burst</span>
                </div>
                {isSimulating ? <Loader2 className="h-4 w-4 animate-spin text-slate-500" /> : <Play className="h-4 w-4 text-amber-400 group-hover:scale-110 transition-transform" />}
              </button>
            ) : (
              <button
                onClick={notifyRestrictedAction}
                className="w-full border border-slate-800 bg-slate-900 p-3.5 rounded-xl text-slate-500 text-left flex justify-between items-center cursor-not-allowed opacity-60"
                title="This action requires elevated privileges."
              >
                <div>
                  <span className="block font-bold">⚠️ Trigger Spend Limit Breach (Restricted)</span>
                  <span className="text-[9px] text-slate-600">Requires Digital Twin privileges</span>
                </div>
                <Lock className="h-4 w-4 text-slate-500" />
              </button>
            )}

            {perms.canRunDigitalTwin && !perms.isReadOnly ? (
              <button
                onClick={() => triggerAttackLifecycle("Rogue Agent Access")}
                disabled={isSimulating}
                className={`w-full border p-3.5 rounded-xl font-bold transition-all text-left flex justify-between items-center group ${
                  isSimulating 
                    ? 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed opacity-50' 
                    : 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border-blue-500/40'
                }`}
              >
                <div>
                  <span className="block font-black">
                    {isSimulating ? '⏳ Simulation in Progress...' : '🔒 Trigger Rogue Agent Access'}
                  </span>
                  <span className="text-[9px] text-slate-400 font-normal">Simulate spoofed agent ID</span>
                </div>
                {isSimulating ? <Loader2 className="h-4 w-4 animate-spin text-slate-500" /> : <Play className="h-4 w-4 text-blue-400 group-hover:scale-110 transition-transform" />}
              </button>
            ) : (
              <button
                onClick={notifyRestrictedAction}
                className="w-full border border-slate-800 bg-slate-900 p-3.5 rounded-xl text-slate-500 text-left flex justify-between items-center cursor-not-allowed opacity-60"
                title="This action requires elevated privileges."
              >
                <div>
                  <span className="block font-bold">🔒 Trigger Rogue Agent Access (Restricted)</span>
                  <span className="text-[9px] text-slate-600">Requires Digital Twin privileges</span>
                </div>
                <Lock className="h-4 w-4 text-slate-500" />
              </button>
            )}
          </div>

          {/* Synchronized Animated Telemetry Cards */}
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl space-y-3 font-mono text-xs shadow-inner">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Animated Fleet Telemetry</span>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Fleet Health:</span>
              <span className={`text-base font-black ${badge.text} transition-colors duration-300`}>{fleetHealth}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Trust Index:</span>
              <span className="text-blue-400 font-bold text-base transition-colors duration-300">{trustScore}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Active Alerts:</span>
              <span className={`font-bold text-base ${activeAlerts > 1 ? 'text-red-400' : 'text-slate-300'} transition-colors duration-300`}>{activeAlerts}</span>
            </div>
          </div>
        </div>

        {/* Live Resilience AreaChart & Event Log */}
        <div className="lg:col-span-2 glass-panel p-6 space-y-6 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs uppercase tracking-widest font-black text-slate-300">Attack Lifecycle Resilience Monitor</h3>
              <p className={`text-[10px] font-mono mt-0.5 font-bold ${badge.text}`}>{statusText}</p>
            </div>
            <span className={`text-[10px] font-mono font-bold px-3 py-1 rounded-xl uppercase border font-bold ${badge.bg}`}>
              {badge.label}
            </span>
          </div>

          {/* Instant Paint Recharts AreaChart */}
          <div ref={containerRef} className="w-full h-[220px] my-1">
            <AreaChart 
              width={containerWidth > 0 ? containerWidth : 500} 
              height={220} 
              data={resilienceTimeline} 
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <defs>
                <linearGradient id="phaseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={badge.stroke} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={badge.stroke} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="step" stroke="#475569" fontSize={9} />
              <YAxis stroke="#475569" fontSize={9} domain={[40, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
              <Area 
                type="monotone" 
                dataKey="health" 
                name="Fleet Health (%)" 
                stroke={badge.stroke} 
                fill="url(#phaseGrad)" 
                strokeWidth={3} 
                isAnimationActive={false}
              />
            </AreaChart>
          </div>

          {/* Synchronized Live Threat Event Log */}
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl space-y-2">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Live Attack Lifecycle Log</span>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {threatLogs.map((log, idx) => (
                <div key={idx} className="flex items-center gap-3 text-[11px] font-mono border-b border-slate-900 pb-1">
                  <span className="text-slate-500 text-[10px] shrink-0">{log.time}</span>
                  <ChevronRight className="h-3 w-3 text-slate-600 shrink-0" />
                  <span className={`font-bold ${
                    log.phase === 'attack' ? 'text-red-400' : 
                    (log.phase === 'containment' ? 'text-amber-400' : 
                    (log.phase === 'recovery' ? 'text-blue-400' : 'text-emerald-400'))
                  }`}>
                    {log.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
