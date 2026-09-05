'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import { useNotifications } from '@/lib/notifications';
import { classifyProblem } from '@/lib/ai-engine';
import type { Problem, Comment } from '@/lib/types';
import { CORPORATE_SPONSORS } from '@/lib/types';
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
  MessageCircle,
  Send,
  CheckSquare,
  Image as ImageIcon,
  Building2,
} from 'lucide-react';

// ─── Jharkhand Nodal Universities ───────────────────────────────────────────

export const JHARKHAND_HEIS = [
  { id: 'all', name: 'All Higher Education Institutions (Statewide)', short: 'All HEIs', dept: 'Statewide Academic R&D Consortium' },
  { id: 'IIT (ISM) Dhanbad', name: 'IIT (ISM) Dhanbad', short: 'IIT ISM', dept: 'Dept. of Environmental Science & Mining Tech' },
  { id: 'NIT Jamshedpur', name: 'NIT Jamshedpur', short: 'NIT Jamshedpur', dept: 'Dept. of Civil & Water Resources Engineering' },
  { id: 'Birsa Agricultural University, Ranchi', name: 'Birsa Agricultural University (BAU), Ranchi', short: 'BAU Ranchi', dept: 'Faculty of Agriculture & Agro-Technology' },
  { id: 'BIT Mesra, Ranchi', name: 'BIT Mesra, Ranchi', short: 'BIT Mesra', dept: 'Dept. of Civil Engineering & Rural Infrastructure' },
  { id: 'RIMS Ranchi', name: 'RIMS Ranchi', short: 'RIMS Ranchi', dept: 'Dept. of Community Medicine & Public Health' },
  { id: 'Kolhan University, Chaibasa', name: 'Kolhan University, Chaibasa', short: 'Kolhan Univ', dept: 'Faculty of Tribal Welfare & Social Sciences' },
  { id: 'Ranchi University', name: 'Ranchi University', short: 'Ranchi Univ', dept: 'Dept. of Public Administration & Urban Studies' },
] as const;

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
  const [selectedUni, setSelectedUni] = useState<string>('all');

  const currentHei = JHARKHAND_HEIS.find((h) => h.id === selectedUni) || JHARKHAND_HEIS[0];

  // Filter problems assigned/routed to this university (or all universities)
  const inbox = useMemo(
    () =>
      problems.filter(
        (p) =>
          (selectedUni === 'all' || p.targetUniversity === selectedUni) &&
          (p.status === 'Submitted' || p.status === 'Routed_To_HEI')
      ),
    [problems, selectedUni]
  );

  const adopted = useMemo(
    () =>
      problems.filter(
        (p) =>
          (selectedUni === 'all' || p.targetUniversity === selectedUni) &&
          (p.status === 'In_Proposal' || p.status === 'Industry_Pledged' || p.status === 'Pilot_Deployed')
      ),
    [problems, selectedUni]
  );

  // Detail drawer
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  // Adopt form modal
  const [adoptTarget, setAdoptTarget] = useState<Problem | null>(null);
  // Success state
  const [successId, setSuccessId] = useState<string | null>(null);

  const { addNotification } = useNotifications();

  return (
    <div className="page-container" style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 20px 60px' }}>
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="animate-fade-in-up" style={{ marginBottom: 28 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 6,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
                flexShrink: 0,
              }}
            >
              <GraduationCap size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.2 }}>
                University Workspace
              </h1>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                {currentHei.name} — {currentHei.dept}
              </p>
            </div>
          </div>

          {/* Institution Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--color-surface)', padding: '6px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <GraduationCap size={15} color="#7c3aed" /> Switch HEI:
            </label>
            <select
              className="input-field"
              value={selectedUni}
              onChange={(e) => setSelectedUni(e.target.value)}
              style={{ padding: '6px 12px', fontSize: '0.82rem', fontWeight: 600, border: 'none', background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-sm)' }}
            >
              {JHARKHAND_HEIS.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
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
            const adoptingUni = selectedUni === 'all' ? (adoptTarget.targetUniversity || 'NIT Jamshedpur') : selectedUni;
            updateProblem(adoptTarget.id, {
              status: 'In_Proposal',
              targetUniversity: adoptingUni,
              assignedTeam: data.teamSummary,
              fundingAmount: data.funding,
              milestones: data.milestones,
              preferredSponsor: data.preferredSponsor,
            });
            setAdoptTarget(null);
            setSuccessId(adoptTarget.id);

            // Fire notifications
            addNotification(
              `Problem "${adoptTarget.title}" adopted by ${adoptingUni}. Team: ${data.teamSummary}. Now In Proposal.`,
              'citizen',
              adoptTarget.id
            );
            addNotification(
              `${adoptingUni} has adopted challenge ${adoptTarget.id}. Seeking industry partnerships.`,
              'industry',
              adoptTarget.id
            );
            addNotification(
              `HEI adoption: ${adoptTarget.id} picked up by ${adoptingUni}. Status → In Proposal.`,
              'government',
              adoptTarget.id
            );
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
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#7c3aed', fontWeight: 600 }}>
            <GraduationCap size={12} /> {problem.targetUniversity || 'Unassigned HEI'}
          </span>
          {adopted && problem.assignedTeam && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--color-primary)' }}>
              <Users size={12} /> {problem.assignedTeam}
            </span>
          )}
          {adopted && problem.milestones && problem.milestones.length > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#16a34a', fontWeight: 600 }}>
              <CheckSquare size={12} />
              {problem.milestones.filter((m) => m.completed).length}/{problem.milestones.length} Milestones
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
  const { updateProblem } = useStore();
  const { addNotification } = useNotifications();
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

          {/* Citizen Media Evidence */}
          {problem.mediaUrl ? (
            <div
              style={{
                marginTop: 16,
                padding: '12px 14px',
                background: 'var(--color-surface-alt)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted)',
                  letterSpacing: '0.04em',
                  marginBottom: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <ImageIcon size={13} /> Citizen Evidence Photo
              </div>
              <img
                src={problem.mediaUrl}
                alt="Citizen evidence"
                style={{
                  maxHeight: 220,
                  maxWidth: '100%',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                }}
              />
            </div>
          ) : (
            <div
              style={{
                marginTop: 16,
                padding: '14px',
                background: 'var(--color-surface-alt)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                color: 'var(--color-text-muted)',
                fontSize: '0.8rem',
              }}
            >
              📷 No citizen photo attached
            </div>
          )}

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

          {/* Project Milestones Roadmap */}
          {problem.milestones && problem.milestones.length > 0 && (
            <div
              style={{
                marginTop: 18,
                padding: '16px',
                background: 'rgba(124, 58, 237, 0.04)',
                border: '1px solid rgba(124, 58, 237, 0.15)',
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
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckSquare size={13} /> Project Milestones & Progress
                </span>
                <span style={{ fontSize: '0.72rem', color: '#7c3aed', fontWeight: 600 }}>
                  {problem.milestones.filter((m) => m.completed).length} of {problem.milestones.length} Completed
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {problem.milestones.map((m, idx) => (
                  <label
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: m.completed ? 'rgba(34, 197, 94, 0.08)' : 'var(--color-surface)',
                      border: `1px solid ${m.completed ? 'rgba(34, 197, 94, 0.3)' : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input
                        type="checkbox"
                        checked={m.completed}
                        onChange={() => {
                          const updated = problem.milestones!.map((item, i) =>
                            i === idx ? { ...item, completed: !item.completed } : item
                          );
                          updateProblem(problem.id, { milestones: updated });
                          if (!m.completed) {
                            addNotification(
                              `Milestone "${m.label}" completed by ${problem.targetUniversity || 'HEI Team'} for ${problem.id}!`,
                              'citizen',
                              problem.id
                            );
                            addNotification(
                              `Milestone reached on ${problem.id}: "${m.label}" marked complete.`,
                              'government',
                              problem.id
                            );
                            addNotification(
                              `Research milestone reached: "${m.label}" completed for ${problem.id}.`,
                              'industry',
                              problem.id
                            );
                          }
                        }}
                        style={{ cursor: 'pointer', accentColor: '#7c3aed', width: 16, height: 16 }}
                      />
                      <span
                        style={{
                          fontSize: '0.82rem',
                          fontWeight: m.completed ? 600 : 500,
                          color: m.completed ? '#16a34a' : 'var(--color-text)',
                          textDecoration: m.completed ? 'line-through' : 'none',
                        }}
                      >
                        {m.label}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                      Target: {m.targetDate}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

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

          {/* Comment Thread */}
          <CommentThread problem={problem} />
        </div>
      </div>
    </div>
  );
}

// ─── Comment Thread Component ───────────────────────────────────────────────

function CommentThread({ problem }: { problem: Problem }) {
  const { updateProblem } = useStore();
  const [newComment, setNewComment] = useState('');

  const comments = problem.comments || [];

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: `cmt-${Date.now()}`,
      author: `${problem.targetUniversity || 'University'} Research Team`,
      role: 'university',
      text: newComment.trim(),
      timestamp: new Date().toISOString(),
    };
    updateProblem(problem.id, {
      comments: [...comments, comment],
    });
    setNewComment('');
  };

  const ROLE_COLORS: Record<string, string> = {
    citizen: '#3b82f6',
    university: '#7c3aed',
    industry: '#0ea5e9',
    government: '#059669',
    admin: '#059669',
  };

  return (
    <div style={{ marginTop: 24 }}>
      <div
        style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          color: 'var(--color-text-muted)',
          letterSpacing: '0.04em',
          marginBottom: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <MessageCircle size={13} /> Stakeholder Discussion ({comments.length})
      </div>

      {comments.length === 0 && (
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
          No comments yet. Start the discussion.
        </p>
      )}

      {comments.map((c) => (
        <div
          key={c.id}
          style={{
            padding: '10px 12px',
            borderLeft: `3px solid ${ROLE_COLORS[c.role] || '#888'}`,
            background: 'var(--color-surface-alt)',
            borderRadius: '0 var(--radius-sm, 6px) var(--radius-sm, 6px) 0',
            marginBottom: 8,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: ROLE_COLORS[c.role] }}>
              {c.author}
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
              {new Date(c.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', lineHeight: 1.5, color: 'var(--color-text)', margin: 0 }}>
            {c.text}
          </p>
        </div>
      ))}

      {/* Add comment */}
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <input
          className="input-field"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(); }}
          style={{ flex: 1, fontSize: '0.82rem' }}
        />
        <button
          className="btn btn-primary"
          onClick={handleAddComment}
          style={{ padding: '8px 14px', flexShrink: 0 }}
          disabled={!newComment.trim()}
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Adopt Modal ────────────────────────────────────────────────────────────

interface AdoptFormData {
  teamSummary: string;
  funding: number;
  milestones: { label: string; targetDate: string; completed: boolean }[];
  preferredSponsor?: string;
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
  const [studentLead1, setStudentLead1] = useState('');
  const [studentLead1Branch, setStudentLead1Branch] = useState('');
  const [studentLead2, setStudentLead2] = useState('');
  const [studentLead2Branch, setStudentLead2Branch] = useState('');
  const [studentLead3, setStudentLead3] = useState('');
  const [studentLead3Branch, setStudentLead3Branch] = useState('');
  const [facultyMentor, setFacultyMentor] = useState('');

  const [proposalTitle, setProposalTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [milestone1, setMilestone1] = useState('');
  const [milestone2, setMilestone2] = useState('');
  const [milestone3, setMilestone3] = useState('');
  const [funding, setFunding] = useState('350000');
  const [preferredSponsor, setPreferredSponsor] = useState(
    problem.preferredSponsor || 'Open to All Corporate Sponsors (Consortium)'
  );

  const handleAutofillSuggested = useCallback(() => {
    if (problem.category === 'Water') {
      setStudentLead1('Pooja Kumari');
      setStudentLead1Branch('Civil & Water Resources Engineering');
      setStudentLead2('Aman Gupta');
      setStudentLead2Branch('Environmental Engineering');
      setFacultyMentor('Dr. S. K. Mukherjee (Dept. of Civil Engineering)');
      setProposalTitle(`CleanWater Pilot: Modular Bio-Sand Filtration for ${problem.district}`);
      setAbstract('Design and field-testing of low-cost gravity filtration units with activated alumina to neutralize toxic contaminants in community drinking water sources.');
      setMilestone1('Groundwater sampling & contaminant profiling in affected wards');
      setMilestone2('Fabrication and lab certification of modular filtration prototype');
      setMilestone3('Field deployment of community filtration unit and local operator training');
      setFunding('380000');
      setPreferredSponsor('Tata Steel CSR Foundation');
    } else if (problem.category === 'Mining/Env') {
      setStudentLead1('Rohit Pandey');
      setStudentLead1Branch('Mining Engineering');
      setStudentLead2('Sneha Roy');
      setStudentLead2Branch('Environmental Science & Engineering');
      setFacultyMentor('Dr. A. K. Sharma (Dept. of Mining Tech)');
      setProposalTitle(`IoT-Based Real-Time Air Quality & Dust Suppression Grid`);
      setAbstract('Low-cost particulate optical sensor network with automated mist cannon triggers deployed across mine perimeter colonies.');
      setMilestone1('Baseline emission audit and wireless sensor grid layout');
      setMilestone2('IoT sensor network calibration & telemetric cloud gateway');
      setMilestone3('On-site deployment of dust suppression actuators and public dashboard');
      setFunding('450000');
      setPreferredSponsor('Central Coalfields Ltd (CCL) CSR');
    } else if (problem.category === 'Agriculture') {
      setStudentLead1('Karan Mahato');
      setStudentLead1Branch('Agronomy & Soil Sciences');
      setStudentLead2('Anita Soren');
      setStudentLead2Branch('Agricultural Engineering');
      setFacultyMentor('Dr. B. P. Singh (Dept. of Crop Sciences)');
      setProposalTitle(`Drought-Resilient Millet Cultivars & Gravity Micro-Drip System`);
      setAbstract('Participatory distribution of drought-tolerant finger millet seeds coupled with low-pressure gravity drip kits for smallholders.');
      setMilestone1('Soil moisture profiling and farmer seed trials');
      setMilestone2('Fabrication and demonstration of micro-drip kits');
      setMilestone3('Harvest yield evaluation and community farmer training');
      setFunding('290000');
      setPreferredSponsor('Usha Martin Foundation');
    } else {
      setStudentLead1('Vikramaditya Sen');
      setStudentLead1Branch('Applied Engineering & Tech');
      setStudentLead2('Ritu Sharma');
      setStudentLead2Branch('Computer Science & Systems');
      setFacultyMentor('Prof. R. N. Verma (Nodal HEI Mentor)');
      setProposalTitle(`Applied Research Solution & Community Pilot for ${problem.title}`);
      setAbstract(`Interdisciplinary applied engineering blueprint to engineer and deploy a practical, low-cost community solution for ${problem.district}.`);
      setMilestone1('Field stakeholder assessment & technical specification');
      setMilestone2('Modular prototype fabrication & bench testing');
      setMilestone3('Field pilot deployment & community impact report');
      setFunding('320000');
      setPreferredSponsor('Open to All Corporate Sponsors (Consortium)');
    }
  }, [problem]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const members = [studentLead1, studentLead2, studentLead3].filter(Boolean).join(', ');
      const teamSummary = `${members} | Mentor: ${facultyMentor}`;
      const now = new Date();
      const userMilestones = [
        milestone1.trim() ? { label: milestone1.trim(), targetDate: new Date(now.getTime() + 60 * 24 * 3600 * 1000).toISOString().slice(0, 10), completed: false } : null,
        milestone2.trim() ? { label: milestone2.trim(), targetDate: new Date(now.getTime() + 120 * 24 * 3600 * 1000).toISOString().slice(0, 10), completed: false } : null,
        milestone3.trim() ? { label: milestone3.trim(), targetDate: new Date(now.getTime() + 180 * 24 * 3600 * 1000).toISOString().slice(0, 10), completed: false } : null,
      ].filter(Boolean) as { label: string; targetDate: string; completed: boolean }[];

      const milestones = userMilestones.length > 0 ? userMilestones : [
        { label: 'Technical feasibility survey & baseline audit', targetDate: new Date(now.getTime() + 60 * 24 * 3600 * 1000).toISOString().slice(0, 10), completed: false },
        { label: 'Prototype development & lab evaluation', targetDate: new Date(now.getTime() + 120 * 24 * 3600 * 1000).toISOString().slice(0, 10), completed: false },
        { label: 'Community pilot deployment & handover', targetDate: new Date(now.getTime() + 180 * 24 * 3600 * 1000).toISOString().slice(0, 10), completed: false },
      ];

      onSubmit({ teamSummary, funding: Number(funding) || 350000, milestones, preferredSponsor });
    },
    [studentLead1, studentLead2, studentLead3, facultyMentor, funding, milestone1, milestone2, milestone3, preferredSponsor, onSubmit]
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
          {/* Quick autofill helper */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
              padding: '10px 14px',
              background: 'rgba(124, 58, 237, 0.05)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(124, 58, 237, 0.15)',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text)' }}>
              <strong>Customizable Proposal:</strong> Form your own student team & milestones, or auto-fill category suggestions.
            </div>
            <button
              type="button"
              onClick={handleAutofillSuggested}
              style={{
                background: '#7c3aed',
                color: '#fff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm, 6px)',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                flexShrink: 0,
                boxShadow: '0 2px 6px rgba(124, 58, 237, 0.3)',
              }}
              title="Auto-fill with relevant department and category data"
            >
              <Sparkles size={13} /> ⚡ Auto-fill Suggested
            </button>
          </div>

          {/* ── Team Section ──────────────────────────────────────── */}
          <div style={{ marginBottom: 24 }}>
            <FormSectionTitle icon={<Users size={15} />} title="Research Team" />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="form-label">Student Lead 1 *</label>
                <input
                  className="input-field"
                  placeholder="e.g., Ananya Verma"
                  value={studentLead1}
                  onChange={(e) => setStudentLead1(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="form-label">Branch / Specialization *</label>
                <input
                  className="input-field"
                  placeholder="e.g., Civil / Environmental Eng."
                  value={studentLead1Branch}
                  onChange={(e) => setStudentLead1Branch(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="form-label">Student Lead 2 (Optional)</label>
                <input
                  className="input-field"
                  placeholder="e.g., Rahul Mahato"
                  value={studentLead2}
                  onChange={(e) => setStudentLead2(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Branch (Optional)</label>
                <input
                  className="input-field"
                  placeholder="e.g., Chemical / Mechanical Eng."
                  value={studentLead2Branch}
                  onChange={(e) => setStudentLead2Branch(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Student Lead 3 (Optional)</label>
                <input
                  className="input-field"
                  placeholder="e.g., Priya Kumari"
                  value={studentLead3}
                  onChange={(e) => setStudentLead3(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Branch (Optional)</label>
                <input
                  className="input-field"
                  placeholder="e.g., Computer Science & Eng."
                  value={studentLead3Branch}
                  onChange={(e) => setStudentLead3Branch(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <label className="form-label">Faculty Mentor / Principal Investigator *</label>
              <input
                className="input-field"
                placeholder="e.g., Dr. S. K. Mukherjee (Associate Professor)"
                value={facultyMentor}
                onChange={(e) => setFacultyMentor(e.target.value)}
                required
              />
            </div>
          </div>

          {/* ── Proposal Section ──────────────────────────────────── */}
          <div style={{ marginBottom: 24 }}>
            <FormSectionTitle icon={<BookOpen size={15} />} title="Solution Proposal" />

            <div style={{ marginBottom: 12 }}>
              <label className="form-label">Proposal Title *</label>
              <input
                className="input-field"
                placeholder="e.g., Rapid Field Filtration & Heavy Metal Removal Unit"
                value={proposalTitle}
                onChange={(e) => setProposalTitle(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label className="form-label">Abstract *</label>
              <textarea
                className="input-field"
                placeholder="Describe your proposed solution approach, methodology, and expected community impact…"
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
              { label: 'Milestone 1 (Month 1–2)', value: milestone1, set: setMilestone1, ph: 'e.g., Baseline field assessment & contaminant sampling' },
              { label: 'Milestone 2 (Month 3–4)', value: milestone2, set: setMilestone2, ph: 'e.g., Prototype fabrication & lab validation' },
              { label: 'Milestone 3 (Month 5–6)', value: milestone3, set: setMilestone3, ph: 'e.g., Community pilot deployment & training' },
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
                  <input
                    className="input-field"
                    placeholder={m.ph}
                    value={m.value}
                    onChange={(e) => m.set(e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* ── Target / Preferred CSR Sponsor ───────────────────── */}
          <div style={{ marginBottom: 24 }}>
            <FormSectionTitle icon={<Building2 size={15} />} title="Target / Preferred CSR Sponsor" />

            <div style={{ marginBottom: 8 }}>
              <label className="form-label">Preferred Corporate Partner (Open to all by default)</label>
              <select
                className="input-field"
                value={preferredSponsor}
                onChange={(e) => setPreferredSponsor(e.target.value)}
                style={{ fontWeight: 600 }}
              >
                {CORPORATE_SPONSORS.map((sp) => (
                  <option key={sp} value={sp}>
                    {sp}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
              💡 <strong>Open Consortium Model:</strong> All proposals are published to the statewide Corporate CSR Innovation Network. Even if a preferred sponsor is targeted, any registered industry partner (Tata Steel, CCL, Adani, Usha Martin, Vedanta, etc.) can review and sanction the grant.
            </div>
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
