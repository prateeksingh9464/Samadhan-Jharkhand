'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, DEMO_CREDENTIALS, MASTER_PASSWORD } from '@/lib/auth-store';
import { ROLE_LABELS, type Role } from '@/lib/types';
import {
  ShieldCheck,
  X,
  Lock,
  User,
  Eye,
  EyeOff,
  Zap,
  ArrowRight,
  AlertCircle,
  Users,
  GraduationCap,
  Building2,
  Landmark,
} from 'lucide-react';

const ROLE_ICONS: Record<string, React.ReactNode> = {
  citizen: <Users size={16} />,
  university: <GraduationCap size={16} />,
  industry: <Building2 size={16} />,
  government: <Landmark size={16} />,
  admin: <Landmark size={16} />,
};

const ROLE_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  citizen: { text: '#d97706', bg: 'rgba(217, 119, 6, 0.12)', border: 'rgba(217, 119, 6, 0.3)' },
  university: { text: '#6366f1', bg: 'rgba(99, 102, 241, 0.12)', border: 'rgba(99, 102, 241, 0.3)' },
  industry: { text: '#0284c7', bg: 'rgba(2, 132, 199, 0.12)', border: 'rgba(2, 132, 199, 0.3)' },
  government: { text: '#059669', bg: 'rgba(5, 150, 105, 0.12)', border: 'rgba(5, 150, 105, 0.3)' },
  admin: { text: '#059669', bg: 'rgba(5, 150, 105, 0.12)', border: 'rgba(5, 150, 105, 0.3)' },
};

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, targetRole, login, quickLogin } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeChip, setActiveChip] = useState<string | null>(null);

  // Pre-fill username when targetRole is set
  useEffect(() => {
    if (isAuthModalOpen) {
      setErrorMessage('');
      setActiveChip(null);
      if (targetRole) {
        if (targetRole === 'citizen') setUsername('cid');
        else if (targetRole === 'university') setUsername('uid');
        else if (targetRole === 'industry') setUsername('iid');
        else if (targetRole === 'government' || targetRole === 'admin') setUsername('gid');
        setPassword(MASTER_PASSWORD);
      } else {
        setUsername('');
        setPassword('');
      }
    }
  }, [isAuthModalOpen, targetRole]);

  // Handle ESC key to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const res = login(username, password);
    if (!res.success) {
      setErrorMessage(res.error || 'Invalid credentials. Please verify your username and password.');
    }
  };

  const handleQuickDemoFill = (demoUsername: string) => {
    setActiveChip(demoUsername);
    setUsername(demoUsername);
    setPassword(MASTER_PASSWORD);
    setErrorMessage('');

    // Trigger instant authentication
    setTimeout(() => {
      quickLogin(demoUsername);
    }, 150);
  };

  // Determine display role for badge
  const displayRoleKey: Role = targetRole || (username === 'cid' ? 'citizen' : username === 'uid' ? 'university' : username === 'iid' ? 'industry' : username === 'gid' ? 'admin' : 'citizen');
  const roleTheme = ROLE_COLORS[displayRoleKey] || ROLE_COLORS.citizen;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.78)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeAuthModal();
        }
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          background: '#0f172a',
          color: '#f8fafc',
          borderRadius: '16px',
          border: '1px solid #334155',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Accent Bar */}
        <div
          style={{
            height: '4px',
            width: '100%',
            background: 'linear-gradient(90deg, #d97706, #f59e0b, #6366f1, #0284c7)',
          }}
        />

        {/* Modal Header */}
        <div
          style={{
            padding: '24px 24px 18px',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.2), rgba(217, 119, 6, 0.05))',
                border: '1px solid rgba(217, 119, 6, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f59e0b',
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={24} />
            </div>
            <div>
              <div
                style={{
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontWeight: 700,
                  color: '#d97706',
                  marginBottom: '2px',
                }}
              >
                Government of Jharkhand SSO
              </div>
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.22rem',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: '#ffffff',
                }}
              >
                Single Sign-On Access
              </h2>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                Multi-Stakeholder Innovation & Grievance Portal
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={closeAuthModal}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94a3b8',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#94a3b8';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
            }}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Target Role Indicator */}
          {targetRole && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: roleTheme.bg,
                border: `1px solid ${roleTheme.border}`,
                borderRadius: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: roleTheme.text }}>{ROLE_ICONS[displayRoleKey]}</span>
                <span style={{ fontSize: '0.82rem', color: '#e2e8f0', fontWeight: 500 }}>
                  Target Portal:
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: roleTheme.text }}>
                  {ROLE_LABELS[displayRoleKey]}
                </span>
              </div>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: roleTheme.text,
                  color: '#fff',
                }}
              >
                Restricted Access
              </span>
            </div>
          )}

          {/* Quick Demo Fill Section */}
          <div
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '14px 16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={14} color="#f59e0b" />
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#f59e0b',
                  }}
                >
                  Quick Demo Fill (Instant Login)
                </span>
              </div>
              <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>1-Click Auth</span>
            </div>

            {/* Demo Pill Buttons Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px',
              }}
            >
              {(Object.keys(DEMO_CREDENTIALS) as Array<keyof typeof DEMO_CREDENTIALS>).map((key) => {
                const cred = DEMO_CREDENTIALS[key];
                const theme = ROLE_COLORS[cred.role];
                const isSelected = activeChip === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleQuickDemoFill(key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      background: isSelected ? theme.bg : '#0f172a',
                      border: `1.5px solid ${isSelected ? theme.text : '#334155'}`,
                      borderRadius: '8px',
                      color: '#f8fafc',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = theme.text;
                      e.currentTarget.style.background = theme.bg;
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = '#334155';
                        e.currentTarget.style.background = '#0f172a';
                      }
                    }}
                  >
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        background: theme.bg,
                        color: theme.text,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {ROLE_ICONS[cred.role]}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          color: '#f8fafc',
                          lineHeight: 1.2,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {cred.pillText}
                      </div>
                      <div
                        style={{
                          fontSize: '0.64rem',
                          color: theme.text,
                          fontWeight: 600,
                        }}
                      >
                        ID: {cred.username}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              margin: '-4px 0',
            }}
          >
            <div style={{ flex: 1, height: '1px', background: '#334155' }} />
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Or Enter Credentials
            </span>
            <div style={{ flex: 1, height: '1px', background: '#334155' }} />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '10px 14px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: '8px',
                color: '#fca5a5',
                fontSize: '0.78rem',
                lineHeight: 1.4,
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#ef4444' }} />
              <div>{errorMessage}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Username Input */}
            <div>
              <label
                htmlFor="auth-username"
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#cbd5e1',
                  marginBottom: '6px',
                }}
              >
                Username / Nodal ID
              </label>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <User size={16} />
                </div>
                <input
                  id="auth-username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setErrorMessage('');
                  }}
                  placeholder="cid, uid, iid, or gid"
                  autoComplete="username"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    background: '#020617',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s ease',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#d97706')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#334155')}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '6px',
                }}
              >
                <label
                  htmlFor="auth-password"
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#cbd5e1',
                  }}
                >
                  Password
                </label>
                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                  Demo Master: <code style={{ color: '#d97706', fontWeight: 700 }}>admin@123</code>
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <Lock size={16} />
                </div>
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage('');
                  }}
                  placeholder="Enter password (admin@123)"
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    padding: '10px 38px 10px 38px',
                    background: '#020617',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s ease',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#d97706')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#334155')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px',
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              style={{
                marginTop: '4px',
                width: '100%',
                padding: '11px',
                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(217, 119, 6, 0.35)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(217, 119, 6, 0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(217, 119, 6, 0.35)';
              }}
            >
              <span>Sign In & Continue</span>
              <ArrowRight size={16} />
            </button>
          </form>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '12px 24px',
            background: '#090e17',
            borderTop: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.7rem',
            color: '#64748b',
          }}
        >
          <span>Smart India Hackathon 2026</span>
          <span>Role-Based Access Control • Demo Active</span>
        </div>
      </div>
    </div>
  );
}
