'use client';

import { StoreProvider, RoleProvider } from '@/lib/store';
import DemoNavbar from '@/components/DemoNavbar';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <RoleProvider>
        <DemoNavbar />
        <main>{children}</main>
      </RoleProvider>
    </StoreProvider>
  );
}
