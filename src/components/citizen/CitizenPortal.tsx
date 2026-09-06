'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-store';
import { classifyProblem, findDuplicates } from '@/lib/ai-engine';
import { useNotifications } from '@/lib/notifications';
import {
  JHARKHAND_DISTRICTS,
  CATEGORIES,
  SUBMITTER_LABELS,
  type AiTriageResult,
  type Category,
  type Problem,
  type ProblemStatus,
  type SubmitterType,
  type Comment,
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
  Search,
  Building2,
  GraduationCap,
  Tag,
  AlertTriangle,
  MessageCircle,
  CheckSquare,
  Calendar,
  Clock,
  Image as ImageIcon,
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
    tabReport: 'Report a Problem',
    tabTrack: 'Track Issue Status',
    trackHeading: 'Citizen Grievance & Solution Tracker',
    trackSubtitle: 'Enter your tracking ID to see real-time updates from universities, industry CSR sponsors, and state monitoring.',
    trackInputPh: 'Enter Tracking ID (e.g., JH-PRB-2026-4991)',
    trackBtn: 'Track Status',
    trackClear: 'Clear Search',
    trackNotFound: 'No problem report found matching',
    trackNotFoundHint: 'Please check your tracking ID (format: JH-PRB-2026-XXXX) or select one of the recent submissions below.',
    recentTitle: 'Recently Registered Community Reports:',
    trackNowBtn: 'Track This Issue Now →',
    viewTimeline: '5-Stage Lifecycle Progress',
    stageSubmitted: '1. Registered & Categorized',
    stageSubmittedDesc: 'AI triage complete; logged into state database.',
    stageRouted: '2. Routed to University',
    stageRoutedDesc: 'Assigned to nodal HEI department for technical R&D.',
    stageProposal: '3. Technical Proposal',
    stageProposalDesc: 'Faculty & student innovation team drafting solution blueprint.',
    stagePledged: '4. CSR Funding Pledged',
    stagePledgedDesc: 'Corporate industry partner committed grant/materials.',
    stageDeployed: '5. Field Pilot Deployed',
    stageDeployedDesc: 'Ground implementation and monitoring active in district.',
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
    tabReport: 'समस्या दर्ज करें',
    tabTrack: 'समस्या की स्थिति ट्रैक करें',
    trackHeading: 'नागरिक समस्या एवं समाधान ट्रैकर',
    trackSubtitle: 'विश्वविद्यालयों, उद्योग CSR प्रायोजकों और सरकारी निगरानी से रीयल-टाइम अपडेट देखने के लिए अपनी ट्रैकिंग ID दर्ज करें।',
    trackInputPh: 'ट्रैकिंग ID दर्ज करें (उदा., JH-PRB-2026-4991)',
    trackBtn: 'स्थिति जांचें',
    trackClear: 'खोज हटाएं',
    trackNotFound: 'इस ID से कोई समस्या रिपोर्ट नहीं मिली:',
    trackNotFoundHint: 'कृपया अपनी ट्रैकिंग संख्या (प्रारूप: JH-PRB-2026-XXXX) जांचें या नीचे दी गई हालिया रिपोर्ट पर क्लिक करें।',
    recentTitle: 'हाल ही में दर्ज सामुदायिक रिपोर्टें:',
    trackNowBtn: 'इस समस्या को अभी ट्रैक करें →',
    viewTimeline: '5-चरणीय जीवनचक्र प्रगति',
    stageSubmitted: '1. दर्ज एवं वर्गीकृत',
    stageSubmittedDesc: 'AI विश्लेषण पूर्ण; राज्य डेटाबेस में सुरक्षित।',
    stageRouted: '2. विश्वविद्यालय को अग्रेषित',
    stageRoutedDesc: 'तकनीकी R&D के लिए नोडल HEI विभाग को सौंपा गया।',
    stageProposal: '3. तकनीकी प्रस्ताव',
    stageProposalDesc: 'फैकल्टी एवं छात्र नवाचार टीम समाधान तैयार कर रही है।',
    stagePledged: '4. CSR फंडिंग स्वीकृत',
    stagePledgedDesc: 'कॉरपोरेट उद्योग साझेदार ने अनुदान/सामग्री की प्रतिज्ञा की।',
    stageDeployed: '5. फ़ील्ड पायलट तैनात',
    stageDeployedDesc: 'जमीनी कार्यान्वयन और निगरानी सक्रिय।',
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

// ─── Stage Configuration for Problem Tracking ─────────────────────────────

const STAGE_CONFIG: {
  status: ProblemStatus;
  labelKey: 'stageSubmitted' | 'stageRouted' | 'stageProposal' | 'stagePledged' | 'stageDeployed';
  descKey: 'stageSubmittedDesc' | 'stageRoutedDesc' | 'stageProposalDesc' | 'stagePledgedDesc' | 'stageDeployedDesc';
  step: number;
}[] = [
  { status: 'Submitted', labelKey: 'stageSubmitted', descKey: 'stageSubmittedDesc', step: 1 },
  { status: 'Routed_To_HEI', labelKey: 'stageRouted', descKey: 'stageRoutedDesc', step: 2 },
  { status: 'In_Proposal', labelKey: 'stageProposal', descKey: 'stageProposalDesc', step: 3 },
  { status: 'Industry_Pledged', labelKey: 'stagePledged', descKey: 'stagePledgedDesc', step: 4 },
  { status: 'Pilot_Deployed', labelKey: 'stageDeployed', descKey: 'stageDeployedDesc', step: 5 },
];

const STATUS_STEPS: ProblemStatus[] = [
  'Submitted',
  'Routed_To_HEI',
  'In_Proposal',
  'Industry_Pledged',
  'Pilot_Deployed',
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function CitizenPortal() {
  const { problems, addProblem, updateProblem } = useStore();
  const { currentUser, openAuthModal } = useAuth();
  const { addNotification } = useNotifications();
  const [lang, setLang] = useState<Lang>('en');
  const L = LABELS[lang];

  // Navigation tab: 'report' vs 'track'
  const [activeTab, setActiveTab] = useState<'report' | 'track'>('report');
  const [trackSearchId, setTrackSearchId] = useState('');
  const [searchedId, setSearchedId] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [district, setDistrict] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [submitterType, setSubmitterType] = useState<SubmitterType>('Individual');
  const [geoDetected, setGeoDetected] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoCoords, setGeoCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [mediaBase64, setMediaBase64] = useState<string>('');

  // AI triage state
  const [triage, setTriage] = useState<AiTriageResult | null>(null);
  const triageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Deduplication state
  const [dupWarning, setDupWarning] = useState<{ problem: Problem; similarity: number }[]>([]);
  const [dupDismissed, setDupDismissed] = useState(false);

  // Success modal
  const [successId, setSuccessId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Lookup problem for tracking
  const trackedProblem = useMemo(() => {
    if (!searchedId.trim()) return null;
    const q = searchedId.trim().toLowerCase();
    return problems.find((p) => p.id.toLowerCase() === q) || null;
  }, [problems, searchedId]);

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

  // Real geolocation with district fallback
  const handleGeoDetect = useCallback(() => {
    setGeoLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGeoCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setGeoDetected(true);
          setGeoLoading(false);
        },
        () => {
          // Fallback to district coordinates on denial/error
          const coords = district
            ? DISTRICT_COORDS[district] || { lat: 23.3441, lng: 85.3096 }
            : { lat: 23.3441, lng: 85.3096 };
          setGeoCoords(coords);
          setGeoDetected(true);
          setGeoLoading(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      const coords = district
        ? DISTRICT_COORDS[district] || { lat: 23.3441, lng: 85.3096 }
        : { lat: 23.3441, lng: 85.3096 };
      setGeoCoords(coords);
      setGeoDetected(true);
      setGeoLoading(false);
    }
  }, [district]);

  // File upload with image preview & Base64 storage
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArr = Array.from(files);
      setFileNames(fileArr.map((f) => f.name));
      // Generate previews for image files
      const previews: string[] = [];
      fileArr.forEach((f) => {
        if (f.type.startsWith('image/')) {
          previews.push(URL.createObjectURL(f));
        }
      });
      setFilePreviews(previews);
      const imgFile = fileArr.find((f) => f.type.startsWith('image/'));
      if (imgFile) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setMediaBase64(reader.result);
          }
        };
        reader.readAsDataURL(imgFile);
      } else {
        setMediaBase64('');
      }
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

  // Dedup check as user types title/description
  useEffect(() => {
    if (title.length < 10 && description.length < 15) {
      setDupWarning([]);
      return;
    }
    const timer = setTimeout(() => {
      const dups = findDuplicates(title, description, problems);
      setDupWarning(dups);
      setDupDismissed(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [title, description, problems]);

  // Submit handler
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      // Check authentication: must be logged in as Citizen
      if (!currentUser || currentUser.role !== 'citizen') {
        openAuthModal('citizen');
        return;
      }

      if (!title || !district || !description || !category) return;

      // Show dedup warning if not dismissed
      if (dupWarning.length > 0 && !dupDismissed) {
        return; // blocked until user dismisses
      }

      const result = triage || classifyProblem(title, description);
      const id = generateId();

      const problem: Problem = {
        id,
        title,
        description,
        district,
        category: category as Category,
        urgency: urgencyFromScore,
        mediaUrl: mediaBase64 || (filePreviews.length > 0 ? filePreviews[0] : (fileNames.length > 0 ? fileNames[0] : '')),
        status: 'Submitted',
        targetUniversity: result.targetUniversity,
        assignedTeam: '',
        industrySponsor: '',
        fundingAmount: 0,
        submittedAt: new Date().toISOString(),
        geoCoords: geoCoords || undefined,
        submitterType,
        comments: [],
        milestones: [],
        patentsCount: 0,
        startupsCreated: 0,
        publicationsCount: 0,
      };

      addProblem(problem);
      setSuccessId(id);

      // Fire notifications
      addNotification(
        `New problem "${title}" submitted from ${district}. Routed to ${result.targetUniversity}.`,
        'university',
        id
      );
      addNotification(
        `Your problem "${title}" has been registered with ID ${id}. AI routed to ${result.targetUniversity}.`,
        'citizen',
        id
      );
      addNotification(
        `New citizen grievance registered: ${id} — ${district}, ${category}. Urgency: ${urgencyFromScore}.`,
        'government',
        id
      );

      // Reset
      setTitle('');
      setDistrict('');
      setDescription('');
      setCategory('');
      setSubmitterType('Individual');
      setGeoDetected(false);
      setGeoCoords(null);
      setFileNames([]);
      setFilePreviews([]);
      setMediaBase64('');
      setTriage(null);
      setDupWarning([]);
      setDupDismissed(false);
    },
    [title, district, description, category, triage, fileNames, filePreviews, mediaBase64, geoCoords, urgencyFromScore, addProblem, generateId, submitterType, addNotification, dupWarning, dupDismissed, currentUser, openAuthModal]
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
        className="page-container"
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
            {activeTab === 'report' ? L.heading : L.trackHeading}
          </h1>
          <p
            style={{
              color: 'var(--color-text-muted)',
              fontSize: '1rem',
              maxWidth: 580,
              margin: '0 auto 20px',
            }}
          >
            {activeTab === 'report' ? L.subtitle : L.trackSubtitle}
          </p>

          {/* Segmented Pill Tab Switcher */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
            <div
              style={{
                display: 'inline-flex',
                padding: 4,
                background: 'var(--color-surface-alt)',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('report')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 22px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  background: activeTab === 'report' ? 'var(--color-primary)' : 'transparent',
                  color: activeTab === 'report' ? '#fff' : 'var(--color-text-muted)',
                  boxShadow: activeTab === 'report' ? 'var(--shadow-sm)' : 'none',
                  transition: 'all var(--transition-base)',
                }}
              >
                <Send size={15} />
                {L.tabReport}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('track')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 22px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  background: activeTab === 'track' ? 'var(--color-primary)' : 'transparent',
                  color: activeTab === 'track' ? '#fff' : 'var(--color-text-muted)',
                  boxShadow: activeTab === 'track' ? 'var(--shadow-sm)' : 'none',
                  transition: 'all var(--transition-base)',
                }}
              >
                <Search size={15} />
                {L.tabTrack}
              </button>
            </div>
          </div>
        </div>

        {/* Main grid: form + AI panel */}
        {activeTab === 'report' && (
        <div
          className="citizen-main-grid"
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
              className="form-grid-2col"
              style={{
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

            {/* Submitter Type */}
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: 'block',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  marginBottom: 6,
                }}
              >
                {lang === 'hi' ? 'प्रस्तुतकर्ता प्रकार' : 'Submitter Type'}
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  className="input-field"
                  value={submitterType}
                  onChange={(e) => setSubmitterType(e.target.value as SubmitterType)}
                  style={{ appearance: 'none', paddingRight: 36 }}
                >
                  {(Object.keys(SUBMITTER_LABELS) as SubmitterType[]).map((st) => (
                    <option key={st} value={st}>
                      {SUBMITTER_LABELS[st]}
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
                className="btn btn-secondary"
                onClick={handleGeoDetect}
                disabled={geoLoading}
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
                  ...(geoLoading ? { opacity: 0.7, cursor: 'wait' } : {}),
                }}
              >
                <MapPin size={16} />
                {geoLoading
                  ? (lang === 'hi' ? 'GPS खोज रहा है…' : 'Detecting GPS…')
                  : geoDetected
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
              {/* Image previews */}
              {filePreviews.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    marginTop: 10,
                    flexWrap: 'wrap',
                  }}
                >
                  {filePreviews.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`Preview ${i + 1}`}
                      style={{
                        width: 72,
                        height: 72,
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-md, 8px)',
                        border: '2px solid var(--color-border)',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Deduplication Warning */}
            {dupWarning.length > 0 && !dupDismissed && (
              <div
                style={{
                  marginBottom: 20,
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md, 8px)',
                  background: 'rgba(234, 179, 8, 0.08)',
                  border: '1.5px solid rgba(234, 179, 8, 0.3)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <AlertTriangle size={16} color="#ca8a04" />
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ca8a04' }}>
                    {lang === 'hi' ? 'संभावित डुप्लिकेट पाया गया' : 'Possible Duplicate Detected'}
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 10, margin: '0 0 10px 0' }}>
                  {lang === 'hi'
                    ? 'इसी तरह की समस्याएँ पहले से दर्ज हैं:'
                    : 'Similar problems have already been reported:'}
                </p>
                {dupWarning.slice(0, 3).map((d) => (
                  <div
                    key={d.problem.id}
                    style={{
                      fontSize: '0.78rem',
                      padding: '6px 10px',
                      background: 'rgba(234, 179, 8, 0.05)',
                      borderRadius: 6,
                      marginBottom: 4,
                    }}
                  >
                    <strong>{d.problem.id}</strong> — {d.problem.title}
                    <span style={{ color: '#ca8a04', marginLeft: 8, fontWeight: 600 }}>
                      {Math.round(d.similarity * 100)}% match
                    </span>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setDupDismissed(true)}
                  className="btn btn-secondary"
                  style={{ marginTop: 10, fontSize: '0.78rem', padding: '6px 14px' }}
                >
                  {lang === 'hi' ? 'फिर भी जमा करें' : 'Submit Anyway'}
                </button>
              </div>
            )}

            {/* Submit */}
            <button
              type={currentUser?.role === 'citizen' ? 'submit' : 'button'}
              onClick={(e) => {
                if (!currentUser || currentUser.role !== 'citizen') {
                  e.preventDefault();
                  openAuthModal('citizen');
                }
              }}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
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
                    ? 'linear-gradient(135deg, #0f172a, #1e293b)'
                    : '#f1f5f9',
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
                    background: 'rgba(217, 119, 6, 0.06)',
                    border: '1px solid rgba(217, 119, 6, 0.15)',
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
        )}

        {/* ─── Tracking View ─────────────────────────────────────────── */}
        {activeTab === 'track' && (
          <div className="animate-fade-in-up" style={{ maxWidth: 880, margin: '0 auto', width: '100%' }}>
            {/* Search Card */}
            <div className="glass-card" style={{ padding: '24px 28px', marginBottom: 24 }}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (trackSearchId.trim()) setSearchedId(trackSearchId.trim());
                }}
                style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
              >
                <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
                  <Search
                    size={18}
                    style={{
                      position: 'absolute',
                      left: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--color-text-muted)',
                    }}
                  />
                  <input
                    className="input-field"
                    type="text"
                    placeholder={L.trackInputPh}
                    value={trackSearchId}
                    onChange={(e) => setTrackSearchId(e.target.value)}
                    style={{ paddingLeft: 42, fontSize: '0.95rem' }}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
                  <Search size={16} />
                  {L.trackBtn}
                </button>
                {searchedId && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setTrackSearchId('');
                      setSearchedId('');
                    }}
                  >
                    {L.trackClear}
                  </button>
                )}
              </form>

              {/* Quick Select Recent Problems */}
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 8, fontWeight: 600 }}>
                  {L.recentTitle}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {problems.slice(0, 5).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setTrackSearchId(p.id);
                        setSearchedId(p.id);
                      }}
                      style={{
                        background:
                          searchedId.toLowerCase() === p.id.toLowerCase()
                            ? 'var(--color-primary)'
                            : 'var(--color-surface-alt)',
                        color:
                          searchedId.toLowerCase() === p.id.toLowerCase()
                            ? '#fff'
                            : 'var(--color-text)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-full)',
                        padding: '4px 12px',
                        fontSize: '0.75rem',
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all var(--transition-base)',
                      }}
                    >
                      {p.id} ({p.category})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tracked Problem Result */}
            {searchedId && trackedProblem && (
              <div className="glass-card animate-fade-in-up" style={{ padding: 32, marginBottom: 24 }}>
                {/* Header info */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: 14,
                    marginBottom: 20,
                    paddingBottom: 18,
                    borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 280 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          background: 'rgba(217, 119, 6, 0.1)',
                          color: '#b45309',
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-md)',
                        }}
                      >
                        {trackedProblem.id}
                      </span>
                      <span className={`badge badge-${trackedProblem.urgency.toLowerCase()}`}>
                        {trackedProblem.urgency} Priority
                      </span>
                      <span className="badge" style={{ background: '#f1f5f9', color: '#475569' }}>
                        <Tag size={12} /> {trackedProblem.category}
                      </span>
                      <span className="badge" style={{ background: '#f1f5f9', color: '#475569' }}>
                        <MapPin size={12} /> {trackedProblem.district}
                      </span>
                    </div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-text)', margin: '0 0 8px' }}>
                      {trackedProblem.title}
                    </h2>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', margin: 0, lineHeight: 1.5 }}>
                      {trackedProblem.description}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Submitted Date
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text)' }}>
                      {new Date(trackedProblem.submittedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                </div>

                {/* 5-Stage Stepper / Timeline */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.04em', marginBottom: 14 }}>
                    {L.viewTimeline}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: 12 }}>
                    {STAGE_CONFIG.map((stage, idx) => {
                      const currentIdx = STATUS_STEPS.indexOf(trackedProblem.status);
                      const isPassed = idx < currentIdx;
                      const isCurrent = idx === currentIdx;

                      return (
                        <div
                          key={stage.status}
                          style={{
                            padding: '14px 12px',
                            borderRadius: 'var(--radius-md)',
                            background: isCurrent
                              ? 'rgba(217, 119, 6, 0.08)'
                              : isPassed
                              ? 'rgba(34, 197, 94, 0.05)'
                              : 'var(--color-surface-alt)',
                            border: isCurrent
                              ? '1.5px solid #d97706'
                              : isPassed
                              ? '1.5px solid rgba(34, 197, 94, 0.3)'
                              : '1px dashed var(--color-border)',
                            position: 'relative',
                            transition: 'all var(--transition-base)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <div
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                background: isPassed
                                  ? 'var(--color-success)'
                                  : isCurrent
                                  ? '#d97706'
                                  : 'var(--color-border)',
                                color: isPassed || isCurrent ? '#fff' : 'var(--color-text-muted)',
                              }}
                            >
                              {isPassed ? <CheckCircle2 size={15} /> : stage.step}
                            </div>
                            <span
                              style={{
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                color: isCurrent
                                  ? '#b45309'
                                  : isPassed
                                  ? 'var(--color-success)'
                                  : 'var(--color-text-muted)',
                              }}
                            >
                              {isCurrent ? 'Active Stage' : isPassed ? 'Completed' : 'Upcoming'}
                            </span>
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--color-text)', marginBottom: 4 }}>
                            {L[stage.labelKey]}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                            {L[stage.descKey]}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Stakeholder Details Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: 16,
                    background: 'var(--color-surface-alt)',
                    padding: 18,
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                      <GraduationCap size={14} /> Assigned HEI Institution
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-primary-dark)' }}>
                      {trackedProblem.targetUniversity || 'Pending Routing'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      Applied Engineering & Capstone Hub
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                      <Building2 size={14} /> CSR Industry Partner
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)' }}>
                      {trackedProblem.industrySponsor || 'Open for CSR Adoption'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {trackedProblem.fundingAmount > 0
                        ? `Pledged Funding: ₹${(trackedProblem.fundingAmount / 100000).toFixed(1)} Lakhs`
                        : 'Awaiting CSR sponsorship round'}
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                      <ShieldCheck size={14} /> Innovation Team
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)' }}>
                      {trackedProblem.assignedTeam || 'Team Allocation in Progress'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      Aligned with NEP 2020 experiential learning
                    </div>
                  </div>
                </div>

                {/* Citizen Media Evidence */}
                {trackedProblem.mediaUrl && (
                  <div
                    style={{
                      marginTop: 20,
                      padding: '14px 16px',
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
                        marginBottom: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <ImageIcon size={14} /> {lang === 'hi' ? 'साक्ष्य फोटो' : 'Citizen Uploaded Evidence'}
                    </div>
                    <img
                      src={trackedProblem.mediaUrl}
                      alt="Citizen evidence"
                      style={{
                        maxHeight: 240,
                        maxWidth: '100%',
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--color-border)',
                      }}
                    />
                  </div>
                )}

                {/* Milestones Checklist */}
                {trackedProblem.milestones && trackedProblem.milestones.length > 0 && (
                  <div
                    style={{
                      marginTop: 20,
                      padding: '16px 20px',
                      background: 'var(--color-surface-alt)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: 'var(--color-primary-dark)',
                          letterSpacing: '0.04em',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <CheckSquare size={15} /> {lang === 'hi' ? 'परियोजना मील के पत्थर' : 'Project Milestones & Deliverables'}
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                        {trackedProblem.milestones.filter((m) => m.completed).length} / {trackedProblem.milestones.length}{' '}
                        {lang === 'hi' ? 'पूर्ण' : 'Completed'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {trackedProblem.milestones.map((m, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            background: m.completed ? 'rgba(34, 197, 94, 0.08)' : 'var(--color-surface)',
                            border: `1px solid ${m.completed ? 'rgba(34, 197, 94, 0.3)' : 'var(--color-border)'}`,
                            borderRadius: 'var(--radius-sm)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {m.completed ? (
                              <CheckCircle2 size={16} color="#16a34a" />
                            ) : (
                              <Clock size={16} color="var(--color-text-muted)" />
                            )}
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
                          <span
                            style={{
                              fontSize: '0.72rem',
                              color: 'var(--color-text-muted)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <Calendar size={12} /> {m.targetDate}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Citizen Discussion Section */}
                <CitizenCommentSection problem={trackedProblem} lang={lang} />
              </div>
            )}

            {/* Not Found state */}
            {searchedId && !trackedProblem && (
              <div className="glass-card animate-fade-in-up" style={{ padding: 36, textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <AlertTriangle size={24} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 8, color: 'var(--color-text)' }}>
                  {L.trackNotFound} &quot;{searchedId}&quot;
                </h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', maxWidth: 460, margin: '0 auto 20px' }}>
                  {L.trackNotFoundHint}
                </p>
              </div>
            )}

            {/* Welcome state when no search yet */}
            {!searchedId && (
              <div className="glass-card animate-fade-in-up" style={{ padding: 36, textAlign: 'center' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(217, 119, 6, 0.1)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Search size={26} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8, color: 'var(--color-text)' }}>
                  {L.trackHeading}
                </h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', maxWidth: 500, margin: '0 auto' }}>
                  {L.trackSubtitle}
                </p>
              </div>
            )}
          </div>
        )}
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
              onClick={() => {
                if (successId) {
                  setTrackSearchId(successId);
                  setSearchedId(successId);
                  setActiveTab('track');
                  setSuccessId(null);
                }
              }}
              style={{ width: '100%', marginBottom: 10 }}
            >
              <Search size={16} />
              {L.trackNowBtn}
            </button>
            <button
              className="btn btn-secondary"
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

// ─── Citizen Comment Section ────────────────────────────────────────────────

function CitizenCommentSection({
  problem,
  lang,
}: {
  problem: Problem;
  lang: 'en' | 'hi';
}) {
  const { updateProblem } = useStore();
  const { currentUser, openAuthModal } = useAuth();
  const { addNotification } = useNotifications();
  const [commentText, setCommentText] = useState('');

  const comments = problem.comments || [];

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser || currentUser.role !== 'citizen') {
      openAuthModal('citizen');
      return;
    }

    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: `c-cit-${Date.now()}`,
      author: currentUser.displayName || (lang === 'hi' ? 'नागरिक प्रस्तुतकर्ता' : 'Citizen Submitter'),
      role: 'citizen',
      text: commentText.trim(),
      timestamp: new Date().toISOString(),
    };

    updateProblem(problem.id, {
      comments: [...comments, newComment],
    });

    addNotification(
      `Citizen added follow-up note on ${problem.id}: "${commentText.trim().slice(0, 40)}..."`,
      'university',
      problem.id
    );
    addNotification(
      `Citizen comment on ${problem.id}: "${commentText.trim().slice(0, 40)}..."`,
      'government',
      problem.id
    );

    setCommentText('');
  };

  const ROLE_COLORS: Record<string, string> = {
    citizen: '#2563eb',
    university: '#4338ca',
    industry: '#0284c7',
    government: '#059669',
    admin: '#059669',
  };

  const ROLE_LABELS: Record<string, string> = {
    citizen: lang === 'hi' ? 'नागरिक' : 'Citizen',
    university: lang === 'hi' ? 'विश्वविद्यालय' : 'University HEI',
    industry: lang === 'hi' ? 'उद्योग CSR' : 'Industry Sponsor',
    government: lang === 'hi' ? 'सरकारी नोडल' : 'Government Officer',
    admin: lang === 'hi' ? 'प्रशासक' : 'Admin',
  };

  return (
    <div
      style={{
        marginTop: 24,
        padding: '18px 20px',
        background: 'var(--color-surface-alt)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <div
        style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          color: 'var(--color-text-muted)',
          letterSpacing: '0.04em',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <MessageCircle size={14} /> {lang === 'hi' ? 'हितधारक चर्चा एवं अनुवर्ती टिप्पणियाँ' : 'Stakeholder Communication Log'} ({comments.length})
      </div>

      {comments.length === 0 && (
        <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', fontStyle: 'italic', marginBottom: 12 }}>
          {lang === 'hi'
            ? 'अभी तक कोई टिप्पणी नहीं है। समाधान प्रक्रिया के संबंध में अतिरिक्त विवरण या प्रश्न नीचे पोस्ट करें।'
            : 'No follow-up notes yet. Post additional details or queries regarding this resolution below.'}
        </p>
      )}

      {comments.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {comments.map((c) => (
            <div
              key={c.id}
              style={{
                padding: '10px 14px',
                borderLeft: `3px solid ${ROLE_COLORS[c.role] || '#888'}`,
                background: 'var(--color-surface)',
                borderRadius: '0 var(--radius-sm, 6px) var(--radius-sm, 6px) 0',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: ROLE_COLORS[c.role] || '#888' }}>
                    {c.author}
                  </span>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      padding: '1px 6px',
                      borderRadius: 4,
                      background: `${ROLE_COLORS[c.role] || '#888'}15`,
                      color: ROLE_COLORS[c.role] || '#888',
                      fontWeight: 600,
                    }}
                  >
                    {ROLE_LABELS[c.role] || c.role}
                  </span>
                </div>
                <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
                  {new Date(c.timestamp).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', lineHeight: 1.5, color: 'var(--color-text)', margin: 0 }}>
                {c.text}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Add follow-up comment */}
      <form onSubmit={handlePost} style={{ display: 'flex', gap: 8 }}>
        <input
          className="input-field"
          placeholder={
            lang === 'hi'
              ? 'अतिरिक्त जानकारी या प्रश्न जोड़ें...'
              : 'Add an update, clarification, or question...'
          }
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          style={{ flex: 1, fontSize: '0.82rem' }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          style={{ padding: '8px 16px', flexShrink: 0 }}
          disabled={!commentText.trim()}
        >
          <Send size={14} /> {lang === 'hi' ? 'भेजें' : 'Send'}
        </button>
      </form>
    </div>
  );
}
