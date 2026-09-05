'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { useStore } from '@/lib/store';
import type { Problem, ProblemStatus, Category, Urgency } from '@/lib/types';
import { JHARKHAND_DISTRICTS, CATEGORIES } from '@/lib/types';
import {
  Landmark,
  Layers,
  GraduationCap,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  MapPin,
  Tag,
  Clock,
  IndianRupee,
  ShieldCheck,
  ChevronRight,
  X,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Activity,
  FileCheck2,
  Compass,
  SlidersHorizontal,
  Download,
} from 'lucide-react';

// ─── Constants & Metadata ───────────────────────────────────────────────────

const GOV_BRAND = {
  department: 'Department of Higher, Technical Education & Skill Development',
  subtext: 'Statewide Societal Innovation & Higher Education R&D Monitoring Cell',
  state: 'Government of Jharkhand',
};

const STATUS_CONFIG: Record<
  ProblemStatus,
  { label: string; cls: string; step: number; color: string }
> = {
  Submitted: { label: 'Submitted', cls: 'badge-submitted', step: 1, color: '#3b82f6' },
  Routed_To_HEI: { label: 'Routed to HEI', cls: 'badge-routed', step: 2, color: '#f59e0b' },
  In_Proposal: { label: 'In Proposal', cls: 'badge-proposal', step: 3, color: '#8b5cf6' },
  Industry_Pledged: { label: 'Industry Pledged', cls: 'badge-pledged', step: 4, color: '#10b981' },
  Pilot_Deployed: { label: 'Pilot Deployed', cls: 'badge-deployed', step: 5, color: '#06b6d4' },
};

const LIFECYCLE_STEPS: ProblemStatus[] = [
  'Submitted',
  'Routed_To_HEI',
  'In_Proposal',
  'Industry_Pledged',
  'Pilot_Deployed',
];

const URGENCY_BADGE: Record<Urgency, string> = {
  Critical: 'badge-critical',
  Medium: 'badge-medium',
  Low: 'badge-low',
};

// Priority districts for visual breakdown
const KEY_DISTRICTS = [
  'Ranchi',
  'Dhanbad',
  'Hazaribagh',
  'Palamu',
  'Bokaro',
  'East Singhbhum',
  'Khunti',
  'Gumla',
];

// ─── Main Component ─────────────────────────────────────────────────────────

