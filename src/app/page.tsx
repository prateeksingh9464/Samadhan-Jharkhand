'use client';

import { useRole } from '@/lib/store';
import CitizenPortal from '@/components/citizen/CitizenPortal';
import UniversityPortal from '@/components/university/UniversityPortal';
import IndustryPortal from '@/components/industry/IndustryPortal';
import GovDashboard from '@/components/admin/GovDashboard';

export default function Home() {
  const { role } = useRole();

  if (role === 'citizen') {
    return <CitizenPortal />;
  }

  if (role === 'university') {
    return <UniversityPortal />;
  }

  if (role === 'industry') {
    return <IndustryPortal />;
  }

  // Covers 'government' and 'admin' roles
  return <GovDashboard />;
}
