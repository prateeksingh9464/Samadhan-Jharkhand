// ─── AI Routing Engine (Deterministic Keyword Classifier) ──────────────────
//
// Analyzes problem title + description text to produce:
//   { domain, urgencyScore, targetUniversity, suggestedDepartment, nepAlignmentNote }
//
// This is a simulation layer; in production, replace with an LLM / ML pipeline.

import { type AiTriageResult, type Category, type Problem } from './types';

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
  Energy: [
    'energy', 'solar panel', 'renewable', 'biomass', 'biogas', 'wind energy',
    'power grid', 'electrification', 'off-grid', 'battery', 'inverter',
    'transformer', 'voltage', 'load shedding', 'power cut', 'microgrid',
    'clean energy', 'fuel', 'kerosene', 'lpg', 'cooking gas',
  ],
  Sanitation: [
    'sanitation', 'open defecation', 'latrine', 'sewage', 'solid waste',
    'garbage', 'waste management', 'dumping', 'compost', 'recycling',
    'swachh', 'cleanliness', 'drain', 'gutter', 'septic', 'sewer',
    'municipal waste', 'plastic waste', 'biomedical waste', 'slum',
  ],
  'Urban Dev': [
    'urban', 'city', 'municipal', 'smart city', 'traffic', 'parking',
    'public transport', 'metro', 'bus', 'streetlight', 'footpath',
    'market', 'commercial', 'town planning', 'zoning', 'encroachment',
    'heritage', 'beautification', 'park', 'recreation',
  ],
  'Public Admin': [
    'ration', 'pension', 'certificate', 'license', 'permit', 'registration',
    'grievance', 'corruption', 'transparency', 'e-governance', 'digital india',
    'aadhaar', 'welfare', 'scheme', 'subsidy', 'beneficiary', 'pds',
    'administration', 'bureaucracy', 'government service', 'portal',
  ],
};

// ── Urgency keywords & scoring ──────────────────────────────────────────────

export const FATAL_KEYWORDS = [
  'die', 'died', 'dead', 'death', 'deaths', 'fatal', 'fatality', 'fatalities',
  'kill', 'killed', 'killing', 'casualty', 'casualties', 'lethal',
  'life-threatening', 'catastrophe', 'catastrophic', 'poisoned', 'cyanide'
];

export const VULNERABLE_KEYWORDS = [
  'child', 'children', 'infant', 'infants', 'baby', 'babies', 'school', 'hospital', 'patient', 'pregnant'
];

const URGENCY_BOOSTERS: { keywords: string[]; boost: number }[] = [
  {
    keywords: [
      'death', 'died', 'dead', 'fatal', 'life-threatening', 'emergency', 'collapse',
      'extreme', 'crisis', 'disaster', 'catastrophe', 'lethal', 'fatalities', 'killed'
    ],
    boost: 4,
  },
  {
    keywords: [
      'toxic', 'contamination', 'arsenic', 'critical', 'epidemic', 'outbreak',
      'poison', 'poisoned', 'poisoning', 'poisonous', 'children', 'infant', 'student',
      'school', 'hospitalized', 'infection', 'sick', 'illness'
    ],
    boost: 3,
  },
  {
    keywords: [
      'severe', 'acute', 'dangerous', 'hazardous', 'displacement',
      'danger', 'polluted', 'pollution', 'unsafe', 'unpotable', 'drought',
      'flooding', 'overflow'
    ],
    boost: 2,
  },
  {
    keywords: [
      'damaged', 'broken', 'urgent', 'immediate', 'shortage',
      'failing', 'disrupted', 'blocked'
    ],
    boost: 1.5,
  },
  {
    keywords: [
      'chronic', 'ongoing', 'persistent', 'recurring', 'frequent'
    ],
    boost: 1,
  },
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
  Energy: {
    university: 'IIT (ISM) Dhanbad',
    department: 'Electrical Engineering & Renewable Energy Lab',
    nepNote:
      'Supports NEP 2020 emphasis on clean-energy research, sustainable development goals, and interdisciplinary technology programs.',
  },
  Sanitation: {
    university: 'NIT Jamshedpur',
    department: 'Environmental & Sanitation Engineering',
    nepNote:
      'Aligned with NEP 2020 focus on community-engaged research addressing Swachh Bharat and public-health infrastructure.',
  },
  'Urban Dev': {
    university: 'BIT Mesra, Ranchi',
    department: 'Architecture & Urban Planning',
    nepNote:
      'Supports NEP 2020 vision of smart, sustainable urban development through academic research and community co-design.',
  },
  'Public Admin': {
    university: 'Central University of Jharkhand',
    department: 'Public Policy & Governance Studies',
    nepNote:
      'Aligned with NEP 2020 emphasis on e-governance research, administrative transparency, and citizen-centric service delivery.',
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
    Energy: 0,
    Sanitation: 0,
    'Urban Dev': 0,
    'Public Admin': 0,
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
  const hasFatal = FATAL_KEYWORDS.some((kw) => text.includes(kw));
  const hasVulnerable = VULNERABLE_KEYWORDS.some((kw) => text.includes(kw));

  if (hasFatal) {
    // Immediate top urgency if loss of life, poisoning, or lethal hazard detected
    urgencyScore = 10;
  } else {
    for (const { keywords, boost } of URGENCY_BOOSTERS) {
      for (const kw of keywords) {
        if (text.includes(kw)) {
          urgencyScore += boost;
          break; // only one boost per tier
        }
      }
    }
    // Boost if vulnerable groups (children, pregnant, hospital) affected
    if (hasVulnerable && urgencyScore >= 6) {
      urgencyScore += 2;
    }
    urgencyScore = Math.min(10, Math.max(1, Math.round(urgencyScore)));
  }

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

// ── Deduplication via Jaccard Similarity ─────────────────────────────────────

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  let intersection = 0;
  for (const word of a) {
    if (b.has(word)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Finds problems similar to the new submission using Jaccard word-token similarity.
 * Returns matching problems with similarity above the threshold (default 0.35).
 */
export function findDuplicates(
  newTitle: string,
  newDescription: string,
  existingProblems: Problem[],
  threshold = 0.35
): { problem: Problem; similarity: number }[] {
  const newTokens = tokenize(`${newTitle} ${newDescription}`);
  if (newTokens.size === 0) return [];

  const results: { problem: Problem; similarity: number }[] = [];

  for (const p of existingProblems) {
    const existingTokens = tokenize(`${p.title} ${p.description}`);
    const sim = jaccardSimilarity(newTokens, existingTokens);
    if (sim >= threshold) {
      results.push({ problem: p, similarity: sim });
    }
  }

  // Sort by similarity descending
  results.sort((a, b) => b.similarity - a.similarity);
  return results;
}

