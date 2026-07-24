import React from 'react';
import { ShieldAlert, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AccessDeniedProps {
  attemptedPage: string;
  onNavigateHome: () => void;
}

export default function AccessDenied({ attemptedPage, onNavigateHome }: AccessDeniedProps) {
  const { roleConfig } = useAuth();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="glass-panel p-10 max-w-lg w-full text-center space-y-6 border border-red-500/30 bg-red-950/10 shadow-2xl relative overflow-hidden">
        <div className="h-16 w-16 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto text-red-400 glow-red">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono font-black uppercase tracking-widest text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full">
            HTTP 403 • ACCESS FORBIDDEN
          </span>
          <h2 className="text-xl font-black text-slate-100 uppercase tracking-tight pt-2">
            Restricted Enterprise Resource
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            Your current assigned role <strong className={roleConfig.badgeText}>({roleConfig.name})</strong> is not granted security authorization to view the <span className="text-slate-200 font-bold font-sans">[{attemptedPage}]</span> desk.
          </p>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl text-left text-[11px] font-mono space-y-1.5 text-slate-400">
          <div className="flex justify-between">
            <span>Required Level:</span>
            <span className="text-slate-200 font-bold">L4 / L5 Administrative Privileges</span>
          </div>
          <div className="flex justify-between">
            <span>Assigned Security Level:</span>
            <span className={`font-bold ${roleConfig.badgeText}`}>{roleConfig.securityLevel}</span>
          </div>
          <div className="flex justify-between border-t border-slate-850 pt-1.5">
            <span>Audit Event ID:</span>
            <span className="text-slate-500">AUD-SEC-403-{Math.floor(Math.random() * 89999 + 10000)}</span>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onNavigateHome}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg shadow-blue-950/30 transition-all flex items-center justify-center gap-2 glow-blue"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to {roleConfig.landingPage} Desk</span>
          </button>
        </div>
      </div>
    </div>
  );
}
