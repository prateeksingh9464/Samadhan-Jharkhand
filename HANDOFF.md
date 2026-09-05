# Samadhan Jharkhand — Phase 1 Handoff Document

> **Smart India Hackathon 2026 · Societal Innovation Collaboration Portal**
> Phase 1 prototype — Citizen Engagement + AI Routing + Role Switching

---

## 📁 Project File Map

```
d:\SIH\
├── src/
│   ├── app/
│   │   ├── globals.css          # Design system (custom properties, utilities, animations)
│   │   ├── layout.tsx           # Root layout with metadata, Google Fonts (Inter), Providers wrapper
│   │   ├── providers.tsx        # Client-side providers (StoreProvider, RoleProvider, DemoNavbar)
│   │   └── page.tsx             # Role-based view switch (Citizen → CitizenPortal, others → Phase2Card)
│   ├── components/
│   │   ├── DemoNavbar.tsx       # Sticky top navbar with SIH banner + 4-role pill switcher
│   │   └── citizen/
│   │       └── CitizenPortal.tsx # Full citizen submission form + live AI triage panel
│   └── lib/
│       ├── types.ts             # All shared TS interfaces, constants, district list, categories
│       ├── ai-engine.ts         # Deterministic keyword-based AI classification engine
│       └── store.tsx            # React Context store + localStorage hydration + 6 seed problems
├── HANDOFF.md                   # This file
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

---

## 🗃️ State Shape

The global store (`src/lib/store.tsx`) manages a `Problem[]` array via `useReducer`.

### Problem Interface

```typescript
interface Problem {
  id: string;                  // e.g., "JH-PRB-2026-1001"
  title: string;
  description: string;
  district: string;            // One of 24 Jharkhand districts
  category: Category;          // 'Agriculture' | 'Water' | 'Health' | 'Education' | 'Rural Infra' | 'Mining/Env'
  urgency: Urgency;            // 'Low' | 'Medium' | 'Critical'
  mediaUrl: string;
  status: ProblemStatus;       // 'Submitted' | 'Routed_To_HEI' | 'In_Proposal' | 'Industry_Pledged' | 'Pilot_Deployed'
  targetUniversity: string;
  assignedTeam: string;
  industrySponsor: string;
  fundingAmount: number;
  submittedAt: string;         // ISO 8601
  geoCoords?: { lat: number; lng: number };
}
```

### How to Add a Problem

```typescript
import { useStore } from '@/lib/store';

const { addProblem } = useStore();
addProblem({
  id: 'JH-PRB-2026-XXXX',
  title: '...',
  // ... all fields
});
```

### How to Update a Problem

```typescript
const { updateProblem } = useStore();
updateProblem('JH-PRB-2026-1001', {
  status: 'Routed_To_HEI',
  assignedTeam: 'IIT ISM Team Alpha',
});
```

### Persistence

- State is hydrated from `localStorage` key `samadhan_jh_problems` on mount.
- Every mutation persists the full array back to `localStorage`.
- To reset to seed data: clear `localStorage` and refresh.

---

## 🤖 AI Routing Engine

`src/lib/ai-engine.ts` exposes a single function:

```typescript
classifyProblem(title: string, description: string): AiTriageResult
```

**Logic:**
1. Concatenates `title + description`, lowercases.
2. Scans against 6 keyword lists (one per category); highest-scoring category wins.
3. Computes urgency score (base 4 + keyword boosts, clamped 1–10).
4. Maps category → target university + department + NEP 2020 note.

**University Mapping:**

| Category     | University                        | Department                         |
|-------------|-----------------------------------|------------------------------------|
| Agriculture  | Birsa Agricultural University     | Dept. of Agronomy                  |
| Water        | NIT Jamshedpur                    | Civil & Environmental Engineering  |
| Health       | RIMS Ranchi                       | Community Medicine                 |
| Education    | Central University of Jharkhand   | Education Technology               |
| Rural Infra  | BIT Mesra, Ranchi                 | Civil Engineering                  |
| Mining/Env   | IIT (ISM) Dhanbad                 | Environmental Science & Engg.      |

---

## 🎭 Role Switching

The `DemoNavbar` provides 4 role pills. Active role is stored in `RoleContext` (no auth required). The main `page.tsx` renders:

| Role       | View                    |
|------------|-------------------------|
| Citizen    | `<CitizenPortal />`     |
| University | Phase 2 placeholder     |
| Industry   | Phase 2 placeholder     |
| Government | Phase 2 placeholder     |

---

## 🚀 Phase 2 Roadmap

### A. University Proposal Builder (`/components/university/`)
- **ProposalList**: Browse problems routed to the university (`status === 'Routed_To_HEI'`).
- **TeamBuilder**: Assign student teams with role/skill tags.
- **ProposalEditor**: Rich-text proposal form with budget breakdown, timeline, and NEP alignment checkbox.
- **State update**: On submit, set `status → 'In_Proposal'`, populate `assignedTeam`.

### B. Industry CSR Pledge Workflow (`/components/industry/`)
- **ProposalBrowser**: View proposals (`status === 'In_Proposal'`) with filters.
- **PledgeForm**: Enter funding amount, milestone conditions, CSR Section 135 tags.
- **State update**: On pledge, set `status → 'Industry_Pledged'`, populate `industrySponsor` + `fundingAmount`.

### C. Government Dashboard (`/components/government/`)
- **DistrictHeatmap**: Jharkhand SVG map with color-coded districts by problem density/urgency.
- **AnalyticsCharts**: Category-wise bar chart, urgency pie chart, status pipeline funnel (use Recharts or Chart.js).
- **ProblemTable**: Searchable, sortable table of all problems with status badges.
- **ExportReport**: Generate PDF/CSV report for CM dashboard.

### D. Cross-Cutting Enhancements
- Real authentication (NextAuth.js / Clerk).
- Notification system (email/SMS on status change).
- Replace keyword AI engine with LLM API (Gemini / GPT).
- PWA support for offline-first citizen submissions.
- Accessibility audit (WCAG 2.1 AA).

---

## 🛠️ Development Commands

```bash
npm run dev       # Start dev server (http://localhost:3000)
npm run build     # Production build
npm run lint      # ESLint check
```

---

*Phase 1 built for SIH 2026 · September 2026*
