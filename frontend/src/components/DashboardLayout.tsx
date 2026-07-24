import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Users, ShieldAlert, FileText, ClipboardList, 
  TrendingUp, Play, Square, Terminal, Shield, LogOut, MessageSquare, 
  Bell, Check, X, AlertTriangle, Send, Sparkles, RefreshCw, CheckCircle2, ChevronRight, AlertOctagon, ChevronUp, UserCheck, Lock, Sun, Moon,
  Copy, Trash2, ArrowRight, Bot
} from 'lucide-react';
import { useAuth, ROLES_CONFIG, type RoleId } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hitlBadgeCount?: number;
}

export default function DashboardLayout({ 
  children, 
  activeTab, 
  setActiveTab, 
  hitlBadgeCount = 8
}: DashboardLayoutProps) {
  const { user, roleConfig, notifyRestrictedAction, setRoleId, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Copilot States
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotQuery, setCopilotQuery] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const initialCopilotMessage = { 
    sender: 'system' as const, 
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text: `Hello! 👋 I am your **GuardianAI Governance Assistant**.\n\nI monitor active audit ledgers, policy compliance, agent trust scores, and infrastructure telemetry across the platform in real time.\n\n### 💬 How I Can Assist You\n• **Investigate Anomalies:** Ask *'Why was Refund Agent paused?'* or *'Show today's failed transactions'*.\n• **Risk & Fraud Analysis:** Ask *'Which agent has highest fraud score?'* or *'Analyze CPU spikes'*.\n• **Policy Governance:** Ask *'Explain policy P-102'* or *'Recommend a safer spend limit'*.\n\nYou are currently viewing the **${activeTab.toUpperCase()}** desk. What would you like to investigate today?`,
    card: {
      title: "Refund Agent Governance Alert",
      reason: "Daily spend threshold breach detected post-midnight.",
      policy: "Policy P-102 (Spend Limit Guard)",
      fraudScore: "72%",
      recommendations: [
        { label: "✓ Resume Agent", actionType: "resume_agent", payload: { agent_id: "refund_agent" }, reqPerm: "canPauseResumeAgents" },
        { label: "✓ Increase Budget", actionType: "update_limit", payload: { agent_id: "refund_agent", limit: 75000 }, reqPerm: "canCreateEditPolicies" },
        { label: "✓ View Audit Log", actionType: "view_audit" }
      ]
    }
  };

  const [copilotHistory, setCopilotHistory] = useState<Array<{ 
    sender: 'user' | 'system', 
    timestamp: string,
    text: string, 
    card?: {
      title: string,
      reason: string,
      policy: string,
      fraudScore: string,
      recommendations: Array<{ label: string, actionType: string, payload?: any, reqPerm?: string }>
    }
  }>>([initialCopilotMessage]);

  const [isCopilotTyping, setIsCopilotTyping] = useState(false);

  // Auto-scroll chat to bottom on new message
  useEffect(() => {
    if (isCopilotOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [copilotHistory, isCopilotTyping, isCopilotOpen]);

  // Vitals
  const [systemHealth, setSystemHealth] = useState<any>({ status: "healthy", metrics: { cpu_load_pct: 12.5 } });
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);

  const fetchVitals = async () => {
    try {
      const hRes = await fetch('http://localhost:8000/api/v1/monitor/health');
      if (hRes.ok) setSystemHealth(await hRes.json());
      const aRes = await fetch('http://localhost:8000/api/v1/agents/');
      if (aRes.ok) {
        const aData = await aRes.json();
        setIsEmergencyActive(aData.length > 0 && aData.every((a: any) => a.status === 'paused'));
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchVitals();
    const interval = setInterval(fetchVitals, 5000);
    return () => clearInterval(interval);
  }, []);

  // Context-aware Smart Suggestions based on activeTab
  const getContextSuggestions = () => {
    switch (activeTab) {
      case 'Policies':
        return [
          "Explain Policy P-102 rules",
          "Which policy caused the refund alert?",
          "Recommend policy improvements"
        ];
      case 'Agents':
        return [
          "Why was Refund Agent paused?",
          "Suggest restarting suspended agents",
          "Which agent has highest fraud score?"
        ];
      case 'Audit Trail':
        return [
          "Show today's failed transactions",
          "Find failed approvals",
          "Generate compliance summary"
        ];
      case 'Monitoring':
        return [
          "Explain CPU spikes",
          "Which agent consumes the most CPU?",
          "Suggest telemetry optimizations"
        ];
      case 'HITL Queue':
        return [
          "Why was this request escalated?",
          "Summarize fraud indicators",
          "Recommend Approve or Reject"
        ];
      case 'Digital Twin':
      case 'Sandbox':
        return [
          "Explain DDoS attack simulation",
          "Describe recovery stages",
          "Predict recovery time"
        ];
      default:
        return [
          "Show today's failed transactions",
          "Why was Refund Agent paused?",
          "Which agent has highest fraud score?"
        ];
    }
  };

  const handleCopilotSend = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const textToSend = customQuery || copilotQuery;
    if (!textToSend.trim()) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setCopilotHistory(prev => [...prev, { sender: 'user', timestamp: time, text: textToSend }]);
    setCopilotQuery('');
    setIsCopilotTyping(true);

    // Direct Navigation Query Handling
    const qLower = textToSend.toLowerCase();
    if (qLower.includes("open audit") || qLower.includes("go to audit") || qLower.includes("view audit")) {
      setTimeout(() => {
        if (roleConfig.allowedPages.includes('Audit Trail')) {
          setActiveTab('Audit Trail');
          setCopilotHistory(prev => [...prev, {
            sender: 'system',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: "Navigated to **Audit Trail** desk."
          }]);
        } else {
          setCopilotHistory(prev => [...prev, {
            sender: 'system',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: "🔒 **Action Restricted**: You do not have permission to view the Audit Trail desk."
          }]);
        }
        setIsCopilotTyping(false);
      }, 400);
      return;
    }

    if (qLower.includes("open policies") || qLower.includes("go to policies") || qLower.includes("navigate to policies")) {
      setTimeout(() => {
        if (roleConfig.allowedPages.includes('Policies')) {
          setActiveTab('Policies');
          setCopilotHistory(prev => [...prev, {
            sender: 'system',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: "Navigated to **Governance Policies** desk."
          }]);
        } else {
          setCopilotHistory(prev => [...prev, {
            sender: 'system',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: "🔒 **Action Restricted**: You do not have permission to view the Policies desk."
          }]);
        }
        setIsCopilotTyping(false);
      }, 400);
      return;
    }

    if (qLower.includes("open monitoring") || qLower.includes("go to monitoring")) {
      setTimeout(() => {
        if (roleConfig.allowedPages.includes('Monitoring')) {
          setActiveTab('Monitoring');
          setCopilotHistory(prev => [...prev, {
            sender: 'system',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: "Navigated to **Diagnostic Monitoring** desk."
          }]);
        } else {
          setCopilotHistory(prev => [...prev, {
            sender: 'system',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: "🔒 **Action Restricted**: You do not have permission to view Monitoring."
          }]);
        }
        setIsCopilotTyping(false);
      }, 400);
      return;
    }

    try {
      // Dynamic FastAPI backend query
      const res = await fetch('http://localhost:8000/api/v1/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: textToSend })
      });

      if (res.ok) {
        const data = await res.json();
        let card = undefined;

        if (data.action) {
          card = {
            title: data.action.label || "Dynamic Governance Alert",
            reason: data.text.split('\n')[0]?.replace(/#/g, '') || "AI Analytics Anomaly Flagged",
            policy: "Policy P-102 (Spend Guard)",
            fraudScore: "72%",
            recommendations: [
              { 
                label: `✓ ${data.action.label || 'Execute Action'}`, 
                actionType: data.action.type, 
                payload: data.action.payload, 
                reqPerm: data.action.type === 'resume_agent' ? 'canPauseResumeAgents' : 'canCreateEditPolicies' 
              },
              { label: "✓ View Audit Ledger", actionType: "view_audit" }
            ]
          };
        }

        setCopilotHistory(prev => [...prev, { 
          sender: 'system', 
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
          text: data.text || "Analysis complete.", 
          card 
        }]);
        setIsCopilotTyping(false);
        return;
      }
    } catch (err) {}

    // Rich Conversational Fallback Mode if Backend is offline
    setTimeout(() => {
      let card = undefined;
      let replyText = "";

      if (qLower.includes("fraud") || qLower.includes("highest") || qLower.includes("score")) {
        replyText = "Based on real-time risk index calculations, **Refund Agent** currently holds the **highest fraud score** at **88.5% (CRITICAL)**.\n\n### 🚨 Risk Factor Breakdown\n• **Velocity Spike:** 4 consecutive refund requests within 90 seconds.\n• **Geo-Location Mismatch:** Request originating from cross-border IP address.\n• **Policy Breach:** Single-signature authorization cap exceeded.\n\nI recommend reviewing the risk analysis or adjusting this agent's daily spend cap.";
        card = {
          title: "Fraud Risk Analysis Report",
          reason: "Refund Agent Risk Score: 88.5% (Critical Anomaly Flagged)",
          policy: "P-101 (AML Global Risk)",
          fraudScore: "88.5%",
          recommendations: [
            { label: "✓ View Risk Analysis", actionType: "view_audit" },
            { label: "✓ Update Spend Limit", actionType: "update_limit", payload: { agent_id: "refund_agent", limit: 25000 }, reqPerm: "canCreateEditPolicies" }
          ]
        };
      } else if (qLower.includes("hello") || qLower.includes("hi") || qLower.includes("hey") || qLower === "hi!" || qLower === "hello!") {
        replyText = "Hello! 👋 I am your **GuardianAI Governance Assistant**.\n\nI monitor active audit ledgers, policy compliance, agent trust scores, and infrastructure telemetry across the platform in real time.\n\n### 💬 How I Can Assist You\n• Ask *'Show today's failed transactions'*\n• Ask *'Why was Refund Agent paused?'*\n• Ask *'Which agent has highest fraud score?'*\n• Ask *'Explain CPU spikes & telemetry'*\n\nWhat would you like to investigate today?";
      } else if (qLower.includes("why") || qLower.includes("pause") || qLower.includes("refund")) {
        replyText = "Here is the incident report for the **Refund Agent**:\n\nThe agent was suspended following a **Policy P-102 (Daily Spend Limit Breach)** when refund velocity spiked to ₹60,000 post-midnight with location mismatch flags.\n\n### 📊 Current Vitals\n• **Trust Score:** `97.0%` (Healthy Baseline)\n• **Fraud Score:** `72%` (Elevated Anomaly)\n• **Daily Spend:** `₹49,200` / Limit `₹15,000`\n\nWould you like me to resume the agent or expand its spend limit?";
        card = {
          title: "Refund Agent Incident Analysis",
          reason: "Policy P-102 (Daily Spend Limit Exceeded by ₹45,000)",
          policy: "P-102 (Spend Guard)",
          fraudScore: "72%",
          recommendations: [
            { label: "✓ Resume Agent", actionType: "resume_agent", payload: { agent_id: "refund_agent" }, reqPerm: "canPauseResumeAgents" },
            { label: "✓ Increase Budget to ₹75,000", actionType: "update_limit", payload: { agent_id: "refund_agent", limit: 75000 }, reqPerm: "canCreateEditPolicies" },
            { label: "✓ View Audit Ledger", actionType: "view_audit" }
          ]
        };
      } else if (qLower.includes("suspicious") || qLower.includes("failed") || qLower.includes("transaction")) {
        replyText = "Here is the breakdown of **today's flagged & failed transactions**:\n\n• **11:09 AM** | Agent: `Refund Agent` | Action: `refund` | Amount: `₹14,200` | Risk: **68.4%** (ESCALATED)\n• **11:05 AM** | Agent: `Credit Agent` | Action: `increase_credit_limit` | Amount: `₹85,000` | Risk: **74.0%** (ESCALATED)\n• **10:52 AM** | Agent: `Card Agent` | Action: `replace_card` | Amount: `₹22,000` | Risk: **62.1%** (REJECTED)\n\n### 🔍 Incident Analysis\nMulti-agent risk evaluator flagged location mismatches and daily spend limit breaches.\n\nWould you like to open the Audit Trail desk to inspect the full payload trace?";
        card = {
          title: "Audit Ledger Anomaly Summary",
          reason: "Multi-agent risk score escalation above 60% threshold.",
          policy: "P-105 (High Risk Regional Filter)",
          fraudScore: "84%",
          recommendations: [
            { label: "✓ View Full Audit Ledger", actionType: "view_audit" },
            { label: "✓ Open Policy Manager", actionType: "view_policy", payload: { policy_id: "P-105" } }
          ]
        };
      } else if (qLower.includes("cpu") || qLower.includes("latency") || qLower.includes("spikes") || qLower.includes("monitoring")) {
        replyText = "Here is the **real-time system telemetry & observability analysis**:\n\n### ⚡ System Telemetry Vitals\n• **CPU Load:** `14.3%` average (Peak: `17.2%` on Risk Engine node)\n• **Memory Utilization:** `48.8%` (15.62 GB / 32.00 GB RAM)\n• **RPC Latency:** `115ms` average (P95: 175ms, P99: 213ms)\n• **System Throughput:** `55 RPS` (20-80 RPS operating band)\n\nAll 10 governance microservices are online and operating smoothly within capacity limits.";
        card = {
          title: "Telemetry Health Report",
          reason: "10/10 Microservices Online & Resilient.",
          policy: "System Reliability Guard",
          fraudScore: "0%",
          recommendations: [
            { label: "✓ View Diagnostic Monitoring", actionType: "view_monitoring" }
          ]
        };
      } else {
        replyText = `Hello! 👋 I am your **GuardianAI Governance Assistant**.\n\nI monitor active audit ledgers, policy compliance, agent trust scores, and infrastructure telemetry across the platform in real time.\n\n### 📊 Key Governance Insights (${activeTab})\n• **Fleet Health Index:** \`98.4%\` (5/5 Agents Operating)\n• **Active Rule Configs:** \`5 Deployed Policies\`\n• **Pending HITL Reviews:** \`${hitlBadgeCount} Items\`\n\nHow else can I assist you with platform compliance or risk analysis?`;
      }

      setCopilotHistory(prev => [...prev, { 
        sender: 'system', 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
        text: replyText, 
        card 
      }]);
      setIsCopilotTyping(false);
    }, 500);
  };

  const handleCopilotAction = async (rec: any) => {
    const perms = roleConfig.permissions;
    if (rec.reqPerm && (!perms[rec.reqPerm as keyof typeof perms] || perms.isReadOnly)) {
      notifyRestrictedAction();
      return;
    }

    if (rec.actionType === 'resume_agent') {
      try {
        await fetch(`http://localhost:8000/api/v1/agents/${rec.payload?.agent_id || 'refund_agent'}/resume`, { method: 'POST' });
      } catch (e) {}
      setCopilotHistory(prev => [...prev, { sender: 'system', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: "**Agent Resumed**: Refund Agent is now operating normally." }]);
    } else if (rec.actionType === 'update_limit') {
      try {
        await fetch(`http://localhost:8000/api/v1/agents/${rec.payload?.agent_id || 'refund_agent'}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ daily_spend_limit: rec.payload?.limit || 75000 })
        });
      } catch (e) {}
      setCopilotHistory(prev => [...prev, { sender: 'system', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: `**Limit Updated**: Daily Spend Limit increased to ₹${(rec.payload?.limit || 75000).toLocaleString()}.` }]);
    } else if (rec.actionType === 'view_audit') {
      if (roleConfig.allowedPages.includes('Audit Trail')) {
        setActiveTab('Audit Trail');
      } else {
        notifyRestrictedAction();
      }
    } else if (rec.actionType === 'view_policy') {
      if (roleConfig.allowedPages.includes('Policies')) {
        setActiveTab('Policies');
      } else {
        notifyRestrictedAction();
      }
    } else if (rec.actionType === 'view_monitoring') {
      if (roleConfig.allowedPages.includes('Monitoring')) {
        setActiveTab('Monitoring');
      } else {
        notifyRestrictedAction();
      }
    } else if (rec.actionType === 'view_twin') {
      if (roleConfig.allowedPages.includes('Digital Twin')) {
        setActiveTab('Digital Twin');
      } else {
        notifyRestrictedAction();
      }
    }
  };

  const handleCopyText = (txt: string, idx: number) => {
    navigator.clipboard.writeText(txt);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClearHistory = () => {
    setCopilotHistory([initialCopilotMessage]);
  };

  // Nav Items Definitions
  const allNavItems = [
    { name: 'Overview', icon: LayoutDashboard },
    { name: 'Agents', icon: Users },
    { name: 'Policies', icon: ShieldAlert },
    { name: 'Audit Trail', icon: FileText },
    { name: 'HITL Queue', icon: ClipboardList, badge: true },
    { name: 'Executive', icon: TrendingUp },
    { name: 'Sandbox', icon: Shield },
    { name: 'Digital Twin', icon: RefreshCw },
    { name: 'Monitoring', icon: Terminal },
  ];

  // Filter Nav Items by Active Role Allowed Pages
  const visibleNavItems = allNavItems.filter(item => roleConfig.allowedPages.includes(item.name));

  const handleRoleChange = (rId: RoleId) => {
    setRoleId(rId);
    const newConfig = ROLES_CONFIG[rId];
    if (newConfig && !newConfig.allowedPages.includes(activeTab)) {
      setActiveTab(newConfig.landingPage);
    }
    setIsProfileMenuOpen(false);
  };

  // ChatGPT-style Markdown & Text Renderer
  const renderChatGPTText = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-2 text-xs leading-relaxed text-slate-200 font-sans">
        {lines.map((line, lIdx) => {
          if (!line.trim()) return <div key={lIdx} className="h-0.5" />;

          // Header ###
          if (line.startsWith('### ')) {
            return (
              <h4 key={lIdx} className="font-extrabold text-xs text-blue-400 uppercase tracking-wider pt-1.5 pb-0.5 border-b border-slate-800/80 flex items-center gap-1.5">
                <span>{line.replace('### ', '')}</span>
              </h4>
            );
          }

          // Bullet list check
          const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
          const lineToParse = isBullet ? line.trim().substring(1).trim() : line;

          // Inline formatting parser for **bold** and `code`
          const parts = lineToParse.split(/(\*\*.*?\*\*|`.*?`)/g);
          const renderedLine = parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx} className="font-extrabold text-slate-100">{part.slice(2, -2)}</strong>;
            } else if (part.startsWith('`') && part.endsWith('`')) {
              return (
                <code key={pIdx} className="bg-blue-500/10 text-blue-400 font-mono px-1.5 py-0.5 rounded border border-blue-500/20 text-[11px] font-bold">
                  {part.slice(1, -1)}
                </code>
              );
            }
            return part;
          });

          if (isBullet) {
            return (
              <div key={lIdx} className="flex items-start gap-2 pl-1">
                <span className="text-blue-400 font-bold shrink-0">•</span>
                <p className="flex-1 leading-normal">{renderedLine}</p>
              </div>
            );
          }

          return <p key={lIdx} className="leading-normal">{renderedLine}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-100 selection:bg-blue-600 selection:text-white relative">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center glow-blue shrink-0 shadow-lg shadow-blue-900/30">
            <span className="font-extrabold text-lg text-white">G</span>
          </div>
          <div className="truncate">
            <h1 className="font-black text-sm leading-none tracking-wider text-slate-50 uppercase">GuardianAI</h1>
            <span className="text-[9px] text-blue-400 font-bold tracking-widest uppercase">AMEX Trust Layer</span>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30 glow-blue font-bold border border-blue-500/50 scale-[1.01]' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100 hover:translate-x-0.5'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.name}</span>
                {item.badge && hitlBadgeCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    {hitlBadgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom User Profile & Dynamic Role Switcher */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 relative">
          
          {/* Interactive Role Switcher Popover */}
          {isProfileMenuOpen && (
            <div className="absolute bottom-full left-3 right-3 mb-2 bg-slate-900 border border-slate-750 rounded-2xl p-3 shadow-2xl space-y-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex justify-between items-center px-1 pb-1 border-b border-slate-800">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Enterprise Role Switcher</span>
                <span className="text-[9px] text-blue-400 font-mono font-bold">Demo Mode</span>
              </div>

              <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                {Object.values(ROLES_CONFIG).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleRoleChange(r.id)}
                    className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-all duration-150 ${
                      roleConfig.id === r.id ? 'bg-slate-800 text-white font-bold border border-slate-700' : 'text-slate-400 hover:bg-slate-950 hover:text-slate-200'
                    }`}
                  >
                    <span className="truncate font-semibold">{r.name}</span>
                    <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border ${r.badgeBg}`}>
                      {r.id.split('_')[0].toUpperCase()}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Profile Card Button */}
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-3 text-left flex-1 truncate p-1.5 rounded-xl hover:bg-slate-800/60 transition-all duration-200"
            >
              <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-blue-400 uppercase text-xs shrink-0">
                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-100 truncate">{user.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[8px] font-mono font-extrabold px-1.5 py-0.2 rounded border ${roleConfig.badgeBg}`}>
                    {roleConfig.name.toUpperCase()}
                  </span>
                </div>
                <span className="text-[9px] text-slate-500 font-mono block truncate">
                  {roleConfig.id === 'super_admin' ? 'L5 Enterprise Administration' : roleConfig.securityLevel}
                </span>
              </div>
            </button>

            <button onClick={logout} title="Sign Out" className="text-slate-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-slate-800">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content (Always Retains 100% Full Width) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Header Bar */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40 gap-4">
          <div className="flex items-center gap-6 min-w-0">
            <div className="flex items-center gap-2.5 shrink-0">
              <span className={`h-2.5 w-2.5 rounded-full ${isEmergencyActive ? 'bg-red-500 shadow-red-500/50' : 'bg-emerald-500 shadow-emerald-500/50'} status-pulse-ring`}></span>
              <span className="text-xs font-bold tracking-wider text-slate-300 whitespace-nowrap">
                STATUS: {isEmergencyActive ? (
                  <span className="text-red-500 uppercase font-extrabold">EMERGENCY SHUTDOWN</span>
                ) : (
                  <span className="text-emerald-400 uppercase font-extrabold">ALL AGENTS SECURE</span>
                )}
              </span>
            </div>

            {/* ACTIVE SESSION ROLE DISPLAY */}
            <div className="hidden lg:flex items-center gap-2 border-l border-slate-800 pl-6 shrink-0 whitespace-nowrap">
              <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">
                ROLE:
              </span>
              <span className={`text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full border ${roleConfig.badgeBg}`}>
                {roleConfig.name.toUpperCase()}
              </span>

              {roleConfig.permissions.isReadOnly && (
                <span className="flex items-center gap-1 bg-slate-800 text-slate-300 border border-slate-700 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ml-1">
                  <Lock className="h-3 w-3 text-slate-400" />
                  <span>READ-ONLY</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {/* Theme Switcher Toggle Button */}
            <button 
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border border-slate-800 bg-slate-900/80 text-slate-200 hover:bg-slate-800 transition-all duration-200 cursor-pointer shadow-sm active:scale-95 shrink-0 whitespace-nowrap"
              title="Toggle Light / Dark Theme"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4 text-amber-400" />
                  <span className="hidden sm:inline text-xs font-mono font-bold">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-indigo-500" />
                  <span className="hidden sm:inline text-xs font-mono font-bold text-slate-800">Dark Mode</span>
                </>
              )}
            </button>

            {/* Governance Copilot Button */}
            <button 
              onClick={() => setIsCopilotOpen(!isCopilotOpen)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 active:scale-95 shrink-0 whitespace-nowrap ${
                isCopilotOpen 
                  ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-900/40 glow-blue' 
                  : 'bg-slate-800/80 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span>Governance Copilot</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto bg-slate-950/20">
          {children}
        </main>
      </div>

      {/* Floating Overlay Side-Drawer (Prevents Main Content Squeezing & Collisions) */}
      {isCopilotOpen && (
        <>
          {/* Subtle Backdrop Overlay */}
          <div 
            onClick={() => setIsCopilotOpen(false)}
            className="fixed inset-0 bg-slate-950/30 copilot-backdrop z-45 animate-in fade-in duration-200"
          />

          {/* Fixed Slide-Over Side Drawer */}
          <div className="fixed inset-y-0 right-0 w-[460px] bg-slate-900 border-l border-slate-800 flex flex-col z-50 shadow-2xl animate-in slide-in-from-right duration-250">
            {/* Header with Context Badge and Clear Button */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950/60 shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-blue-600 flex items-center justify-center text-white glow-blue shadow-lg shadow-blue-900/40">
                  <Bot className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-100">Governance Copilot</h3>
                    <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[8px] font-bold font-mono px-1.5 py-0.2 rounded uppercase">
                      {activeTab} Desk
                    </span>
                  </div>
                  <span className="text-[9px] text-blue-400 font-mono font-bold block leading-none mt-0.5">ChatGPT-Powered AI Assistant</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={handleClearHistory} 
                  className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Clear Chat History"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => setIsCopilotOpen(false)} className="text-slate-500 hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-800 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Chat History View */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {copilotHistory.map((chat, idx) => (
                <div key={idx} className={`flex flex-col ${chat.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] text-slate-500 font-mono font-bold">{chat.sender === 'user' ? 'Operator' : 'GuardianAI Copilot'}</span>
                    <span className="text-[9px] text-slate-600 font-mono">• {chat.timestamp}</span>
                    
                    {chat.sender === 'system' && (
                      <button 
                        onClick={() => handleCopyText(chat.text, idx)}
                        className="text-slate-600 hover:text-slate-300 ml-1 transition-colors"
                        title="Copy Response"
                      >
                        {copiedIndex === idx ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      </button>
                    )}
                  </div>

                  <div className={`p-4 rounded-2xl text-xs leading-relaxed max-w-[96%] shadow-md ${
                    chat.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none font-semibold' 
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none space-y-3'
                  }`}>
                    {chat.sender === 'user' ? (
                      <p className="whitespace-pre-wrap font-medium">{chat.text}</p>
                    ) : (
                      renderChatGPTText(chat.text)
                    )}

                    {chat.card && (
                      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-3 shadow-inner mt-2">
                        <div className="flex justify-between items-start border-b border-slate-800 pb-2">
                          <span className="font-extrabold text-slate-100 text-xs">{chat.card.title}</span>
                          <span className="bg-red-500/20 text-red-400 text-[9px] font-bold px-2 py-0.5 rounded border border-red-500/30">
                            HIGH RISK
                          </span>
                        </div>

                        <div className="space-y-2 text-[10px] font-mono">
                          <div>
                            <span className="text-slate-500 text-[9px] uppercase font-bold block">Reason</span>
                            <span className="text-slate-200">{chat.card.reason}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-slate-500 text-[9px] uppercase font-bold block">Policy Violation</span>
                              <span className="text-blue-400 font-bold">{chat.card.policy}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 text-[9px] uppercase font-bold block">Fraud Score</span>
                              <span className="text-amber-400 font-bold">{chat.card.fraudScore}</span>
                            </div>
                          </div>
                        </div>

                        {/* Permission Aware Action Buttons */}
                        <div className="pt-2 border-t border-slate-800 space-y-1.5">
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Recommended Actions</span>
                          <div className="flex flex-wrap gap-2">
                            {chat.card.recommendations.map((rec, rIdx) => {
                              const perms = roleConfig.permissions;
                              const isAllowed = !rec.reqPerm || (perms[rec.reqPerm as keyof typeof perms] && !perms.isReadOnly);

                              return isAllowed ? (
                                <button
                                  key={rIdx}
                                  onClick={() => handleCopilotAction(rec)}
                                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] shadow transition-all duration-150 active:scale-95 flex items-center gap-1 glow-blue"
                                >
                                  <span>{rec.label}</span>
                                </button>
                              ) : (
                                <button
                                  key={rIdx}
                                  onClick={notifyRestrictedAction}
                                  className="bg-slate-800 text-slate-500 border border-slate-700 font-bold px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1 cursor-not-allowed opacity-60"
                                  title="Action Restricted: Elevated privileges required."
                                >
                                  <Lock className="h-3 w-3 text-slate-500" />
                                  <span>{rec.label} (Restricted)</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isCopilotTyping && (
                <div className="flex gap-1.5 items-center bg-slate-950 border border-slate-800 p-3 rounded-xl max-w-[40%] mr-auto rounded-bl-none">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-bounce"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:0.4s]"></span>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Context-Aware Smart Suggestions Chips Toolbar */}
            <div className="px-4 py-2.5 border-t border-slate-800/80 bg-slate-950/40 space-y-1.5">
              <span className="text-[9px] text-slate-500 font-mono font-bold uppercase tracking-wider block">Suggested Questions ({activeTab})</span>
              <div className="flex flex-wrap gap-1.5">
                {getContextSuggestions().map((sug, sIdx) => (
                  <button
                    key={sIdx}
                    onClick={() => handleCopilotSend(undefined, sug)}
                    className="text-[10px] font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 px-2.5 py-1 rounded-lg transition-all text-left truncate max-w-full flex items-center gap-1 active:scale-95"
                  >
                    <ArrowRight className="h-3 w-3 text-blue-400 shrink-0" />
                    <span className="truncate">{sug}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Footer Form */}
            <form onSubmit={handleCopilotSend} className="p-4 border-t border-slate-800 bg-slate-950/60 flex gap-2 shrink-0">
              <input 
                type="text" 
                value={copilotQuery}
                onChange={(e) => setCopilotQuery(e.target.value)}
                placeholder={`Ask Copilot about ${activeTab} or security rules...`}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button type="submit" className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg glow-blue active:scale-95 transition-all">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
