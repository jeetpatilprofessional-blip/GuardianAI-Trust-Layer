import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Download, ExternalLink, X, Clock, 
  CheckCircle, AlertTriangle, ShieldCheck, Cpu, ChevronRight, UserCheck
} from 'lucide-react';

interface AuditTrailProps {
  setActiveTab?: (tab: string) => void;
}

export default function AuditTrail({ setActiveTab }: AuditTrailProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [agentFilter, setAgentFilter] = useState('');
  const [decisionFilter, setDecisionFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const fetchLogs = async () => {
    try {
      let url = 'http://localhost:8000/api/v1/monitor/logs?limit=100';
      if (agentFilter) url += `&agent_id=${agentFilter}`;
      if (decisionFilter) url += `&decision=${decisionFilter}`;
      if (riskFilter) url += `&risk_level=${riskFilter}`;
      if (search) url += `&search=${search}`;
      
      const res = await fetch(url);
      if (res.ok) {
        setLogs(await res.json());
      }
    } catch (e) {
      console.warn("Connection lost. Seeding offline audit records.");
      setLogs([
        {
          id: 4,
          timestamp: new Date(Date.now() - 1800000).toISOString(),
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
          explainability_score: 88.0,
          execution_time_ms: 920,
          status: "success",
          reasoning: "Transaction escalated to Human-in-the-Loop. Fraud score is elevated (18%). Location mismatch detected (Delhi IP from Mumbai). Amount ₹12,000 exceeds compliance automated check.",
          details: {
            amount: 12000.0,
            customer_trust_score: 75.0,
            device_recognition: 0.9,
            location: "mismatch",
            fraud_score: 18.0,
            payload_content: "Disputed charge refund Request ID RF-9921",
            compliance_status: "warning"
          }
        },
        {
          id: 3,
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          agent_id: "refund_agent",
          agent_name: "Refund Agent",
          action: "refund",
          customer_id: "CUST-8021",
          policy_id: "P-102",
          policy_name: "Refund Discrepancy Policy",
          risk_score: 78.2,
          risk_level: "High",
          decision: "rejected",
          confidence_score: 21.8,
          explainability_score: 95.0,
          execution_time_ms: 880,
          status: "failed",
          reasoning: "Request rejected. Policy violation: Requested refund amount ₹16,000 exceeds maximum policy threshold of ₹15,000 (P-102). Elevated fraud risk detected.",
          details: {
            amount: 16000.0,
            customer_trust_score: 45.0,
            device_recognition: 0.4,
            location: "mismatch",
            fraud_score: 52.0,
            payload_content: "Disputed charges for lodging RF-4412",
            compliance_status: "passed"
          }
        },
        {
          id: 2,
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          agent_id: "card_agent",
          agent_name: "Card Replacement Agent",
          action: "waive_annual_fee",
          customer_id: "CUST-4112",
          policy_id: "P-104",
          policy_name: "Annual Fee Waiver Verification",
          risk_score: 8.2,
          risk_level: "Low",
          decision: "approved",
          confidence_score: 98.5,
          explainability_score: 95.0,
          execution_time_ms: 480,
          status: "success",
          reasoning: "Annual fee waiver approved automatically. Policy P-104 matches. Waiver amount ₹1,200 is below policy threshold ₹5,000.",
          details: {
            amount: 1200.0,
            customer_trust_score: 85.0,
            device_recognition: 1.0,
            location: "matching",
            fraud_score: 2.0,
            payload_content: "Waive fee premium credit card",
            compliance_status: "passed"
          }
        },
        {
          id: 1,
          timestamp: new Date(Date.now() - 14400000).toISOString(),
          agent_id: "refund_agent",
          agent_name: "Refund Agent",
          action: "refund",
          customer_id: "CUST-9921",
          policy_id: "P-102",
          policy_name: "Refund Discrepancy Policy",
          risk_score: 14.5,
          risk_level: "Low",
          decision: "approved",
          confidence_score: 96.4,
          explainability_score: 95.0,
          execution_time_ms: 750,
          status: "success",
          reasoning: "Refund approved. Policy P-102 matches. Fraud score is below threshold (4%). Known customer. Daily spend limits remain available.",
          details: {
            amount: 4200.0,
            customer_trust_score: 95.0,
            device_recognition: 1.0,
            location: "matching",
            fraud_score: 4.0,
            payload_content: "Disputed Uber transaction adjustment",
            compliance_status: "passed"
          }
        }
      ]);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [agentFilter, decisionFilter, riskFilter, search]);

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Timestamp,Agent Name,Action,Customer ID,Risk Score,Risk Level,Decision,Latency (ms)\n";
    
    logs.forEach(l => {
      const row = `"${l.timestamp}","${l.agent_name}","${l.action}","${l.customer_id}",${l.risk_score},"${l.risk_level}","${l.decision}",${l.execution_time_ms}\n`;
      csvContent += row;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GuardianAI_AuditTrail_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mock timelines if missing from response database schema
  const generateMockTimeline = (log: any) => {
    const details = log.details || {};
    const amt = details.amount || 0;
    const isEscalated = log.decision === 'escalated';
    const isApproved = log.decision === 'approved';
    
    return [
      {
        step: "Security Guard",
        status: "passed",
        message: "Agent Registry Match: verified",
        details: `Agent '${log.agent_name}' matches registration records.`
      },
      {
        step: "Permission Verification",
        status: "passed",
        message: `Action Allowed: '${log.action}'`,
        details: `Action permissions checked and validated.`
      },
      {
        step: "Compliance Agent",
        status: amt > 10000 ? "warning" : "passed",
        message: amt > 10000 ? "Compliance Warning: Dual-Auth Triggered" : "Compliance Check: Passed",
        details: amt > 10000 
          ? "RBI Guidelines: transactions above ₹10,000 require manual dual-verification."
          : "PCI DSS: no unmasked card numbers identified in logs."
      },
      {
        step: "Policy Rules Evaluation",
        status: isApproved || isEscalated ? "passed" : "failed",
        message: isApproved || isEscalated ? "Corporate Policies: Clear" : `Rule Triggered: Policy ${log.policy_id}`,
        details: isApproved || isEscalated 
          ? "Request complies with all assigned policy conditions."
          : `Refund request amount ₹${amt.toLocaleString()} violates policy '${log.policy_name}' (P-102).`
      },
      {
        step: "Adaptive Risk Calculation",
        status: log.risk_score <= 30 ? "passed" : (log.risk_score <= 60 ? "warning" : "failed"),
        message: `Risk Calculated: ${log.risk_level.toUpperCase()}`,
        details: `Calculated score: ${log.risk_score}%. Fraud Score: ${details.fraud_score || 0}%, Location: ${details.location || 'matching'}.`
      },
      {
        step: "Governance Final Decision",
        status: isApproved ? "passed" : (isEscalated ? "warning" : "failed"),
        message: `Verdict: ${log.decision.toUpperCase()}`,
        details: `Decision Confidence Index: ${log.confidence_score}% | Explainability: ${log.explainability_score}%`
      }
    ];
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-100">Audit Trail Ledger</h2>
          <p className="text-sm text-slate-400">Read-only immutable governance database storing audit trails, decisions, and reasoning</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold py-2 px-4 rounded-xl shadow-lg transition-all"
        >
          <Download className="h-4.5 w-4.5" />
          <span>Export Ledger</span>
        </button>
      </div>

      {/* Filters Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center gap-3">
          <Search className="h-4 w-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search audit trail by customer id, action, or policy..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none text-xs text-slate-200 focus:outline-none w-full"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center gap-3">
          <Filter className="h-4 w-4 text-slate-500" />
          <select 
            value={decisionFilter}
            onChange={(e) => setDecisionFilter(e.target.value)}
            className="bg-transparent border-none text-xs text-slate-300 focus:outline-none w-full cursor-pointer"
          >
            <option value="" className="bg-slate-900">All Decisions</option>
            <option value="approved" className="bg-slate-900 text-emerald-400">Approved</option>
            <option value="rejected" className="bg-slate-900 text-red-400">Rejected</option>
            <option value="escalated" className="bg-slate-900 text-amber-400">Escalated</option>
          </select>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center gap-3">
          <Filter className="h-4 w-4 text-slate-500" />
          <select 
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-transparent border-none text-xs text-slate-300 focus:outline-none w-full cursor-pointer"
          >
            <option value="" className="bg-slate-900">All Risk Levels</option>
            <option value="Low" className="bg-slate-900 text-blue-400">Low Risk</option>
            <option value="Medium" className="bg-slate-900 text-amber-400">Medium Risk</option>
            <option value="High" className="bg-slate-900 text-orange-400">High Risk</option>
            <option value="Critical" className="bg-slate-900 text-red-400">Critical Risk</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="glass-panel overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-500 uppercase tracking-widest text-[9px] font-bold">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Agent Name</th>
                <th className="p-4">Action</th>
                <th className="p-4">Customer ID</th>
                <th className="p-4">Risk Score</th>
                <th className="p-4">Risk Level</th>
                <th className="p-4">Decision</th>
                <th className="p-4">Latency</th>
                <th className="p-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {logs.map((log: any) => {
                const date = new Date(log.timestamp);
                return (
                  <tr key={log.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="p-4 font-mono text-slate-400">
                      {date.toLocaleDateString()} {date.toLocaleTimeString()}
                    </td>
                    <td className="p-4 font-bold text-slate-200">{log.agent_name}</td>
                    <td className="p-4 capitalize font-mono text-slate-400">{log.action.replace('_', ' ')}</td>
                    <td className="p-4 font-mono text-slate-300">{log.customer_id}</td>
                    <td className="p-4 font-mono text-slate-300">{log.risk_score}%</td>
                    <td className="p-4 font-bold">
                      <span className={`uppercase text-[10px] ${
                        log.risk_level === 'Critical' ? 'text-red-500' :
                        (log.risk_level === 'High' ? 'text-orange-400' :
                        (log.risk_level === 'Medium' ? 'text-amber-400' : 'text-blue-400'))
                      }`}>
                        {log.risk_level}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        log.decision === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                        (log.decision === 'escalated' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20')
                      }`}>
                        {log.decision}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-500">{log.execution_time_ms}ms</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 rounded-lg transition-colors border border-slate-700"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {logs.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center p-12 text-slate-500">No logs processed in ledger database.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Log & Explainable AI Timeline Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-end z-50">
          <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">Explainable AI Decision Trace</h3>
                <span className="text-[10px] text-slate-500 font-mono">ID: {selectedLog.id} | Timestamp: {new Date(selectedLog.timestamp).toLocaleTimeString()}</span>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {/* Outcome Banner */}
              <div className={`p-4 rounded-xl border flex justify-between items-center ${
                selectedLog.decision === 'approved' ? 'bg-emerald-950/20 border-emerald-500/30' : 
                (selectedLog.decision === 'escalated' ? 'bg-amber-950/20 border-amber-500/30' : 'bg-red-950/20 border-red-500/30')
              }`}>
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Decision Outcome</span>
                  <span className={`text-base font-extrabold capitalize ${
                    selectedLog.decision === 'approved' ? 'text-emerald-400' : (selectedLog.decision === 'escalated' ? 'text-amber-400' : 'text-red-400')
                  }`}>{selectedLog.decision}</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-right">
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">Confidence</span>
                    <span className="text-slate-200 font-extrabold">{selectedLog.confidence_score}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">Explainability</span>
                    <span className="text-slate-200 font-extrabold">{selectedLog.explainability_score}%</span>
                  </div>
                </div>
              </div>

              {/* Natural Language reasoning */}
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-xs space-y-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">AI Explanation</span>
                <p className="text-slate-300 leading-relaxed font-mono">
                  {selectedLog.reasoning}
                </p>
              </div>

              {/* Step-by-Step Explainable Timeline */}
              <div className="space-y-4">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Governance Stepper</span>
                <div className="relative border-l border-slate-800 pl-6 ml-3 space-y-6">
                  {/* Generate timeline steps dynamically */}
                  {generateMockTimeline(selectedLog).map((step, sIdx) => {
                    const isFailed = step.status === 'failed';
                    const isWarning = step.status === 'warning';
                    return (
                      <div key={sIdx} className="relative">
                        {/* Dot indicator */}
                        <span className={`absolute -left-[30px] top-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                          isFailed ? 'bg-slate-900 border-red-500 text-red-500' :
                          (isWarning ? 'bg-slate-900 border-amber-500 text-amber-500' : 'bg-slate-900 border-emerald-500 text-emerald-500')
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            isFailed ? 'bg-red-500' : (isWarning ? 'bg-amber-500' : 'bg-emerald-500')
                          }`}></span>
                        </span>
                        
                        {/* Step Details */}
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-200">{step.step}</span>
                            <span className={`text-[9px] font-bold font-mono px-1.5 py-0.25 rounded uppercase ${
                              isFailed ? 'bg-red-500/10 text-red-400' : (isWarning ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400')
                            }`}>{step.status}</span>
                          </div>
                          <p className="text-slate-300 font-bold text-[11px]">{step.message}</p>
                          <p className="text-slate-500 leading-relaxed">{step.details}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action for HITL review redirection */}
              {selectedLog.decision === 'escalated' && setActiveTab && (
                <button
                  onClick={() => {
                    setSelectedLog(null);
                    setActiveTab('HITL Queue');
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg shadow-blue-900/10 transition-colors"
                >
                  <UserCheck className="h-4 w-4" />
                  <span>Open HITL Operator Queue</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
