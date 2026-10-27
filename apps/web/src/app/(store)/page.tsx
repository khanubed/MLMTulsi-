import type { Metadata } from 'next';
import { FAQS } from '@/data/faqData';
import { HomePageClient } from '@/components/home/HomePageClient';

export const metadata: Metadata = {
  title: 'Tulsi Swaraj | Premium Ayurvedic Botanical Wellness',
  description:
    'Experience pure Ayurvedic wellness with Tulsi Swaraj. Traditional botanical formulations harmonized by nature and crafted to wholeness. Flagship Tulsi Meta Ved Herbal Mix.',
  alternates: {
    canonical: '/',
  },
};

export default function Page() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <HomePageClient />
    </>
  );
}
