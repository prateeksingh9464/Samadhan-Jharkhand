'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import type { Problem, Role } from './types';

// ─── Seed Data ──────────────────────────────────────────────────────────────

const SEED_PROBLEMS: Problem[] = [
  {
    id: 'JH-PRB-2026-1001',
    title: 'Coal Dust Pollution Near Residential Areas',
    description:
      'Residents of Jharia and surrounding colonies in Dhanbad are severely affected by coal dust from open-cast mining operations. Particulate matter levels routinely exceed safe limits (PM2.5 > 300 µg/m³). Children and elderly report chronic respiratory issues, and visibility drops below 200m during dry months. The coal washeries discharge effluent into local nalas. Urgent need for real-time air-quality monitoring stations, dust suppression systems, and a community health screening program.',
    district: 'Dhanbad',
    category: 'Mining/Env',
    urgency: 'Critical',
    mediaUrl: '',
    status: 'Submitted',
    targetUniversity: 'IIT (ISM) Dhanbad',
    assignedTeam: '',
    industrySponsor: '',
    fundingAmount: 0,
    submittedAt: '2026-08-15T09:30:00+05:30',
    geoCoords: { lat: 23.7957, lng: 86.4304 },
  },
  {
    id: 'JH-PRB-2026-1002',
    title: 'Drought-Resilient Crop Varieties Needed for Palamu Farmers',
    description:
      'Palamu district has experienced 3 consecutive years of below-normal rainfall (deficit > 35%). Smallholder farmers growing paddy and maize face total crop loss in kharif season. Existing seed varieties are not drought-tolerant. Farmers lack access to drip/sprinkler irrigation. Need urgent development and distribution of climate-resilient millet and pulse varieties suitable for the Chotanagpur plateau soil profile, along with farmer training in water-efficient cultivation techniques.',
    district: 'Palamu',
    category: 'Agriculture',
    urgency: 'Critical',
    mediaUrl: '',
    status: 'Routed_To_HEI',
    targetUniversity: 'Birsa Agricultural University, Ranchi',
    assignedTeam: '',
    industrySponsor: '',
    fundingAmount: 0,
    submittedAt: '2026-08-20T14:15:00+05:30',
    geoCoords: { lat: 24.0268, lng: 84.0531 },
  },
  {
    id: 'JH-PRB-2026-1003',
    title: 'Arsenic Contamination in Groundwater Sources',
    description:
      'Multiple blocks in Hazaribagh district have tested positive for arsenic levels exceeding 50 ppb (WHO safe limit: 10 ppb) in hand-pump and tube-well water sources. Over 12,000 households depend on these contaminated sources as their primary drinking water supply. Cases of arsenicosis skin lesions have been reported in Barkagaon and Churchu blocks. Immediate need for arsenic filtration units, alternative safe-water supply, and a comprehensive groundwater mapping study.',
    district: 'Hazaribagh',
    category: 'Water',
    urgency: 'Critical',
    mediaUrl: '',
    status: 'In_Proposal',
    targetUniversity: 'NIT Jamshedpur',
    assignedTeam: 'NIT-J Water Research Lab',
    industrySponsor: '',
    fundingAmount: 0,
    submittedAt: '2026-07-10T11:00:00+05:30',
    geoCoords: { lat: 23.9925, lng: 85.3637 },
  },
  {
    id: 'JH-PRB-2026-1004',
    title: 'Lac Cultivation Post-Harvest Losses in Khunti',
    description:
      'Khunti district is one of India\'s largest lac-producing regions, yet tribal farmers lose 30-40% of harvest due to lack of proper processing, storage, and market linkage infrastructure. Lac scraped from kusum and palash trees degrades rapidly in monsoon humidity. Farmers sell to middlemen at 40% below market rates. Need for solar-powered drying units, community-level processing centers, and a digital marketplace connecting cultivators directly with shellac/resin buyers.',
    district: 'Khunti',
    category: 'Agriculture',
    urgency: 'Medium',
    mediaUrl: '',
    status: 'Industry_Pledged',
    targetUniversity: 'Birsa Agricultural University, Ranchi',
    assignedTeam: 'BAU Lac Research Division',
    industrySponsor: 'Tata Steel CSR Foundation',
    fundingAmount: 1250000,
    submittedAt: '2026-06-25T16:45:00+05:30',
    geoCoords: { lat: 23.0741, lng: 85.2787 },
  },
  {
    id: 'JH-PRB-2026-1005',
    title: 'Lack of Telemedicine Connectivity in Remote Blocks',
    description:
      'Gumla district\'s interior blocks (Raidih, Sisai, Chainpur) have no Primary Health Centre within 25 km radius. Tribal communities rely on traditional healers for serious conditions including complicated pregnancies and snakebites. Mobile network coverage is patchy (2G only in most areas). Need for a satellite-linked telemedicine kiosk network with basic diagnostic equipment (BP monitor, pulse oximeter, thermal scanner) staffed by trained ASHA workers, with specialist doctor consultations from RIMS Ranchi.',
    district: 'Gumla',
    category: 'Health',
    urgency: 'Medium',
    mediaUrl: '',
    status: 'Submitted',
    targetUniversity: 'RIMS Ranchi',
    assignedTeam: '',
    industrySponsor: '',
    fundingAmount: 0,
    submittedAt: '2026-09-01T08:20:00+05:30',
    geoCoords: { lat: 23.0437, lng: 84.5419 },
  },
  {
    id: 'JH-PRB-2026-1006',
    title: 'Damaged Rural Bridge on Subarnarekha Tributary',
    description:
      'The single-lane concrete bridge connecting Mosaboni and Rakha Mines area in East Singhbhum over a Subarnarekha tributary has developed severe structural cracks after the 2025 monsoon floods. Load-bearing capacity is compromised — heavy vehicles (> 5 tonnes) are banned. Villagers from 8 panchayats use alternate 40 km detour, disrupting school attendance, market access, and emergency medical transport. Need structural assessment, temporary bailey bridge, and permanent reconstruction design.',
    district: 'East Singhbhum',
    category: 'Rural Infra',
    urgency: 'Low',
    mediaUrl: '',
    status: 'Submitted',
    targetUniversity: 'BIT Mesra, Ranchi',
    assignedTeam: '',
    industrySponsor: '',
    fundingAmount: 0,
    submittedAt: '2026-09-03T10:00:00+05:30',
    geoCoords: { lat: 22.5726, lng: 86.2029 },
  },
];

