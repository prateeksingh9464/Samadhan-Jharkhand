// ─── AI Routing Engine (Deterministic Keyword Classifier) ──────────────────
//
// Analyzes problem title + description text to produce:
//   { domain, urgencyScore, targetUniversity, suggestedDepartment, nepAlignmentNote }
//
// This is a simulation layer; in production, replace with an LLM / ML pipeline.

import { type AiTriageResult, type Category } from './types';

// ── Keyword → Category mapping ──────────────────────────────────────────────

const DOMAIN_KEYWORDS: Record<Category, string[]> = {
  Agriculture: [
    'crop', 'farm', 'agriculture', 'irrigation', 'harvest', 'seed', 'fertilizer',
    'drought', 'soil', 'lac', 'cultivation', 'paddy', 'wheat', 'vegetable',
    'horticulture', 'livestock', 'dairy', 'fishery', 'sericulture', 'millet',
    'pest', 'kharif', 'rabi', 'manure', 'organic farming',
  ],
  Water: [
    'water', 'groundwater', 'arsenic', 'fluoride', 'borewell', 'tube well',
    'contamination', 'drinking water', 'well', 'river', 'dam', 'flood',
    'waterlogging', 'sewage', 'drainage', 'purification', 'rainwater',
    'hand pump', 'pipeline', 'aquifer',
  ],
  Health: [
    'health', 'hospital', 'disease', 'malaria', 'dengue', 'doctor', 'medicine',
    'telemedicine', 'clinic', 'ambulance', 'vaccine', 'nutrition', 'maternal',
    'anemia', 'tuberculosis', 'sanitation', 'hygiene', 'sickle cell',
    'patient', 'medical', 'diagnosis', 'treatment',
  ],
  Education: [
    'school', 'education', 'teacher', 'student', 'literacy', 'digital',
    'classroom', 'dropout', 'enrollment', 'skill', 'training', 'vocational',
    'e-learning', 'library', 'scholarship', 'mid-day meal', 'hostel',
    'university', 'college', 'curriculum',
  ],
  'Rural Infra': [
    'road', 'bridge', 'electricity', 'power', 'solar', 'infrastructure',
    'connectivity', 'transport', 'highway', 'construction', 'housing',
    'toilet', 'network', 'telecom', 'internet', 'panchayat', 'building',
    'rural', 'village', 'damaged',
  ],
  'Mining/Env': [
    'mining', 'coal', 'pollution', 'dust', 'environment', 'deforestation',
    'waste', 'emission', 'toxic', 'displacement', 'rehabilitation',
    'reclamation', 'air quality', 'particulate', 'overburden', 'slag',
    'effluent', 'mica', 'iron ore', 'bauxite', 'forest',
  ],
};

// ── Urgency keywords & scoring ──────────────────────────────────────────────

const URGENCY_BOOSTERS: { keywords: string[]; boost: number }[] = [
  { keywords: ['death', 'fatal', 'life-threatening', 'emergency', 'collapse'], boost: 3 },
  { keywords: ['toxic', 'contamination', 'arsenic', 'critical', 'epidemic', 'outbreak'], boost: 2.5 },
  { keywords: ['severe', 'acute', 'dangerous', 'hazardous', 'displacement'], boost: 2 },
  { keywords: ['damaged', 'broken', 'urgent', 'immediate', 'shortage'], boost: 1.5 },
  { keywords: ['chronic', 'ongoing', 'persistent', 'recurring', 'frequent'], boost: 1 },
];

// ── University & Department mapping ─────────────────────────────────────────

interface UniversityMapping {
  university: string;
  department: string;
  nepNote: string;
}

const UNIVERSITY_MAP: Record<Category, UniversityMapping> = {
  Agriculture: {
    university: 'Birsa Agricultural University, Ranchi',
    department: 'Dept. of Agronomy',
    nepNote:
      'Aligned with NEP 2020 emphasis on multidisciplinary research in agricultural sciences and community-driven innovation labs.',
  },
  Water: {
    university: 'NIT Jamshedpur',
    department: 'Civil & Environmental Engineering',
    nepNote:
      'Supports NEP 2020 vision of research-driven HEIs addressing local environmental challenges through applied engineering.',
  },
  Health: {
    university: 'RIMS Ranchi',
    department: 'Community Medicine',
    nepNote:
      'Aligns with NEP 2020 goal of integrating healthcare education with grassroots public-health intervention programs.',
  },
  Education: {
    university: 'Central University of Jharkhand',
    department: 'Education Technology',
    nepNote:
      'Directly supports NEP 2020 pillars of equitable access, technology-enabled learning, and teacher capacity building.',
  },
  'Rural Infra': {
    university: 'BIT Mesra, Ranchi',
    department: 'Civil Engineering',
    nepNote:
      'Supports NEP 2020 mandate for HEIs to engage with community infrastructure needs via capstone and service-learning projects.',
  },
  'Mining/Env': {
    university: 'IIT (ISM) Dhanbad',
    department: 'Environmental Science & Engineering',
    nepNote:
      'Aligned with NEP 2020 emphasis on sustainability research, environmental stewardship, and industry-academia partnerships.',
  },
};

// ── Core Classification Function ────────────────────────────────────────────

export function classifyProblem(title: string, description: string): AiTriageResult {
  const text = `${title} ${description}`.toLowerCase();

  // 1. Score each category by keyword hits
  const scores: Record<Category, number> = {
    Agriculture: 0,
    Water: 0,
    Health: 0,
    Education: 0,
    'Rural Infra': 0,
    'Mining/Env': 0,
  };

  for (const [cat, keywords] of Object.entries(DOMAIN_KEYWORDS) as [Category, string[]][]) {
    for (const kw of keywords) {
      if (text.includes(kw)) {
        scores[cat] += 1;
      }
    }
  }

  // 2. Pick the top-scoring domain (fallback to 'Rural Infra' as general-purpose)
  let domain: Category = 'Rural Infra';
  let maxScore = 0;
  for (const [cat, score] of Object.entries(scores) as [Category, number][]) {
    if (score > maxScore) {
      maxScore = score;
      domain = cat;
    }
  }

  // 3. Compute urgency score (base 4, boosted by keywords, clamped 1-10)
  let urgencyScore = 4;
  for (const { keywords, boost } of URGENCY_BOOSTERS) {
    for (const kw of keywords) {
      if (text.includes(kw)) {
        urgencyScore += boost;
        break; // only one boost per tier
      }
    }
  }
  urgencyScore = Math.min(10, Math.max(1, Math.round(urgencyScore)));

  // 4. Look up university mapping
  const mapping = UNIVERSITY_MAP[domain];

  return {
    domain,
    urgencyScore,
    targetUniversity: mapping.university,
    suggestedDepartment: mapping.department,
    nepAlignmentNote: mapping.nepNote,
  };
}
