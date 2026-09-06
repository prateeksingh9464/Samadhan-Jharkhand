'use client';

import { StoreProvider, RoleProvider } from '@/lib/store';
import { AuthProvider } from '@/lib/auth-store';
import { NotificationProvider } from '@/lib/notifications';
import DemoNavbar from '@/components/DemoNavbar';
import AuthModal from '@/components/auth/AuthModal';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <RoleProvider>
        <AuthProvider>
          <NotificationProvider>
            <DemoNavbar />
            <main>{children}</main>
            <AuthModal />
          </NotificationProvider>
        </AuthProvider>
      </RoleProvider>
    </StoreProvider>
  );
}

