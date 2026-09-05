'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '@/lib/store';
import { classifyProblem } from '@/lib/ai-engine';
import {
  JHARKHAND_DISTRICTS,
  CATEGORIES,
  type AiTriageResult,
  type Category,
  type Problem,
} from '@/lib/types';
import {
  Send,
  MapPin,
  Upload,
  Brain,
  Globe,
  CheckCircle2,
  Copy,
  X,
  FileText,
  Sparkles,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';

// ─── Hindi / English label map ──────────────────────────────────────────────

const LABELS = {
  en: {
    heading: 'Report a Problem',
    subtitle: 'Submit issues affecting your community. Our AI will route it to the right institution.',
    title: 'Problem Title',
    titlePh: 'e.g., Contaminated water supply in my village',
    district: 'District',
    districtPh: 'Select your district',
    description: 'Detailed Description',
    descPh: 'Describe the issue in detail — who is affected, since when, severity…',
    category: 'Category',
    categoryPh: 'Select category',
    geoBtn: 'Auto-detect Location',
    geoDetected: 'Location detected',
    uploadLabel: 'Upload Photos / Documents',
    uploadHint: 'Drag & drop or click to browse (JPG, PNG, PDF)',
    aiTitle: 'AI Triage Preview',
    aiDomain: 'Detected Domain',
    aiUrgency: 'Urgency Score',
    aiUni: 'Target University',
    aiDept: 'Department',
    aiNep: 'NEP 2020 Alignment',
    submit: 'Submit Problem Report',
    successTitle: 'Problem Submitted Successfully!',
    successMsg: 'Your issue has been registered. Use this Tracking ID:',
    close: 'Close',
    langToggle: 'हिन्दी',
  },
  hi: {
    heading: 'समस्या दर्ज करें',
    subtitle: 'अपने समुदाय की समस्या दर्ज करें। हमारा AI इसे सही संस्थान तक पहुँचाएगा।',
    title: 'समस्या का शीर्षक',
    titlePh: 'उदा., मेरे गाँव में दूषित पानी की आपूर्ति',
    district: 'ज़िला',
    districtPh: 'अपना ज़िला चुनें',
    description: 'विस्तृत विवरण',
    descPh: 'समस्या का विस्तार से वर्णन करें — कौन प्रभावित है, कब से, गंभीरता…',
    category: 'श्रेणी',
    categoryPh: 'श्रेणी चुनें',
    geoBtn: 'स्वतः स्थान पहचानें',
    geoDetected: 'स्थान पहचाना गया',
    uploadLabel: 'फ़ोटो / दस्तावेज़ अपलोड करें',
    uploadHint: 'खींचें और छोड़ें या ब्राउज़ करें (JPG, PNG, PDF)',
    aiTitle: 'AI विश्लेषण पूर्वावलोकन',
    aiDomain: 'पहचाना गया क्षेत्र',
    aiUrgency: 'तात्कालिकता स्कोर',
    aiUni: 'लक्षित विश्वविद्यालय',
    aiDept: 'विभाग',
    aiNep: 'NEP 2020 संरेखण',
    submit: 'समस्या रिपोर्ट जमा करें',
    successTitle: 'समस्या सफलतापूर्वक दर्ज!',
    successMsg: 'आपकी समस्या दर्ज हो गई है। ट्रैकिंग ID:',
    close: 'बंद करें',
    langToggle: 'English',
  },
} as const;

type Lang = keyof typeof LABELS;

// ─── Mock geo coordinates for districts ─────────────────────────────────────

const DISTRICT_COORDS: Record<string, { lat: number; lng: number }> = {
  Ranchi: { lat: 23.3441, lng: 85.3096 },
  Dhanbad: { lat: 23.7957, lng: 86.4304 },
  Bokaro: { lat: 23.6693, lng: 86.1511 },
  Hazaribagh: { lat: 23.9925, lng: 85.3637 },
  Palamu: { lat: 24.0268, lng: 84.0531 },
  Gumla: { lat: 23.0437, lng: 84.5419 },
  Khunti: { lat: 23.0741, lng: 85.2787 },
  'East Singhbhum': { lat: 22.5726, lng: 86.2029 },
  'West Singhbhum': { lat: 22.5732, lng: 85.6355 },
  Deoghar: { lat: 24.4764, lng: 86.6944 },
  Dumka: { lat: 24.2682, lng: 87.2487 },
  Giridih: { lat: 24.1903, lng: 86.3007 },
  Godda: { lat: 24.8273, lng: 87.2127 },
  Jamtara: { lat: 23.9583, lng: 86.8142 },
  Koderma: { lat: 24.4675, lng: 85.5939 },
  Latehar: { lat: 23.7378, lng: 84.4973 },
  Lohardaga: { lat: 23.4356, lng: 84.6844 },
  Pakur: { lat: 24.6369, lng: 87.8455 },
  Ramgarh: { lat: 23.6307, lng: 85.5131 },
  Sahebganj: { lat: 25.2484, lng: 87.5876 },
  'Saraikela-Kharsawan': { lat: 22.7003, lng: 85.9310 },
  Simdega: { lat: 22.6171, lng: 84.5089 },
  Chatra: { lat: 24.2053, lng: 84.8719 },
  Garhwa: { lat: 24.1750, lng: 83.8072 },
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function CitizenPortal() {
  const { addProblem } = useStore();
  const [lang, setLang] = useState<Lang>('en');
  const L = LABELS[lang];

  // Form state
  const [title, setTitle] = useState('');
  const [district, setDistrict] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [geoDetected, setGeoDetected] = useState(false);
  const [geoCoords, setGeoCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [fileNames, setFileNames] = useState<string[]>([]);

  // AI triage state
  const [triage, setTriage] = useState<AiTriageResult | null>(null);
  const triageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Success modal
  const [successId, setSuccessId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Debounced AI triage as user types
  useEffect(() => {
    if (triageTimer.current) clearTimeout(triageTimer.current);

    if (title.length < 5 && description.length < 10) {
      setTriage(null);
      return;
    }

    triageTimer.current = setTimeout(() => {
      const result = classifyProblem(title, description);
      setTriage(result);
    }, 400);

    return () => {
      if (triageTimer.current) clearTimeout(triageTimer.current);
    };
  }, [title, description]);

  // Mock geolocation
  const handleGeoDetect = useCallback(() => {
    const coords = district
      ? DISTRICT_COORDS[district] || { lat: 23.3441, lng: 85.3096 }
      : { lat: 23.3441, lng: 85.3096 };
    setGeoCoords(coords);
    setGeoDetected(true);
  }, [district]);

  // Mock file upload
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFileNames(Array.from(files).map((f) => f.name));
    }
  }, []);

  // Generate tracking ID
  const generateId = useCallback(() => {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `JH-PRB-2026-${num}`;
  }, []);

  // Urgency label from score
  const urgencyFromScore = useMemo(() => {
    if (!triage) return 'Medium' as const;
    if (triage.urgencyScore >= 7) return 'Critical' as const;
    if (triage.urgencyScore >= 4) return 'Medium' as const;
    return 'Low' as const;
  }, [triage]);

  // Submit handler
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!title || !district || !description || !category) return;

      const result = triage || classifyProblem(title, description);
      const id = generateId();

      const problem: Problem = {
        id,
        title,
        description,
        district,
        category: category as Category,
        urgency: urgencyFromScore,
        mediaUrl: fileNames.length > 0 ? fileNames[0] : '',
        status: 'Submitted',
        targetUniversity: result.targetUniversity,
        assignedTeam: '',
        industrySponsor: '',
        fundingAmount: 0,
        submittedAt: new Date().toISOString(),
        geoCoords: geoCoords || undefined,
      };

      addProblem(problem);
      setSuccessId(id);

      // Reset
      setTitle('');
      setDistrict('');
      setDescription('');
      setCategory('');
      setGeoDetected(false);
      setGeoCoords(null);
      setFileNames([]);
      setTriage(null);
    },
    [title, district, description, category, triage, fileNames, geoCoords, urgencyFromScore, addProblem, generateId]
  );

  const copyId = useCallback(() => {
    if (successId) {
      navigator.clipboard.writeText(successId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [successId]);

  // Urgency gauge helpers
  const gaugeWidth = triage ? `${triage.urgencyScore * 10}%` : '0%';
  const gaugeClass = triage
    ? triage.urgencyScore >= 7
      ? 'urgency-high'
      : triage.urgencyScore >= 4
      ? 'urgency-medium'
      : 'urgency-low'
    : 'urgency-low';

  return (
    <>
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '32px 20px 60px',
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 28,
        }}
      >
        {/* Header */}
        <div
          className="animate-fade-in-up"
          style={{ textAlign: 'center', marginBottom: 8 }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: 16,
            }}
          >
            <button
              className="btn btn-secondary"
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              style={{ fontSize: '0.8rem', padding: '6px 14px' }}
            >
              <Globe size={14} />
              {L.langToggle}
            </button>
          </div>
          <h1
            style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              color: 'var(--color-text)',
              marginBottom: 8,
            }}
          >
            {L.heading}
          </h1>
          <p
            style={{
              color: 'var(--color-text-muted)',
              fontSize: '1rem',
              maxWidth: 560,
              margin: '0 auto',
            }}
          >
            {L.subtitle}
          </p>
        </div>

        {/* Main grid: form + AI panel */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)',
            gap: 24,
            alignItems: 'start',
          }}
        >
          {/* ─── Form ──────────────────────────────────────────────── */}
          <form
            onSubmit={handleSubmit}
            className="glass-card animate-fade-in-up"
            style={{ padding: 28 }}
          >
            {/* Title */}
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: 'block',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  marginBottom: 6,
                  color: 'var(--color-text)',
                }}
              >
                {L.title}
              </label>
              <input
                className="input-field"
                type="text"
                placeholder={L.titlePh}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* District + Category row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
                marginBottom: 20,
              }}
            >
              {/* District */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    marginBottom: 6,
                  }}
                >
                  {L.district}
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    className="input-field"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    required
                    style={{
                      appearance: 'none',
                      paddingRight: 32,
                    }}
                  >
                    <option value="">{L.districtPh}</option>
                    {JHARKHAND_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                      color: 'var(--color-text-muted)',
                    }}
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    marginBottom: 6,
                  }}
                >
                  {L.category}
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    className="input-field"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    required
                    style={{
                      appearance: 'none',
                      paddingRight: 32,
                    }}
                  >
                    <option value="">{L.categoryPh}</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                      color: 'var(--color-text-muted)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: 'block',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  marginBottom: 6,
                }}
              >
                {L.description}
              </label>
              <textarea
                className="input-field"
                placeholder={L.descPh}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Geolocation button */}
            <div style={{ marginBottom: 20 }}>
              <button
                type="button"
                className={geoDetected ? 'btn btn-secondary' : 'btn btn-secondary'}
                onClick={handleGeoDetect}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  ...(geoDetected
                    ? {
                        borderColor: 'var(--color-success)',
                        color: 'var(--color-success)',
                        background: 'rgba(34, 197, 94, 0.06)',
                      }
                    : {}),
                }}
              >
                <MapPin size={16} />
                {geoDetected
                  ? `${L.geoDetected}: ${geoCoords?.lat.toFixed(4)}°N, ${geoCoords?.lng.toFixed(4)}°E`
                  : L.geoBtn}
              </button>
            </div>

            {/* File upload dropzone */}
            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: 'block',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  marginBottom: 6,
                }}
              >
                {L.uploadLabel}
              </label>
              <label className="dropzone" style={{ display: 'block', cursor: 'pointer' }}>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                {fileNames.length > 0 ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      color: 'var(--color-primary)',
                    }}
                  >
                    <FileText size={18} />
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                      {fileNames.join(', ')}
                    </span>
                  </div>
                ) : (
                  <div>
                    <Upload
                      size={28}
                      style={{
                        margin: '0 auto 8px',
                        color: 'var(--color-text-muted)',
                      }}
                    />
                    <p
                      style={{
                        color: 'var(--color-text-muted)',
                        fontSize: '0.83rem',
                      }}
                    >
                      {L.uploadHint}
                    </p>
                  </div>
                )}
              </label>
            </div>

            {/* Submit */}
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              <Send size={16} />
              {L.submit}
            </button>
          </form>

          {/* ─── AI Triage Preview ─────────────────────────────────── */}
          <div
            className="glass-card animate-fade-in-up"
            style={{
              padding: 24,
              position: 'sticky',
              top: 130,
              animationDelay: '0.15s',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 20,
              }}
            >
              <div
                className={triage ? 'animate-pulse-glow' : ''}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: triage
                    ? 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))'
                    : 'var(--color-surface-alt)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Brain size={17} color={triage ? '#fff' : 'var(--color-text-muted)'} />
              </div>
              <div>
                <h3
                  style={{
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: 'var(--color-text)',
                    lineHeight: 1.2,
                  }}
                >
                  {L.aiTitle}
                </h3>
                <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                  {triage ? 'Live analysis active' : 'Start typing to activate'}
                </p>
              </div>
            </div>

            {!triage ? (
              <div
                style={{
                  padding: '32px 0',
                  textAlign: 'center',
                  color: 'var(--color-text-muted)',
                  fontSize: '0.85rem',
                }}
              >
                <Sparkles
                  size={36}
                  style={{ margin: '0 auto 12px', opacity: 0.3 }}
                />
                <p>AI triage will activate as you describe the problem…</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* Domain */}
                <TriageRow label={L.aiDomain}>
                  <span
                    className={`badge badge-${
                      triage.domain === 'Mining/Env'
                        ? 'critical'
                        : triage.domain === 'Agriculture'
                        ? 'pledged'
                        : triage.domain === 'Water'
                        ? 'submitted'
                        : triage.domain === 'Health'
                        ? 'proposal'
                        : triage.domain === 'Education'
                        ? 'routed'
                        : 'deployed'
                    }`}
                  >
                    {triage.domain}
                  </span>
                </TriageRow>

                {/* Urgency gauge */}
                <TriageRow label={L.aiUrgency}>
                  <div style={{ width: '100%' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 4,
                        fontSize: '0.8rem',
                        fontWeight: 700,
                      }}
                    >
                      <span
                        style={{
                          color:
                            triage.urgencyScore >= 7
                              ? 'var(--color-danger)'
                              : triage.urgencyScore >= 4
                              ? '#d97706'
                              : 'var(--color-success)',
                        }}
                      >
                        {triage.urgencyScore}/10
                      </span>
                      <span
                        className={`badge ${
                          triage.urgencyScore >= 7
                            ? 'badge-critical'
                            : triage.urgencyScore >= 4
                            ? 'badge-medium'
                            : 'badge-low'
                        }`}
                      >
                        {triage.urgencyScore >= 7
                          ? 'Critical'
                          : triage.urgencyScore >= 4
                          ? 'Medium'
                          : 'Low'}
                      </span>
                    </div>
                    <div className="urgency-gauge-track">
                      <div
                        className={`urgency-gauge-fill ${gaugeClass}`}
                        style={{ width: gaugeWidth }}
                      />
                    </div>
                  </div>
                </TriageRow>

                {/* Target university */}
                <TriageRow label={L.aiUni}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontWeight: 600,
                      fontSize: '0.88rem',
                      color: 'var(--color-primary-dark)',
                    }}
                  >
                    <GraduationCapIcon />
                    {triage.targetUniversity}
                  </div>
                </TriageRow>

                {/* Department */}
                <TriageRow label={L.aiDept}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text)' }}>
                    {triage.suggestedDepartment}
                  </span>
                </TriageRow>

                {/* NEP note */}
                <div
                  style={{
                    background: 'rgba(20, 184, 166, 0.06)',
                    border: '1px solid rgba(20, 184, 166, 0.15)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 14px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      marginBottom: 6,
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      color: 'var(--color-primary)',
                    }}
                  >
                    <ShieldCheck size={14} />
                    {L.aiNep}
                  </div>
                  <p
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--color-text-muted)',
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    {triage.nepAlignmentNote}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Success Modal ──────────────────────────────────────────── */}
      {successId && (
        <div className="modal-overlay" onClick={() => setSuccessId(null)}>
          <div
            className="modal-card animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-success), #4ade80)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <CheckCircle2 size={28} color="#fff" />
            </div>
            <h2
              style={{
                fontWeight: 800,
                fontSize: '1.2rem',
                marginBottom: 8,
                color: 'var(--color-text)',
              }}
            >
              {L.successTitle}
            </h2>
            <p
              style={{
                color: 'var(--color-text-muted)',
                fontSize: '0.9rem',
                marginBottom: 16,
              }}
            >
              {L.successMsg}
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px 20px',
                background: 'var(--color-surface-alt)',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'monospace',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--color-primary-dark)',
                marginBottom: 20,
              }}
            >
              {successId}
              <button
                onClick={copyId}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  color: copied ? 'var(--color-success)' : 'var(--color-text-muted)',
                }}
                title="Copy ID"
              >
                {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setSuccessId(null)}
              style={{ width: '100%' }}
            >
              <X size={16} />
              {L.close}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function TriageRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: '0.72rem',
          fontWeight: 600,
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function GraduationCapIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m2 10 10-5 10 5-10 5z" />
      <path d="M6 12v5c0 2 6 3 6 3s6-1 6-3v-5" />
    </svg>
  );
}
