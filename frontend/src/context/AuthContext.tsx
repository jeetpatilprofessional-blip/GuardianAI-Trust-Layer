import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type RoleId = 
  | 'super_admin'
  | 'security_admin'
  | 'ops_manager'
  | 'compliance_officer'
  | 'risk_analyst'
  | 'human_reviewer'
  | 'executive'
  | 'devops_engineer'
  | 'auditor';

export interface PermissionsSchema {
  canManageAgents: boolean;
  canPauseResumeAgents: boolean;
  canDeleteAgents: boolean;
  canCreateEditPolicies: boolean;
  canDeployPolicies: boolean;
  canDeletePolicies: boolean;
  canApproveHITL: boolean;
  canRejectHITL: boolean;
  canRunSandbox: boolean;
  canRunDigitalTwin: boolean;
  canRestartServices: boolean;
  canEmergencyKill: boolean;
  isReadOnly: boolean;
}

export interface RoleConfig {
  id: RoleId;
  name: string;
  securityLevel: string;
  badgeBg: string;
  badgeText: string;
  landingPage: string;
  allowedPages: string[];
  permissions: PermissionsSchema;
}

export const ROLES_CONFIG: Record<RoleId, RoleConfig> = {
  super_admin: {
    id: 'super_admin',
    name: 'Super Administrator',
    securityLevel: 'L5 Executive Admin',
    badgeBg: 'bg-purple-500/20 border-purple-500/40 text-purple-400',
    badgeText: 'text-purple-400',
    landingPage: 'Overview',
    allowedPages: ['Overview', 'Agents', 'Policies', 'Audit Trail', 'HITL Queue', 'Executive', 'Sandbox', 'Digital Twin', 'Monitoring'],
    permissions: {
      canManageAgents: true,
      canPauseResumeAgents: true,
      canDeleteAgents: true,
      canCreateEditPolicies: true,
      canDeployPolicies: true,
      canDeletePolicies: true,
      canApproveHITL: true,
      canRejectHITL: true,
      canRunSandbox: true,
      canRunDigitalTwin: true,
      canRestartServices: true,
      canEmergencyKill: true,
      isReadOnly: false,
    }
  },
  security_admin: {
    id: 'security_admin',
    name: 'Security Administrator',
    securityLevel: 'L3 Security',
    badgeBg: 'bg-red-500/20 border-red-500/40 text-red-400',
    badgeText: 'text-red-400',
    landingPage: 'Overview',
    allowedPages: ['Overview', 'Agents', 'Policies', 'Audit Trail', 'Sandbox', 'Digital Twin', 'Monitoring'],
    permissions: {
      canManageAgents: true,
      canPauseResumeAgents: true,
      canDeleteAgents: false,
      canCreateEditPolicies: true,
      canDeployPolicies: true,
      canDeletePolicies: false,
      canApproveHITL: false,
      canRejectHITL: false,
      canRunSandbox: true,
      canRunDigitalTwin: true,
      canRestartServices: false,
      canEmergencyKill: false,
      isReadOnly: false,
    }
  },
  ops_manager: {
    id: 'ops_manager',
    name: 'Operations Manager',
    securityLevel: 'L3 Operations',
    badgeBg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
    badgeText: 'text-emerald-400',
    landingPage: 'Overview',
    allowedPages: ['Overview', 'Agents', 'HITL Queue', 'Audit Trail', 'Monitoring'],
    permissions: {
      canManageAgents: true,
      canPauseResumeAgents: true,
      canDeleteAgents: false,
      canCreateEditPolicies: false,
      canDeployPolicies: false,
      canDeletePolicies: false,
      canApproveHITL: true,
      canRejectHITL: true,
      canRunSandbox: false,
      canRunDigitalTwin: false,
      canRestartServices: false,
      canEmergencyKill: false,
      isReadOnly: false,
    }
  },
  compliance_officer: {
    id: 'compliance_officer',
    name: 'Compliance Officer',
    securityLevel: 'L4 Regulatory Compliance',
    badgeBg: 'bg-blue-500/20 border-blue-500/40 text-blue-400',
    badgeText: 'text-blue-400',
    landingPage: 'Policies',
    allowedPages: ['Overview', 'Policies', 'Audit Trail', 'HITL Queue', 'Executive'],
    permissions: {
      canManageAgents: false,
      canPauseResumeAgents: false,
      canDeleteAgents: false,
      canCreateEditPolicies: true,
      canDeployPolicies: true,
      canDeletePolicies: false,
      canApproveHITL: true,
      canRejectHITL: true,
      canRunSandbox: false,
      canRunDigitalTwin: false,
      canRestartServices: false,
      canEmergencyKill: false,
      isReadOnly: false,
    }
  },
  risk_analyst: {
    id: 'risk_analyst',
    name: 'Risk Analyst',
    securityLevel: 'L3 Risk Analytics',
    badgeBg: 'bg-amber-500/20 border-amber-500/40 text-amber-400',
    badgeText: 'text-amber-400',
    landingPage: 'Overview',
    allowedPages: ['Overview', 'Agents', 'Policies', 'Audit Trail', 'Sandbox', 'Digital Twin', 'Monitoring', 'Executive'],
    permissions: {
      canManageAgents: false,
      canPauseResumeAgents: false,
      canDeleteAgents: false,
      canCreateEditPolicies: false,
      canDeployPolicies: false,
      canDeletePolicies: false,
      canApproveHITL: false,
      canRejectHITL: false,
      canRunSandbox: true,
      canRunDigitalTwin: true,
      canRestartServices: false,
      canEmergencyKill: false,
      isReadOnly: false,
    }
  },
  human_reviewer: {
    id: 'human_reviewer',
    name: 'Human Reviewer (HITL)',
    securityLevel: 'L2 Verification Desk',
    badgeBg: 'bg-amber-500/20 border-amber-500/40 text-amber-400',
    badgeText: 'text-amber-400',
    landingPage: 'HITL Queue',
    allowedPages: ['HITL Queue'],
    permissions: {
      canManageAgents: false,
      canPauseResumeAgents: false,
      canDeleteAgents: false,
      canCreateEditPolicies: false,
      canDeployPolicies: false,
      canDeletePolicies: false,
      canApproveHITL: true,
      canRejectHITL: true,
      canRunSandbox: false,
      canRunDigitalTwin: false,
      canRestartServices: false,
      canEmergencyKill: false,
      isReadOnly: false,
    }
  },
  executive: {
    id: 'executive',
    name: 'Executive',
    securityLevel: 'L5 Executive Leadership',
    badgeBg: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400',
    badgeText: 'text-yellow-400',
    landingPage: 'Executive',
    allowedPages: ['Executive'],
    permissions: {
      canManageAgents: false,
      canPauseResumeAgents: false,
      canDeleteAgents: false,
      canCreateEditPolicies: false,
      canDeployPolicies: false,
      canDeletePolicies: false,
      canApproveHITL: false,
      canRejectHITL: false,
      canRunSandbox: false,
      canRunDigitalTwin: false,
      canRestartServices: false,
      canEmergencyKill: false,
      isReadOnly: true,
    }
  },
  devops_engineer: {
    id: 'devops_engineer',
    name: 'DevOps Engineer',
    securityLevel: 'L4 Systems Reliability',
    badgeBg: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400',
    badgeText: 'text-cyan-400',
    landingPage: 'Monitoring',
    allowedPages: ['Overview', 'Monitoring', 'Sandbox', 'Digital Twin'],
    permissions: {
      canManageAgents: true,
      canPauseResumeAgents: false,
      canDeleteAgents: false,
      canCreateEditPolicies: false,
      canDeployPolicies: false,
      canDeletePolicies: false,
      canApproveHITL: false,
      canRejectHITL: false,
      canRunSandbox: true,
      canRunDigitalTwin: true,
      canRestartServices: true,
      canEmergencyKill: false,
      isReadOnly: false,
    }
  },
  auditor: {
    id: 'auditor',
    name: 'Auditor (Read Only)',
    securityLevel: 'L4 External Audit',
    badgeBg: 'bg-slate-500/20 border-slate-500/40 text-slate-400',
    badgeText: 'text-slate-400',
    landingPage: 'Audit Trail',
    allowedPages: ['Overview', 'Agents', 'Policies', 'Audit Trail', 'HITL Queue', 'Executive', 'Sandbox', 'Digital Twin', 'Monitoring'],
    permissions: {
      canManageAgents: false,
      canPauseResumeAgents: false,
      canDeleteAgents: false,
      canCreateEditPolicies: false,
      canDeployPolicies: false,
      canDeletePolicies: false,
      canApproveHITL: false,
      canRejectHITL: false,
      canRunSandbox: false,
      canRunDigitalTwin: false,
      canRestartServices: false,
      canEmergencyKill: false,
      isReadOnly: true,
    }
  }
};