export default function GovDashboard() {
  const { problems, updateProblem } = useStore();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');

  // Modal / Drawer state
  const [auditTarget, setAuditTarget] = useState<Problem | null>(null);
  const [successToast, setSuccessToast] = useState<{ id: string; status: string } | null>(null);

  // ─── 4 Core KPI Metrics ───────────────────────────────────────────────────

  // 1. Total Issues Reported
  const totalIssues = problems.length;

  // 2. Active HEI Research Projects (problems in Routed_To_HEI, In_Proposal, Industry_Pledged, Pilot_Deployed)
  const activeHeiProjects = useMemo(
    () => problems.filter((p) => p.status !== 'Submitted').length,
    [problems]
  );

  // 3. CSR Funds Pledged (in ₹ Lakhs/Crores)
  const totalCsrFunds = useMemo(
    () => problems.reduce((acc, p) => acc + (p.fundingAmount || 0), 0),
    [problems]
  );

  // 4. Deployed Field Pilots
  const deployedPilots = useMemo(
    () => problems.filter((p) => p.status === 'Pilot_Deployed').length,
    [problems]
  );

  // ─── Lifecycle Funnel Breakdown ───────────────────────────────────────────

  const funnelCounts = useMemo(() => {
    const counts: Record<ProblemStatus, number> = {
      Submitted: 0,
      Routed_To_HEI: 0,
      In_Proposal: 0,
      Industry_Pledged: 0,
      Pilot_Deployed: 0,
    };
    problems.forEach((p) => {
      if (counts[p.status] !== undefined) {
        counts[p.status] += 1;
      }
    });
    return counts;
  }, [problems]);

  // ─── District Distribution Breakdown ──────────────────────────────────────

  const districtStats = useMemo(() => {
    return KEY_DISTRICTS.map((dist) => {
      const distProblems = problems.filter((p) => p.district.toLowerCase() === dist.toLowerCase());
      const total = distProblems.length;
      const fundedOrDeployed = distProblems.filter(
        (p) => p.status === 'Industry_Pledged' || p.status === 'Pilot_Deployed'
      ).length;
      const inHei = distProblems.filter(
        (p) => p.status === 'Routed_To_HEI' || p.status === 'In_Proposal'
      ).length;
      const percentage = total > 0 ? Math.round(((fundedOrDeployed + inHei) / total) * 100) : 0;
      return {
        district: dist,
        total,
        fundedOrDeployed,
        inHei,
        percentage,
      };
    });
  }, [problems]);

  // ─── Filtered Master Pipeline Audit List ──────────────────────────────────

  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesId = p.id.toLowerCase().includes(q);
        const matchesDistrict = p.district.toLowerCase().includes(q);
        const matchesUni = p.targetUniversity.toLowerCase().includes(q);
        const matchesTeam = p.assignedTeam.toLowerCase().includes(q);
        const matchesSponsor = p.industrySponsor.toLowerCase().includes(q);
        if (
          !matchesTitle &&
          !matchesId &&
          !matchesDistrict &&
          !matchesUni &&
          !matchesTeam &&
          !matchesSponsor
        ) {
          return false;
        }
      }

      // Status
      if (statusFilter !== 'all' && p.status !== statusFilter) {
        return false;
      }

      // District
      if (districtFilter !== 'all' && p.district !== districtFilter) {
        return false;
      }

      // Category
      if (categoryFilter !== 'all' && p.category !== categoryFilter) {
        return false;
      }

      // Urgency
      if (urgencyFilter !== 'all' && p.urgency !== urgencyFilter) {
        return false;
      }

      return true;
    });
  }, [problems, searchQuery, statusFilter, districtFilter, categoryFilter, urgencyFilter]);

  // Promote problem status handler
  const handlePromoteStatus = useCallback(
    (id: string, newStatus: ProblemStatus) => {
      updateProblem(id, { status: newStatus });
      setAuditTarget((prev) => (prev && prev.id === id ? { ...prev, status: newStatus } : prev));
      setSuccessToast({ id, status: newStatus });
    },
    [updateProblem]
  );

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '28px 20px 80px' }}>
      {/* ─── Header & State Identity ────────────────────────────────────── */}
      <div className="animate-fade-in-up" style={{ marginBottom: 28 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #065f46 0%, #047857 50%, #10b981 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 14px rgba(6, 95, 70, 0.25)',
              }}
            >
              <Landmark size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#047857',
                    background: 'rgba(4, 120, 87, 0.1)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  State Administration
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>•</span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: '#059669',
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: '#10b981',
                      display: 'inline-block',
                      animation: 'pulse-glow 2s infinite',
                    }}
                  />
                  Live Portal Telemetry
                </span>
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.2 }}>
                {GOV_BRAND.state}
              </h1>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                {GOV_BRAND.department}
              </p>
            </div>
          </div>

          {/* Quick Action Badges */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div
              className="glass-card"
              style={{
                padding: '8px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: '0.78rem',
                fontWeight: 600,
              }}
            >
              <ShieldCheck size={16} color="#047857" />
              <span>Section 135 Monitoring Cell</span>
            </div>
            <div
              className="glass-card"
              style={{
                padding: '8px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: '0.78rem',
                fontWeight: 600,
              }}
            >
              <Compass size={16} color="#0284c7" />
              <span>24 Districts Synchronized</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 4 KPI Metric Cards ─────────────────────────────────────────── */}
      <div
        className="animate-fade-in-up"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
          marginBottom: 28,
          animationDelay: '0.05s',
        }}
      >
        {/* KPI 1 */}
        <GovKpiCard
          label="Total Issues Reported"
          value={totalIssues.toString()}
          subtext="Citizen grievances & grassroots challenges"
          icon={<AlertTriangle size={22} />}
          badge="+14% this month"
          color="#3b82f6"
        />

        {/* KPI 2 */}
        <GovKpiCard
          label="Active HEI Research Projects"
          value={activeHeiProjects.toString()}
          subtext="Under investigation by IIT, NIT, BIT & BAU"
          icon={<GraduationCap size={22} />}
          badge="6 Universities"
          color="#8b5cf6"
        />

        {/* KPI 3 */}
        <GovKpiCard
          label="CSR Funds Pledged"
          value={formatINR(totalCsrFunds)}
          subtext="Corporate grants authorized under Sec 135"
          icon={<IndianRupee size={22} />}
          badge="Tata Steel & PSUs"
          color="#059669"
        />

        {/* KPI 4 */}
        <GovKpiCard
          label="Deployed Field Pilots"
          value={deployedPilots.toString()}
          subtext="Live community interventions in blocks"
          icon={<CheckCircle2 size={22} />}
          badge="High Impact"
          color="#06b6d4"
        />
      </div>

      {/* ─── Lifecycle Pipeline Funnel ─────────────────────────────────── */}
      <div
        className="glass-card animate-fade-in-up"
        style={{
          padding: '20px 24px',
          marginBottom: 28,
          animationDelay: '0.1s',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers size={18} color="#047857" />
              Statewide Innovation Lifecycle Pipeline
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              Track citizen challenges from grassroot submission to field pilot deployment
            </p>
          </div>
          {statusFilter !== 'all' && (
            <button
              onClick={() => setStatusFilter('all')}
              style={{
                fontSize: '0.72rem',
                color: '#047857',
                background: 'rgba(4, 120, 87, 0.08)',
                border: 'none',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Clear Filter ({STATUS_CONFIG[statusFilter as ProblemStatus]?.label || statusFilter}) ✕
            </button>
          )}
        </div>

        {/* Visual Pipeline Funnel Steps */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 12,
            position: 'relative',
          }}
        >
          {LIFECYCLE_STEPS.map((step, idx) => {
            const cfg = STATUS_CONFIG[step];
            const count = funnelCounts[step] || 0;
            const isSelected = statusFilter === step;
            return (
              <div
                key={step}
                onClick={() => setStatusFilter(isSelected ? 'all' : step)}
                style={{
                  padding: '14px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: isSelected
                    ? `${cfg.color}15`
                    : 'var(--color-surface-alt)',
                  border: `1.5px solid ${isSelected ? cfg.color : 'transparent'}`,
                  cursor: 'pointer',
                  transition: 'all var(--transition-base)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-border)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLDivElement).style.borderColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: cfg.color,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Stage 0{idx + 1}
                  </span>
                  <span
                    style={{
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: 'var(--color-text)',
                    }}
                  >
                    {count}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: isSelected ? cfg.color : 'var(--color-text)',
                    lineHeight: 1.25,
                  }}
                >
                  {cfg.label}
                </div>
                <div
                  style={{
                    height: 4,
                    borderRadius: 'var(--radius-full)',
                    background: isSelected ? cfg.color : 'rgba(0,0,0,0.08)',
                    marginTop: 4,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── District Distribution & Analytics Visual ─────────────────── */}
      <div
        className="glass-card animate-fade-in-up"
        style={{
          padding: '22px 24px',
          marginBottom: 28,
          animationDelay: '0.12s',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={18} color="#047857" />
              District-Wise Innovation & HEI Resolution Index
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              Regional progress indicators measuring academic adoption and corporate CSR allocation
            </p>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
            Click any district to filter master pipeline
          </span>
        </div>

        {/* District Progress Bars Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
          }}
        >
          {districtStats.map((d) => {
            const isSelected = districtFilter.toLowerCase() === d.district.toLowerCase();
            return (
              <div
                key={d.district}
                onClick={() =>
                  setDistrictFilter(isSelected ? 'all' : d.district)
                }
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: isSelected ? 'rgba(4, 120, 87, 0.08)' : 'var(--color-surface-alt)',
                  border: `1.5px solid ${isSelected ? '#047857' : 'transparent'}`,
                  cursor: 'pointer',
                  transition: 'all var(--transition-base)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 6,
                  }}
                >
                  <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--color-text)' }}>
                    {d.district}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                      {d.total} {d.total === 1 ? 'issue' : 'issues'}
                    </span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: d.percentage > 50 ? '#059669' : '#d97706',
                      }}
                    >
                      {d.percentage}% active
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div
                  style={{
                    height: 7,
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--color-border)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.max(12, d.percentage)}%`,
                      borderRadius: 'var(--radius-full)',
                      background:
                        d.percentage >= 60
                          ? 'linear-gradient(90deg, #10b981, #059669)'
                          : d.percentage > 0
                          ? 'linear-gradient(90deg, #3b82f6, #0284c7)'
                          : 'var(--color-text-muted)',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.7rem',
                    color: 'var(--color-text-muted)',
                    marginTop: 6,
                  }}
                >
                  <span>HEI R&D: {d.inHei}</span>
                  <span>Funded/Deployed: {d.fundedOrDeployed}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Master Pipeline Audit Table ─────────────────────────────────── */}
      <div className="glass-card animate-fade-in-up" style={{ padding: '22px 24px', animationDelay: '0.15s' }}>
        {/* Table Header & Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
            flexWrap: 'wrap',
            gap: 14,
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileCheck2 size={20} color="#047857" />
              Master Pipeline Audit Table
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Showing {filteredProblems.length} of {problems.length} total registered societal challenges
            </p>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '100%', maxWidth: 320 }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Search title, ID, district, HEI, sponsor…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: 36, fontSize: '0.82rem', height: 38 }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Filter Badges Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 18,
            flexWrap: 'wrap',
            paddingBottom: 14,
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
            <SlidersHorizontal size={14} />
            <span style={{ fontWeight: 600 }}>Filters:</span>
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              fontSize: '0.76rem',
              color: 'var(--color-text)',
              fontWeight: 500,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Statuses ({problems.length})</option>
            {LIFECYCLE_STEPS.map((s) => (
              <option key={s} value={s}>
                {STATUS_CONFIG[s].label} ({funnelCounts[s] || 0})
              </option>
            ))}
          </select>

          {/* District Dropdown */}
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              fontSize: '0.76rem',
              color: 'var(--color-text)',
              fontWeight: 500,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Districts (24)</option>
            {JHARKHAND_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              fontSize: '0.76rem',
              color: 'var(--color-text)',
              fontWeight: 500,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Domains ({CATEGORIES.length})</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Urgency Dropdown */}
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              fontSize: '0.76rem',
              color: 'var(--color-text)',
              fontWeight: 500,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Urgency Levels</option>
            <option value="Critical">Critical</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Reset Filters */}
          {(statusFilter !== 'all' ||
            districtFilter !== 'all' ||
            categoryFilter !== 'all' ||
            urgencyFilter !== 'all' ||
            searchQuery) && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setDistrictFilter('all');
                setCategoryFilter('all');
                setUrgencyFilter('all');
                setSearchQuery('');
              }}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '0.75rem',
                color: '#ef4444',
                cursor: 'pointer',
                fontWeight: 600,
                padding: '4px 8px',
              }}
            >
              Reset All ✕
            </button>
          )}
        </div>

        {/* Data Table */}
        {filteredProblems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--color-text-muted)' }}>
            <Sparkles size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontWeight: 600, fontSize: '0.92rem' }}>No problems match your current audit filters.</p>
            <p style={{ fontSize: '0.78rem', marginTop: 4 }}>Try clearing search keywords or selecting all districts.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'separate',
                borderSpacing: '0 8px',
                fontSize: '0.82rem',
              }}
            >
              <thead>
                <tr style={{ color: 'var(--color-text-muted)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 12px', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase' }}>
                    ID & Date
                  </th>
                  <th style={{ padding: '8px 12px', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase' }}>
                    Challenge & District
                  </th>
                  <th style={{ padding: '8px 12px', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase' }}>
                    Category & Urgency
                  </th>
                  <th style={{ padding: '8px 12px', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase' }}>
                    Assigned HEI & Team
                  </th>
                  <th style={{ padding: '8px 12px', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase' }}>
                    CSR Grant / Sponsor
                  </th>
                  <th style={{ padding: '8px 12px', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase' }}>
                    Lifecycle Status
                  </th>
                  <th style={{ padding: '8px 12px', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', textAlign: 'right' }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProblems.map((p) => {
                  const sb = STATUS_CONFIG[p.status] || STATUS_CONFIG.Submitted;
                  const ub = URGENCY_BADGE[p.urgency] || 'badge-low';
                  const dateFormatted = new Date(p.submittedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <tr
                      key={p.id}
                      style={{
                        background: 'var(--color-surface)',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'all var(--transition-base)',
                        borderRadius: 'var(--radius-md)',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLTableRowElement).style.boxShadow = 'var(--shadow-md)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLTableRowElement).style.boxShadow = 'var(--shadow-sm)';
                      }}
                    >
                      {/* ID & Date */}
                      <td style={{ padding: '12px 12px', borderTopLeftRadius: 'var(--radius-md)', borderBottomLeftRadius: 'var(--radius-md)' }}>
                        <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.72rem', color: '#047857' }}>
                          {p.id}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                          {dateFormatted}
                        </div>
                      </td>

                      {/* Title & District */}
                      <td style={{ padding: '12px 12px', maxWidth: 260 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            color: 'var(--color-text)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={p.title}
                        >
                          {p.title}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                          <MapPin size={11} /> {p.district}, Jharkhand
                        </div>
                      </td>

                      {/* Category & Urgency */}
                      <td style={{ padding: '12px 12px' }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <span className={`badge ${ub}`}>{p.urgency}</span>
                          <span className="badge badge-deployed">{p.category}</span>
                        </div>
                      </td>

                      {/* HEI & Team */}
                      <td style={{ padding: '12px 12px', maxWidth: 220 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            fontSize: '0.78rem',
                            color: 'var(--color-text)',
                          }}
                        >
                          <GraduationCap size={13} color="#8b5cf6" style={{ flexShrink: 0 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {p.targetUniversity || 'Pending HEI Assignment'}
                          </span>
                        </div>
                        {p.assignedTeam ? (
                          <div style={{ fontSize: '0.7rem', color: '#8b5cf6', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {p.assignedTeam}
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                            Unassigned
                          </div>
                        )}
                      </td>

                      {/* Sponsor & Funding */}
                      <td style={{ padding: '12px 12px' }}>
                        {p.fundingAmount > 0 ? (
                          <div>
                            <div style={{ fontWeight: 800, color: '#059669', display: 'flex', alignItems: 'center', gap: 3 }}>
                              <IndianRupee size={12} />
                              {p.fundingAmount.toLocaleString('en-IN')}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: 1 }}>
                              {p.industrySponsor || 'Sec 135 Grant'}
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                            Awaiting CSR
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 12px' }}>
                        <span className={`badge ${sb.cls}`}>
                          {sb.label}
                        </span>
                      </td>

                      {/* Action */}
                      <td style={{ padding: '12px 12px', textAlign: 'right', borderTopRightRadius: 'var(--radius-md)', borderBottomRightRadius: 'var(--radius-md)' }}>
                        <button
                          className="btn btn-secondary"
                          style={{
                            padding: '5px 12px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                          onClick={() => setAuditTarget(p)}
                        >
                          Audit & Progress
                          <ChevronRight size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Audit & Lifecycle Management Modal ──────────────────────────── */}
      {auditTarget && (
        <AuditDrawer
          problem={auditTarget}
          onClose={() => setAuditTarget(null)}
          onPromote={(newStatus) => handlePromoteStatus(auditTarget.id, newStatus)}
        />
      )}

      {/* ─── Success Feedback Toast ─────────────────────────────────────── */}
      {successToast && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: 'var(--color-surface)',
            border: '1px solid #10b981',
            borderRadius: 'var(--radius-md)',
            padding: '12px 18px',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            zIndex: 120,
            animation: 'fadeInUp 0.3s ease-out',
          }}
        >
          <CheckCircle2 size={18} color="#10b981" />
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text)' }}>
              Status Updated Successfully!
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
              {successToast.id} transitioned to <strong>{STATUS_CONFIG[successToast.status as ProblemStatus]?.label || successToast.status}</strong>
            </div>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--color-text-muted)' }}
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

// ─── KPI Card ───────────────────────────────────────────────────────────────

function GovKpiCard({
  label,
  value,
  subtext,
  icon,
  badge,
  color,
}: {
  label: string;
  value: string;
  subtext: string;
  icon: React.ReactNode;
  badge: string;
  color: string;
}) {
  return (
    <div
      className="glass-card"
      style={{
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: color,
        }}
      />
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-md)',
              background: `${color}14`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color,
            }}
          >
            {icon}
          </div>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              background: `${color}12`,
              color,
            }}
          >
            {badge}
          </span>
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.1, marginBottom: 4 }}>
          {value}
        </div>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: 2 }}>
          {label}
        </div>
        <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
          {subtext}
        </div>
      </div>
    </div>
  );
}

// ─── Audit Drawer & Lifecycle Updater ───────────────────────────────────────

function AuditDrawer({
  problem,
  onClose,
  onPromote,
}: {
  problem: Problem;
  onClose: () => void;
  onPromote: (status: ProblemStatus) => void;
}) {
  const sb = STATUS_CONFIG[problem.status] || STATUS_CONFIG.Submitted;
  const currentStep = sb.step;

  // Next recommended status in workflow
  const nextStatus: ProblemStatus | null =
    currentStep === 1
      ? 'Routed_To_HEI'
      : currentStep === 2
      ? 'In_Proposal'
      : currentStep === 3
      ? 'Industry_Pledged'
      : currentStep === 4
      ? 'Pilot_Deployed'
      : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          maxWidth: 680,
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
            zIndex: 10,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#047857', fontWeight: 700 }}>
                {problem.id}
              </span>
              <span className={`badge ${sb.cls}`}>{sb.label}</span>
              <span className="badge badge-deployed">{problem.category}</span>
            </div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, lineHeight: 1.3 }}>
              {problem.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: 'var(--color-text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '22px 24px' }}>
          {/* Visual Lifecycle Stepper */}
          <div
            style={{
              padding: '16px',
              background: 'var(--color-surface-alt)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 24,
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 12 }}>
              Current Pipeline Lifecycle State
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
              {LIFECYCLE_STEPS.map((step, idx) => {
                const isPassed = idx + 1 <= currentStep;
                const isCurrent = idx + 1 === currentStep;
                return (
                  <div
                    key={step}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      zIndex: 2,
                      width: 80,
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: isCurrent ? '#047857' : isPassed ? '#10b981' : 'var(--color-border)',
                        color: isPassed ? '#fff' : 'var(--color-text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        marginBottom: 6,
                        boxShadow: isCurrent ? '0 0 0 4px rgba(4, 120, 87, 0.2)' : 'none',
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div style={{ fontSize: '0.68rem', fontWeight: isCurrent ? 700 : 500, color: isCurrent ? 'var(--color-text)' : 'var(--color-text-muted)', lineHeight: 1.2 }}>
                      {STATUS_CONFIG[step].label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                District / Location
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, marginTop: 3 }}>
                {problem.district}, Jharkhand
              </div>
              {problem.geoCoords && (
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  GPS: {problem.geoCoords.lat.toFixed(4)}°N, {problem.geoCoords.lng.toFixed(4)}°E
                </div>
              )}
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Urgency Level
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, marginTop: 3 }}>
                {problem.urgency} Priority
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Submitted on {new Date(problem.submittedAt).toLocaleDateString('en-IN')}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Assigned HEI
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, marginTop: 3 }}>
                {problem.targetUniversity || 'Pending Assignment'}
              </div>
              {problem.assignedTeam && (
                <div style={{ fontSize: '0.75rem', color: '#8b5cf6' }}>
                  Team: {problem.assignedTeam}
                </div>
              )}
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                CSR Sponsor & Funding
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, marginTop: 3 }}>
                {problem.industrySponsor || 'Pending Corporate Sponsor'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                {problem.fundingAmount > 0
                  ? `Grant: ₹${problem.fundingAmount.toLocaleString('en-IN')}`
                  : 'Grant: Seeking Sponsorship'}
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 6 }}>
              Citizen Problem Statement
            </div>
            <div
              style={{
                fontSize: '0.85rem',
                lineHeight: 1.6,
                color: 'var(--color-text)',
                padding: '12px 14px',
                background: 'var(--color-surface-alt)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              {problem.description}
            </div>
          </div>

          {/* State Action: Lifecycle Transition */}
          <div
            style={{
              padding: '16px 20px',
              background: 'rgba(4, 120, 87, 0.05)',
              border: '1.5px solid rgba(4, 120, 87, 0.2)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#047857', marginBottom: 6 }}>
              State Administrative Actions
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 14 }}>
              As a Government official, update this problem's lifecycle status or fast-track its field deployment.
            </p>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {nextStatus && (
                <button
                  className="btn btn-primary"
                  style={{
                    fontSize: '0.82rem',
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
                  }}
                  onClick={() => onPromote(nextStatus)}
                >
                  <ArrowRight size={15} /> Advance to &quot;{STATUS_CONFIG[nextStatus].label}&quot;
                </button>
              )}

              {problem.status !== 'Pilot_Deployed' && (
                <button
                  className="btn btn-secondary"
                  style={{
                    fontSize: '0.82rem',
                    padding: '8px 16px',
                    borderColor: '#06b6d4',
                    color: '#0891b2',
                  }}
                  onClick={() => onPromote('Pilot_Deployed')}
                >
                  <CheckCircle2 size={15} /> Direct Deploy Field Pilot
                </button>
              )}

              {problem.status === 'Submitted' && (
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: '0.82rem', padding: '8px 16px' }}
                  onClick={() => onPromote('Routed_To_HEI')}
                >
                  <GraduationCap size={15} /> Route to {problem.targetUniversity || 'IIT (ISM) Dhanbad'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Number Helper ──────────────────────────────────────────────────────────

function formatINR(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} Lakh`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}
