'use client';

import { StoreProvider, RoleProvider } from '@/lib/store';
import { NotificationProvider } from '@/lib/notifications';
import DemoNavbar from '@/components/DemoNavbar';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <RoleProvider>
        <NotificationProvider>
          <DemoNavbar />
          <main>{children}</main>
        </NotificationProvider>
      </RoleProvider>
    </StoreProvider>
  );
}

