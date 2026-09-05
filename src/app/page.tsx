'use client';

import { useRole } from '@/lib/store';
import CitizenPortal from '@/components/citizen/CitizenPortal';
import {
  GraduationCap,
  Building2,
  Landmark,
  ArrowRight,
  Construction,
} from 'lucide-react';

export default function Home() {
  const { role } = useRole();

  if (role === 'citizen') {
    return <CitizenPortal />;
  }

  if (role === 'university') {
    return (
      <Phase2Card
        icon={<GraduationCap size={40} />}
        title="University Proposal Builder"
        subtitle="IIT (ISM) Dhanbad — Research Proposal & Student Team Management"
        features={[
          'Browse routed problems from citizen submissions',
          'Form interdisciplinary student research teams',
          'Draft and submit research proposals with NEP 2020 alignment',
          'Track proposal lifecycle from submission to pilot deployment',
        ]}
      />
    );
  }

  if (role === 'industry') {
    return (
      <Phase2Card
        icon={<Building2 size={40} />}
        title="Industry CSR Pledge Workflow"
        subtitle="Tata Steel CSR Foundation — Funding & Partnership Portal"
        features={[
          'Browse vetted university proposals seeking funding',
          'Pledge CSR funds against specific proposals',
          'Track fund utilization and milestone delivery',
          'Generate CSR compliance reports (Section 135)',
        ]}
      />
    );
  }

  return (
    <Phase2Card
      icon={<Landmark size={40} />}
      title="Government Dashboard"
      subtitle="Government of Jharkhand — District-Level Oversight & Analytics"
      features={[
        'Interactive district heatmap of citizen problems',
        'Category-wise and urgency-wise analytics charts',
        'Track pipeline: Submitted → Routed → Proposal → Funded → Deployed',
        'Generate block-level progress reports for the CM dashboard',
      ]}
    />
  );
}

// ─── Phase 2 Placeholder Card ───────────────────────────────────────────────

function Phase2Card({
  icon,
  title,
  subtitle,
  features,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  features: string[];
}) {
  return (
    <div
      style={{
        maxWidth: 680,
        margin: '60px auto',
        padding: '0 20px',
      }}
    >
      <div
        className="glass-card animate-fade-in-up"
        style={{ padding: '48px 36px', textAlign: 'center' }}
      >
        {/* Icon */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: '#fff',
          }}
        >
          {icon}
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'var(--color-text)',
            marginBottom: 8,
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontSize: '0.9rem',
            color: 'var(--color-text-muted)',
            marginBottom: 28,
          }}
        >
          {subtitle}
        </p>

        {/* Phase 2 badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(245, 158, 11, 0.1)',
            color: '#d97706',
            fontWeight: 700,
            fontSize: '0.78rem',
            marginBottom: 24,
          }}
        >
          <Construction size={14} />
          Phase 2 — Coming Next
        </div>

        {/* Feature list */}
        <div
          style={{
            textAlign: 'left',
            padding: '20px 24px',
            background: 'var(--color-surface-alt)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <p
            style={{
              fontWeight: 700,
              fontSize: '0.8rem',
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: 12,
            }}
          >
            Planned Features
          </p>
          {features.map((f, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                marginBottom: i < features.length - 1 ? 10 : 0,
                fontSize: '0.88rem',
                color: 'var(--color-text)',
              }}
            >
              <ArrowRight
                size={14}
                style={{
                  marginTop: 4,
                  flexShrink: 0,
                  color: 'var(--color-primary-light)',
                }}
              />
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
