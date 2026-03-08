'use client';

import { useEffect } from 'react';
import AuthGuard from '@/components/admin/AuthGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.body.classList.add('admin-mode');
    return () => document.body.classList.remove('admin-mode');
  }, []);

  return <AuthGuard>{children}</AuthGuard>;
}
