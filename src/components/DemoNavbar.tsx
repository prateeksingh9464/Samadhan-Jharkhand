'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRole } from '@/lib/store';
import { useAuth } from '@/lib/auth-store';
import { useNotifications } from '@/lib/notifications';
import type { Role } from '@/lib/types';
import { ROLE_LABELS } from '@/lib/types';
import {
  Users,
  GraduationCap,
  Building2,
  Landmark,
  Bell,
  CheckCheck,
  Inbox,
  Clock,
  LogOut,
  KeyRound,
  Lock,
} from 'lucide-react';

const ROLE_ICONS: Record<Role, React.ReactNode> = {
  citizen: <Users size={15} />,
  university: <GraduationCap size={15} />,
  industry: <Building2 size={15} />,
  government: <Landmark size={15} />,
  admin: <Landmark size={15} />,
};

const ROLE_TAGS: Record<Role, { name: string; color: string; bg: string }> = {
  citizen: { name: 'Citizen', color: '#d97706', bg: 'rgba(217, 119, 6, 0.1)' },
  university: { name: 'University', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' },
  industry: { name: 'Industry CSR', color: '#0369a1', bg: 'rgba(3, 105, 161, 0.1)' },
  government: { name: 'Govt Cell', color: '#047857', bg: 'rgba(4, 120, 87, 0.1)' },
  admin: { name: 'Govt Cell', color: '#047857', bg: 'rgba(4, 120, 87, 0.1)' },
};

const ROLES: Role[] = ['citizen', 'university', 'industry', 'government'];

export default function DemoNavbar() {
  const { role, setRole } = useRole();
  const { currentUser, logout, openAuthModal } = useAuth();
  const { notifications, getUnreadCount, getForRole, markRead, markAllRead } = useNotifications();
  const [bellOpen, setBellOpen] = useState(false);
  const [activeNotifTab, setActiveNotifTab] = useState<'role' | 'all'>('role');
  const bellRef = useRef<HTMLDivElement>(null);

  const currentRoleUnread = getUnreadCount(role);
  const totalPlatformUnread = useMemo(
    () => ROLES.reduce((acc, r) => acc + getUnreadCount(r), 0),
    [getUnreadCount]
  );

  const roleNotifs = useMemo(() => getForRole(role).slice(0, 25), [getForRole, role]);
  const allNotifs = useMemo(() => notifications.slice(0, 30), [notifications]);

  const displayedNotifs = activeNotifTab === 'role' ? roleNotifs : allNotifs;
  const currentTabUnreadCount = activeNotifTab === 'role' ? currentRoleUnread : totalPlatformUnread;

  // Close dropdown on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    }
    if (bellOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [bellOpen]);

  const activePillRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll the active pill into view on mobile whenever role changes
  useEffect(() => {
    if (activePillRef.current) {
      activePillRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [role]);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 50,
        background: '#0f172a',
        borderBottom: '1px solid #1e293b',
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        boxSizing: 'border-box',
      }}
    >
      {/* Main nav */}
      <div className="navbar-container">
        {/* Brand */}
        <div className="navbar-brand">
          <div className="navbar-logo">
            सJ
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="navbar-brand-title">
              Samadhan Jharkhand
            </div>
            <div className="navbar-brand-subtitle">
              Societal Innovation Collaboration Portal
            </div>
          </div>
        </div>

        {/* Actions: Auth Status & Notification Bell */}
        <div className="navbar-actions-group">
          {currentUser ? (
            <div className="navbar-auth-section">
              <div
                className="navbar-auth-badge"
                title={`Active session: ${currentUser.displayName} (${currentUser.organization})`}
              >
                <span className="auth-live-dot" />
                <span className="auth-prefix">Logged in as:</span>
                <span className="auth-username">{currentUser.username}</span>
                <span className="auth-badge-label">({currentUser.badgeLabel})</span>
              </div>
              <button
                type="button"
                onClick={logout}
                className="navbar-logout-btn"
                title="Logout and return to public Citizen view"
              >
                <LogOut size={13} />
                <span className="logout-text">Logout</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal()}
              className="navbar-login-btn"
              title="Open Demo Role Sign-In Modal"
            >
              <KeyRound size={13} />
              <span>Demo Login</span>
            </button>
          )}

          {/* Notification Bell */}
          <div className="navbar-bell-container" ref={bellRef}>
            <button
              onClick={() => {
                const nextOpen = !bellOpen;
                setBellOpen(nextOpen);
                if (nextOpen) {
                  markAllRead(role);
                }
              }}
              style={{
                position: 'relative',
                background: bellOpen ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)',
                border: 'none',
                borderRadius: '50%',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#fff',
                transition: 'background 0.2s',
              }}
              aria-label="Notifications"
            >
              <Bell size={18} />
              {currentRoleUnread > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -2,
                    right: -2,
                    minWidth: 18,
                    height: 18,
                    padding: '0 4px',
                    borderRadius: '999px',
                    background: '#ef4444',
                    color: '#fff',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #0f172a',
                    lineHeight: 1,
                  }}
                >
                  {currentRoleUnread > 9 ? '9+' : currentRoleUnread}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {bellOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 44,
                  right: 0,
                  width: 'min(370px, calc(100vw - 24px))',
                  maxHeight: 480,
                  overflowY: 'auto',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg, 12px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
                  zIndex: 999,
                  padding: 0,
                }}
              >
                {/* Header */}
                <div
                  style={{
                    padding: '14px 16px 10px',
                    borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 10,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: 'rgba(217, 119, 6, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#d97706',
                        }}
                      >
                        {ROLE_ICONS[role]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--color-text)' }}>
                          {ROLE_LABELS[role].split(':')[0]} Inbox
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
                          Role-specific updates & dispatch trail
                        </div>
                      </div>
                    </div>

                    {currentTabUnreadCount > 0 && (
                      <button
                        onClick={() => markAllRead(activeNotifTab === 'role' ? role : undefined)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#d97706',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '4px 8px',
                          borderRadius: 6,
                        }}
                        title="Mark notifications as read"
                      >
                        <CheckCheck size={14} /> Clear {activeNotifTab === 'role' ? 'Role' : 'All'}
                      </button>
                    )}
                  </div>

                  {/* Sub-tabs: Role vs All Stakeholders */}
                  <div
                    style={{
                      display: 'flex',
                      gap: 4,
                      background: 'var(--color-surface-alt)',
                      padding: 3,
                      borderRadius: 'var(--radius-sm, 6px)',
                    }}
                  >
                    <button
                      onClick={() => setActiveNotifTab('role')}
                      style={{
                        flex: 1,
                        padding: '5px 8px',
                        fontSize: '0.74rem',
                        fontWeight: activeNotifTab === 'role' ? 700 : 500,
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        background: activeNotifTab === 'role' ? 'var(--color-surface)' : 'transparent',
                        color: activeNotifTab === 'role' ? 'var(--color-text)' : 'var(--color-text-muted)',
                        boxShadow: activeNotifTab === 'role' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        transition: 'all 0.15s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                      }}
                    >
                      <span>This Role</span>
                      {currentRoleUnread > 0 && (
                        <span
                          style={{
                            background: '#ef4444',
                            color: '#fff',
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            padding: '1px 5px',
                            borderRadius: 10,
                          }}
                        >
                          {currentRoleUnread}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setActiveNotifTab('all')}
                      style={{
                        flex: 1,
                        padding: '5px 8px',
                        fontSize: '0.74rem',
                        fontWeight: activeNotifTab === 'all' ? 700 : 500,
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        background: activeNotifTab === 'all' ? 'var(--color-surface)' : 'transparent',
                        color: activeNotifTab === 'all' ? 'var(--color-text)' : 'var(--color-text-muted)',
                        boxShadow: activeNotifTab === 'all' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        transition: 'all 0.15s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                      }}
                    >
                      <span>All Stakeholders</span>
                      {totalPlatformUnread > 0 && (
                        <span
                          style={{
                            background: 'rgba(217, 119, 6, 0.8)',
                            color: '#fff',
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            padding: '1px 5px',
                            borderRadius: 10,
                          }}
                        >
                          {totalPlatformUnread}
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Notification list */}
                {displayedNotifs.length === 0 ? (
                  <div
                    style={{
                      padding: '36px 16px',
                      textAlign: 'center',
                      color: 'var(--color-text-muted)',
                      fontSize: '0.82rem',
                    }}
                  >
                    <Inbox size={28} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                    <p style={{ margin: 0, fontWeight: 500 }}>
                      {activeNotifTab === 'role'
                        ? `No notifications for ${ROLE_LABELS[role].split(':')[0]}.`
                        : 'No platform activity yet.'}
                    </p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.72rem', opacity: 0.7 }}>
                      {activeNotifTab === 'role'
                        ? 'New updates targeted to your role will appear here.'
                        : 'All cross-portal events will be recorded here.'}
                    </p>
                  </div>
                ) : (
                  displayedNotifs.map((n) => {
                    const tag = ROLE_TAGS[n.role] || ROLE_TAGS.citizen;
                    return (
                      <div
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        style={{
                          padding: '11px 16px',
                          borderBottom: '1px solid var(--color-border)',
                          cursor: 'pointer',
                          background: n.read ? 'transparent' : 'rgba(217, 119, 6, 0.04)',
                          transition: 'background 0.15s',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 8,
                          }}
                        >
                          {!n.read ? (
                            <span
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius: '50%',
                                background: '#ef4444',
                                flexShrink: 0,
                                marginTop: 5,
                              }}
                            />
                          ) : (
                            <span
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius: '50%',
                                background: 'transparent',
                                flexShrink: 0,
                                marginTop: 5,
                              }}
                            />
                          )}

                          <div style={{ flex: 1, minWidth: 0 }}>
                            {activeNotifTab === 'all' && (
                              <div style={{ marginBottom: 4 }}>
                                <span
                                  style={{
                                    fontSize: '0.64rem',
                                    fontWeight: 700,
                                    padding: '2px 6px',
                                    borderRadius: 4,
                                    color: tag.color,
                                    background: tag.bg,
                                  }}
                                >
                                  {tag.name}
                                </span>
                              </div>
                            )}

                            <p
                              style={{
                                fontSize: '0.8rem',
                                color: 'var(--color-text)',
                                fontWeight: n.read ? 400 : 600,
                                lineHeight: 1.45,
                                margin: 0,
                              }}
                            >
                              {n.message}
                            </p>

                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                marginTop: 4,
                                fontSize: '0.68rem',
                                color: 'var(--color-text-muted)',
                              }}
                            >
                              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Clock size={11} />
                                {new Date(n.timestamp).toLocaleTimeString('en-IN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>

                              {n.problemId && (
                                <span
                                  style={{
                                    color: '#d97706',
                                    fontWeight: 700,
                                    background: 'rgba(217, 119, 6, 0.08)',
                                    padding: '1px 5px',
                                    borderRadius: 3,
                                  }}
                                >
                                  {n.problemId}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* Role Navigation */}
        <div className="navbar-role-wrapper">
          <nav className="navbar-role-nav" aria-label="Portal Stakeholder Roles">
            {ROLES.map((r) => {
              const roleUnread = getUnreadCount(r);
              const isActive = r === role;
              const isAuthorized =
                r === 'citizen' ||
                (r === 'university' && currentUser?.role === 'university') ||
                (r === 'industry' && currentUser?.role === 'industry') ||
                ((r === 'government' || r === 'admin') &&
                  (currentUser?.role === 'admin' || currentUser?.role === 'government'));

              const handleRoleClick = () => {
                if (r === 'citizen') {
                  setRole('citizen');
                  markAllRead('citizen');
                  return;
                }

                if (r === 'university') {
                  if (currentUser?.role === 'university') {
                    setRole('university');
                    markAllRead('university');
                  } else {
                    openAuthModal('university');
                  }
                  return;
                }

                if (r === 'industry') {
                  if (currentUser?.role === 'industry') {
                    setRole('industry');
                    markAllRead('industry');
                  } else {
                    openAuthModal('industry');
                  }
                  return;
                }

                if (r === 'government') {
                  if (currentUser?.role === 'admin' || currentUser?.role === 'government') {
                    setRole('government');
                    markAllRead('government');
                  } else {
                    openAuthModal('admin');
                  }
                  return;
                }
              };

              return (
                <button
                  key={r}
                  ref={isActive ? activePillRef : undefined}
                  onClick={handleRoleClick}
                  className={
                    isActive ? 'role-pill role-pill-active' : 'role-pill role-pill-inactive'
                  }
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    flexShrink: 0,
                    position: 'relative',
                  }}
                  title={
                    !isAuthorized
                      ? `Requires ${ROLE_LABELS[r]} authentication (Click to authenticate)`
                      : `Switch to ${ROLE_LABELS[r]}${roleUnread > 0 ? ` (${roleUnread} new notifications)` : ''}`
                  }
                >
                  {ROLE_ICONS[r]}
                  <span>{ROLE_LABELS[r]}</span>
                  {!isAuthorized && !isActive && (
                    <Lock size={11} style={{ opacity: 0.55, marginLeft: -1 }} />
                  )}
                  {roleUnread > 0 && (
                    <span
                      className={`nav-role-badge ${
                        isActive ? 'nav-role-badge-active' : 'nav-role-badge-inactive'
                      }`}
                      aria-label={`${roleUnread} unread notifications`}
                    >
                      {roleUnread > 9 ? '9+' : roleUnread}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
