'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AuthGuard from '@/components/admin/AuthGuard';
import AppShell from '@/components/admin/AppShell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === '/admin/login';

  useEffect(() => {
    document.body.classList.add('admin-mode');
    // Lock viewport for app feel
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    return () => {
      document.body.classList.remove('admin-mode');
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, []);

  if (isLogin) {
    return <AuthGuard>{children}</AuthGuard>;
  }

  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
