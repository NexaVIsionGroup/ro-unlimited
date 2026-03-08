'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import GSAPProvider from '@/components/animations/GSAPProvider';
import ProgressBar from '@/components/animations/ProgressBar';
import LoadingSequence from '@/components/animations/LoadingSequence';

export default function SiteWrapper({ children }: { children: React.ReactNode }) {
  return (
    <GSAPProvider>
      <ProgressBar />
      <LoadingSequence>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </LoadingSequence>
    </GSAPProvider>
  );
}
