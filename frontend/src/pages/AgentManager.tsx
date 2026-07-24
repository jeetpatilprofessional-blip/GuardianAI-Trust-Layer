import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, ShieldAlert, Power, Play, Pause, 
  X, Check, AlertTriangle, Search, Filter, ShieldCheck, HelpCircle, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AgentManager() {
  const { roleConfig, notifyRestrictedAction } = useAuth();
  const perms = roleConfig.permissions;

  const [agents, setAgents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form State
  const [agentId, setAgentId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [riskLevel, setRiskLevel] = useState('low');
  const [permissionLevel, setPermissionLevel] = useState('agent');
  const [dailyLimit, setDailyLimit] = useState(50000.0);
  const [monthlyLimit, setMonthlyLimit] = useState(500000.0);
  const [allowedApis, setAllowedApis] = useState<string[]>([]);
  const [assignedPolicies, setAssignedPolicies] = useState<string[]>([]);

  const fetchAgents = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/agents/');
      if (res.ok) {
        const data = await res.json();
        setAgents(data);
      }
    } catch (e) {
      setAgents([
        {
          agent_id: "refund_agent",
          name: "Refund Agent",
          description: "Processes customer purchase refunds and disputed merchant transaction adjustments.",
          status: "active",
          risk_level: "medium",
          permission_level: "agent",
          daily_spend_limit: 50000.0,
          monthly_spend_limit: 500000.0,
          current_daily_spend: 12000.0,
          current_monthly_spend: 85000.0,
          allowed_apis: ["refund", "read_transactions", "view_customer_profile"],
          assigned_policies: ["P-101", "P-102", "P-105"],
          trust_score: 97.0,
          total_requests: 128,
          policy_violations: 2,
          avg_response_time: 820
        },
        {
          agent_id: "credit_agent",
          name: "Credit Limit Agent",
          description: "Evaluates requests to increase credit limits or adjust lending tiers.",
          status: "active",
          risk_level: "high",
          permission_level: "agent",
          daily_spend_limit: 100000.0,
          monthly_spend_limit: 1000000.0,
          current_daily_spend: 0.0,
          current_monthly_spend: 320000.0,
          allowed_apis: ["increase_credit_limit", "read_transactions", "view_customer_profile"],
          assigned_policies: ["P-101", "P-103", "P-105"],
          trust_score: 95.8,
          total_requests: 86,
          policy_violations: 1,
          avg_response_time: 1210
        },
        {
          agent_id: "card_agent",
          name: "Card Replacement Agent",
          description: "Replaces lost/stolen cards and waives credit card annual membership fees.",
          status: "active",
          risk_level: "low",
          permission_level: "agent",
          daily_spend_limit: 20000.0,
          monthly_spend_limit: 150000.0,
          current_daily_spend: 1200.0,
          current_monthly_spend: 14800.0,
          allowed_apis: ["replace_card", "waive_annual_fee", "read_transactions"],
          assigned_policies: ["P-101", "P-104"],
          trust_score: 99.2,
          total_requests: 215,
          policy_violations: 0,
          avg_response_time: 580
        }
      ]);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const openCreateModal = () => {
    if (!perms.canManageAgents || perms.isReadOnly) {
      notifyRestrictedAction();
      return;
    }
    setAgentId('');
    setName('');
    setDescription('');
    setRiskLevel('low');
    setPermissionLevel('agent');
    setDailyLimit(50000.0);
    setMonthlyLimit(500000.0);
    setAllowedApis([]);
    setAssignedPolicies([]);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const openEditModal = (agent: any) => {
    if (!perms.canManageAgents || perms.isReadOnly) {
      notifyRestrictedAction();
      return;
    }
    setAgentId(agent.agent_id);
    setName(agent.name);
    setDescription(agent.description);
    setRiskLevel(agent.risk_level);
    setPermissionLevel(agent.permission_level);
    setDailyLimit(agent.daily_spend_limit);
    setMonthlyLimit(agent.monthly_spend_limit);
    setAllowedApis(agent.allowed_apis || []);
    setAssignedPolicies(agent.assigned_policies || []);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleSaveAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!perms.canManageAgents || perms.isReadOnly) return;
    const payload = {
      agent_id: agentId,
      name,
      description,
      risk_level: riskLevel,
      permission_level: permissionLevel,
      daily_spend_limit: dailyLimit,
      monthly_spend_limit: monthlyLimit,
      allowed_apis: allowedApis,
      assigned_policies: assignedPolicies
    };

    try {
      let res;
      if (isEditMode) {
        res = await fetch(`http://localhost:8000/api/v1/agents/${agentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('http://localhost:8000/api/v1/agents/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        setIsModalOpen(false);
        fetchAgents();
      }
    } catch (e) {
      setIsModalOpen(false);
    }
  };

  const togglePauseAgent = async (agent: any) => {
    if (!perms.canPauseResumeAgents || perms.isReadOnly) {
      notifyRestrictedAction();
      return;
    }

    const isPaused = agent.status === 'paused';
    const action = isPaused ? 'resume' : 'pause';
    try {
      const res = await fetch(`http://localhost:8000/api/v1/agents/${agent.agent_id}/${action}`, {
        method: 'POST'
      });
      if (res.ok) {
        fetchAgents();
      }
    } catch (e) {
      setAgents(prev => prev.map(a => 
        a.agent_id === agent.agent_id 
          ? { ...a, status: a.status === 'paused' ? 'active' : 'paused' } 
          : a
      ));
    }
  };

  const handleDeleteAgent = async (agent_id: string) => {
    if (!perms.canDeleteAgents || perms.isReadOnly) {
      notifyRestrictedAction();
      return;
    }
    if (!confirm(`Are you sure you want to delete Agent ${agent_id}?`)) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/agents/${agent_id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchAgents();
      }
    } catch (e) {
      setAgents(prev => prev.filter(a => a.agent_id !== agent_id));
    }
  };

  const filteredAgents = agents.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || 
                        a.agent_id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-100 uppercase">Agent Fleet Directory</h2>
          <p className="text-xs text-blue-400 font-semibold tracking-wider uppercase mt-0.5">
            Configure permission lists, spending budgets, and security parameters per runtime
          </p>
        </div>

        {perms.canManageAgents && !perms.isReadOnly ? (
          <button 
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all glow-blue text-xs uppercase"
          >
            <Plus className="h-4 w-4" />
            <span>Register Agent</span>
          </button>
        ) : (
          <button 
            onClick={notifyRestrictedAction}
            className="flex items-center gap-2 bg-slate-800 text-slate-500 border border-slate-700 py-2 px-4 rounded-xl text-xs uppercase cursor-not-allowed opacity-60"
            title="This action requires elevated privileges."
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Register Agent (Restricted)</span>
          </button>
        )}
      </div>

      {/* Filters Search Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center gap-3">
          <Search className="h-4 w-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search agents by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none text-xs text-slate-200 focus:outline-none w-full"
          />
        </div>

        <div className="w-full md:w-48 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center gap-3">
          <Filter className="h-4 w-4 text-slate-500" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent border-none text-xs text-slate-300 focus:outline-none w-full cursor-pointer font-bold"
          >
            <option value="all" className="bg-slate-900">All Statuses</option>
            <option value="active" className="bg-slate-900 text-emerald-400">Active Only</option>
            <option value="paused" className="bg-slate-900 text-red-400">Paused Only</option>
          </select>
        </div>
      </div>

      {/* Agents Directory Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredAgents.length === 0 ? (
          <p className="text-center text-xs text-slate-500 py-12">No agents found matching search criteria.</p>
        ) : (
          filteredAgents.map(a => {
            const isLowTrust = a.trust_score < 90.0;
            const spendPct = Math.min(Math.round(((a.current_daily_spend || 0) / a.daily_spend_limit) * 100.0), 100);

            return (
              <div 
                key={a.agent_id} 
                className={`glass-panel p-6 border ${
                  isLowTrust ? 'border-amber-500/30 bg-amber-500/[0.02]' : 'border-slate-800'
                } flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-700/60 transition-colors`}
              >
                {/* ID and info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${a.status === 'active' ? 'bg-emerald-500 status-pulse-ring' : 'bg-red-500'}`}></div>
                    <span className="text-xs font-mono text-slate-500 uppercase">{a.agent_id}</span>
                    <h3 className="font-extrabold text-sm text-slate-100">{a.name}</h3>
                    {isLowTrust && (
                      <span className="flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Low Trust Penalized</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-normal max-w-2xl">{a.description}</p>
                  
                  {/* Stats items */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono pt-2">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Trust Score</span>
                      <span className={`font-bold ${isLowTrust ? 'text-amber-400' : 'text-emerald-400'}`}>{a.trust_score}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Action Latency</span>
                      <span className="text-slate-300 font-bold">{a.avg_response_time || 0}ms</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Violations</span>
                      <span className={`font-bold ${a.policy_violations > 0 ? 'text-red-400' : 'text-slate-400'}`}>{a.policy_violations}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Risk Tier</span>
                      <span className={`font-bold uppercase ${
                        a.risk_level === 'high' ? 'text-orange-400' : (a.risk_level === 'medium' ? 'text-amber-400' : 'text-blue-400')
                      }`}>{a.risk_level}</span>
                    </div>
                  </div>

                  {/* API Permissions List */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Allowed API Access List</span>
                    <div className="flex flex-wrap gap-1.5">
                      {a.allowed_apis?.map((api: string) => (
                        <span key={api} className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-[10px] text-slate-400 rounded font-mono">
                          {api}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Spending Progress Gauge (INR) */}
                <div className="w-full md:w-56 shrink-0 space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-[10px] text-slate-500">Daily Spend Limit</span>
                    <span className="text-slate-300 font-bold">₹{a.current_daily_spend?.toLocaleString()} / ₹{a.daily_spend_limit?.toLocaleString()}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        spendPct > 80 ? 'bg-red-500 glow-red' : (spendPct > 50 ? 'bg-amber-500 glow-amber' : 'bg-blue-500 glow-blue')
                      }`}
                      style={{ width: `${spendPct}%` }}
                    ></div>
                  </div>
                  <span className="text-[9px] text-slate-500 block text-right font-mono">{spendPct}% of Daily Budget</span>
                </div>

                {/* Operations Actions Buttons (Filtered by Permissions) */}
                <div className="flex md:flex-col justify-end gap-2.5 pt-4 md:pt-0 border-t md:border-t-0 border-slate-800 shrink-0">
                  {perms.canPauseResumeAgents && !perms.isReadOnly ? (
                    <button 
                      onClick={() => togglePauseAgent(a)}
                      className={`flex items-center justify-center gap-2 text-xs font-semibold py-2 px-4 rounded-xl border transition-all ${
                        a.status === 'paused' 
                          ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-600/30' 
                          : 'bg-red-600/20 text-red-400 border-red-500/40 hover:bg-red-600/30'
                      }`}
                    >
                      {a.status === 'paused' ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                      <span>{a.status === 'paused' ? 'Resume Operations' : 'Pause Operations'}</span>
                    </button>
                  ) : (
                    <button 
                      onClick={notifyRestrictedAction}
                      className="flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-4 rounded-xl bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60"
                      title="This action requires elevated privileges."
                    >
                      <Lock className="h-3.5 w-3.5" />
                      <span>{a.status === 'paused' ? 'Resume' : 'Pause'} (Restricted)</span>
                    </button>
                  )}

                  <div className="flex gap-2">
                    {perms.canManageAgents && !perms.isReadOnly ? (
                      <button 
                        onClick={() => openEditModal(a)}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>
                    ) : (
                      <button 
                        onClick={notifyRestrictedAction}
                        className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold py-2 px-3 rounded-xl bg-slate-850 text-slate-500 border border-slate-750 cursor-not-allowed opacity-60"
                        title="This action requires elevated privileges."
                      >
                        <Lock className="h-3 w-3" />
                        <span>Edit</span>
                      </button>
                    )}

                    {perms.canDeleteAgents && !perms.isReadOnly ? (
                      <button 
                        onClick={() => handleDeleteAgent(a.agent_id)}
                        className="flex items-center justify-center p-2 rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <button 
                        onClick={notifyRestrictedAction}
                        className="flex items-center justify-center p-2 rounded-xl bg-slate-850 text-slate-600 border border-slate-750 cursor-not-allowed opacity-60"
                        title="This action requires elevated privileges."
                      >
                        <Lock className="h-3.5 w-3.5" />
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
