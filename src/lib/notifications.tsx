'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import type { AppNotification, Role } from './types';

// ─── Storage Key ────────────────────────────────────────────────────────────

const NOTIF_STORAGE_KEY = 'samadhan_jh_notifications';

// ─── Reducer ────────────────────────────────────────────────────────────────

type NotifAction =
  | { type: 'ADD'; payload: AppNotification }
  | { type: 'MARK_READ'; payload: string }
  | { type: 'MARK_ALL_READ'; payload?: Role }
  | { type: 'HYDRATE'; payload: AppNotification[] };

function notifReducer(state: AppNotification[], action: NotifAction): AppNotification[] {
  switch (action.type) {
    case 'ADD':
      return [action.payload, ...state].slice(0, 50); // keep last 50
    case 'MARK_READ':
      return state.map((n) => (n.id === action.payload ? { ...n, read: true } : n));
    case 'MARK_ALL_READ':
      return state.map((n) => (!action.payload || n.role === action.payload ? { ...n, read: true } : n));
    case 'HYDRATE':
      return action.payload;
    default:
      return state;
  }
}

const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-seed-1',
    message: 'AI Triage: Dhanbad Coal Dust challenge routed to IIT (ISM) Dhanbad Department of Environmental Science.',
    role: 'university',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    read: false,
    problemId: 'JH-PRB-2026-1001',
  },
  {
    id: 'notif-seed-2',
    message: 'Academic Proposal: BIT Mesra submitted an R&D blueprint for Arsenic Water Purification seeking Tata Steel CSR funding.',
    role: 'industry',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    read: false,
    problemId: 'JH-PRB-2026-1003',
  },
  {
    id: 'notif-seed-3',
    message: 'State Alert: High urgency drought resilience challenge registered in Palamu district.',
    role: 'government',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    read: false,
    problemId: 'JH-PRB-2026-1002',
  },
  {
    id: 'notif-seed-4',
    message: 'Your reported issue (JH-PRB-2026-1001) has been logged and assigned to IIT (ISM) Dhanbad for research review.',
    role: 'citizen',
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    read: false,
    problemId: 'JH-PRB-2026-1001',
  },
];

// ─── Context ────────────────────────────────────────────────────────────────

interface NotificationContextValue {
  notifications: AppNotification[];
  addNotification: (message: string, role: Role, problemId: string) => void;
  markRead: (id: string) => void;
  markAllRead: (role?: Role) => void;
  getUnreadCount: (role: Role) => number;
  getForRole: (role: Role) => AppNotification[];
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, dispatch] = useReducer(notifReducer, []);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(NOTIF_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as AppNotification[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          dispatch({ type: 'HYDRATE', payload: parsed });
        } else {
          dispatch({ type: 'HYDRATE', payload: SEED_NOTIFICATIONS });
        }
      } else {
        dispatch({ type: 'HYDRATE', payload: SEED_NOTIFICATIONS });
      }
    } catch {
      dispatch({ type: 'HYDRATE', payload: SEED_NOTIFICATIONS });
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(notifications));
      } catch {
        // storage full
      }
    }
  }, [notifications, hydrated]);

  const addNotification = useCallback((message: string, role: Role, problemId: string) => {
    const notif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      message,
      role,
      timestamp: new Date().toISOString(),
      read: false,
      problemId,
    };
    dispatch({ type: 'ADD', payload: notif });
  }, []);

  const markRead = useCallback((id: string) => {
    dispatch({ type: 'MARK_READ', payload: id });
  }, []);

  const markAllRead = useCallback((role?: Role) => {
    dispatch({ type: 'MARK_ALL_READ', payload: role });
  }, []);

  const getUnreadCount = useCallback(
    (role: Role) => {
      return notifications.filter((n) => n.role === role && !n.read).length;
    },
    [notifications]
  );

  const getForRole = useCallback(
    (role: Role) => {
      return notifications.filter((n) => n.role === role);
    },
    [notifications]
  );

  const value = useMemo(
    () => ({ notifications, addNotification, markRead, markAllRead, getUnreadCount, getForRole }),
    [notifications, addNotification, markRead, markAllRead, getUnreadCount, getForRole]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within <NotificationProvider>');
  return ctx;
}
