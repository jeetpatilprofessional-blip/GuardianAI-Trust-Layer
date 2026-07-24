import React, { useState, useEffect } from 'react';
import { 
  Plus, History, RefreshCcw, Sparkles, Check, X, 
  ChevronRight, ArrowLeftRight, HelpCircle, Eye, AlertCircle, Lock, ShieldCheck,
  ChevronDown, ChevronUp, Clock, Calendar, CheckCircle2, AlertTriangle, ShieldAlert, Zap
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';

export default function PolicyManager() {
  const { roleConfig, notifyRestrictedAction } = useAuth();
  const perms = roleConfig.permissions;
  const isComplianceRole = roleConfig.id === 'compliance_officer';

  const [policies, setPolicies] = useState<any[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [compareVersions, setCompareVersions] = useState<number[]>([]);

  // Simulation State
  const [simAmount, setSimAmount] = useState(15000.0);
  const [simBlockedActions, setSimBlockedActions] = useState<string[]>(["replace_card"]);
  const [simMinTrust, setSimMinTrust] = useState(60);
  const [simResults, setSimResults] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Form State for edit/create
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [policyId, setPolicyId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [maxAmount, setMaxAmount] = useState(50000.0);
  const [requiredApproval, setRequiredApproval] = useState('automated');
  const [changeReason, setChangeReason] = useState('Baseline registration');

  // Dynamic AI Recommendations Panel States
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([
    {
      id: 'REC-101',
      title: 'Increase Refund Agent Threshold Monitoring',
      priority: 'critical',
      confidence: 96.4,
      explanation: 'Refund Agent daily transaction velocity exceeded 82% of capacity post-midnight with 2 regional mismatch flags.',
      recommendedAction: 'Lower refund auto-approval limit from ₹15,000 to ₹10,000 and enforce 2FA verification.',
      details: 'Audit logs show 4 consecutive refund attempts exceeding ₹12,000 from unverified device IPs. Policy P-102 currently permits single-operator sign-off.',
      affectedAgent: 'Refund Agent',
      policyId: 'P-102',
      timestamp: new Date().toISOString(),
      status: 'pending' // 'pending' | 'applied' | 'ignored'
    },
    {
      id: 'REC-102',
      title: 'Tighten AML Transaction Limit During Peak Hours',
      priority: 'high',
      confidence: 91.8,
      explanation: 'AML Global Risk Limit (P-101) experienced high-value batch spikes exceeding single-signature threshold.',
      recommendedAction: 'Tighten AML auto-approval cap from ₹100,000 to ₹75,000 during peak trading window.',
      details: 'High transaction throughput detected on Amex corporate settlement pipeline. Lowering cap prevents single-signature compliance breaches.',
      affectedAgent: 'Corporate Refund Agent',
      policyId: 'P-101',
      timestamp: new Date(Date.now() - 60000).toISOString(),
      status: 'pending'
    },
    {
      id: 'REC-103',
      title: 'Enable Dual Approval for Credit Limit Policy',
      priority: 'high',
      confidence: 88.5,
      explanation: 'Credit Limit Agent (P-103) requested 3 limit increases above ₹80,000 for accounts under 6 months tenure.',
      recommendedAction: 'Enforce dual-signature admin authorization for credit line increases over ₹50,000.',
      details: 'Account tenure anomalies detected. Dual signature ensures L3 Security Admin verification before credit line expansion.',
      affectedAgent: 'Credit Limit Agent',
      policyId: 'P-103',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      status: 'pending'
    },
    {
      id: 'REC-104',
      title: 'Archive Unused Legacy Policy Versions',
      priority: 'medium',
      confidence: 84.0,
      explanation: 'Annual Fee Waiver Policy (P-104) retains 4 inactive legacy draft versions consuming rule evaluation slots.',
      recommendedAction: 'Prune inactive policy drafts to optimize decision pipeline response speed.',
      details: 'Rule engine latency is currently 111ms. Archiving unused drafts reduces evaluation overhead by ~14ms.',
      affectedAgent: 'Card Replacement Agent',
      policyId: 'P-104',
      timestamp: new Date(Date.now() - 180000).toISOString(),
      status: 'pending'
    },
    {
      id: 'REC-105',
      title: 'Schedule Policy Review in 7 Days',
      priority: 'low',
      confidence: 79.2,
      explanation: 'High Risk Regional Filter (P-105) has not undergone compliance review in 30 days.',
      recommendedAction: 'Schedule automated compliance audit for P-105 on next evaluation cycle.',
      details: 'PCI-DSS 4.0 guidelines mandate monthly policy certification for high-risk regional filter configurations.',
      affectedAgent: 'Travel Claim Agent',
      policyId: 'P-105',
      timestamp: new Date(Date.now() - 240000).toISOString(),
      status: 'pending'
    }
  ]);

  const [expandedRecId, setExpandedRecId] = useState<string | null>(null);
  const [reviewModalRec, setReviewModalRec] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [isAiScanning, setIsAiScanning] = useState<boolean>(false);
  const [lastAnalysisTimestamp, setLastAnalysisTimestamp] = useState<number>(Date.now());
  const [nextScanSeconds, setNextScanSeconds] = useState<number>(30);
  const [timeAgoText, setTimeAgoText] = useState<string>('Just now');

  // Auto-refresh countdown timer and scanner
  useEffect(() => {
    const timer = setInterval(() => {
      setNextScanSeconds(prev => {
        if (prev <= 1) {
          triggerAiScan();
          return 30;
        }
        return prev - 1;
      });

      // Update time ago string
      const elapsed = Math.floor((Date.now() - lastAnalysisTimestamp) / 1000);
      if (elapsed < 5) setTimeAgoText('Just now');
      else if (elapsed < 60) setTimeAgoText(`${elapsed}s ago`);
      else setTimeAgoText(`${Math.floor(elapsed / 60)}m ago`);
    }, 1000);

    return () => clearInterval(timer);
  }, [lastAnalysisTimestamp]);

  const triggerAiScan = () => {
    setIsAiScanning(true);
    setTimeout(() => {
      setLastAnalysisTimestamp(Date.now());
      setIsAiScanning(false);
    }, 1200);
  };

  const fetchPoliciesAndRecs = async () => {
    try {
      const pRes = await fetch('http://localhost:8000/api/v1/policies/');
      if (pRes.ok) {
        setPolicies(await pRes.json());
      }
    } catch (e) {
      setPolicies([
        { policy_id: "P-101", name: "AML Global Risk Limit", description: "Anti-Money Laundering baseline restrictions blocking any single transaction above ₹100,000 without administrative approval.", priority: "high", max_amount: 100000.0, required_approval_level: "admin", status: "active", version: 1, change_reason: "Initial configuration" },
        { policy_id: "P-102", name: "Refund Discrepancy Policy", description: "Limits automated refund agent approvals to a maximum of ₹15,000 for standard customer support tickets.", priority: "medium", max_amount: 15000.0, required_approval_level: "operator", status: "active", version: 3, change_reason: "Adjusted max amount from 12k to 15k based on operations support request." },
        { policy_id: "P-103", name: "Credit Limit Adjustments Policy", description: "Requires fraud check score below 30% and customer trust above 80% to double a credit limit.", priority: "high", max_amount: 80000.0, required_approval_level: "admin", status: "active", version: 1, change_reason: "Initial deployment" },
        { policy_id: "P-104", name: "Annual Fee Waiver Verification", description: "Allows automated annual fee waiving up to ₹5,000. Larger fee waivers require manual review.", priority: "low", max_amount: 5000.0, required_approval_level: "automated", status: "active", version: 1, change_reason: "Initial deployment" },
        { policy_id: "P-105", name: "High Risk Regional Filter", description: "Escalates any transactions above ₹10,000 if fraud score exceeds 15% or device mismatch occurs.", priority: "high", max_amount: 10000.0, required_approval_level: "operator", status: "active", version: 1, change_reason: "Initial deployment" }
      ]);
    }
  };

  useEffect(() => {
    fetchPoliciesAndRecs();
  }, []);

  const handleApplyRecommendation = (rec: any) => {
    if (!perms.canDeployPolicies || perms.isReadOnly) {
      notifyRestrictedAction();
      return;
    }

    setAiRecommendations(prev => prev.map(r => r.id === rec.id ? { ...r, status: 'applied' } : r));

    // Update policies data dynamically if applicable
    if (rec.policyId) {
      setPolicies(prev => prev.map(p => {
        if (p.policy_id === rec.policyId) {
          return {
            ...p,
            max_amount: Math.max(5000, p.max_amount - 2500),
            version: p.version + 1,
            change_reason: `AI Recommendation Applied: ${rec.title}`
          };
        }
        return p;
      }));
    }

    showToast(`Recommendation Applied: ${rec.title}. Policy parameters updated.`);
    if (reviewModalRec?.id === rec.id) setReviewModalRec(null);
  };

  const handleIgnoreRecommendation = (recId: string) => {
    setAiRecommendations(prev => prev.map(r => r.id === recId ? { ...r, status: 'ignored' } : r));
    showToast('Recommendation dismissed.');
    if (reviewModalRec?.id === recId) setReviewModalRec(null);
  };

  const handleScheduleRecommendation = (rec: any) => {
    setAiRecommendations(prev => prev.map(r => r.id === rec.id ? { ...r, status: 'scheduled' } : r));
    showToast(`Policy Review Scheduled for ${rec.title} in 7 days.`);
    if (reviewModalRec?.id === rec.id) setReviewModalRec(null);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleOpenHistory = async (policy: any) => {
    setSelectedPolicy(policy);
    setCompareVersions([]);
    setIsHistoryOpen(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/policies/${policy.policy_id}/history`);
      if (res.ok) {
        setHistory(await res.json());
      }
    } catch (e) {
      setHistory([
        { policy_id: policy.policy_id, version: 3, name: policy.name, max_amount: policy.max_amount, change_reason: policy.change_reason, created_at: new Date().toISOString(), created_by: "Administrator" },
        { policy_id: policy.policy_id, version: 2, name: policy.name, max_amount: policy.max_amount - 3000, change_reason: "Increased limit due to retail volume spike.", created_at: new Date(Date.now() - 86400000).toISOString(), created_by: "Administrator" },
        { policy_id: policy.policy_id, version: 1, name: policy.name, max_amount: policy.max_amount - 5000, change_reason: "Initial baseline configuration", created_at: new Date(Date.now() - 172800000).toISOString(), created_by: "System" }
      ]);
    }
  };

  const runSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/policies/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          max_amount: simAmount,
          blocked_actions: simBlockedActions,
          conditions: { min_customer_trust: simMinTrust }
        })
      });
      if (res.ok) {
        setSimResults(await res.json());
      }
    } catch (e) {
      setTimeout(() => {
        setSimResults({
          approvals_reduced_pct: 12.4,
          fraud_prevented_pct: 18.5,
          customer_friction_index: "Minimal",
          impact_message: "Simulated against 128 historical transaction requests. Policy blocked 16 transactions."
        });
      }, 600);
    } finally {
      setIsSimulating(false);
    }
  };

  const toggleSimAction = (action: string) => {
    setSimBlockedActions(prev => 
      prev.includes(action) ? prev.filter(a => a !== action) : [...prev, action]
    );
  };

  const openCreateModal = () => {
    if (!perms.canCreateEditPolicies || perms.isReadOnly) {
      notifyRestrictedAction();
      return;
    }
    setIsEditMode(false);
    setPolicyId(`P-${Math.floor(100 + Math.random() * 900)}`);
    setName('');
    setDescription('');
    setPriority('medium');
    setMaxAmount(50000.0);
    setRequiredApproval('automated');
    setChangeReason('Initial baseline registration');
    setIsModalOpen(true);
  };

  const activePendingRecommendations = aiRecommendations.filter(r => r.status === 'pending');

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-bold font-mono animate-in fade-in duration-200 shadow-lg">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-100 uppercase">Governance Policies</h2>
          <p className="text-xs text-blue-400 font-semibold tracking-wider uppercase mt-0.5">
            Manage transaction limits, authorization rules, and regulatory directives
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isComplianceRole && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-xs font-bold">
              <ShieldCheck className="h-4 w-4 text-blue-400" />
              <span>🛡️ Compliance Management</span>
            </div>
          )}

          {perms.canCreateEditPolicies && !perms.isReadOnly ? (
            <button 
              onClick={openCreateModal}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all glow-blue text-xs uppercase"
            >
              <Plus className="h-4 w-4" />
              <span>New Policy</span>
            </button>
          ) : (
            <button 
              onClick={notifyRestrictedAction}
              className="flex items-center gap-2 bg-slate-900 border border-slate-750 text-slate-400 font-mono text-xs font-bold py-2 px-4 rounded-xl cursor-not-allowed opacity-60"
              title="This action requires elevated privileges."
            >
              <Lock className="h-3.5 w-3.5 text-slate-400" />
              <span>New Policy (Restricted)</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Active Policies (Left 2 cols) & AI Recommendations (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Active Policies & Simulation Mode */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6">
            <h3 className="text-xs uppercase tracking-widest font-black text-slate-300 mb-6">Active Rule Configs</h3>
            <div className="space-y-4">
              {policies.map(p => (
                <div key={p.policy_id} className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl flex items-center justify-between text-xs hover:border-slate-700/60 transition-colors">
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-500 font-mono uppercase">{p.policy_id}</span>
                      <h4 className="font-extrabold text-slate-200">{p.name}</h4>
                      <span className="bg-blue-600/10 text-blue-400 border border-blue-500/20 text-[9px] font-bold px-1.5 py-0.5 rounded">
                        V{p.version}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        p.priority === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {p.priority}
                      </span>
                    </div>
                    <p className="text-slate-400 leading-normal">{p.description}</p>
                    <div className="text-[10px] text-slate-500 font-mono">
                      <span>Daily Max: ₹{p.max_amount?.toLocaleString()} | Required Approval: <span className="text-slate-400 capitalize">{p.required_approval_level}</span></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleOpenHistory(p)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition-colors"
                      title="View Version History"
                    >
                      <History className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Simulation Panel */}
          <div className="glass-panel p-6 space-y-6">
            <div>
              <h3 className="text-xs uppercase tracking-widest font-black text-slate-300">AI Simulation Mode</h3>
              <p className="text-[10px] text-slate-500 mt-1">Pre-simulate a proposed policy against 30-day historical transaction logs to model business outcomes</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4 text-xs">
                {/* Inputs */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Simulated Limit Amount (INR)</label>
                  <input 
                    type="number" 
                    value={simAmount}
                    onChange={(e) => setSimAmount(parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Required Min Customer Trust Score</label>
                  <input 
                    type="range" 
                    min="0" max="100"
                    value={simMinTrust}
                    onChange={(e) => setSimMinTrust(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>0%</span>
                    <span>Active: {simMinTrust}%</span>
                    <span>100%</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Blocked Actions</span>
                  <div className="flex flex-wrap gap-2">
                    {["refund", "waive_annual_fee", "replace_card", "increase_credit_limit"].map(act => (
                      <button
                        key={act}
                        onClick={() => toggleSimAction(act)}
                        className={`px-2.5 py-1 rounded text-[10px] font-mono border transition-all ${
                          simBlockedActions.includes(act) 
                            ? 'bg-red-500/20 text-red-400 border-red-500/40' 
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {act.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={runSimulation}
                  disabled={isSimulating}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-2 rounded-xl text-xs shadow-lg shadow-blue-900/10 transition-colors"
                >
                  {isSimulating ? "Running Telemetry Model..." : "Run Policy Simulation"}
                </button>
              </div>

              <div className="md:col-span-2 bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
                {simResults ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-center">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Approvals Reduced</span>
                        <p className="text-lg font-black text-amber-500">{simResults.approvals_reduced_pct}%</p>
                      </div>
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-center">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Fraud Prevented</span>
                        <p className="text-lg font-black text-emerald-500">{simResults.fraud_prevented_pct}%</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Customer Friction Index:</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          simResults.customer_friction_index === 'Minimal' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>{simResults.customer_friction_index}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed pt-2 border-t border-slate-800/60 font-mono">
                        {simResults.impact_message}
                      </p>
                    </div>

                    {/* Chart summary */}
                    <div className="h-28">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { name: 'Approvals Reduced', value: simResults.approvals_reduced_pct },
                          { name: 'Fraud Prevented', value: simResults.fraud_prevented_pct }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                          <XAxis dataKey="name" stroke="#4b5563" fontSize={9} />
                          <YAxis stroke="#4b5563" fontSize={9} />
                          <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs py-8">
                    <Sparkles className="h-8 w-8 text-blue-500/40 mb-2 animate-pulse" />
                    <span>Run a simulation to view estimated regulatory impact.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: ENHANCED DYNAMIC ENTERPRISE AI RECOMMENDATIONS PANEL */}
        <div className="glass-panel p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Panel Header with Live AI Scan Timestamps */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 glow-blue shrink-0">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs uppercase tracking-widest font-black text-slate-200 leading-none">AI Recommendations</h3>
                  <span className="text-[9px] text-blue-400 font-mono font-bold block mt-1">Autonomous Policy Intelligence</span>
                </div>
              </div>

              {/* Automatic Timestamp & Trigger Refresh Button */}
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="text-[9px] text-slate-500 font-mono block">Last AI Scan: <strong className="text-slate-300">{timeAgoText}</strong></span>
                  <span className="text-[8px] text-slate-600 font-mono block">Next in {nextScanSeconds}s</span>
                </div>
                <button 
                  onClick={triggerAiScan}
                  disabled={isAiScanning}
                  className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-lg transition-all active:scale-95"
                  title="Force AI Policy Scan"
                >
                  <RefreshCcw className={`h-3.5 w-3.5 ${isAiScanning ? 'animate-spin text-blue-400' : ''}`} />
                </button>
              </div>
            </div>

            {/* Description Subtext */}
            <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
              Real-time governance engine evaluating audit logs, agent risk profiles, and spending velocity to propose compliance directives.
            </p>

            {/* Loading Skeleton Animation */}
            {isAiScanning ? (
              <div className="space-y-4 py-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-3 animate-pulse">
                    <div className="flex justify-between items-center">
                      <div className="h-3 w-16 bg-slate-800 rounded"></div>
                      <div className="h-3 w-10 bg-slate-800 rounded"></div>
                    </div>
                    <div className="h-4 w-3/4 bg-slate-800 rounded"></div>
                    <div className="h-3 w-full bg-slate-800/60 rounded"></div>
                    <div className="h-8 w-full bg-slate-800/40 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : activePendingRecommendations.length === 0 ? (
              /* Enterprise Healthy Empty State */
              <div className="p-6 bg-emerald-500/[0.04] border border-emerald-500/20 rounded-2xl text-center space-y-4 my-2">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400 glow-emerald">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-xs text-slate-100 uppercase tracking-wider">All Governance Policies Healthy</h4>
                  <p className="text-[11px] text-emerald-400 font-mono font-bold">✓ No compliance risks or policy anomalies detected</p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 space-y-1">
                  <p className="flex items-center justify-center gap-1">
                    <Clock className="h-3 w-3 text-slate-500" />
                    <span>Last AI analysis completed {timeAgoText}</span>
                  </p>
                  <p className="flex items-center justify-center gap-1 text-slate-500">
                    <RefreshCcw className="h-3 w-3 text-blue-400" />
                    <span>Next scheduled analysis in {nextScanSeconds} seconds</span>
                  </p>
                </div>
              </div>
            ) : (
              /* Dynamic AI Recommendation Cards List */
              <div className="space-y-4">
                {activePendingRecommendations.map((rec) => {
                  const isExpanded = expandedRecId === rec.id;

                  // Priority Color Coding Rules
                  let borderBgClasses = "border-blue-500/30 bg-blue-500/[0.02]";
                  let badgeClasses = "bg-blue-500/15 border-blue-500/30 text-blue-400";

                  if (rec.priority === 'critical') {
                    borderBgClasses = "border-red-500/30 bg-red-500/[0.03]";
                    badgeClasses = "bg-red-500/15 border-red-500/30 text-red-400";
                  } else if (rec.priority === 'high') {
                    borderBgClasses = "border-amber-500/30 bg-amber-500/[0.03]";
                    badgeClasses = "bg-amber-500/15 border-amber-500/30 text-amber-400";
                  } else if (rec.priority === 'low') {
                    borderBgClasses = "border-emerald-500/30 bg-emerald-500/[0.03]";
                    badgeClasses = "bg-emerald-500/15 border-emerald-500/30 text-emerald-400";
                  }

                  return (
                    <div 
                      key={rec.id} 
                      className={`p-4 border rounded-xl text-xs space-y-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${borderBgClasses}`}
                    >
                      {/* Priority Badge, AI Confidence & Timestamp Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-extrabold font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${badgeClasses}`}>
                            {rec.priority}
                          </span>
                          <span className="text-[9px] font-mono text-slate-500 font-bold">ID: {rec.id}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                            {rec.confidence}% AI Confidence
                          </span>
                        </div>
                      </div>

                      {/* Title & Short Explanation */}
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-xs text-slate-100 leading-snug">{rec.title}</h4>
                        <p className="text-slate-400 text-[11px] font-mono leading-relaxed">{rec.explanation}</p>
                      </div>

                      {/* Suggested Action Box */}
                      <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80 space-y-1">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Suggested Action</span>
                        <p className="text-slate-300 text-[10px] font-mono leading-relaxed">{rec.recommendedAction}</p>
                      </div>

                      {/* Expand / Collapse Details Button */}
                      <button 
                        onClick={() => setExpandedRecId(isExpanded ? null : rec.id)}
                        className="text-[10px] text-blue-400 hover:text-blue-300 font-mono font-bold flex items-center gap-1 transition-colors"
                      >
                        <span>{isExpanded ? 'Hide Analysis Details' : 'View AI Analysis Details'}</span>
                        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>

                      {/* Collapsible Technical Details */}
                      {isExpanded && (
                        <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-[10px] font-mono space-y-2 text-slate-300 animate-in fade-in duration-150">
                          <div>
                            <span className="text-slate-500 font-bold uppercase text-[9px] block">Technical Attack/Anomaly Pattern</span>
                            <p className="text-slate-300 leading-relaxed">{rec.details}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                            <div>
                              <span className="text-slate-500 font-bold uppercase text-[9px] block">Affected Agent</span>
                              <span className="text-slate-200 font-bold">{rec.affectedAgent}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 font-bold uppercase text-[9px] block">Target Policy</span>
                              <span className="text-blue-400 font-bold">{rec.policyId}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons Toolbar: Apply, Review, Schedule, Ignore */}
                      <div className="pt-1 flex flex-wrap gap-2">
                        {perms.canDeployPolicies && !perms.isReadOnly ? (
                          <button
                            onClick={() => handleApplyRecommendation(rec)}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 px-3 rounded-lg text-[10px] uppercase tracking-wider transition-all duration-150 shadow-md glow-blue active:scale-95 flex items-center justify-center gap-1"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Apply</span>
                          </button>
                        ) : (
                          <button
                            onClick={notifyRestrictedAction}
                            className="flex-1 bg-slate-900 border border-slate-800 text-slate-500 font-mono text-[9px] font-bold py-1.5 px-3 rounded-lg uppercase flex items-center justify-center gap-1 cursor-not-allowed opacity-60"
                            title="Action Restricted: Elevated privileges required."
                          >
                            <Lock className="h-3 w-3" />
                            <span>Apply (Restricted)</span>
                          </button>
                        )}

                        <button
                          onClick={() => setReviewModalRec(rec)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold py-1.5 px-2.5 rounded-lg text-[10px] transition-all active:scale-95"
                          title="Review Technical Details"
                        >
                          Review
                        </button>

                        <button
                          onClick={() => handleScheduleRecommendation(rec)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold py-1.5 px-2.5 rounded-lg text-[10px] transition-all active:scale-95"
                          title="Schedule Review in 7 Days"
                        >
                          Schedule
                        </button>

                        <button
                          onClick={() => handleIgnoreRecommendation(rec.id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Ignore / Dismiss Recommendation"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal for Deep Inspection */}
      {reviewModalRec && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Sparkles className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-100 uppercase tracking-wider">{reviewModalRec.title}</h3>
                  <span className="text-[10px] text-blue-400 font-mono font-bold">AI Analysis Deep Inspection</span>
                </div>
              </div>
              <button onClick={() => setReviewModalRec(null)} className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-slate-800">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-[9px] text-slate-500 uppercase font-bold block">AI Explanation</span>
                <p className="text-slate-200 text-[11px] leading-relaxed">{reviewModalRec.explanation}</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-[9px] text-slate-500 uppercase font-bold block">Suggested Directive</span>
                <p className="text-blue-400 text-[11px] font-bold leading-relaxed">{reviewModalRec.recommendedAction}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[10px]">
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block uppercase font-bold">Affected Agent</span>
                  <span className="text-slate-200 font-bold text-xs">{reviewModalRec.affectedAgent}</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block uppercase font-bold">Target Policy ID</span>
                  <span className="text-amber-400 font-bold text-xs">{reviewModalRec.policyId}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => handleIgnoreRecommendation(reviewModalRec.id)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs transition-colors"
              >
                Dismiss
              </button>

              <button 
                onClick={() => handleApplyRecommendation(reviewModalRec)}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg glow-blue transition-colors flex items-center justify-center gap-1.5"
              >
                <Check className="h-4 w-4" />
                <span>Apply Recommendation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Version History compare & Rollback Modal Drawer */}
      {isHistoryOpen && selectedPolicy && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-end z-50">
          <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-blue-400" />
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">Policy Version History</h3>
                  <span className="text-[10px] text-slate-500 font-mono uppercase">{selectedPolicy.policy_id}</span>
                </div>
              </div>
              <button 
                onClick={() => setIsHistoryOpen(false)}
                className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* List of Versions */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 text-xs">
              {history.map((ver) => (
                <div 
                  key={ver.version} 
                  className={`p-4 border rounded-xl space-y-2 transition-all ${
                    selectedPolicy.version === ver.version 
                      ? 'bg-blue-950/20 border-blue-500/40' 
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-600 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded">
                        V{ver.version}
                      </span>
                      {selectedPolicy.version === ver.version && (
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold px-2 py-0.5 rounded">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(ver.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-slate-300 font-medium">Reason: {ver.change_reason}</p>
                  
                  <div className="text-[10px] font-mono text-slate-400">
                    <span>Limit: ₹{ver.max_amount?.toLocaleString()} | Created by: {ver.created_by}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
