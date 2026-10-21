import type { Metadata } from 'next';
import { POLICIES_DATA } from '@/data/policiesData';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Tulsi Swaraj collects, safeguards, and respects your personal and payment data.',
  alternates: {
    canonical: '/privacy-policy',
  },
};

export default function PrivacyPolicyPage() {
  const policy = POLICIES_DATA.privacy;

  return (
    <article className="min-h-screen bg-[#F8F5ED] py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <header className="border-b border-[#E5DFD3] pb-6 space-y-2">
          <div className="flex items-center gap-2 text-xs text-[#285642] font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Privacy & Trust</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#183F32]">
            {policy.title}
          </h1>
          <p className="text-xs text-[#77796F]">Last updated: {policy.lastUpdated}</p>
        </header>

        <aside className="p-4 rounded-xl bg-[#EFE9DB] border border-[#B49A63]/60 flex items-start gap-3 text-xs text-[#252923]">
          <AlertCircle className="w-5 h-5 text-[#B49A63] shrink-0 mt-0.5" />
          <p>
            <strong>Zero Data Selling:</strong> We never sell, rent, or monetize your contact or
            shipping records to third-party marketing brokers. Data is strictly utilized for order
            dispatch and account management.
          </p>
        </aside>

        <section className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5DFD3] shadow-xs space-y-8">
          {policy.sections.map((sec, idx) => (
            <div key={idx} className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-[#183F32]">{sec.heading}</h2>
              <p className="text-xs sm:text-sm text-[#77796F] leading-relaxed">{sec.content}</p>
            </div>
          ))}
        </section>
      </div>
    </article>
  );
}
