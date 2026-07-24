import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Shield, Lock, User, Sparkles } from 'lucide-react';

import { AuthProvider, useAuth, ROLES_CONFIG, type RoleId } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import DashboardLayout from './components/DashboardLayout';
import AccessDenied from './components/AccessDenied';
import { ErrorBoundary } from './components/ErrorBoundary';

import Overview from './pages/Overview';
import AgentManager from './pages/AgentManager';
import PolicyManager from './pages/PolicyManager';
import AuditTrail from './pages/AuditTrail';
import HITLQueue from './pages/HITLQueue';
import ExecutiveDashboard from './pages/ExecutiveDashboard';
import Sandbox from './pages/Sandbox';
import DigitalTwin from './pages/DigitalTwin';
import Monitoring from './pages/Monitoring';

const queryClient = new QueryClient();

function MainApp() {
  const { token, roleConfig, login, isPageAllowed } = useAuth();
  const [activeTab, setActiveTab] = useState<string>(roleConfig?.landingPage || 'Overview');
  const [hitlBadgeCount, setHitlBadgeCount] = useState<number>(8);
  
  // Login Form States
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Password123');
  const [selectedRole, setSelectedRole] = useState<RoleId>('super_admin');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sync activeTab with role landingPage when role changes
  useEffect(() => {
    if (token && roleConfig) {
      if (!isPageAllowed(activeTab)) {
        setActiveTab(roleConfig.landingPage || 'Overview');
      }
    }
  }, [roleConfig, token]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    setTimeout(() => {
      login(username, password, selectedRole);
      const targetConfig = ROLES_CONFIG[selectedRole] || ROLES_CONFIG['super_admin'];
      setActiveTab(targetConfig.landingPage || 'Overview');
      setIsLoggingIn(false);
    }, 300);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-blue-600 selection:text-white">
        <div className="absolute top-1/4 left-1/4 h-[300px] w-[300px] rounded-full bg-blue-600/10 blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-purple-600/10 blur-[120px]"></div>

        <div className="w-full max-w-md space-y-6 z-10">
          {/* Header & Logo */}
          <div className="text-center space-y-2">
            <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto shadow-xl shadow-blue-900/30 glow-blue">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-wider text-slate-100 leading-none">GuardianAI</h1>
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest leading-none mt-1 block">
                American Express Enterprise Governance Platform
              </span>
            </div>
          </div>

          {/* Login Card */}
          <div className="glass-panel p-8 shadow-2xl relative border border-slate-800 space-y-5">
            <div>
              <h2 className="text-sm font-black text-slate-200 uppercase tracking-wider">Enterprise Sign-In</h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Select your department role to initialize customized RBAC desk permissions.</p>
            </div>

            {loginError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-bold font-mono text-center">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Role Dropdown Selection */}
              <div className="space-y-1 text-xs">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Enterprise Role</label>
                <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 flex items-center justify-between">
                  <select 
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as RoleId)}
                    className="bg-transparent text-xs text-slate-200 focus:outline-none w-full cursor-pointer font-bold"
                  >
                    {Object.values(ROLES_CONFIG).map((r) => (
                      <option key={r.id} value={r.id} className="bg-slate-900 text-slate-200">
                        {r.name} ({r.securityLevel})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Username */}
              <div className="space-y-1 text-xs">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Username</label>
                <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center gap-3">
                  <User className="h-4 w-4 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Enter security alias"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-transparent border-none text-xs text-slate-200 focus:outline-none w-full"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1 text-xs">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Password</label>
                <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center gap-3">
                  <Lock className="h-4 w-4 text-slate-500" />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-transparent border-none text-xs text-slate-200 focus:outline-none w-full"
                    required
                  />
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-400 font-medium">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0"
                  />
                  <span>Remember Session</span>
                </label>
                <span className="text-[10px] font-mono text-blue-400 font-bold">L3-L5 Encrypted</span>
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={isLoggingIn}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg shadow-blue-900/20 transition-all glow-blue flex items-center justify-center gap-2"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{isLoggingIn ? 'Authenticating Session...' : 'Authenticate Access'}</span>
              </button>
            </form>
          </div>

          <div className="text-center font-mono text-[9px] text-slate-600">
            <span>Demo Alias: admin / Password123 • Full RBAC Engine Active</span>
          </div>
        </div>
      </div>
    );
  }

  // Render Page Component or 403 Access Denied Guard
  const renderTabContent = () => {
    if (!isPageAllowed(activeTab)) {
      return (
        <AccessDenied 
          attemptedPage={activeTab} 
          onNavigateHome={() => setActiveTab(roleConfig?.landingPage || 'Overview')} 
        />
      );
    }

    switch (activeTab) {
      case 'Overview':
        return <Overview />;
      case 'Agents':
        return <AgentManager />;
      case 'Policies':
        return <PolicyManager />;
      case 'Audit Trail':
        return <AuditTrail setActiveTab={setActiveTab} />;
      case 'HITL Queue':
        return <HITLQueue onQueueLengthChange={(count) => setHitlBadgeCount(count)} />;
      case 'Executive':
        return <ExecutiveDashboard />;
      case 'Sandbox':
        return <Sandbox />;
      case 'Digital Twin':
        return <DigitalTwin />;
      case 'Monitoring':
        return <Monitoring />;
      default:
        return <Overview />;
    }
  };

  return (
    <DashboardLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      hitlBadgeCount={hitlBadgeCount}
    >
      <ErrorBoundary key={activeTab}>
        {renderTabContent()}
      </ErrorBoundary>
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <ThemeProvider>
          <AuthProvider>
            <MainApp />
          </AuthProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