// ─── Store Actions ──────────────────────────────────────────────────────────

type StoreAction =
  | { type: 'ADD_PROBLEM'; payload: Problem }
  | { type: 'UPDATE_PROBLEM'; payload: { id: string; updates: Partial<Problem> } }
  | { type: 'HYDRATE'; payload: Problem[] };

function storeReducer(state: Problem[], action: StoreAction): Problem[] {
  switch (action.type) {
    case 'ADD_PROBLEM':
      return [action.payload, ...state];
    case 'UPDATE_PROBLEM':
      return state.map((p) =>
        p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
      );
    case 'HYDRATE':
      return action.payload;
    default:
      return state;
  }
}

// ─── Context ────────────────────────────────────────────────────────────────

interface StoreContextValue {
  problems: Problem[];
  addProblem: (p: Problem) => void;
  updateProblem: (id: string, updates: Partial<Problem>) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const STORAGE_KEY = 'samadhan_jh_problems';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [problems, dispatch] = useReducer(storeReducer, SEED_PROBLEMS);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Problem[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          dispatch({ type: 'HYDRATE', payload: parsed });
        }
      }
    } catch {
      // localStorage unavailable or corrupted — use seed data
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage on every change (after hydration)
  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(problems));
      } catch {
        // storage full — silently ignore
      }
    }
  }, [problems, hydrated]);

  const addProblem = useCallback((p: Problem) => {
    dispatch({ type: 'ADD_PROBLEM', payload: p });
  }, []);

  const updateProblem = useCallback((id: string, updates: Partial<Problem>) => {
    dispatch({ type: 'UPDATE_PROBLEM', payload: { id, updates } });
  }, []);

  const value = useMemo(
    () => ({ problems, addProblem, updateProblem }),
    [problems, addProblem, updateProblem]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within <StoreProvider>');
  return ctx;
}

// ─── Role Context ───────────────────────────────────────────────────────────

interface RoleContextValue {
  role: Role;
  setRole: (r: Role) => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('citizen');
  const value = useMemo(() => ({ role, setRole }), [role]);
  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within <RoleProvider>');
  return ctx;
}
