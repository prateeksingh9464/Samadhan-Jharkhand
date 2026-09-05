// ─── Shared Types for Samadhan Jharkhand ───────────────────────────────────

export type Category =
  | 'Agriculture'
  | 'Water'
  | 'Health'
  | 'Education'
  | 'Rural Infra'
  | 'Mining/Env'
  | 'Energy'
  | 'Sanitation'
  | 'Urban Dev'
  | 'Public Admin';

export type Urgency = 'Low' | 'Medium' | 'Critical';

export type ProblemStatus =
  | 'Submitted'
  | 'Routed_To_HEI'
  | 'In_Proposal'
  | 'Industry_Pledged'
  | 'Pilot_Deployed';

export type SubmitterType =
  | 'Individual'
  | 'PRI'
  | 'ULB'
  | 'GovDepartment'
  | 'CommunityOrg';

export const SUBMITTER_LABELS: Record<SubmitterType, string> = {
  Individual: 'Individual Citizen',
  PRI: 'Panchayati Raj Institution',
  ULB: 'Urban Local Body',
  GovDepartment: 'Government Department',
  CommunityOrg: 'Community Organization / NGO',
};

export interface Comment {
  id: string;
  author: string;
  role: Role;
  text: string;
  timestamp: string;
}

export interface Milestone {
  label: string;
  targetDate: string;
  completed: boolean;
}

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
  submitterType?: SubmitterType;
  comments?: Comment[];
  milestones?: Milestone[];
  preferredSponsor?: string;
  patentsCount?: number;
  startupsCreated?: number;
  publicationsCount?: number;
}

export const CORPORATE_SPONSORS = [
  'Open to All Corporate Sponsors (Consortium)',
  'Tata Steel CSR Foundation',
  'Central Coalfields Ltd (CCL) CSR',
  'Adani Foundation Jharkhand',
  'Usha Martin Foundation',
  'Vedanta / ESL Steel CSR',
  'Jindal Steel & Power (JSP) Foundation',
] as const;

export interface AppNotification {
  id: string;
  message: string;
  role: Role;
  timestamp: string;
  read: boolean;
  problemId: string;
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
  university: 'University Workspace',
  industry: 'Industry & CSR Hub',
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
  'Energy',
  'Sanitation',
  'Urban Dev',
  'Public Admin',
];
