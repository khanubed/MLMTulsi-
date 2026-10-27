import type { Metadata } from 'next';
import { POLICIES_DATA } from '@/data/policiesData';
import { FileText, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Operating guidelines, product declarations, and service terms for Tulsi Swaraj.',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsPage() {
  const policy = POLICIES_DATA.terms;

  return (
    <article className="min-h-screen bg-[#F8F5ED] py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <header className="border-b border-[#E5DFD3] pb-6 space-y-2">
          <div className="flex items-center gap-2 text-xs text-[#285642] font-semibold uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            <span>Terms of Service</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#183F32]">
            {policy.title}
          </h1>
          <p className="text-xs text-[#77796F]">Last updated: {policy.lastUpdated}</p>
        </header>

        <aside className="p-4 rounded-xl bg-[#EFE9DB] border border-[#B49A63]/60 flex items-start gap-3 text-xs text-[#252923]">
          <AlertCircle className="w-5 h-5 text-[#B49A63] shrink-0 mt-0.5" />
          <p>
            <strong>Standard Disclaimer:</strong> Botanical formulations are wellness teas and dietary
            preparations intended to enrich daily rituals. They are not intended to diagnose, treat,
            cure, or prevent any medical condition.
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
