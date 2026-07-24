import React, { useState } from 'react';
import { 
  ShieldAlert, Play, RefreshCw, X, Check, 
  HelpCircle, ChevronRight, Terminal, UserCheck, AlertTriangle, CheckCircle2, Sparkles, ShieldCheck, ArrowRight, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sandbox() {
  const { roleConfig, notifyRestrictedAction } = useAuth();
  const perms = roleConfig.permissions;

  // Inputs
  const [agentId, setAgentId] = useState('refund_agent');
  const [action, setAction] = useState('refund');
  const [amount, setAmount] = useState(12000.0);
  const [customerTrust, setCustomerTrust] = useState(95.0);
  const [fraudScore, setFraudScore] = useState(5.0);
  const [payloadContent, setPayloadContent] = useState('Customer Uber dispute refund credit adjustment');
  const [expectedDecision, setExpectedDecision] = useState('approved');

  // Animation States
  const [isRunning, setIsRunning] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [results, setResults] = useState<any>({
    decision: "approved",
    risk_score: 23.5,
    confidence: 98.7,
    explainability: 96.0,
    sandbox_status: "success",
    match: true
  });

  const pipelineNodes = [
    { name: 'Refund Agent', role: 'Origin Agent', desc: 'Pre-flight identity scan' },
    { name: 'Fraud Agent', role: 'Security Layer', desc: 'ML probability check' },
    { name: 'Customer Verification', role: 'Trust Engine', desc: 'Behavior & device match' },
    { name: 'Compliance Agent', role: 'Regulatory Guard', desc: 'RBI & PCI DSS guidelines' },
    { name: 'Risk Engine', role: 'Adaptive Scoring', desc: 'Weighted score calculation' },
    { name: 'Confidence Evaluator', role: 'Uncertainty Scan', desc: 'Index evaluation' },
    { name: 'Decision Gate', role: 'Final Verdict', desc: 'Policy enforcement' },
    { name: 'Audit Ledger', role: 'Immutable Store', desc: 'System log committed' }
  ];

  const runSandboxTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!perms.canRunSandbox || perms.isReadOnly) {
      notifyRestrictedAction();
      return;
    }

    setIsRunning(true);
    setActiveStepIndex(0);

    // Animate through all 8 pipeline nodes sequentially
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setActiveStepIndex(step);
      if (step >= pipelineNodes.length - 1) {
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 280);

    try {
      const payload = {
        agent_id: agentId, action, amount, customer_id: "CUST-SANDBOX-TEST",
        customer_trust_score: customerTrust, fraud_score: fraudScore, payload_content: payloadContent, expected_decision: expectedDecision
      };
      const res = await fetch('http://localhost:8000/api/v1/sandbox/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch (e) {
      // offline fallback
      let dec = "approved";
      if (payloadContent.toLowerCase().includes("ignore") || payloadContent.toLowerCase().includes("bypass")) dec = "rejected";
      else if (amount > 15000) dec = "escalated";

      setResults({
        decision: dec,
        risk_score: fraudScore + (amount > 15000 ? 35 : 5),
        confidence: 98.7,
        explainability: 95.5,
        sandbox_status: "success",
        match: dec === expectedDecision
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-100 uppercase">AI Governance Sandbox</h2>
        <p className="text-xs text-blue-400 font-semibold tracking-wider uppercase mt-0.5">
          Execute test payloads through the multi-agent decision pipeline
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Test Scenario Form */}
        <div className="glass-panel p-6 space-y-4">
          <h3 className="text-xs uppercase tracking-widest font-black text-slate-300 mb-4">Payload Assertion Config</h3>
          <form onSubmit={runSandboxTest} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Origin Agent</label>
                <select value={agentId} onChange={(e) => setAgentId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-300">
                  <option value="refund_agent">Refund Agent</option>
                  <option value="credit_agent">Credit Limit Agent</option>
                  <option value="card_agent">Card Replacement Agent</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Action</label>
                <select value={action} onChange={(e) => setAction(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-300">
                  <option value="refund">refund</option>
                  <option value="increase_credit_limit">increase_credit_limit</option>
                  <option value="replace_card">replace_card</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Amount (INR)</label>
                <input type="number" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200" required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Expected Outcome</label>
                <select value={expectedDecision} onChange={(e) => setExpectedDecision(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-300">
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="escalated">Escalated</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Payload Content</label>
              <textarea value={payloadContent} onChange={(e) => setPayloadContent(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 h-16 resize-none" />
            </div>

            {perms.canRunSandbox && !perms.isReadOnly ? (
              <button 
                type="submit" 
                disabled={isRunning}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg glow-blue flex items-center justify-center gap-2"
              >
                <Play className="h-3.5 w-3.5" />
                <span>{isRunning ? 'Traversing Pipeline...' : 'Execute Sandbox Test'}</span>
              </button>
            ) : (
              <button 
                type="button"
                onClick={notifyRestrictedAction}
                className="w-full bg-slate-900 border border-slate-800 text-slate-500 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-not-allowed opacity-60"
                title="This action requires elevated privileges."
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Execute Sandbox Test (Restricted)</span>
              </button>
            )}
          </form>
        </div>

        {/* Hero Interactive Animated Multi-Stage Pipeline */}
        <div className="lg:col-span-2 glass-panel p-6 flex flex-col justify-between space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs uppercase tracking-widest font-black text-slate-300">Animated Governance Pipeline Trace</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Real-time packet propagation through multi-agent nodes</p>
            </div>
            {results && (
              <span className={`text-[10px] font-mono font-bold px-3 py-1 rounded-xl uppercase border ${
                results.decision === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                (results.decision === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20')
              }`}>
                Verdict: {results.decision}
              </span>
            )}
          </div>

          {/* Sequential 8-Node Animated Pipeline Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {pipelineNodes.map((node, idx) => {
              const isActive = activeStepIndex === idx;
              const isPassed = activeStepIndex >= idx;

              return (
                <div 
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between min-h-[110px] ${
                    isActive 
                      ? 'bg-blue-900/30 border-blue-500 text-white shadow-xl glow-blue scale-105' 
                      : (isPassed 
                          ? 'bg-slate-900/80 border-emerald-500/40 text-slate-200' 
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-500 opacity-60')
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-extrabold uppercase text-slate-400">Step 0{idx+1}</span>
                    <CheckCircle2 className={`h-4 w-4 ${isPassed ? 'text-emerald-400' : 'text-slate-700'}`} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-100">{node.name}</h4>
                    <p className="text-[9px] text-slate-400 font-mono mt-0.5">{node.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Decision Metrics Summary */}
          {results && (
            <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl grid grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-500 text-[9px] uppercase font-bold block">Risk Score</span>
                <span className="text-emerald-400 font-bold text-sm">{results.risk_score}%</span>
              </div>
              <div>
                <span className="text-slate-500 text-[9px] uppercase font-bold block">Confidence</span>
                <span className="text-blue-400 font-bold text-sm">{results.confidence}%</span>
              </div>
              <div>
                <span className="text-slate-500 text-[9px] uppercase font-bold block">Explainability</span>
                <span className="text-indigo-400 font-bold text-sm">{results.explainability}%</span>
              </div>
              <div>
                <span className="text-slate-500 text-[9px] uppercase font-bold block">Assertion Match</span>
                <span className="text-emerald-400 font-bold text-sm">{results.match ? 'PASSED ✓' : 'FAILED ✗'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
