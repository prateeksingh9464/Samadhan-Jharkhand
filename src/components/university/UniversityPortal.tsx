'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import { classifyProblem } from '@/lib/ai-engine';
import type { Problem } from '@/lib/types';
import {
  GraduationCap,
  MapPin,
  AlertTriangle,
  Clock,
  ChevronRight,
  X,
  Users,
  BookOpen,
  Target,
  CheckCircle2,
  FileText,
  Sparkles,
  IndianRupee,
  Beaker,
  Tag,
} from 'lucide-react';

// ─── Constants ──────────────────────────────────────────────────────────────

const UNIVERSITY_ID = 'IIT (ISM) Dhanbad';
const DEPARTMENT = 'Dept. of Environmental Science & Engineering';

const STATUS_BADGE: Record<string, { cls: string; label: string }> = {
  Submitted: { cls: 'badge-submitted', label: 'Submitted' },
  Routed_To_HEI: { cls: 'badge-routed', label: 'Routed to HEI' },
  In_Proposal: { cls: 'badge-proposal', label: 'In Proposal' },
  Industry_Pledged: { cls: 'badge-pledged', label: 'Industry Pledged' },
  Pilot_Deployed: { cls: 'badge-deployed', label: 'Pilot Deployed' },
};

const URGENCY_BADGE: Record<string, string> = {
  Critical: 'badge-critical',
  Medium: 'badge-medium',
  Low: 'badge-low',
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function UniversityPortal() {
  const { problems, updateProblem } = useStore();

  // Filter problems assigned/routed to this university
  const inbox = useMemo(
    () =>
      problems.filter(
        (p) =>
          p.targetUniversity === UNIVERSITY_ID &&
          (p.status === 'Submitted' || p.status === 'Routed_To_HEI')
      ),
    [problems]
  );

  const adopted = useMemo(
    () =>
      problems.filter(
        (p) =>
          p.targetUniversity === UNIVERSITY_ID &&
          (p.status === 'In_Proposal' || p.status === 'Industry_Pledged' || p.status === 'Pilot_Deployed')
      ),
    [problems]
  );

  // Detail drawer
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  // Adopt form modal
  const [adoptTarget, setAdoptTarget] = useState<Problem | null>(null);
  // Success state
  const [successId, setSuccessId] = useState<string | null>(null);

  return (
    <div className="page-container" style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 20px 60px' }}>
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="animate-fade-in-up" style={{ marginBottom: 28 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 6,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <GraduationCap size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.2 }}>
              University Workspace
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
              {UNIVERSITY_ID} — {DEPARTMENT}
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats Row ────────────────────────────────────────────── */}
      <div
        className="university-stat-grid animate-fade-in-up"
        style={{
          marginBottom: 28,
          animationDelay: '0.05s',
        }}
      >
        <StatCard
          label="Incoming Challenges"
          value={inbox.length}
          color="#7c3aed"
          icon={<AlertTriangle size={18} />}
        />
        <StatCard
          label="Proposals Submitted"
          value={adopted.filter((p) => p.status === 'In_Proposal').length}
          color="#0f766e"
          icon={<FileText size={18} />}
        />
        <StatCard
          label="Funded / Deployed"
          value={adopted.filter((p) => p.status === 'Industry_Pledged' || p.status === 'Pilot_Deployed').length}
          color="#d97706"
          icon={<CheckCircle2 size={18} />}
        />
      </div>

      {/* ── Inbox ────────────────────────────────────────────────── */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <SectionHeader
          title="Challenge Inbox"
          subtitle="Problems routed to your institution for research adoption"
          count={inbox.length}
        />

        {inbox.length === 0 ? (
          <EmptyState message="No new challenges in the inbox. All caught up!" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {inbox.map((p) => (
              <ProblemRow
                key={p.id}
                problem={p}
                onView={() => setSelectedProblem(p)}
                onAdopt={() => setAdoptTarget(p)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Adopted / In-Progress ────────────────────────────────── */}
      {adopted.length > 0 && (
        <div className="animate-fade-in-up" style={{ marginTop: 36, animationDelay: '0.15s' }}>
          <SectionHeader
            title="Adopted Challenges"
            subtitle="Problems your teams are actively working on"
            count={adopted.length}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {adopted.map((p) => (
              <ProblemRow
                key={p.id}
                problem={p}
                onView={() => setSelectedProblem(p)}
                adopted
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Detail Drawer ────────────────────────────────────────── */}
      {selectedProblem && (
        <DetailDrawer
          problem={selectedProblem}
          onClose={() => setSelectedProblem(null)}
          onAdopt={() => {
            setSelectedProblem(null);
            setAdoptTarget(selectedProblem);
          }}
        />
      )}

      {/* ── Adopt Form Modal ─────────────────────────────────────── */}
      {adoptTarget && (
        <AdoptModal
          problem={adoptTarget}
          onClose={() => setAdoptTarget(null)}
          onSubmit={(data) => {
            updateProblem(adoptTarget.id, {
              status: 'In_Proposal',
              assignedTeam: data.teamSummary,
              fundingAmount: data.funding,
            });
            setAdoptTarget(null);
            setSuccessId(adoptTarget.id);
          }}
        />
      )}

      {/* ── Success Toast ────────────────────────────────────────── */}
      {successId && (
        <SuccessToast
          problemId={successId}
          onClose={() => setSuccessId(null)}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

// ─── Stat Card ──────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="glass-card"
      style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 14 }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 'var(--radius-md)',
          background: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color, lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
          {label}
        </div>
      </div>
    </div>
  );
}

// ─── Section Header ─────────────────────────────────────────────────────────

function SectionHeader({
  title,
  subtitle,
  count,
}: {
  title: string;
  subtitle: string;
  count: number;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{title}</h2>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: 'var(--color-primary)',
            color: '#fff',
            fontSize: '0.72rem',
            fontWeight: 700,
          }}
        >
          {count}
        </span>
      </div>
      <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{subtitle}</p>
    </div>
  );
}

// ─── Empty State ────────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div
      className="glass-card"
      style={{
        padding: '40px 24px',
        textAlign: 'center',
        color: 'var(--color-text-muted)',
        fontSize: '0.9rem',
      }}
    >
      <Sparkles size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
      <p>{message}</p>
    </div>
  );
}

// ─── Problem Row Card ───────────────────────────────────────────────────────

function ProblemRow({
  problem,
  onView,
  onAdopt,
  adopted,
}: {
  problem: Problem;
  onView: () => void;
  onAdopt?: () => void;
  adopted?: boolean;
}) {
  const sb = STATUS_BADGE[problem.status] || STATUS_BADGE.Submitted;
  const ub = URGENCY_BADGE[problem.urgency] || 'badge-low';
  const date = new Date(problem.submittedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div
      className="glass-card"
      style={{
        padding: '18px 22px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        cursor: 'pointer',
        transition: 'all var(--transition-base)',
      }}
      onClick={onView}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-lg)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      {/* Left color stripe */}
      <div
        style={{
          width: 4,
          height: 48,
          borderRadius: 2,
          background:
            problem.urgency === 'Critical'
              ? '#ef4444'
              : problem.urgency === 'Medium'
              ? '#f59e0b'
              : '#22c55e',
          flexShrink: 0,
        }}
      />

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span
            style={{
              fontSize: '0.7rem',
              fontFamily: 'monospace',
              color: 'var(--color-text-muted)',
            }}
          >
            {problem.id}
          </span>
          <span className={`badge ${sb.cls}`}>{sb.label}</span>
          <span className={`badge ${ub}`}>{problem.urgency}</span>
        </div>
        <h3
          style={{
            fontSize: '0.95rem',
            fontWeight: 700,
            marginBottom: 4,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {problem.title}
        </h3>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            fontSize: '0.78rem',
            color: 'var(--color-text-muted)',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <MapPin size={12} /> {problem.district}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Tag size={12} /> {problem.category}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Clock size={12} /> {date}
          </span>
          {adopted && problem.assignedTeam && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--color-primary)' }}>
              <Users size={12} /> {problem.assignedTeam}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {!adopted && onAdopt && (
          <button
            className="btn btn-primary"
            style={{ fontSize: '0.78rem', padding: '7px 14px' }}
            onClick={(e) => {
              e.stopPropagation();
              onAdopt();
            }}
          >
            <Beaker size={14} /> Adopt
          </button>
        )}
        <ChevronRight size={18} style={{ color: 'var(--color-text-muted)' }} />
      </div>
    </div>
  );
}

// ─── Detail Drawer ──────────────────────────────────────────────────────────

function DetailDrawer({
  problem,
  onClose,
  onAdopt,
}: {
  problem: Problem;
  onClose: () => void;
  onAdopt: () => void;
}) {
  const triage = classifyProblem(problem.title, problem.description);
  const sb = STATUS_BADGE[problem.status] || STATUS_BADGE.Submitted;
  const canAdopt = problem.status === 'Submitted' || problem.status === 'Routed_To_HEI';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          maxWidth: 600,
          width: '92%',
          maxHeight: '85vh',
          overflow: 'auto',
          boxShadow: 'var(--shadow-lg)',
          animation: 'fadeInUp 0.3s ease-out',
        }}
      >
        {/* Header bar */}
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
            <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>
              {problem.id}
            </span>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.3 }}>
              {problem.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 6,
              color: 'var(--color-text-muted)',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px' }}>
          {/* Badges */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <span className={`badge ${sb.cls}`}>{sb.label}</span>
            <span className={`badge ${URGENCY_BADGE[problem.urgency]}`}>{problem.urgency}</span>
            <span className="badge badge-deployed">{problem.category}</span>
          </div>

          {/* District & Geo */}
          <InfoRow icon={<MapPin size={14} />} label="District" value={problem.district} />
          {problem.geoCoords && (
            <InfoRow
              icon={<Target size={14} />}
              label="GPS"
              value={`${problem.geoCoords.lat.toFixed(4)}°N, ${problem.geoCoords.lng.toFixed(4)}°E`}
            />
          )}
          <InfoRow
            icon={<Clock size={14} />}
            label="Submitted"
            value={new Date(problem.submittedAt).toLocaleString('en-IN')}
          />

          {/* Description */}
          <div style={{ marginTop: 18 }}>
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--color-text-muted)',
                letterSpacing: '0.04em',
                marginBottom: 6,
              }}
            >
              Citizen Description
            </div>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.7, color: 'var(--color-text)' }}>
              {problem.description}
            </p>
          </div>

          {/* Media placeholder */}
          <div
            style={{
              marginTop: 16,
              padding: '20px',
              background: 'var(--color-surface-alt)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
              color: 'var(--color-text-muted)',
              fontSize: '0.82rem',
            }}
          >
            📷 Citizen-uploaded media would appear here
          </div>

          {/* AI Triage Notes */}
          <div
            style={{
              marginTop: 18,
              padding: '16px',
              background: 'rgba(124, 58, 237, 0.05)',
              border: '1px solid rgba(124, 58, 237, 0.12)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: '#7c3aed',
                letterSpacing: '0.04em',
                marginBottom: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Sparkles size={13} /> AI Triage Analysis
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <MiniField label="Domain" value={triage.domain} />
              <MiniField label="Urgency Score" value={`${triage.urgencyScore}/10`} />
              <MiniField label="Target University" value={triage.targetUniversity} />
              <MiniField label="Department" value={triage.suggestedDepartment} />
            </div>
            <div style={{ marginTop: 10 }}>
              <MiniField label="NEP 2020 Alignment" value={triage.nepAlignmentNote} />
            </div>
          </div>

          {/* Adopt button */}
          {canAdopt && (
            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 20 }}
              onClick={onAdopt}
            >
              <Beaker size={16} /> Adopt Challenge & Form Team
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Adopt Modal ────────────────────────────────────────────────────────────

interface AdoptFormData {
  teamSummary: string;
  funding: number;
}

function AdoptModal({
  problem,
  onClose,
  onSubmit,
}: {
  problem: Problem;
  onClose: () => void;
  onSubmit: (data: AdoptFormData) => void;
}) {
  const [studentLead1, setStudentLead1] = useState('Ananya Verma');
  const [studentLead1Branch, setStudentLead1Branch] = useState('Environmental Engineering');
  const [studentLead2, setStudentLead2] = useState('Rahul Mahato');
  const [studentLead2Branch, setStudentLead2Branch] = useState('Mining Engineering');
  const [studentLead3, setStudentLead3] = useState('');
  const [studentLead3Branch, setStudentLead3Branch] = useState('');
  const [facultyMentor, setFacultyMentor] = useState('Dr. K. N. Singh');

  const [proposalTitle, setProposalTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [milestone1, setMilestone1] = useState('Literature review & field survey');
  const [milestone2, setMilestone2] = useState('Prototype development & lab testing');
  const [milestone3, setMilestone3] = useState('Community pilot deployment & evaluation');
  const [funding, setFunding] = useState('280000');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const members = [studentLead1, studentLead2, studentLead3].filter(Boolean).join(', ');
      const teamSummary = `${members} | Mentor: ${facultyMentor}`;
      onSubmit({ teamSummary, funding: Number(funding) || 280000 });
    },
    [studentLead1, studentLead2, studentLead3, facultyMentor, funding, onSubmit]
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          maxWidth: 640,
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
              <Beaker size={16} color="#7c3aed" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#7c3aed' }}>
                Adopt Challenge & Form Team
              </span>
            </div>
            <p
              style={{
                fontSize: '0.78rem',
                color: 'var(--color-text-muted)',
                maxWidth: 400,
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

        <form onSubmit={handleSubmit} style={{ padding: '20px 24px' }}>
          {/* ── Team Section ──────────────────────────────────────── */}
          <div style={{ marginBottom: 24 }}>
            <FormSectionTitle icon={<Users size={15} />} title="Research Team" />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="form-label">Student Lead 1</label>
                <input className="input-field" value={studentLead1} onChange={(e) => setStudentLead1(e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Branch</label>
                <input className="input-field" value={studentLead1Branch} onChange={(e) => setStudentLead1Branch(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Student Lead 2</label>
                <input className="input-field" value={studentLead2} onChange={(e) => setStudentLead2(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Branch</label>
                <input className="input-field" value={studentLead2Branch} onChange={(e) => setStudentLead2Branch(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Student Lead 3 (Optional)</label>
                <input className="input-field" placeholder="Name" value={studentLead3} onChange={(e) => setStudentLead3(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Branch</label>
                <input className="input-field" placeholder="Branch" value={studentLead3Branch} onChange={(e) => setStudentLead3Branch(e.target.value)} />
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <label className="form-label">Faculty Mentor</label>
              <input className="input-field" value={facultyMentor} onChange={(e) => setFacultyMentor(e.target.value)} required />
            </div>
          </div>

          {/* ── Proposal Section ──────────────────────────────────── */}
          <div style={{ marginBottom: 24 }}>
            <FormSectionTitle icon={<BookOpen size={15} />} title="Solution Proposal" />

            <div style={{ marginBottom: 12 }}>
              <label className="form-label">Proposal Title</label>
              <input
                className="input-field"
                placeholder="e.g., IoT-Based Real-Time Air Quality Monitoring Network for Jharia Coalfields"
                value={proposalTitle}
                onChange={(e) => setProposalTitle(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label className="form-label">Abstract</label>
              <textarea
                className="input-field"
                placeholder="Describe your proposed solution approach, methodology, and expected impact…"
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                rows={3}
                required
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* NEP 2020 note */}
            <div
              style={{
                padding: '10px 14px',
                background: 'rgba(20, 184, 166, 0.06)',
                border: '1px solid rgba(20, 184, 166, 0.15)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.78rem',
                color: 'var(--color-primary)',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
              }}
            >
              <GraduationCap size={14} style={{ marginTop: 2, flexShrink: 0 }} />
              <span>
                <strong>NEP 2020 Capstone Alignment:</strong> This proposal qualifies as a
                multidisciplinary capstone project under NEP 2020 guidelines, combining
                community engagement with applied research.
              </span>
            </div>
          </div>

          {/* ── Milestones ────────────────────────────────────────── */}
          <div style={{ marginBottom: 24 }}>
            <FormSectionTitle icon={<Target size={15} />} title="Execution Milestones" />

            {[
              { label: 'Milestone 1 (Month 1–2)', value: milestone1, set: setMilestone1 },
              { label: 'Milestone 2 (Month 3–4)', value: milestone2, set: setMilestone2 },
              { label: 'Milestone 3 (Month 5–6)', value: milestone3, set: setMilestone3 },
            ].map((m, i) => (
              <div key={i} style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: 'var(--color-primary)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label" style={{ marginBottom: 2 }}>{m.label}</label>
                  <input className="input-field" value={m.value} onChange={(e) => m.set(e.target.value)} required />
                </div>
              </div>
            ))}
          </div>

          {/* ── Funding ───────────────────────────────────────────── */}
          <div style={{ marginBottom: 28 }}>
            <FormSectionTitle icon={<IndianRupee size={15} />} title="Pilot Grant Request" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)' }}>₹</span>
              <input
                className="input-field"
                type="number"
                min="10000"
                step="1000"
                value={funding}
                onChange={(e) => setFunding(e.target.value)}
                required
                style={{ maxWidth: 200 }}
              />
              <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                ({formatINR(Number(funding))})
              </span>
            </div>
          </div>

          {/* ── Submit ────────────────────────────────────────────── */}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            <FileText size={16} /> Submit Proposal for Review
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Success Toast ──────────────────────────────────────────────────────────

function SuccessToast({
  problemId,
  onClose,
}: {
  problemId: string;
  onClose: () => void;
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <CheckCircle2 size={28} color="#fff" />
        </div>
        <h2 style={{ fontWeight: 800, fontSize: '1.15rem', marginBottom: 8 }}>
          Proposal Submitted!
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', marginBottom: 6 }}>
          Your research proposal for <strong>{problemId}</strong> has been
          registered. The problem is now marked <strong>In Proposal</strong>.
        </p>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', marginBottom: 20 }}>
          Industry partners can now discover and fund this proposal.
        </p>
        <button className="btn btn-primary" onClick={onClose} style={{ width: '100%' }}>
          <X size={16} /> Close
        </button>
      </div>
    </div>
  );
}

// ─── Tiny Helpers ───────────────────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
        fontSize: '0.84rem',
      }}
    >
      <span style={{ color: 'var(--color-text-muted)' }}>{icon}</span>
      <span style={{ fontWeight: 600, color: 'var(--color-text-muted)', minWidth: 80 }}>
        {label}:
      </span>
      <span style={{ color: 'var(--color-text)' }}>{value}</span>
    </div>
  );
}

function MiniField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: '0.82rem', color: 'var(--color-text)', lineHeight: 1.4 }}>{value}</div>
    </div>
  );
}

function FormSectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
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
      <span style={{ color: 'var(--color-primary)' }}>{icon}</span>
      <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{title}</span>
    </div>
  );
}

function formatINR(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} Lakh`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}
