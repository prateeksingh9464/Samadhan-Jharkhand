'use client';

import { useRole } from '@/lib/store';
import { useAuth } from '@/lib/auth-store';
import CitizenPortal from '@/components/citizen/CitizenPortal';
import UniversityPortal from '@/components/university/UniversityPortal';
import IndustryPortal from '@/components/industry/IndustryPortal';
import GovDashboard from '@/components/admin/GovDashboard';

export default function Home() {
  const { role } = useRole();
  const { currentUser, isInitialized } = useAuth();

  // Citizen view is public to all visitors
  if (role === 'citizen') {
    return <CitizenPortal />;
  }

  // University workspace requires authenticated university role
  if (role === 'university') {
    if (isInitialized && currentUser?.role !== 'university') {
      return <CitizenPortal />;
    }
    return <UniversityPortal />;
  }

  // Industry & CSR hub requires authenticated industry role
  if (role === 'industry') {
    if (isInitialized && currentUser?.role !== 'industry') {
      return <CitizenPortal />;
    }
    return <IndustryPortal />;
  }

  // Government dashboard requires authenticated admin/government role
  if (isInitialized && currentUser?.role !== 'admin' && currentUser?.role !== 'government') {
    return <CitizenPortal />;
  }

  // Covers 'government' and 'admin' roles
  return <GovDashboard />;
}
