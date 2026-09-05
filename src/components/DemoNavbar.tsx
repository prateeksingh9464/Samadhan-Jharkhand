'use client';

import React from 'react';
import { useRole } from '@/lib/store';
import type { Role } from '@/lib/types';
import { ROLE_LABELS } from '@/lib/types';
import {
  Users,
  GraduationCap,
  Building2,
  Landmark,
} from 'lucide-react';

const ROLE_ICONS: Record<Role, React.ReactNode> = {
  citizen: <Users size={15} />,
  university: <GraduationCap size={15} />,
  industry: <Building2 size={15} />,
  government: <Landmark size={15} />,
  admin: <Landmark size={15} />,
};

const ROLES: Role[] = ['citizen', 'university', 'industry', 'government'];

export default function DemoNavbar() {
  const { role, setRole } = useRole();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      }}
    >
      {/* Main nav */}
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.9rem',
              color: '#fff',
            }}
          >
            सJ
          </div>
          <div>
            <div
              style={{
                fontWeight: 800,
                fontSize: '1.05rem',
                color: '#fff',
                lineHeight: 1.2,
              }}
            >
              Samadhan Jharkhand
            </div>
            <div
              style={{
                fontSize: '0.7rem',
                color: 'rgba(255,255,255,0.7)',
                fontWeight: 500,
              }}
            >
              Societal Innovation Collaboration Portal
            </div>
          </div>
        </div>

        {/* Role switcher */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            flexWrap: 'wrap',
          }}
        >
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={
                r === role ? 'role-pill role-pill-active' : 'role-pill role-pill-inactive'
              }
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              {ROLE_ICONS[r]}
              {ROLE_LABELS[r]}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
