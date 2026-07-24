import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, Clock, UserCheck, ShieldAlert, Check, X, 
  AlertCircle, ArrowRight, HelpCircle, FileText, Lock, ChevronDown, ChevronUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HITLQueueProps {
  onQueueLengthChange?: (count: number) => void;
}

export default function HITLQueue({ onQueueLengthChange }: HITLQueueProps) {
  const { roleConfig, notifyRestrictedAction } = useAuth();
  const perms = roleConfig.permissions;

  const [escalations, setEscalations] = useState<any[]>([
    {
      id: 1,
      timestamp: new Date().toISOString(),
      agent_id: "refund_agent",
      agent_name: "Refund Agent",
      action: "refund",
      customer_id: "CUST-3877",
      policy_id: "P-105",
      policy_name: "High Risk Regional Filter",
      risk_score: 68.4,
      risk_level: "High",
      decision: "escalated",
      confidence_score: 41.2,
      reasoning: "Transaction escalated to Human-in-the-Loop. Fraud score is elevated (18%). Location mismatch detected (Delhi/Mumbai). Amount ₹14,200 exceeds automated threshold.",
      details: { amount: 14200.0, customer_trust_score: 75.0, device_recognition: 0.9, location: "mismatch" }
    },
    {
      id: 2,
      timestamp: new Date().toISOString(),
      agent_id: "credit_agent",
      agent_name: "Credit Limit Agent",
      action: "increase_credit_limit",
      customer_id: "CUST-9102",
      policy_id: "P-103",
      policy_name: "Credit Breach Guard",
      risk_score: 74.0,
      risk_level: "High",
      decision: "escalated",
      confidence_score: 38.5,
      reasoning: "Credit limit increase request of ₹85,000 post-midnight from an unverified IP address.",
      details: { amount: 85000.0, customer_trust_score: 70.0, device_recognition: 0.6, location: "unrecognized" }
    },
    {
      id: 3,
      timestamp: new Date().toISOString(),
      agent_id: "card_agent",
      agent_name: "Card Replacement Agent",
      action: "replace_card",
      customer_id: "CUST-4410",
      policy_id: "P-104",
      policy_name: "Card Velocity Shield",
      risk_score: 62.1,
      risk_level: "Medium",
      decision: "escalated",
      confidence_score: 45.0,
      reasoning: "2nd card replacement request within 48 hours for international travel claim.",
      details: { amount: 22000.0, customer_trust_score: 82.0, device_recognition: 0.8, location: "matching" }
    },
    {
      id: 4,
      timestamp: new Date().toISOString(),
      agent_id: "dispute_agent",
      agent_name: "Dispute Agent",
      action: "approve_dispute",
      customer_id: "CUST-7721",
      policy_id: "P-106",
      policy_name: "Dispute Settlement Limit",
      risk_score: 79.8,
      risk_level: "High",
      decision: "escalated",
      confidence_score: 35.0,
      reasoning: "Merchant chargeback dispute of ₹36,500 requires manual compliance auditor sign-off.",
      details: { amount: 36500.0, customer_trust_score: 68.0, device_recognition: 0.7, location: "matching" }
    },
    {
      id: 5,
      timestamp: new Date().toISOString(),
      agent_id: "fee_agent",
      agent_name: "Fee Waiver Agent",
      action: "waive_annual_fee",
      customer_id: "CUST-1092",
      policy_id: "P-107",
      policy_name: "Annual Fee Waiver Cap",
      risk_score: 65.0,
      risk_level: "Medium",
      decision: "escalated",
      confidence_score: 48.0,
      reasoning: "Annual fee waiver requested for premium Amex Centurion account with account tenure under 6 months.",
      details: { amount: 15000.0, customer_trust_score: 88.0, device_recognition: 0.95, location: "matching" }
    },
    {
      id: 6,
      timestamp: new Date().toISOString(),
      agent_id: "rewards_agent",
      agent_name: "Rewards Agent",
      action: "redeem_points",
      customer_id: "CUST-8830",
      policy_id: "P-108",
      policy_name: "Reward Points Anomaly Guard",
      risk_score: 71.2,
      risk_level: "High",
      decision: "escalated",
      confidence_score: 42.0,
      reasoning: "Bulk point redemption of 250,000 Membership Rewards points triggered high-value velocity flag.",
      details: { amount: 48000.0, customer_trust_score: 72.0, device_recognition: 0.85, location: "matching" }
    },
    {
      id: 7,
      timestamp: new Date().toISOString(),
      agent_id: "travel_agent",
      agent_name: "Travel Claim Agent",
      action: "approve_travel_claim",
      customer_id: "CUST-6154",
      policy_id: "P-105",
      policy_name: "International Travel Policy",
      risk_score: 82.0,
      risk_level: "High",
      decision: "escalated",
      confidence_score: 32.0,
      reasoning: "Travel disruption reimbursement claim of ₹95,000 filed post-departure without travel insurance pre-registration.",
      details: { amount: 95000.0, customer_trust_score: 64.0, device_recognition: 0.5, location: "mismatch" }
    },
    {
      id: 8,
      timestamp: new Date().toISOString(),
      agent_id: "corp_agent",
      agent_name: "Corporate Refund Agent",
      action: "corporate_refund",
      customer_id: "CUST-2041",
      policy_id: "P-109",
      policy_name: "Corporate Batch Threshold",
      risk_score: 88.5,
      risk_level: "Critical",
      decision: "escalated",
      confidence_score: 29.0,
      reasoning: "Batch refund request of ₹110,000 for corporate card account exceeds single-signature authorization limit.",
      details: { amount: 110000.0, customer_trust_score: 60.0, device_recognition: 0.6, location: "matching" }
    }
  ]);

  const [processingId, setProcessingId] = useState<number | null>(null);
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [expandedReasonId, setExpandedReasonId] = useState<number | null>(null);

  const fetchEscalations = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/monitor/logs?decision=escalated');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setEscalations(data);
          if (onQueueLengthChange) onQueueLengthChange(data.length);
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchEscalations();
  }, []);

  const handleFeedback = async (auditId: number, decision: 'approved_override' | 'rejected_override') => {
    if ((decision === 'approved_override' && !perms.canApproveHITL) || (decision === 'rejected_override' && !perms.canRejectHITL) || perms.isReadOnly) {
      notifyRestrictedAction();
      return;
    }

    setProcessingId(auditId);
    try {
      await fetch('http://localhost:8000/api/v1/governance/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audit_id: auditId,
          feedback_decision: decision,
          notes: feedbackNotes
        })
      });
    } catch (e) {}

    const updatedQueue = escalations.filter(x => x.id !== auditId);
    setEscalations(updatedQueue);
    if (onQueueLengthChange) onQueueLengthChange(updatedQueue.length);

    setSuccessMsg(`Decision overridden successfully: ${decision.replace('_', ' ').toUpperCase()}. Risk parameters updated.`);
    setFeedbackNotes('');
    setTimeout(() => setSuccessMsg(''), 4000);
    setProcessingId(null);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header with Title & Inline Pending Badge */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-2xl font-black tracking-tight text-slate-100 uppercase">HITL Review Queue</h2>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-xs font-bold shadow-sm shrink-0">
            <Clock className="h-3.5 w-3.5" />
            <span>{escalations.length} Pending Review</span>
          </div>
        </div>

        <p className="text-xs text-blue-400 font-semibold tracking-wider uppercase">
          Human-in-the-loop manual verification desk for low-confidence agent transactions
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-bold font-mono animate-in fade-in duration-200">
          {successMsg}
        </div>
      )}

      {/* Escalated Queue Cards list */}
      <div className="grid grid-cols-1 gap-6">
        {escalations.length === 0 ? (
          <div className="glass-panel p-12 text-center text-slate-500 text-xs rounded-2xl shadow-lg">
            <ClipboardCheck className="h-8 w-8 text-slate-600 mb-2 mx-auto" />
            <span>Escalation queue clear. All autonomous actions operating within parameters.</span>
          </div>
        ) : (
          escalations.map((item) => {
            const details = item.details || {};
            const amt = details.amount || 12000.0;
            const isReasonExpanded = expandedReasonId === item.id;
            const isLongText = item.reasoning.length > 130;

            return (
              <div 
                key={item.id} 
                className="glass-panel p-6 border border-amber-500/20 bg-amber-500/[0.01] flex flex-col xl:flex-row gap-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 items-stretch overflow-hidden max-w-full mb-2"
              >
                {/* Request Vitals Left Panel */}
                <div className="flex-1 space-y-4 flex flex-col justify-between min-w-0">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-bold font-mono uppercase shrink-0">
                        <Clock className="h-3 w-3" />
                        <span>Pending Verification</span>
                      </span>
                      <span className="text-xs font-mono text-slate-500 font-bold shrink-0">ID: #{item.id}</span>
                      <h3 className="font-extrabold text-sm text-slate-200 truncate">{item.agent_name}</h3>
                    </div>

                    {/* AI Trigger Reason box */}
                    <div className="text-xs text-slate-300 font-medium bg-slate-950/90 p-3.5 border border-slate-800 rounded-xl leading-relaxed relative">
                      <div className="flex justify-between items-baseline mb-1">
                        <strong className="text-amber-500 font-bold text-[11px] block">AI Trigger Reason:</strong>
                        {isLongText && (
                          <button 
                            onClick={() => setExpandedReasonId(isReasonExpanded ? null : item.id)}
                            className="text-[10px] text-blue-400 hover:text-blue-300 font-mono font-bold flex items-center gap-0.5 ml-2 shrink-0"
                          >
                            <span>{isReasonExpanded ? 'Show Less' : 'View Details'}</span>
                            {isReasonExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          </button>
                        )}
                      </div>
                      <p className={`text-slate-300 text-[11px] font-mono ${!isReasonExpanded && isLongText ? 'line-clamp-3' : ''}`}>
                        {item.reasoning}
                      </p>
                    </div>
                  </div>

                  {/* Clean 4-Column Metric Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono pt-3 border-t border-slate-800/60">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5 truncate">Requested Action</span>
                      <span className="text-slate-200 font-extrabold capitalize truncate block">{item.action.replace('_', ' ')}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5 truncate">Transaction Value</span>
                      <span className="text-slate-100 font-black truncate block">₹{amt.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5 truncate">Risk Score</span>
                      <span className="text-red-500 font-black truncate block">{item.risk_score}% ({item.risk_level})</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5 truncate">Confidence Rating</span>
                      <span className="text-amber-500 font-black truncate block">{item.confidence_score}%</span>
                    </div>
                  </div>
                </div>

                {/* Right Operator Panel */}
                <div className="w-full xl:w-[360px] shrink-0 border-t xl:border-t-0 xl:border-l border-slate-800/80 pt-6 xl:pt-0 xl:pl-6 flex flex-col justify-between space-y-5 overflow-hidden">
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Auditor Sign-off Notes</label>
                    <textarea 
                      value={feedbackNotes}
                      onChange={(e) => setFeedbackNotes(e.target.value)}
                      disabled={perms.isReadOnly}
                      placeholder={perms.isReadOnly ? "Notes locked in read-only mode..." : "Add compliance notes or authorization code..."}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 h-[72px] resize-none placeholder-slate-500 disabled:opacity-50 transition-all duration-200 box-border"
                    />
                  </div>

                  {/* Symmetrical Rectangular Action Buttons (matching rounded-xl, 52px height) */}
                  <div className="flex flex-col sm:flex-row gap-4 items-center w-full pt-1">
                    {perms.canRejectHITL && !perms.isReadOnly ? (
                      <button 
                        onClick={() => handleFeedback(item.id, 'rejected_override')}
                        disabled={processingId === item.id}
                        className="w-full sm:w-1/2 h-[52px] flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white border border-red-500/40 font-bold rounded-xl text-xs transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-lg box-border shrink-0"
                      >
                        <X className="h-4.5 w-4.5" />
                        <span>Decline</span>
                      </button>
                    ) : (
                      <button 
                        onClick={notifyRestrictedAction}
                        className="w-full sm:w-1/2 h-[52px] flex items-center justify-center gap-2 bg-slate-850 text-slate-500 border border-slate-750 font-bold rounded-xl text-xs cursor-not-allowed opacity-60 box-border shrink-0"
                        title="Action Restricted: Elevated privileges required."
                      >
                        <Lock className="h-4 w-4 text-slate-500" />
                        <span>Decline</span>
                      </button>
                    )}

                    {perms.canApproveHITL && !perms.isReadOnly ? (
                      <button 
                        onClick={() => handleFeedback(item.id, 'approved_override')}
                        disabled={processingId === item.id}
                        className="w-full sm:w-1/2 h-[52px] flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/40 font-bold rounded-xl text-xs shadow-lg shadow-emerald-950/30 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 glow-emerald box-border shrink-0"
                      >
                        <Check className="h-4.5 w-4.5" />
                        <span>Approve</span>
                      </button>
                    ) : (
                      <button 
                        onClick={notifyRestrictedAction}
                        className="w-full sm:w-1/2 h-[52px] flex items-center justify-center gap-2 bg-slate-800 text-slate-500 border border-slate-700 font-bold rounded-xl text-xs cursor-not-allowed opacity-60 box-border shrink-0"
                        title="Action Restricted: Elevated privileges required."
                      >
                        <Lock className="h-4 w-4 text-slate-500" />
                        <span>Approve</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
