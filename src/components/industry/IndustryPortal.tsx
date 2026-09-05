'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import type { Problem } from '@/lib/types';
import {
  Building2,
  MapPin,
  GraduationCap,
  Users,
  IndianRupee,
  CheckCircle2,
  X,
  ShieldCheck,
  Target,
  Clock,
  Tag,
  Handshake,
  TrendingUp,
  Landmark,
  Filter,
  Sparkles,
  CircleDollarSign,
  BadgeCheck,
} from 'lucide-react';

// ─── Constants ──────────────────────────────────────────────────────────────

const SPONSOR_ID = 'Tata Steel CSR Foundation';
const DIVISION = 'Sustainable Communities Division';

const DOMAIN_FILTERS = [
  { key: 'all', label: 'All Domains' },
  { key: 'Water', label: 'Water Resources' },
  { key: 'Mining/Env', label: 'Sustainable Mining' },
  { key: 'Agriculture', label: 'Rural Livelihoods' },
  { key: 'Health', label: 'Healthcare' },
  { key: 'Education', label: 'Education' },
  { key: 'Rural Infra', label: 'Infrastructure' },
] as const;

const URGENCY_BADGE: Record<string, string> = {
  Critical: 'badge-critical',
  Medium: 'badge-medium',
  Low: 'badge-low',
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function IndustryPortal() {
  const { problems, updateProblem } = useStore();
  const [activeFilter, setActiveFilter] = useState('all');
  const [pledgeTarget, setPledgeTarget] = useState<Problem | null>(null);
  const [successProblem, setSuccessProblem] = useState<Problem | null>(null);
  const [successAmount, setSuccessAmount] = useState(0);

  // Proposals seeking sponsorship
  const proposals = useMemo(
    () => problems.filter((p) => p.status === 'In_Proposal'),
    [problems]
  );

  const filtered = useMemo(
    () =>
      activeFilter === 'all'
        ? proposals
        : proposals.filter((p) => p.category === activeFilter),
    [proposals, activeFilter]
  );

  // Already pledged by this sponsor
  const pledged = useMemo(
    () =>
      problems.filter(
        (p) =>
          p.industrySponsor === SPONSOR_ID &&
          (p.status === 'Industry_Pledged' || p.status === 'Pilot_Deployed')
      ),
    [problems]
  );

  const totalPledged = useMemo(
    () => pledged.reduce((sum, p) => sum + p.fundingAmount, 0),
    [pledged]
  );

  return (
    <div className="page-container" style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 20px 60px' }}>
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="animate-fade-in-up" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0369a1, #38bdf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <Building2 size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.2 }}>
              Industry & CSR Hub
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
              {SPONSOR_ID} — {DIVISION}
            </p>
          </div>
        </div>
      </div>

      {/* ── KPI Row ──────────────────────────────────────────────── */}
      <div
        className="industry-kpi-grid animate-fade-in-up"
        style={{
          marginBottom: 28,
          animationDelay: '0.05s',
        }}
      >
        <KpiCard
          label="Open Proposals"
          value={proposals.length.toString()}
          icon={<Sparkles size={18} />}
          color="#0369a1"
        />
        <KpiCard
          label="Grants Pledged"
          value={pledged.length.toString()}
          icon={<Handshake size={18} />}
          color="#059669"
        />
        <KpiCard
          label="Total CSR Committed"
          value={formatINR(totalPledged)}
          icon={<CircleDollarSign size={18} />}
          color="#d97706"
        />
        <KpiCard
          label="Section 135 Eligible"
          value="100%"
          icon={<ShieldCheck size={18} />}
          color="#7c3aed"
        />
      </div>

      {/* ── Filter Bar ───────────────────────────────────────────── */}
      <div
        className="mobile-scroll-filters animate-fade-in-up"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 20,
          animationDelay: '0.1s',
        }}
      >
        <Filter size={15} style={{ color: 'var(--color-text-muted)' }} />
        {DOMAIN_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            style={{
              padding: '5px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1.5px solid',
              transition: 'all var(--transition-base)',
              background:
                activeFilter === f.key
                  ? 'var(--color-primary)'
                  : 'var(--color-surface)',
              color:
                activeFilter === f.key
                  ? '#fff'
                  : 'var(--color-text-muted)',
              borderColor:
                activeFilter === f.key
                  ? 'var(--color-primary)'
                  : 'var(--color-border)',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Proposal Cards ───────────────────────────────────────── */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.12s' }}>
        <div style={{ marginBottom: 14 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            Proposals Seeking Sponsorship
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
            University-backed research proposals ready for corporate CSR funding
          </p>
        </div>

        {filtered.length === 0 ? (
          <div
            className="glass-card"
            style={{
              padding: '44px 24px',
              textAlign: 'center',
              color: 'var(--color-text-muted)',
              fontSize: '0.9rem',
            }}
          >
            <Sparkles size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p>
              {activeFilter === 'all'
                ? 'No proposals awaiting sponsorship right now.'
                : `No proposals in "${activeFilter}" domain.`}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {filtered.map((p) => (
              <ProposalCard
                key={p.id}
                problem={p}
                onPledge={() => setPledgeTarget(p)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Pledged History ──────────────────────────────────────── */}
      {pledged.length > 0 && (
        <div className="animate-fade-in-up" style={{ marginTop: 36, animationDelay: '0.15s' }}>
          <div style={{ marginBottom: 14 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              Your CSR Portfolio
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
              Grants you have pledged under Section 135
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {pledged.map((p) => (
              <PledgedCard key={p.id} problem={p} />
            ))}
          </div>
        </div>
      )}

      {/* ── Pledge Modal ─────────────────────────────────────────── */}
      {pledgeTarget && (
        <PledgeModal
          problem={pledgeTarget}
          onClose={() => setPledgeTarget(null)}
          onAuthorize={(amount) => {
            updateProblem(pledgeTarget.id, {
              status: 'Industry_Pledged',
              industrySponsor: SPONSOR_ID,
              fundingAmount: amount,
            });
            setSuccessProblem(pledgeTarget);
            setSuccessAmount(amount);
            setPledgeTarget(null);
          }}
        />
      )}

      {/* ── Success Modal ────────────────────────────────────────── */}
      {successProblem && (
        <SuccessReceipt
          problem={successProblem}
          amount={successAmount}
          onClose={() => {
            setSuccessProblem(null);
            setSuccessAmount(0);
          }}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

// ─── KPI Card ───────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div
      className="glass-card"
      style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 12 }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 'var(--radius-md)',
          background: `${color}12`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, color, lineHeight: 1.1 }}>
          {value}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
          {label}
        </div>
      </div>
    </div>
  );
}

// ─── Proposal Card ──────────────────────────────────────────────────────────

function ProposalCard({
  problem,
  onPledge,
}: {
  problem: Problem;
  onPledge: () => void;
}) {
  const date = new Date(problem.submittedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div
      className="glass-card"
      style={{
        padding: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all var(--transition-base)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-lg)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          height: 4,
          background: 'linear-gradient(90deg, #0369a1, #38bdf8)',
        }}
      />

      <div style={{ padding: '20px 22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Badges row */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
          <span className="badge badge-proposal">In Proposal</span>
          <span className={`badge ${URGENCY_BADGE[problem.urgency] || 'badge-low'}`}>
            {problem.urgency}
          </span>
          <span className="badge badge-deployed">{problem.category}</span>
        </div>

        {/* Title */}
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8, lineHeight: 1.35 }}>
          {problem.title}
        </h3>

        {/* Meta */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
            fontSize: '0.8rem',
            color: 'var(--color-text-muted)',
            marginBottom: 14,
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <MapPin size={13} /> {problem.district}, Jharkhand
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <GraduationCap size={13} /> {problem.targetUniversity}
          </span>
          {problem.assignedTeam && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users size={13} /> {problem.assignedTeam}
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={13} /> Submitted {date}
          </span>
        </div>

        {/* Abstract preview */}
        <div
          style={{
            padding: '10px 14px',
            background: 'var(--color-surface-alt)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.82rem',
            color: 'var(--color-text)',
            lineHeight: 1.55,
            marginBottom: 14,
            flex: 1,
          }}
        >
          <div
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              letterSpacing: '0.04em',
              marginBottom: 4,
            }}
          >
            Proposal Abstract
          </div>
          {problem.description.length > 180
            ? problem.description.slice(0, 180) + '…'
            : problem.description}
        </div>

        {/* Milestone preview */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              letterSpacing: '0.04em',
              marginBottom: 6,
            }}
          >
            Milestone Plan
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['Research & Survey', 'Prototype Dev', 'Pilot Deploy'].map((ms, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  background: i === 0 ? 'rgba(3, 105, 161, 0.08)' : 'var(--color-surface-alt)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  textAlign: 'center',
                  color: i === 0 ? '#0369a1' : 'var(--color-text-muted)',
                }}
              >
                <div style={{ fontSize: '0.62rem', opacity: 0.7, marginBottom: 1 }}>M{i + 1}</div>
                {ms}
              </div>
            ))}
          </div>
        </div>

        {/* Footer: funding + CTA */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 14,
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
              }}
            >
              Funding Requested
            </div>
            <div
              style={{
                fontSize: '1.1rem',
                fontWeight: 800,
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <IndianRupee size={15} />
              {(problem.fundingAmount > 0 ? problem.fundingAmount : 280000).toLocaleString('en-IN')}
            </div>
          </div>
          <button
            className="btn btn-primary"
            style={{ fontSize: '0.8rem', padding: '8px 18px' }}
            onClick={onPledge}
          >
            <Handshake size={15} /> Pledge Grant
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Pledged Card ───────────────────────────────────────────────────────────

function PledgedCard({ problem }: { problem: Problem }) {
  return (
    <div className="glass-card" style={{ padding: '18px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span className="badge badge-pledged">✓ Funded</span>
        <span
          style={{
            fontSize: '0.7rem',
            fontFamily: 'monospace',
            color: 'var(--color-text-muted)',
          }}
        >
          {problem.id}
        </span>
      </div>
      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 6, lineHeight: 1.3 }}>
        {problem.title}
      </h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 10 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <MapPin size={12} /> {problem.district}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <GraduationCap size={12} /> {problem.targetUniversity}
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          background: 'rgba(5, 150, 105, 0.06)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
          <BadgeCheck size={15} /> Section 135 Compliant
        </div>
        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#059669' }}>
          ₹{problem.fundingAmount.toLocaleString('en-IN')}
        </div>
      </div>
    </div>
  );
}

// ─── Pledge Modal ───────────────────────────────────────────────────────────

function PledgeModal({
  problem,
  onClose,
  onAuthorize,
}: {
  problem: Problem;
  onClose: () => void;
  onAuthorize: (amount: number) => void;
}) {
  const [amount, setAmount] = useState(problem.fundingAmount > 0 ? problem.fundingAmount : 280000);
  const [milestoneLinked, setMilestoneLinked] = useState(true);

  const handleSlider = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(Number(e.target.value));
  }, []);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val)) setAmount(Math.max(50000, Math.min(1000000, val)));
  }, []);

  const milestoneBreakdown = useMemo(() => {
    const m1 = Math.round(amount * 0.3);
    const m2 = Math.round(amount * 0.4);
    const m3 = amount - m1 - m2;
    return [
      { label: 'M1: Research & Survey', pct: 30, amount: m1 },
      { label: 'M2: Prototype Development', pct: 40, amount: m2 },
      { label: 'M3: Pilot Deployment', pct: 30, amount: m3 },
    ];
  }, [amount]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          maxWidth: 560,
          width: '94%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: 'var(--shadow-lg)',
          animation: 'fadeInUp 0.3s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            background: 'var(--color-surface)',
            zIndex: 2,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <Handshake size={16} color="#0369a1" />
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0369a1' }}>
                Pledge CSR Grant
              </span>
            </div>
            <p
              style={{
                fontSize: '0.76rem',
                color: 'var(--color-text-muted)',
                maxWidth: 380,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {problem.id} — {problem.title}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: 'var(--color-text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '22px 24px' }}>
          {/* Problem summary */}
          <div
            style={{
              padding: '14px 16px',
              background: 'var(--color-surface-alt)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 22,
            }}
          >
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={12} /> {problem.district}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Tag size={12} /> {problem.category}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <GraduationCap size={12} /> {problem.targetUniversity}
              </span>
            </div>
            {problem.assignedTeam && (
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Users size={12} /> Team: {problem.assignedTeam}
              </div>
            )}
          </div>

          {/* ── Amount Selector ────────────────────────────────────── */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 14,
                paddingBottom: 8,
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <IndianRupee size={15} style={{ color: 'var(--color-primary)' }} />
              <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>Grant Amount</span>
            </div>

            {/* Big display */}
            <div
              style={{
                textAlign: 'center',
                padding: '16px 0',
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  fontSize: '2.2rem',
                  fontWeight: 800,
                  color: '#0369a1',
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                ₹{amount.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                ({formatINR(amount)})
              </div>
            </div>

            {/* Slider */}
            <div style={{ marginBottom: 10 }}>
              <input
                type="range"
                min={50000}
                max={1000000}
                step={10000}
                value={amount}
                onChange={handleSlider}
                style={{
                  width: '100%',
                  height: 6,
                  borderRadius: 'var(--radius-full)',
                  appearance: 'none',
                  background: `linear-gradient(to right, #0369a1 ${((amount - 50000) / 950000) * 100}%, var(--color-border) ${((amount - 50000) / 950000) * 100}%)`,
                  outline: 'none',
                  cursor: 'pointer',
                  accentColor: '#0369a1',
                }}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.68rem',
                  color: 'var(--color-text-muted)',
                  marginTop: 4,
                }}
              >
                <span>₹50,000</span>
                <span>₹10,00,000</span>
              </div>
            </div>

            {/* Direct input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--color-text)' }}>₹</span>
              <input
                className="input-field"
                type="number"
                min={50000}
                max={1000000}
                step={10000}
                value={amount}
                onChange={handleInput}
                style={{ maxWidth: 180 }}
              />
            </div>
          </div>

          {/* ── Section 135 Badge ──────────────────────────────────── */}
          <div
            style={{
              padding: '12px 16px',
              background: 'rgba(124, 58, 237, 0.05)',
              border: '1px solid rgba(124, 58, 237, 0.12)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <ShieldCheck size={22} color="#7c3aed" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#7c3aed', marginBottom: 2 }}>
                Section 135 — Companies Act Compliance
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                Eligible under Schedule VII: Rural Development, Environmental Sustainability &
                Technology Incubation.
              </div>
            </div>
          </div>

          {/* ── Milestone-linked disbursement ──────────────────────── */}
          <div style={{ marginBottom: 22 }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                cursor: 'pointer',
                padding: '12px 14px',
                background: milestoneLinked ? 'rgba(5, 150, 105, 0.05)' : 'var(--color-surface-alt)',
                border: `1.5px solid ${milestoneLinked ? 'rgba(5, 150, 105, 0.3)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-md)',
                transition: 'all var(--transition-base)',
              }}
            >
              <input
                type="checkbox"
                checked={milestoneLinked}
                onChange={(e) => setMilestoneLinked(e.target.checked)}
                style={{ marginTop: 3, accentColor: '#059669', width: 16, height: 16 }}
              />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>
                  Milestone-Linked Fund Disbursement
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                  Release funds in tranches tied to milestone completion. Ensures accountability
                  and transparent utilization tracking.
                </div>
              </div>
            </label>

            {/* Milestone breakdown */}
            {milestoneLinked && (
              <div
                style={{
                  marginTop: 12,
                  padding: '14px 16px',
                  background: 'var(--color-surface-alt)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--color-text-muted)',
                    letterSpacing: '0.04em',
                    marginBottom: 10,
                  }}
                >
                  Disbursement Schedule
                </div>
                {milestoneBreakdown.map((m, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      borderBottom: i < 2 ? '1px solid var(--color-border)' : 'none',
                      fontSize: '0.82rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          background: 'var(--color-primary)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                        }}
                      >
                        {i + 1}
                      </div>
                      <span style={{ color: 'var(--color-text)' }}>{m.label}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                        {m.pct}%
                      </span>
                      <span style={{ fontWeight: 700, color: '#0369a1' }}>
                        ₹{m.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Authorize Button ───────────────────────────────────── */}
          <button
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '12px 20px',
              fontSize: '0.92rem',
              background: 'linear-gradient(135deg, #0369a1, #38bdf8)',
              boxShadow: '0 2px 12px rgba(3, 105, 161, 0.3)',
            }}
            onClick={() => onAuthorize(amount)}
          >
            <Landmark size={17} /> Authorize CSR Grant
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Success Receipt ────────────────────────────────────────────────────────

function SuccessReceipt({
  problem,
  amount,
  onClose,
}: {
  problem: Problem;
  amount: number;
  onClose: () => void;
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 480 }}
      >
        {/* Icon */}
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #059669, #34d399)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <CheckCircle2 size={30} color="#fff" />
        </div>

        <h2 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: 8 }}>
          CSR Grant Authorized!
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', marginBottom: 18 }}>
          Your grant pledge has been recorded successfully.
        </p>

        {/* Receipt */}
        <div
          style={{
            padding: '16px 18px',
            background: 'var(--color-surface-alt)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'left',
            marginBottom: 20,
          }}
        >
          <ReceiptRow label="Problem ID" value={problem.id} />
          <ReceiptRow label="Problem" value={problem.title} />
          <ReceiptRow label="District" value={problem.district} />
          <ReceiptRow label="University" value={problem.targetUniversity} />
          <ReceiptRow label="Sponsor" value={SPONSOR_ID} />
          <ReceiptRow
            label="Grant Amount"
            value={`₹${amount.toLocaleString('en-IN')}`}
            highlight
          />
          <ReceiptRow label="Status" value="Industry Pledged ✓" highlight />
        </div>

        {/* Section 135 badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(124, 58, 237, 0.08)',
            color: '#7c3aed',
            fontSize: '0.75rem',
            fontWeight: 700,
            marginBottom: 20,
          }}
        >
          <ShieldCheck size={13} /> Section 135 Compliant
        </div>

        <button
          className="btn btn-primary"
          onClick={onClose}
          style={{ width: '100%' }}
        >
          <X size={16} /> Close
        </button>
      </div>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function ReceiptRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '6px 0',
        borderBottom: '1px solid var(--color-border)',
        fontSize: '0.82rem',
      }}
    >
      <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>{label}</span>
      <span
        style={{
          fontWeight: highlight ? 800 : 600,
          color: highlight ? '#059669' : 'var(--color-text)',
          textAlign: 'right',
          maxWidth: '60%',
        }}
      >
        {value}
      </span>
    </div>
  );
}

function formatINR(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} Lakh`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}
