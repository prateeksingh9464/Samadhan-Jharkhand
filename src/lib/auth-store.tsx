'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { Role } from './types';
import { useRole } from './store';

export interface AuthUser {
  username: string;
  role: Role;
  displayName: string;
  badgeLabel: string;
  organization: string;
}

export interface DemoCredential {
  username: string;
  role: Role;
  displayName: string;
  badgeLabel: string;
  organization: string;
  pillText: string;
}

export const MASTER_PASSWORD = 'admin@123';

export const DEMO_CREDENTIALS: Record<string, DemoCredential> = {
  cid: {
    username: 'cid',
    role: 'citizen',
    displayName: 'Citizen Submitter',
    badgeLabel: 'Citizen',
    organization: 'Jharkhand Resident / Nagrik',
    pillText: 'Demo Citizen: cid',
  },
  uid: {
    username: 'uid',
    role: 'university',
    displayName: 'Prof. A. Banerjee',
    badgeLabel: 'University',
    organization: 'BIT Mesra Innovation Cell',
    pillText: 'Demo University: uid',
  },
  iid: {
    username: 'iid',
    role: 'industry',
    displayName: 'R. Singhania',
    badgeLabel: 'Industry',
    organization: 'Tata Steel CSR Division',
    pillText: 'Demo Industry: iid',
  },
  gid: {
    username: 'gid',
    role: 'admin',
    displayName: 'State IT Directorate',
    badgeLabel: 'Govt / Admin',
    organization: 'Govt. of Jharkhand - Planning Dept',
    pillText: 'Demo Govt: gid',
  },
};

interface AuthContextType {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  targetRole: Role | null;
  isInitialized: boolean;
  login: (username: string, password: string) => { success: boolean; error?: string };
  quickLogin: (username: string) => boolean;
  logout: () => void;
  openAuthModal: (role?: Role) => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_STORAGE_KEY = 'samadhan_jh_auth_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setRole } = useRole();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [targetRole, setTargetRole] = useState<Role | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Restore session from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as AuthUser;
        if (parsed && parsed.username && parsed.role) {
          setCurrentUser(parsed);
        }
      }
    } catch {
      // Ignore localStorage errors
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const openAuthModal = useCallback((role?: Role) => {
    if (role) {
      setTargetRole(role);
    }
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setTargetRole(null);
  }, []);

  const login = useCallback(
    (rawUsername: string, rawPassword: string): { success: boolean; error?: string } => {
      const username = rawUsername.trim().toLowerCase();
      const password = rawPassword.trim();

      if (!username || !password) {
        return { success: false, error: 'Please enter both username and password.' };
      }

      const cred = DEMO_CREDENTIALS[username];

      if (!cred) {
        return {
          success: false,
          error: `Unknown username "${rawUsername}". Valid demo IDs: cid, uid, iid, gid.`,
        };
      }

      if (password !== MASTER_PASSWORD) {
        return {
          success: false,
          error: 'Incorrect password. Demo master password is "admin@123".',
        };
      }

      const user: AuthUser = {
        username: cred.username,
        role: cred.role,
        displayName: cred.displayName,
        badgeLabel: cred.badgeLabel,
        organization: cred.organization,
      };

      setCurrentUser(user);

      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } catch {
        // Silently handle quota errors
      }

      // Switch active view to match the authenticated role
      if (user.role === 'admin') {
        setRole('government');
      } else {
        setRole(user.role);
      }

      setIsAuthModalOpen(false);
      setTargetRole(null);

      return { success: true };
    },
    [setRole]
  );

  const quickLogin = useCallback(
    (username: string): boolean => {
      const result = login(username, MASTER_PASSWORD);
      return result.success;
    },
    [login]
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // Ignore
    }
    setRole('citizen');
    setIsAuthModalOpen(false);
    setTargetRole(null);
  }, [setRole]);

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: !!currentUser,
      isAuthModalOpen,
      targetRole,
      isInitialized,
      login,
      quickLogin,
      logout,
      openAuthModal,
      closeAuthModal,
    }),
    [
      currentUser,
      isAuthModalOpen,
      targetRole,
      isInitialized,
      login,
      quickLogin,
      logout,
      openAuthModal,
      closeAuthModal,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
}