export interface UserProfile {
  name: string;
  alias: string;
  roleId: RoleId;
}

interface AuthContextType {
  token: string;
  user: UserProfile;
  roleConfig: RoleConfig;
  setRoleId: (roleId: RoleId) => void;
  login: (username: string, password: string, selectedRoleId: RoleId) => boolean;
  logout: () => void;
  isPageAllowed: (pageName: string) => boolean;
  notifyRestrictedAction: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string>(localStorage.getItem('guardian_token') || '');
  const [roleId, setRoleIdState] = useState<RoleId>(() => {
    const saved = localStorage.getItem('guardian_role') as RoleId;
    return saved && ROLES_CONFIG[saved] ? saved : 'super_admin';
  });

  const getRoleDefaultUser = (rId: RoleId): string => {
    switch (rId) {
      case 'super_admin': return 'John Smith';
      case 'security_admin': return 'Sarah Connor';
      case 'ops_manager': return 'Robert Chen';
      case 'compliance_officer': return 'Elena Vance';
      case 'risk_analyst': return 'Marcus Aurelius';
      case 'human_reviewer': return 'David Miller';
      case 'executive': return 'Stephen Squeri (CEO)';
      case 'devops_engineer': return 'Alex Rivers';
      case 'auditor': return 'KPMG Auditor Desk';
      default: return 'John Smith';
    }
  };

