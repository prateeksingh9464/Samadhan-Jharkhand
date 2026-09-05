// ─── Shared Types for Samadhan Jharkhand ───────────────────────────────────

export type Category =
  | 'Agriculture'
  | 'Water'
  | 'Health'
  | 'Education'
  | 'Rural Infra'
  | 'Mining/Env';

export type Urgency = 'Low' | 'Medium' | 'Critical';

export type ProblemStatus =
  | 'Submitted'
  | 'Routed_To_HEI'
  | 'In_Proposal'
  | 'Industry_Pledged'
  | 'Pilot_Deployed';

export interface Problem {
  id: string;
  title: string;
  description: string;
  district: string;
  category: Category;
  urgency: Urgency;
  mediaUrl: string;
  status: ProblemStatus;
  targetUniversity: string;
  assignedTeam: string;
  industrySponsor: string;
  fundingAmount: number;
  submittedAt: string; // ISO date string
  geoCoords?: { lat: number; lng: number };
}

export interface AiTriageResult {
  domain: Category;
  urgencyScore: number; // 1-10
  targetUniversity: string;
  suggestedDepartment: string;
  nepAlignmentNote: string;
}

export type Role = 'citizen' | 'university' | 'industry' | 'government' | 'admin';

export const ROLE_LABELS: Record<Role, string> = {
  citizen: 'Citizen View',
  university: 'University: IIT ISM Dhanbad',
  industry: 'Industry: Tata Steel CSR',
  government: 'Gov Dashboard: Govt of Jharkhand',
  admin: 'Gov Dashboard: Govt of Jharkhand',
};

export const JHARKHAND_DISTRICTS = [
  'Bokaro',
  'Chatra',
  'Deoghar',
  'Dhanbad',
  'Dumka',
  'East Singhbhum',
  'Garhwa',
  'Giridih',
  'Godda',
  'Gumla',
  'Hazaribagh',
  'Jamtara',
  'Khunti',
  'Koderma',
  'Latehar',
  'Lohardaga',
  'Pakur',
  'Palamu',
  'Ramgarh',
  'Ranchi',
  'Sahebganj',
  'Saraikela-Kharsawan',
  'Simdega',
  'West Singhbhum',
] as const;

export const CATEGORIES: Category[] = [
  'Agriculture',
  'Water',
  'Health',
  'Education',
  'Rural Infra',
  'Mining/Env',
];