  const [user, setUser] = useState<UserProfile>({
    name: getRoleDefaultUser(roleId),
    alias: 'admin',
    roleId: roleId
  });

  useEffect(() => {
    localStorage.setItem('guardian_role', roleId);
    setUser(prev => ({
      ...prev,
      roleId: roleId,
      name: getRoleDefaultUser(roleId)
    }));
  }, [roleId]);

  const setRoleId = (newRoleId: RoleId) => {
    if (ROLES_CONFIG[newRoleId]) {
      setRoleIdState(newRoleId);
    }
  };

  const notifyRestrictedAction = () => {
    alert("Action Restricted: Elevated privileges required.");
  };

  const login = (username: string, password: string, selectedRoleId: RoleId): boolean => {
    const mockToken = `token_${selectedRoleId}_${Date.now()}`;
    localStorage.setItem('guardian_token', mockToken);
    localStorage.setItem('guardian_role', selectedRoleId);
    setToken(mockToken);
    setRoleIdState(selectedRoleId);
    setUser({
      name: getRoleDefaultUser(selectedRoleId),
      alias: username || 'admin',
      roleId: selectedRoleId
    });
    return true;
  };

  const logout = () => {
    localStorage.removeItem('guardian_token');
    localStorage.removeItem('guardian_role');
    setToken('');
  };

  const activeRoleConfig = ROLES_CONFIG[roleId] || ROLES_CONFIG['super_admin'];

  const isPageAllowed = (pageName: string): boolean => {
    return activeRoleConfig.allowedPages.includes(pageName);
  };

  return (
    <AuthContext.Provider value={{
      token,
      user,
      roleConfig: activeRoleConfig,
      setRoleId,
      login,
      logout,
      isPageAllowed,
      notifyRestrictedAction
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
